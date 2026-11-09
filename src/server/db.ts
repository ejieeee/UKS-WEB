import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import { getMakassarDateTime } from '../utils/timezone.js';

const DB_PATH = path.resolve(process.cwd(), 'pmr_absensi.db');
export const db = new Database(DB_PATH);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS anggota (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL,
    angkatan TEXT NOT NULL,
    kelas_jurusan TEXT NOT NULL,
    divisi TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS absensi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    anggota_id INTEGER NOT NULL,
    nama_snapshot TEXT NOT NULL,
    angkatan_snapshot TEXT NOT NULL,
    kelas_jurusan_snapshot TEXT NOT NULL,
    divisi_snapshot TEXT NOT NULL,
    tanggal TEXT NOT NULL,
    waktu TEXT NOT NULL,
    tanda_tangan TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_absensi_tanggal ON absensi(tanggal);
  CREATE INDEX IF NOT EXISTS idx_absensi_anggota_tanggal ON absensi(anggota_id, tanggal);

  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

// Seed default admin and sample members if database is fresh
export function seedInitialData() {
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin').get() as { count: number };
  if (adminCount.count === 0) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('pmr123', salt);
    const now = new Date().toISOString();
    db.prepare('INSERT INTO admin (username, password_hash, created_at) VALUES (?, ?, ?)')
      .run('sekretaris', hash, now);
    console.log('✅ Admin default created: username: sekretaris, password: pmr123');
  }

  const anggotaCount = db.prepare('SELECT COUNT(*) as count FROM anggota').get() as { count: number };
  if (anggotaCount.count === 0) {
    const now = new Date().toISOString();
    const insertAnggota = db.prepare(`
      INSERT INTO anggota (nama, angkatan, kelas_jurusan, divisi, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const initialMembers = [
      { nama: 'Salma Rahmawati', angkatan: 'XI', kelas: 'PPLG 1', divisi: 'LITBANG' },
      { nama: 'Sarah Amelia', angkatan: 'X', kelas: 'DKV 2', divisi: 'PDD' },
      { nama: 'Rizky Pratama', angkatan: 'XI', kelas: 'TJKT 1', divisi: 'PRIMA' },
      { nama: 'Nabila Syifa', angkatan: 'X', kelas: 'ANIMASI', divisi: 'KEBERSIHAN' },
      { nama: 'Dimas Arya', angkatan: 'XI', kelas: 'PPLG 2', divisi: 'LITBANG' },
      { nama: 'Alya Putri', angkatan: 'X', kelas: 'TJKT 3', divisi: 'PDD' },
      { nama: 'Muhammad Fajar', angkatan: 'XI', kelas: 'DKV 1', divisi: 'PRIMA' },
      { nama: 'Zahra Nur Aini', angkatan: 'X', kelas: 'PPLG 1', divisi: 'KEBERSIHAN' },
      { nama: 'Kevin Chandra', angkatan: 'XI', kelas: 'ANIMASI', divisi: 'PDD' },
      { nama: 'Tiara Maharani', angkatan: 'X', kelas: 'TJKT 2', divisi: 'PRIMA' },
      { nama: 'Bagas Saputra', angkatan: 'XI', kelas: 'TJKT 2', divisi: 'LITBANG' },
      { nama: 'Dewa Mahendra', angkatan: 'X', kelas: 'DKV 1', divisi: 'KEBERSIHAN' },
      { nama: 'Farhan Maulana', angkatan: 'XI', kelas: 'PPLG 1', divisi: 'PRIMA' },
      { nama: 'Annisa Fitri', angkatan: 'X', kelas: 'TJKT 1', divisi: 'LITBANG' },
      { nama: 'Ilham Ramadhan', angkatan: 'XI', kelas: 'DKV 2', divisi: 'PDD' },
    ];

    const insertMany = db.transaction((members) => {
      for (const m of members) {
        insertAnggota.run(m.nama, m.angkatan, m.kelas, m.divisi, now, now);
      }
    });

    insertMany(initialMembers);
    console.log(`✅ Seeded ${initialMembers.length} sample PMR members.`);

    // Seed a couple of initial attendance records for testing recap
    const sampleSignature = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAA8CAYAAAA90kQRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAETUlEQVR4nO3bTWwUVRzH8e+0tLV0W7al2lJaKqVCS6EgCggGIoKJJnrhYjQaNcaLN+NFjTe9ejHgAY0n40EThTcgMRo0Go+aSCKCooiiVIvUUqC1pW132223y46H2emwO1M6O7Pdtvn/khvYmdm3v/3NzjM7O/N1ZlkWAAAAAADAe3JcA8DDpRIp2d62TVt+3SY11VUl7yvU5/fJtRs35frNmzK5eFEu//KL/D11SS4NDcn411flxO+/y9/nf5f/TpyQP37/Xf74fVzeT05K/4V++ez4cZnp75frg4Pyy5Ur8uH+/fLlgQPye1+ffHnwQfn45yPy0fFjcuJgT+a16b3fyo/vHZNPj/bKRz8fleN7e6SnvV0y6Rk53tcjvZ2dkq/LyY7e3nU1n94fHZVbQ8My/s03MvjDDzL87TcydOCAHHnhBdnevl26Wlvluu7J3t6e+rW79/jxdf08X49+lTj/O9zO5+s5fVp6u7rkVvT1N8774ePHy44HAEh3V7ds37xZ+qJR6Wltla7WlqytLS3S0dIiv/b1ydN790p7U1PGtraWZmnq6JD21hZp27BBmtvbpaO1WdraWqWtrTWzfn/fPmlpac5s72ptk+amJmnd0CrtmzZlejs2SltTS8Y5ejo6Mvv7otHMy69fvVp+35564QW5sW58ZWV8a2tz/dvd1tb6vP/69/H61168/v28Pj68u3z/3d0bM46b6t9Z78eO1d/X+s2bZefmzZne7m7ZsXmztDWv/fvdtmWLZL/eAAAkGZ+V7Z3dMvTbb2W/Uf17u7u7Zf/u3bJ3507ZtmVL5rn+tXb79+9f95rt6enZ4Lz612vPnj2yb9++jHN98OCB/87bt/dAuf38fHl9fXvlzp07cvfunbLxee3eXb6fb35O683t31/39u8vP9e+aFR6Wv89R/738/03Z28v7j9XF/336+91y+bN0tvVJV3R6Po/u3fv/u/101f3n2sAALCj7m7pvu0mN95+W9atWydbt26VzZtvls7OzoytW2+WlpaWzPq2tjZpbW3N2NLSstb2tvWv394mLS0tmd7Nm2Xzpk3SvGFDpnfDBmnfuDHzvI716zO9bds2yfatW6V5w4ZMe3u7tLS0SHNz84Z53bRhQ/mz/v7aN2+WpqamzPptbW3Z97N+vTS3tGRm+/36/Tdu3CgbN27M7G/Tpk1rbd/eId3r11/r53vj+vU35r1r1/p39v73r9u+Xdqam2V9/f43bNwom9avz6zftXmztLa2yratW2V7W1vG/vbv379u/507d/7rfm7fvl3aWlsz53jrtm2yfeu/19vY/fv3r+v1+f2+P7/fr7m5WdatW7fG5625uXldf11/bAQAwEMx/gWjQZ4jP0990wAAAABJRU5ErkJggg==';

    try {
      db.prepare(`
        INSERT INTO absensi (anggota_id, nama_snapshot, angkatan_snapshot, kelas_jurusan_snapshot, divisi_snapshot, tanggal, waktu, tanda_tangan, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        1,
        'Salma Rahmawati',
        'XI',
        'PPLG 1',
        'LITBANG',
        getMakassarDateTime().tanggal,
        '07:45:12',
        sampleSignature,
        now
      );
      console.log('✅ Seeded 1 test attendance for today');
    } catch (e) {
      // Ignored
    }
  }
}
