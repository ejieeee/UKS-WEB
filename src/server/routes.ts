import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import * as XLSX from 'xlsx';
import { db } from './db.js';
import { getMakassarDateTime } from '../utils/timezone.js';
import { Anggota, Absensi } from '../types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'pmr_digital_attendance_secret_key_2026';

export const router = express.Router();

// Middleware: Authenticate Admin JWT token
export function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Akses ditolak. Sesi admin diperlukan.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string };
    (req as any).admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sesi admin tidak valid atau telah berakhir. Silakan login kembali.' });
  }
}

// ==========================================
// 1. PUBLIC PORTAL ABSENSI ENDPOINTS
// ==========================================

// Autocomplete live search for members
router.get('/anggota/search', (req: Request, res: Response) => {
  const query = (req.query.q as string || '').trim();
  if (!query) {
    // Return first 15 members if no query
    const rows = db.prepare('SELECT id, nama, angkatan, kelas_jurusan, divisi FROM anggota ORDER BY nama ASC LIMIT 15').all();
    return res.json(rows);
  }

  const stmt = db.prepare(`
    SELECT id, nama, angkatan, kelas_jurusan, divisi 
    FROM anggota 
    WHERE nama LIKE ? OR nama LIKE ?
    ORDER BY 
      CASE WHEN nama LIKE ? THEN 0 ELSE 1 END,
      nama ASC 
    LIMIT 20
  `);
  const prefix = `${query}%`;
  const anywhere = `%${query}%`;
  const rows = stmt.all(prefix, anywhere, prefix);
  res.json(rows);
});

// Check if member already attended today (Asia/Makassar)
router.get('/absensi/check-today', (req: Request, res: Response) => {
  const anggotaId = parseInt(req.query.anggota_id as string, 10);
  if (!anggotaId || isNaN(anggotaId)) {
    return res.status(400).json({ error: 'Parameter anggota_id tidak valid.' });
  }

  const { tanggal } = getMakassarDateTime();
  const existing = db.prepare(`
    SELECT id, waktu, tanggal 
    FROM absensi 
    WHERE anggota_id = ? AND tanggal = ? 
    LIMIT 1
  `).get(anggotaId, tanggal) as { id: number; waktu: string; tanggal: string } | undefined;

  if (existing) {
    return res.json({
      alreadyAttended: true,
      waktu: existing.waktu,
      tanggal: existing.tanggal,
      message: `Anggota ini sudah melakukan absensi hari ini pada pukul ${existing.waktu} WITA.`,
    });
  }

  res.json({ alreadyAttended: false });
});

// Submit attendance
router.post('/absensi', (req: Request, res: Response) => {
  const { anggota_id, tanda_tangan } = req.body;

  if (!anggota_id) {
    return res.status(400).json({ error: 'Anggota belum dipilih.' });
  }

  if (!tanda_tangan || typeof tanda_tangan !== 'string' || !tanda_tangan.startsWith('data:image/')) {
    return res.status(400).json({ error: 'Tanda tangan digital wajib diisi sebelum absensi dikirim.' });
  }

  // Fetch member
  const member = db.prepare('SELECT * FROM anggota WHERE id = ?').get(anggota_id) as Anggota | undefined;
  if (!member) {
    return res.status(404).json({ error: 'Data anggota tidak ditemukan dalam database.' });
  }

  const { tanggal, waktu } = getMakassarDateTime();

  // Validate duplicate attendance in same day
  const existing = db.prepare(`
    SELECT id, waktu 
    FROM absensi 
    WHERE anggota_id = ? AND tanggal = ? 
    LIMIT 1
  `).get(member.id, tanggal) as { id: number; waktu: string } | undefined;

  if (existing) {
    return res.status(409).json({
      error: `Pemberitahuan: ${member.nama} sudah melakukan absensi hari ini pada pukul ${existing.waktu} WITA.`,
      waktu: existing.waktu,
      sudahAbsen: true,
    });
  }

  const nowIso = new Date().toISOString();
  const insertStmt = db.prepare(`
    INSERT INTO absensi (
      anggota_id,
      nama_snapshot,
      angkatan_snapshot,
      kelas_jurusan_snapshot,
      divisi_snapshot,
      tanggal,
      waktu,
      tanda_tangan,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insertStmt.run(
    member.id,
    member.nama,
    member.angkatan,
    member.kelas_jurusan,
    member.divisi,
    tanggal,
    waktu,
    tanda_tangan,
    nowIso
  );

  res.status(201).json({
    success: true,
    message: 'Absensi berhasil dicatat!',
    absensi: {
      id: Number(result.lastInsertRowid),
      nama: member.nama,
      angkatan: member.angkatan,
      kelas_jurusan: member.kelas_jurusan,
      divisi: member.divisi,
      tanggal,
      waktu,
    },
  });
});

// Current server time in Asia/Makassar
router.get('/server-time', (_req: Request, res: Response) => {
  const dt = getMakassarDateTime();
  res.json(dt);
});

// ==========================================
// 2. ADMIN AUTHENTICATION
// ==========================================

router.post('/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi.' });
  }

  const admin = db.prepare('SELECT * FROM admin WHERE username = ?').get(username) as {
    id: number;
    username: string;
    password_hash: string;
  } | undefined;

  if (!admin) {
    return res.status(401).json({ error: 'Username atau password salah.' });
  }

  const isPasswordValid = bcrypt.compareSync(password, admin.password_hash);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Username atau password salah.' });
  }

  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    JWT_SECRET,
    { expiresIn: '12h' }
  );

  res.json({
    success: true,
    token,
    admin: {
      id: admin.id,
      username: admin.username,
    },
  });
});

router.get('/admin/me', authenticateAdmin, (req: Request, res: Response) => {
  const adminInfo = (req as any).admin;
  res.json({ admin: adminInfo });
});

router.put('/admin/profile', authenticateAdmin, (req: Request, res: Response) => {
  const adminId = (req as any).admin.id;
  const { current_password, new_username, new_password } = req.body;

  const admin = db.prepare('SELECT * FROM admin WHERE id = ?').get(adminId) as {
    id: number;
    username: string;
    password_hash: string;
  } | undefined;

  if (!admin) {
    return res.status(404).json({ error: 'Admin tidak ditemukan.' });
  }

  if (!bcrypt.compareSync(current_password, admin.password_hash)) {
    return res.status(400).json({ error: 'Password saat ini salah.' });
  }

  const finalUsername = new_username?.trim() || admin.username;
  let finalHash = admin.password_hash;

  if (new_password) {
    if (new_password.length < 5) {
      return res.status(400).json({ error: 'Password baru minimal 5 karakter.' });
    }
    const salt = bcrypt.genSaltSync(10);
    finalHash = bcrypt.hashSync(new_password, salt);
  }

  try {
    db.prepare('UPDATE admin SET username = ?, password_hash = ? WHERE id = ?')
      .run(finalUsername, finalHash, adminId);

    const token = jwt.sign(
      { id: admin.id, username: finalUsername },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      success: true,
      message: 'Profil admin berhasil diperbarui.',
      token,
      admin: { id: admin.id, username: finalUsername },
    });
  } catch (err: any) {
    if (err.message?.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Username sudah digunakan oleh admin lain.' });
    }
    res.status(500).json({ error: 'Gagal memperbarui profil admin.' });
  }
});

// ==========================================
// 3. ADMIN: PENGELOLAAN ANGGOTA (CRUD)
// ==========================================

router.get('/anggota', authenticateAdmin, (req: Request, res: Response) => {
  const search = (req.query.search as string || '').trim();
  const angkatan = req.query.angkatan as string;
  const divisi = req.query.divisi as string;
  const kelas = req.query.kelas as string;

  let sql = 'SELECT * FROM anggota WHERE 1=1';
  const params: any[] = [];

  if (search) {
    sql += ' AND nama LIKE ?';
    params.push(`%${search}%`);
  }
  if (angkatan) {
    sql += ' AND angkatan = ?';
    params.push(angkatan);
  }
  if (divisi) {
    sql += ' AND divisi = ?';
    params.push(divisi);
  }
  if (kelas) {
    sql += ' AND kelas_jurusan = ?';
    params.push(kelas);
  }

  sql += ' ORDER BY nama ASC';
  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

router.post('/anggota', authenticateAdmin, (req: Request, res: Response) => {
  const { nama, angkatan, kelas_jurusan, divisi } = req.body;

  if (!nama?.trim()) {
    return res.status(400).json({ error: 'Nama lengkap wajib diisi.' });
  }
  if (!angkatan || !['X', 'XI'].includes(angkatan)) {
    return res.status(400).json({ error: 'Angkatan harus dipilih antara Kelas 10 (X) atau Kelas 11 (XI).' });
  }
  if (!kelas_jurusan?.trim()) {
    return res.status(400).json({ error: 'Kelas/Jurusan wajib dipilih.' });
  }
  if (!divisi?.trim()) {
    return res.status(400).json({ error: 'Divisi wajib dipilih.' });
  }

  const now = new Date().toISOString();
  const result = db.prepare(`
    INSERT INTO anggota (nama, angkatan, kelas_jurusan, divisi, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(nama.trim(), angkatan, kelas_jurusan.trim(), divisi.trim(), now, now);

  const newMember = db.prepare('SELECT * FROM anggota WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({
    success: true,
    message: 'Anggota baru berhasil ditambahkan.',
    anggota: newMember,
  });
});

router.put('/anggota/:id', authenticateAdmin, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { nama, angkatan, kelas_jurusan, divisi } = req.body;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'ID anggota tidak valid.' });
  }
  if (!nama?.trim()) {
    return res.status(400).json({ error: 'Nama lengkap wajib diisi.' });
  }
  if (!angkatan || !['X', 'XI'].includes(angkatan)) {
    return res.status(400).json({ error: 'Angkatan harus dipilih antara Kelas 10 (X) atau Kelas 11 (XI).' });
  }
  if (!kelas_jurusan?.trim()) {
    return res.status(400).json({ error: 'Kelas/Jurusan wajib dipilih.' });
  }
  if (!divisi?.trim()) {
    return res.status(400).json({ error: 'Divisi wajib dipilih.' });
  }

  const existing = db.prepare('SELECT id FROM anggota WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Data anggota tidak ditemukan.' });
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE anggota 
    SET nama = ?, angkatan = ?, kelas_jurusan = ?, divisi = ?, updated_at = ?
    WHERE id = ?
  `).run(nama.trim(), angkatan, kelas_jurusan.trim(), divisi.trim(), now, id);

  const updatedMember = db.prepare('SELECT * FROM anggota WHERE id = ?').get(id);
  res.json({
    success: true,
    message: 'Data anggota berhasil diperbarui.',
    anggota: updatedMember,
  });
});

router.delete('/anggota/:id', authenticateAdmin, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'ID anggota tidak valid.' });
  }

  const existing = db.prepare('SELECT id, nama FROM anggota WHERE id = ?').get(id) as { id: number; nama: string } | undefined;
  if (!existing) {
    return res.status(404).json({ error: 'Data anggota tidak ditemukan.' });
  }

  // Deleting anggota does NOT delete past absensi records (history preserved via snapshot columns)
  db.prepare('DELETE FROM anggota WHERE id = ?').run(id);

  res.json({
    success: true,
    message: `Data anggota ${existing.nama} berhasil dihapus. Riwayat absensi tetap tersimpan.`,
  });
});

// ==========================================
// 4. ADMIN: REKAP ABSENSI & FILTERS
// ==========================================

function buildAbsensiQuery(query: any) {
  const {
    bulan,
    tahun,
    angkatan,
    kelas_jurusan,
    divisi,
    search,
    sort_by = 'tanggal',
    sort_order = 'desc',
  } = query;

  let sql = 'SELECT * FROM absensi WHERE 1=1';
  const params: any[] = [];

  // Filter Bulan (1-12 or 01-12)
  if (bulan) {
    const formattedBulan = String(bulan).padStart(2, '0');
    sql += " AND strftime('%m', tanggal) = ?";
    params.push(formattedBulan);
  }

  // Filter Tahun
  if (tahun) {
    sql += " AND strftime('%Y', tanggal) = ?";
    params.push(String(tahun));
  }

  // Filter Angkatan (X or XI)
  if (angkatan) {
    sql += ' AND angkatan_snapshot = ?';
    params.push(angkatan);
  }

  // Filter Kelas / Jurusan
  if (kelas_jurusan) {
    sql += ' AND kelas_jurusan_snapshot = ?';
    params.push(kelas_jurusan);
  }

  // Filter Divisi
  if (divisi) {
    sql += ' AND divisi_snapshot = ?';
    params.push(divisi);
  }

  // Search by member name
  if (search && search.trim()) {
    sql += ' AND nama_snapshot LIKE ?';
    params.push(`%${search.trim()}%`);
  }

  // Sorting
  const allowedSortCols: Record<string, string> = {
    tanggal: 'tanggal',
    nama: 'nama_snapshot',
    waktu: 'waktu',
  };
  const orderCol = allowedSortCols[sort_by] || 'tanggal';
  const orderDir = sort_order === 'asc' ? 'ASC' : 'DESC';

  sql += ` ORDER BY ${orderCol} ${orderDir}, waktu DESC`;

  return { sql, params };
}

router.get('/absensi', authenticateAdmin, (req: Request, res: Response) => {
  const { sql, params } = buildAbsensiQuery(req.query);
  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

// Update attendance record (for fixing admin recording errors)
router.put('/absensi/:id', authenticateAdmin, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { tanggal, waktu, nama_snapshot, angkatan_snapshot, kelas_jurusan_snapshot, divisi_snapshot } = req.body;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'ID absensi tidak valid.' });
  }

  const existing = db.prepare('SELECT id FROM absensi WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Data absensi tidak ditemukan.' });
  }

  db.prepare(`
    UPDATE absensi 
    SET tanggal = COALESCE(?, tanggal),
        waktu = COALESCE(?, waktu),
        nama_snapshot = COALESCE(?, nama_snapshot),
        angkatan_snapshot = COALESCE(?, angkatan_snapshot),
        kelas_jurusan_snapshot = COALESCE(?, kelas_jurusan_snapshot),
        divisi_snapshot = COALESCE(?, divisi_snapshot)
    WHERE id = ?
  `).run(
    tanggal || null,
    waktu || null,
    nama_snapshot || null,
    angkatan_snapshot || null,
    kelas_jurusan_snapshot || null,
    divisi_snapshot || null,
    id
  );

  const updated = db.prepare('SELECT * FROM absensi WHERE id = ?').get(id);
  res.json({
    success: true,
    message: 'Data absensi berhasil diperbarui.',
    absensi: updated,
  });
});

// Delete attendance record
router.delete('/absensi/:id', authenticateAdmin, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'ID absensi tidak valid.' });
  }

  const existing = db.prepare('SELECT id, nama_snapshot FROM absensi WHERE id = ?').get(id) as { id: number; nama_snapshot: string } | undefined;
  if (!existing) {
    return res.status(404).json({ error: 'Data absensi tidak ditemukan.' });
  }

  db.prepare('DELETE FROM absensi WHERE id = ?').run(id);
  res.json({
    success: true,
    message: `Data absensi ${existing.nama_snapshot} berhasil dihapus.`,
  });
});

// ==========================================
// 5. EXCEL EXPORT (Server-side generated workbook)
// ==========================================
router.get('/export/excel', authenticateAdmin, (req: Request, res: Response) => {
  const { sql, params } = buildAbsensiQuery(req.query);
  const rows = db.prepare(sql).all(...params) as Absensi[];

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

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 28 }, // Nama
    { wch: 18 }, // Angkatan
    { wch: 20 }, // Kelas
    { wch: 18 }, // Divisi
    { wch: 14 }, // Tanggal
    { wch: 16 }, // Waktu
    { wch: 22 }, // Tanda Tangan
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Absensi PMR');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  const dateSuffix = getMakassarDateTime().tanggal;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="Rekap_Absensi_PMR_${dateSuffix}.xlsx"`);
  res.send(buffer);
});
