import * as XLSX from 'xlsx';
import { Anggota, Absensi, Divisi, Angkatan, StatusKeanggotaan, CatatanUKS, CatatanPiket } from '../types.js';
import { getMakassarDateTime } from '../utils/timezone.js';

const STORAGE_KEY_MEMBERS = 'pmr_db_members_v2';
const STORAGE_KEY_ATTENDANCE = 'pmr_db_attendance';
const STORAGE_KEY_ADMIN = 'pmr_db_admin';
const STORAGE_KEY_UKS = 'pmr_db_uks';
const STORAGE_KEY_PIKET = 'pmr_db_piket';

interface AdminStorage {
  id: number;
  username: string;
  password: string; // Plaintext or hashed for local demo
  created_at: string;
}

const DEFAULT_MEMBERS: Omit<Anggota, 'id' | 'created_at'>[] = [
  { nama: 'Salma Rahmawati', angkatan: 'XI', kelas_jurusan: 'PPLG 1', divisi: 'LITBANG', status_keanggotaan: 'Pengurus', jabatan: 'Ketua PMR Wira' },
  { nama: 'Dimas Arya', angkatan: 'XI', kelas_jurusan: 'PPLG 2', divisi: 'LITBANG', status_keanggotaan: 'Pengurus', jabatan: 'Wakil Ketua PMR' },
  { nama: 'Sarah Amelia', angkatan: 'X', kelas_jurusan: 'DKV 2', divisi: 'PDD', status_keanggotaan: 'Pengurus', jabatan: 'Sekretaris' },
  { nama: 'Farhan Maulana', angkatan: 'XI', kelas_jurusan: 'PPLG 1', divisi: 'PRIMA', status_keanggotaan: 'Pengurus', jabatan: 'Bendahara' },
  { nama: 'Rizky Pratama', angkatan: 'XI', kelas_jurusan: 'TJKT 1', divisi: 'PRIMA', status_keanggotaan: 'Pengurus', jabatan: 'Koordinator Divisi PRIMA' },
  { nama: 'Kevin Chandra', angkatan: 'XI', kelas_jurusan: 'ANIMASI', divisi: 'PDD', status_keanggotaan: 'Pengurus', jabatan: 'Koordinator Divisi PDD' },
  { nama: 'Bagas Saputra', angkatan: 'XI', kelas_jurusan: 'TJKT 2', divisi: 'LITBANG', status_keanggotaan: 'Pengurus', jabatan: 'Koordinator Divisi LITBANG' },
  { nama: 'Dewa Mahendra', angkatan: 'X', kelas_jurusan: 'DKV 1', divisi: 'KEBERSIHAN', status_keanggotaan: 'Pengurus', jabatan: 'Koordinator Divisi KEBERSIHAN' },
  { nama: 'Nabila Syifa', angkatan: 'X', kelas_jurusan: 'ANIMASI', divisi: 'KEBERSIHAN', status_keanggotaan: 'Anggota' },
  { nama: 'Alya Putri', angkatan: 'X', kelas_jurusan: 'TJKT 3', divisi: 'PDD', status_keanggotaan: 'Anggota' },
  { nama: 'Muhammad Fajar', angkatan: 'XI', kelas_jurusan: 'DKV 1', divisi: 'PRIMA', status_keanggotaan: 'Anggota' },
  { nama: 'Zahra Nur Aini', angkatan: 'X', kelas_jurusan: 'PPLG 1', divisi: 'KEBERSIHAN', status_keanggotaan: 'Anggota' },
  { nama: 'Tiara Maharani', angkatan: 'X', kelas_jurusan: 'TJKT 2', divisi: 'PRIMA', status_keanggotaan: 'Anggota' },
  { nama: 'Annisa Fitri', angkatan: 'X', kelas_jurusan: 'TJKT 1', divisi: 'LITBANG', status_keanggotaan: 'Anggota' },
  { nama: 'Ilham Ramadhan', angkatan: 'XI', kelas_jurusan: 'DKV 2', divisi: 'PDD', status_keanggotaan: 'Anggota' },
];

const SAMPLE_SIGNATURE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAA8CAYAAAA90kQRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAETUlEQVR4nO3bTWwUVRzH8e+0tLV0W7al2lJaKqVCS6EgCggGIoKJJnrhYjQaNcaLN+NFjTe9ejHgAY0n40EThTcgMRo0Go+aSCKCooiiVIvUUqC1pW132223y46H2emwO1M6O7Pdtvn/khvYmdm3v/3NzjM7O/N1ZlkWAAAAAADAe3JcA8DDpRIp2d62TVt+3SY11VUl7yvU5/fJtRs35frNmzK5eFEu//KL/D11SS4NDcn411flxO+/y9/nf5f/TpyQP37/Xf74fVzeT05K/4V++ez4cZnp75frg4Pyy5Ur8uH+/fLlgQPye1+ffHnwQfn45yPy0fFjcuJgT+a16b3fyo/vHZNPj/bKRz8fleN7e6SnvV0y6Rk53tcjvZ2dkq/LyY7e3nU1n94fHZVbQ8My/s03MvjDDzL87TcydOCAHHnhBdnevl26Wlvluu7J3t6e+rW79/jxdf08X49+lTj/O9zO5+s5fVp6u7rkVvT1N8774ePHy44HAEh3V7ds37xZ+qJR6Wltla7WlqytLS3S0dIiv/b1ydN790p7U1PGtraWZmnq6JD21hZp27BBmtvbpaO1WdraWqWtrTWzfn/fPmlpac5s72ptk+amJmnd0CrtmzZlejs2SltTS8Y5ejo6Mvv7otHMy69fvVp+35564QW5sW58ZWV8a2tz/dvd1tb6vP/69/H61168/v28Pj68u3z/3d0bM46b6t9Z78eO1d/X+s2bZefmzZne7m7ZsXmztDWv/fvdtmWLZL/eAAAkGZ+V7Z3dMvTbb2W/Uf17u7u7Zf/u3bJ3507ZtmVL5rn+tXb79+9f95rt6enZ4Lz612vPnj2yb9++jHN98OCB/87bt/dAuf38fHl9fXvlzp07cvfunbLxee3eXb6fb35O683t31/39u8vP9e+aFR6Wv89R/738/03Z28v7j9XF/336+91y+bN0tvVJV3R6Po/u3fv/u/101f3n2sAALCj7m7pvu0mN95+W9atWydbt26VzZtvls7OzoytW2+WlpaWzPq2tjZpbW3N2NLSstb2tvWv394mLS0tmd7Nm2Xzpk3SvGFDpnfDBmnfuDHzvI716zO9bds2yfatW6V5w4ZMe3u7tLS0SHNz84Z53bRhQ/mz/v7aN2+WpqamzPptbW3Z97N+vTS3tGRm+/36/Tdu3CgbN27M7G/Tpk1rbd/eId3r11/r53vj+vU35r1r1/p39v73r9u+Xdqam2V9/f43bNwom9avz6zftXmztLa2yratW2V7W1vG/vbv379u/507d/7rfm7fvl3aWlsz53jrtm2yfeu/19vY/fv3r+v1+f2+P7/fr7m5WdatW7fG5625uXldf11/bAQAwEMx/gWjQZ4jP0990wAAAABJRU5ErkJggg==';

// Initialize default data if not present
function getStoredMembers(): Anggota[] {
  const raw = localStorage.getItem(STORAGE_KEY_MEMBERS);
  if (raw) {
    try {
      const parsed: Anggota[] = JSON.parse(raw);
      let changed = false;
      const updated = parsed.map((m) => {
        if (!m.status_keanggotaan) {
          changed = true;
          const matchDefault = DEFAULT_MEMBERS.find((d) => d.nama.toLowerCase() === m.nama.toLowerCase());
          return {
            ...m,
            status_keanggotaan: matchDefault ? matchDefault.status_keanggotaan : ('Anggota' as StatusKeanggotaan),
            jabatan: matchDefault ? matchDefault.jabatan : undefined,
          };
        }
        return m;
      });
      if (changed) saveMembers(updated);
      return updated;
    } catch (e) {
      // Fallback
    }
  }

  // Check legacy key
  const legacyRaw = localStorage.getItem('pmr_db_members');
  if (legacyRaw) {
    try {
      const legacy: any[] = JSON.parse(legacyRaw);
      const migrated: Anggota[] = legacy.map((m) => {
        const matchDefault = DEFAULT_MEMBERS.find((d) => d.nama.toLowerCase() === m.nama.toLowerCase());
        return {
          id: m.id,
          nama: m.nama,
          angkatan: m.angkatan as Angkatan,
          kelas_jurusan: m.kelas_jurusan,
          divisi: m.divisi as Divisi,
          status_keanggotaan: matchDefault ? matchDefault.status_keanggotaan : (m.status_keanggotaan || 'Anggota'),
          jabatan: matchDefault ? matchDefault.jabatan : m.jabatan,
          created_at: m.created_at || new Date().toISOString(),
          updated_at: m.updated_at,
        };
      });
      saveMembers(migrated);
      return migrated;
    } catch (e) {
      // Fallback
    }
  }

  const now = new Date().toISOString();
  const initial: Anggota[] = DEFAULT_MEMBERS.map((m, idx) => ({
    id: idx + 1,
    nama: m.nama,
    angkatan: m.angkatan as Angkatan,
    kelas_jurusan: m.kelas_jurusan,
    divisi: m.divisi as Divisi,
    status_keanggotaan: m.status_keanggotaan,
    jabatan: m.jabatan,
    created_at: now,
    updated_at: now,
  }));
  localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(initial));
  return initial;
}

function saveMembers(members: Anggota[]) {
  localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
}

function getStoredAttendance(): Absensi[] {
  const raw = localStorage.getItem(STORAGE_KEY_ATTENDANCE);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      // Fallback
    }
  }

  const { tanggal } = getMakassarDateTime();
  const now = new Date().toISOString();
  const initial: Absensi[] = [
    {
      id: 1,
      anggota_id: 1,
      nama_snapshot: 'Salma Rahmawati',
      angkatan_snapshot: 'XI',
      kelas_jurusan_snapshot: 'PPLG 1',
      divisi_snapshot: 'LITBANG',
      tanggal,
      waktu: '07:45:12',
      tanda_tangan: SAMPLE_SIGNATURE,
      created_at: now,
    },
  ];
  localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(initial));
  return initial;
}

function saveAttendance(records: Absensi[]) {
  localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(records));
}

function getStoredUKS(): CatatanUKS[] {
  const raw = localStorage.getItem(STORAGE_KEY_UKS);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      // Fallback
    }
  }
  const { tanggal } = getMakassarDateTime();
  const initial: CatatanUKS[] = [
    {
      id: 1,
      anggota_id: 8,
      nama_snapshot: 'Zahra Nur Aini',
      kelas_snapshot: 'X PPLG 1',
      divisi_snapshot: 'KEBERSIHAN',
      status_keanggotaan_snapshot: 'Anggota',
      keluhan: 'Pusing & lemas setelah upacara',
      tindakan: 'Diberi teh hangat, istirahat 30 menit, dan minyak kayu putih',
      suhu_tubuh: '36.8',
      tanggal,
      waktu: '08:30:00',
      petugas_pencatat: 'Salma Rahmawati (Ketua PMR Wira)',
      created_at: new Date().toISOString(),
    },
  ];
  localStorage.setItem(STORAGE_KEY_UKS, JSON.stringify(initial));
  return initial;
}

function saveUKS(records: CatatanUKS[]) {
  localStorage.setItem(STORAGE_KEY_UKS, JSON.stringify(records));
}

function getStoredPiket(): CatatanPiket[] {
  const raw = localStorage.getItem(STORAGE_KEY_PIKET);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      // Fallback
    }
  }
  const { tanggal } = getMakassarDateTime();
  const initial: CatatanPiket[] = [
    {
      id: 1,
      anggota_id: 3,
      nama_snapshot: 'Rizky Pratama',
      kelas_snapshot: 'XI TJKT 1',
      divisi_snapshot: 'PRIMA',
      status_keanggotaan_snapshot: 'Pengurus',
      jabatan_snapshot: 'Koordinator Divisi PRIMA',
      shift: 'Istirahat Pertama (09:45 - 10:15)',
      area_tugas: 'Ruang UKS & Pos P3K',
      keterangan: 'Pengecekan stok obat & kesiapan tandu darurat',
      tanggal,
      waktu: '09:45:10',
      created_at: new Date().toISOString(),
    },
  ];
  localStorage.setItem(STORAGE_KEY_PIKET, JSON.stringify(initial));
  return initial;
}

function savePiket(records: CatatanPiket[]) {
  localStorage.setItem(STORAGE_KEY_PIKET, JSON.stringify(records));
}

function getStoredAdmin(): AdminStorage {
  const raw = localStorage.getItem(STORAGE_KEY_ADMIN);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      // Fallback
    }
  }
  const defaultAdmin: AdminStorage = {
    id: 1,
    username: 'sekretaris',
    password: 'pmr123',
    created_at: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY_ADMIN, JSON.stringify(defaultAdmin));
  return defaultAdmin;
}

function saveAdmin(admin: AdminStorage) {
  localStorage.setItem(STORAGE_KEY_ADMIN, JSON.stringify(admin));
}

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function errorResponse(error: string, status = 400, extra: Record<string, any> = {}) {
  return new Response(JSON.stringify({ error, ...extra }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function handleMockApiRequest(
  urlStr: string,
  options: RequestInit = {}
): Promise<Response> {
  const parsedUrl = new URL(urlStr, window.location.origin);
  const pathname = parsedUrl.pathname;
  const searchParams = parsedUrl.searchParams;
  const method = (options.method || 'GET').toUpperCase();

  let body: any = null;
  if (options.body && typeof options.body === 'string') {
    try {
      body = JSON.parse(options.body);
    } catch (e) {
      // Raw string
    }
  }

  // 1. Health check
  if (pathname === '/api/health') {
    return jsonResponse({ status: 'ok', time: new Date().toISOString() });
  }

  // 2. Server time
  if (pathname === '/api/server-time') {
    return jsonResponse(getMakassarDateTime());
  }

  // 3. Autocomplete member search
  if (pathname === '/api/anggota/search') {
    const q = (searchParams.get('q') || '').trim().toLowerCase();
    const members = getStoredMembers();

    if (!q) {
      return jsonResponse(members.slice(0, 15));
    }

    const filtered = members
      .filter((m) => m.nama.toLowerCase().includes(q))
      .sort((a, b) => {
        const aStarts = a.nama.toLowerCase().startsWith(q);
        const bStarts = b.nama.toLowerCase().startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.nama.localeCompare(b.nama);
      })
      .slice(0, 20);

    return jsonResponse(filtered);
  }

  // 4. Check today's attendance for a member
  if (pathname === '/api/absensi/check-today') {
    const anggotaId = parseInt(searchParams.get('anggota_id') || '', 10);
    if (!anggotaId || isNaN(anggotaId)) {
      return errorResponse('Parameter anggota_id tidak valid.');
    }

    const { tanggal } = getMakassarDateTime();
    const records = getStoredAttendance();
    const existing = records.find(
      (r) => r.anggota_id === anggotaId && r.tanggal === tanggal
    );

    if (existing) {
      return jsonResponse({
        alreadyAttended: true,
        waktu: existing.waktu,
        tanggal: existing.tanggal,
        message: `Anggota ini sudah melakukan absensi hari ini pada pukul ${existing.waktu} WITA.`,
      });
    }

    return jsonResponse({ alreadyAttended: false });
  }

  // 5. Submit attendance
  if (pathname === '/api/absensi' && method === 'POST') {
    const { anggota_id, tanda_tangan } = body || {};

    if (!anggota_id) {
      return errorResponse('Anggota belum dipilih.');
    }
    if (!tanda_tangan || typeof tanda_tangan !== 'string' || !tanda_tangan.startsWith('data:image/')) {
      return errorResponse('Tanda tangan digital wajib diisi sebelum absensi dikirim.');
    }

    const members = getStoredMembers();
    const member = members.find((m) => m.id === Number(anggota_id));
    if (!member) {
      return errorResponse('Data anggota tidak ditemukan dalam database.', 404);
    }

    const { tanggal, waktu } = getMakassarDateTime();
    const records = getStoredAttendance();
    const existing = records.find(
      (r) => r.anggota_id === member.id && r.tanggal === tanggal
    );

    if (existing) {
      return errorResponse(
        `Pemberitahuan: ${member.nama} sudah melakukan absensi hari ini pada pukul ${existing.waktu} WITA.`,
        409,
        { waktu: existing.waktu, sudahAbsen: true }
      );
    }

    const nowIso = new Date().toISOString();
    const newRecord: Absensi = {
      id: Date.now(),
      anggota_id: member.id,
      nama_snapshot: member.nama,
      angkatan_snapshot: member.angkatan,
      kelas_jurusan_snapshot: member.kelas_jurusan,
      divisi_snapshot: member.divisi,
      status_keanggotaan_snapshot: member.status_keanggotaan,
      jabatan_snapshot: member.jabatan,
      tanggal,
      waktu,
      tanda_tangan,
      created_at: nowIso,
    };

    records.unshift(newRecord);
    saveAttendance(records);

    return jsonResponse(
      {
        success: true,
        message: 'Absensi berhasil dicatat!',
        absensi: {
          id: newRecord.id,
          nama: member.nama,
          angkatan: member.angkatan,
          kelas_jurusan: member.kelas_jurusan,
          divisi: member.divisi,
          status_keanggotaan: member.status_keanggotaan,
          jabatan: member.jabatan,
          tanggal,
          waktu,
        },
      },
      201
    );
  }

  // 6. Admin Login
  if (pathname === '/api/admin/login' && method === 'POST') {
    const { username, password } = body || {};
    if (!username || !password) {
      return errorResponse('Username dan password wajib diisi.');
    }

    const admin = getStoredAdmin();
    if (admin.username === username && admin.password === password) {
      const token = `pmr_mock_jwt_${Date.now()}_${admin.id}`;
      return jsonResponse({
        success: true,
        token,
        admin: {
          id: admin.id,
          username: admin.username,
        },
      });
    }

    return errorResponse('Username atau password salah.', 401);
  }

  // 7. Admin Me
  if (pathname === '/api/admin/me') {
    const auth = options.headers ? (options.headers as any).Authorization : null;
    if (!auth) {
      return errorResponse('Akses ditolak. Sesi admin diperlukan.', 401);
    }
    const admin = getStoredAdmin();
    return jsonResponse({
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
  }

  // 8. Admin Profile Update
  if (pathname === '/api/admin/profile' && method === 'PUT') {
    const { current_password, new_username, new_password } = body || {};
    const admin = getStoredAdmin();

    if (admin.password !== current_password) {
      return errorResponse('Password saat ini salah.');
    }

    if (new_password && new_password.length < 5) {
      return errorResponse('Password baru minimal 5 karakter.');
    }

    admin.username = new_username?.trim() || admin.username;
    if (new_password) {
      admin.password = new_password;
    }
    saveAdmin(admin);

    const token = `pmr_mock_jwt_${Date.now()}_${admin.id}`;
    return jsonResponse({
      success: true,
      message: 'Profil admin berhasil diperbarui.',
      token,
      admin: { id: admin.id, username: admin.username },
    });
  }

  // 9. Members CRUD
  if (pathname === '/api/anggota' && method === 'GET') {
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const angkatan = searchParams.get('angkatan');
    const divisi = searchParams.get('divisi');
    const kelas = searchParams.get('kelas');
    const status = searchParams.get('status');

    let list = getStoredMembers();
    if (search) {
      list = list.filter((m) => m.nama.toLowerCase().includes(search) || (m.jabatan && m.jabatan.toLowerCase().includes(search)));
    }
    if (angkatan) {
      list = list.filter((m) => m.angkatan === angkatan);
    }
    if (divisi) {
      list = list.filter((m) => m.divisi === divisi);
    }
    if (kelas) {
      list = list.filter((m) => m.kelas_jurusan === kelas);
    }
    if (status) {
      list = list.filter((m) => m.status_keanggotaan === status);
    }

    list.sort((a, b) => a.nama.localeCompare(b.nama));
    return jsonResponse(list);
  }

  if (pathname === '/api/anggota' && method === 'POST') {
    const { nama, angkatan, kelas_jurusan, divisi, status_keanggotaan, jabatan } = body || {};
    if (!nama?.trim()) return errorResponse('Nama lengkap wajib diisi.');
    if (!angkatan || !['X', 'XI'].includes(angkatan)) {
      return errorResponse('Angkatan harus dipilih antara Kelas 10 (X) atau Kelas 11 (XI).');
    }
    if (!kelas_jurusan?.trim()) return errorResponse('Kelas/Jurusan wajib dipilih.');
    if (!divisi?.trim()) return errorResponse('Divisi wajib dipilih.');

    const statusVal: StatusKeanggotaan = status_keanggotaan === 'Pengurus' ? 'Pengurus' : 'Anggota';
    const jabatanVal = statusVal === 'Pengurus' ? (jabatan?.trim() || 'Pengurus Harian') : undefined;

    const members = getStoredMembers();
    const now = new Date().toISOString();
    const newMember: Anggota = {
      id: Date.now(),
      nama: nama.trim(),
      angkatan,
      kelas_jurusan: kelas_jurusan.trim(),
      divisi: divisi.trim() as Divisi,
      status_keanggotaan: statusVal,
      jabatan: jabatanVal,
      created_at: now,
      updated_at: now,
    };
    members.push(newMember);
    saveMembers(members);

    return jsonResponse(
      {
        success: true,
        message: 'Anggota baru berhasil ditambahkan.',
        anggota: newMember,
      },
      201
    );
  }

  const anggotaMatch = pathname.match(/^\/api\/anggota\/(\d+)$/);
  if (anggotaMatch) {
    const id = parseInt(anggotaMatch[1], 10);
    const members = getStoredMembers();
    const memberIndex = members.findIndex((m) => m.id === id);

    if (memberIndex === -1) {
      return errorResponse('Data anggota tidak ditemukan.', 404);
    }

    if (method === 'PUT') {
      const { nama, angkatan, kelas_jurusan, divisi, status_keanggotaan, jabatan } = body || {};
      if (!nama?.trim()) return errorResponse('Nama lengkap wajib diisi.');
      if (!angkatan || !['X', 'XI'].includes(angkatan)) {
        return errorResponse('Angkatan harus dipilih antara Kelas 10 (X) atau Kelas 11 (XI).');
      }
      if (!kelas_jurusan?.trim()) return errorResponse('Kelas/Jurusan wajib dipilih.');
      if (!divisi?.trim()) return errorResponse('Divisi wajib dipilih.');

      const statusVal: StatusKeanggotaan = status_keanggotaan === 'Pengurus' ? 'Pengurus' : 'Anggota';
      const jabatanVal = statusVal === 'Pengurus' ? (jabatan?.trim() || 'Pengurus Harian') : undefined;

      members[memberIndex] = {
        ...members[memberIndex],
        nama: nama.trim(),
        angkatan,
        kelas_jurusan: kelas_jurusan.trim(),
        divisi: divisi.trim() as Divisi,
        status_keanggotaan: statusVal,
        jabatan: jabatanVal,
        updated_at: new Date().toISOString(),
      };
      saveMembers(members);

      return jsonResponse({
        success: true,
        message: 'Data anggota berhasil diperbarui.',
        anggota: members[memberIndex],
      });
    }

    if (method === 'DELETE') {
      const removed = members.splice(memberIndex, 1)[0];
      saveMembers(members);
      return jsonResponse({
        success: true,
        message: `Data anggota ${removed.nama} berhasil dihapus. Riwayat absensi tetap tersimpan.`,
      });
    }
  }

  // 10. Attendance Recap & Filters
  function filterRecords(params: URLSearchParams) {
    const bulan = params.get('bulan');
    const tahun = params.get('tahun');
    const angkatan = params.get('angkatan');
    const kelas_jurusan = params.get('kelas_jurusan');
    const divisi = params.get('divisi');
    const search = (params.get('search') || '').trim().toLowerCase();
    const sort_by = params.get('sort_by') || 'tanggal';
    const sort_order = params.get('sort_order') || 'desc';

    let list = getStoredAttendance();

    if (bulan) {
      const monthNum = parseInt(bulan, 10);
      list = list.filter((r) => {
        const m = parseInt(r.tanggal.split('-')[1], 10);
        return m === monthNum;
      });
    }

    if (tahun) {
      list = list.filter((r) => r.tanggal.startsWith(tahun));
    }

    if (angkatan) {
      list = list.filter((r) => r.angkatan_snapshot === angkatan);
    }

    if (kelas_jurusan) {
      list = list.filter((r) => r.kelas_jurusan_snapshot === kelas_jurusan);
    }

    if (divisi) {
      list = list.filter((r) => r.divisi_snapshot === divisi);
    }

    if (search) {
      list = list.filter((r) => r.nama_snapshot.toLowerCase().includes(search));
    }

    list.sort((a, b) => {
      let cmp = 0;
      if (sort_by === 'nama') {
        cmp = a.nama_snapshot.localeCompare(b.nama_snapshot);
      } else if (sort_by === 'waktu') {
        cmp = a.waktu.localeCompare(b.waktu);
      } else {
        cmp = a.tanggal.localeCompare(b.tanggal);
        if (cmp === 0) {
          cmp = a.waktu.localeCompare(b.waktu);
        }
      }
      return sort_order === 'asc' ? cmp : -cmp;
    });

    return list;
  }

  if (pathname === '/api/absensi' && method === 'GET') {
    const list = filterRecords(searchParams);
    return jsonResponse(list);
  }

  // Attendance item update / delete
  const absensiMatch = pathname.match(/^\/api\/absensi\/(\d+)$/);
  if (absensiMatch) {
    const id = parseInt(absensiMatch[1], 10);
    const records = getStoredAttendance();
    const recordIndex = records.findIndex((r) => r.id === id);

    if (recordIndex === -1) {
      return errorResponse('Data absensi tidak ditemukan.', 404);
    }

    if (method === 'PUT') {
      const {
        tanggal,
        waktu,
        nama_snapshot,
        angkatan_snapshot,
        kelas_jurusan_snapshot,
        divisi_snapshot,
      } = body || {};

      records[recordIndex] = {
        ...records[recordIndex],
        tanggal: tanggal || records[recordIndex].tanggal,
        waktu: waktu || records[recordIndex].waktu,
        nama_snapshot: nama_snapshot || records[recordIndex].nama_snapshot,
        angkatan_snapshot: angkatan_snapshot || records[recordIndex].angkatan_snapshot,
        kelas_jurusan_snapshot:
          kelas_jurusan_snapshot || records[recordIndex].kelas_jurusan_snapshot,
        divisi_snapshot: divisi_snapshot || records[recordIndex].divisi_snapshot,
      };
      saveAttendance(records);

      return jsonResponse({
        success: true,
        message: 'Data absensi berhasil diperbarui.',
        absensi: records[recordIndex],
      });
    }

    if (method === 'DELETE') {
      const removed = records.splice(recordIndex, 1)[0];
      saveAttendance(records);
      return jsonResponse({
        success: true,
        message: `Data absensi ${removed.nama_snapshot} berhasil dihapus.`,
      });
    }
  }

  // 11. Excel Export
  if (pathname === '/api/export/excel') {
    const rows = filterRecords(searchParams);

    const excelData = rows.map((r, idx) => ({
      No: idx + 1,
      'Nama Lengkap': r.nama_snapshot,
      'Angkatan': `Kelas ${r.angkatan_snapshot === 'XI' ? '11 (XI)' : '10 (X)'}`,
      'Kelas / Jurusan': `${r.angkatan_snapshot} ${r.kelas_jurusan_snapshot}`,
      'Divisi': r.divisi_snapshot,
      'Tanggal': r.tanggal,
      'Waktu (WITA)': `${r.waktu} WITA`,
      'Status Tanda Tangan': r.tanda_tangan ? 'Ada (Digital)' : 'Tidak Ada',
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 28 },
      { wch: 18 },
      { wch: 20 },
      { wch: 18 },
      { wch: 14 },
      { wch: 16 },
      { wch: 22 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Absensi PMR');

    const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    return new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  }

  // 12. UKS Endpoints
  if (pathname === '/api/uks') {
    if (method === 'GET') {
      const records = getStoredUKS();
      return jsonResponse(records);
    }
    if (method === 'POST') {
      const { anggota_id, keluhan, tindakan, suhu_tubuh, petugas_pencatat } = body || {};
      const members = getStoredMembers();
      const member = members.find((m) => m.id === Number(anggota_id));
      if (!member) return errorResponse('Anggota tidak ditemukan.', 404);
      if (!keluhan?.trim()) return errorResponse('Keluhan wajib diisi.');
      if (!tindakan?.trim()) return errorResponse('Tindakan/penanganan wajib diisi.');

      const { tanggal, waktu } = getMakassarDateTime();
      const records = getStoredUKS();
      const newUks: CatatanUKS = {
        id: Date.now(),
        anggota_id: member.id,
        nama_snapshot: member.nama,
        kelas_snapshot: `${member.angkatan} ${member.kelas_jurusan}`,
        divisi_snapshot: member.divisi,
        status_keanggotaan_snapshot: member.status_keanggotaan,
        jabatan_snapshot: member.jabatan,
        keluhan: keluhan.trim(),
        tindakan: tindakan.trim(),
        suhu_tubuh: suhu_tubuh?.trim() || undefined,
        tanggal,
        waktu,
        petugas_pencatat: petugas_pencatat?.trim() || 'Petugas Jaga UKS',
        created_at: new Date().toISOString(),
      };
      records.unshift(newUks);
      saveUKS(records);
      return jsonResponse({ success: true, message: 'Catatan layanan UKS berhasil disimpan!', data: newUks }, 201);
    }
  }

  // 13. Piket Endpoints
  if (pathname === '/api/piket') {
    if (method === 'GET') {
      const records = getStoredPiket();
      return jsonResponse(records);
    }
    if (method === 'POST') {
      const { anggota_id, shift, area_tugas, keterangan, tanda_tangan } = body || {};
      const members = getStoredMembers();
      const member = members.find((m) => m.id === Number(anggota_id));
      if (!member) return errorResponse('Anggota tidak ditemukan.', 404);
      if (!shift?.trim()) return errorResponse('Shift piket wajib dipilih.');
      if (!area_tugas?.trim()) return errorResponse('Area tugas wajib dipilih.');

      const { tanggal, waktu } = getMakassarDateTime();
      const records = getStoredPiket();
      const newPiket: CatatanPiket = {
        id: Date.now(),
        anggota_id: member.id,
        nama_snapshot: member.nama,
        kelas_snapshot: `${member.angkatan} ${member.kelas_jurusan}`,
        divisi_snapshot: member.divisi,
        status_keanggotaan_snapshot: member.status_keanggotaan,
        jabatan_snapshot: member.jabatan,
        shift: shift.trim(),
        area_tugas: area_tugas.trim(),
        keterangan: keterangan?.trim() || 'Piket terlaksana dengan baik.',
        tanggal,
        waktu,
        tanda_tangan,
        created_at: new Date().toISOString(),
      };
      records.unshift(newPiket);
      savePiket(records);
      return jsonResponse({ success: true, message: 'Presensi piket berhasil dicatat!', data: newPiket }, 201);
    }
  }

  return errorResponse('Endpoint tidak ditemukan', 404);
}

// Unified apiFetch function for direct component usage
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let urlStr = '';
  if (typeof input === 'string') {
    urlStr = input;
  } else if (input instanceof URL) {
    urlStr = input.href;
  } else if (input && typeof (input as Request).url === 'string') {
    urlStr = (input as Request).url;
  }

  if (urlStr.startsWith('/api/') || urlStr.startsWith('api/') || urlStr.includes('/api/')) {
    try {
      return await handleMockApiRequest(urlStr, init);
    } catch (err) {
      console.error('Client API error:', err);
      return errorResponse('Terjadi kesalahan pada layanan lokal.', 500);
    }
  }

  return window.fetch(input, init);
}

// Global fetch interceptor for environments where window.fetch is mutable
export function initClientApiInterceptor() {
  try {
    const originalFetch = window.fetch;
    const customFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      return apiFetch(input, init);
    };

    try {
      window.fetch = customFetch;
    } catch (e) {
      try {
        Object.defineProperty(window, 'fetch', {
          value: customFetch,
          writable: true,
          configurable: true,
        });
      } catch (err) {
        // If host environment locks window.fetch as getter-only, components use apiFetch directly
      }
    }
  } catch (err) {
    // Graceful fallback
  }
}

