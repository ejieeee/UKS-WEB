export type Angkatan = 'X' | 'XI';

export const DAFTAR_ANGKATAN: { value: Angkatan; label: string }[] = [
  { value: 'X', label: 'Kelas 10 (X)' },
  { value: 'XI', label: 'Kelas 11 (XI)' },
];

export const DAFTAR_KELAS_JURUSAN = [
  'PPLG 1',
  'PPLG 2',
  'DKV 1',
  'DKV 2',
  'ANIMASI',
  'TJKT 1',
  'TJKT 2',
  'TJKT 3',
] as const;

export type KelasJurusan = (typeof DAFTAR_KELAS_JURUSAN)[number];

export const DAFTAR_DIVISI = [
  'PRIMA',
  'LITBANG',
  'PDD',
  'KEBERSIHAN',
] as const;

export type Divisi = (typeof DAFTAR_DIVISI)[number];

export type StatusKeanggotaan = 'Anggota' | 'Pengurus';

export const DAFTAR_STATUS_KEANGGOTAAN: { value: StatusKeanggotaan; label: string }[] = [
  { value: 'Anggota', label: 'Anggota PMR' },
  { value: 'Pengurus', label: 'Pengurus Organisasi' },
];

export const PRESET_JABATAN_PENGURUS = [
  'Ketua PMR Wira',
  'Wakil Ketua PMR',
  'Sekretaris',
  'Bendahara',
  'Koordinator Divisi PRIMA',
  'Koordinator Divisi LITBANG',
  'Koordinator Divisi PDD',
  'Koordinator Divisi KEBERSIHAN',
  'Koordinator Layanan UKS',
  'Humas & Publikasi',
  'Logistik & Perlengkapan',
] as const;

export interface Anggota {
  id: number;
  nama: string;
  angkatan: Angkatan;
  kelas_jurusan: string;
  divisi: Divisi;
  status_keanggotaan: StatusKeanggotaan;
  jabatan?: string;
  created_at: string;
  updated_at?: string;
}

export interface Absensi {
  id: number;
  anggota_id: number;
  nama_snapshot: string;
  angkatan_snapshot: Angkatan;
  kelas_jurusan_snapshot: string;
  divisi_snapshot: Divisi;
  status_keanggotaan_snapshot?: StatusKeanggotaan;
  jabatan_snapshot?: string;
  tanggal: string; // YYYY-MM-DD (Asia/Makassar)
  waktu: string;   // HH:mm:ss (Asia/Makassar)
  tanda_tangan: string; // base64 PNG data URL
  created_at: string;
}

export interface AdminUser {
  id: number;
  username: string;
  created_at: string;
}

export interface AbsensiFilter {
  bulan?: string; // 1-12
  tahun?: string; // e.g. 2026
  angkatan?: string; // 'X' | 'XI'
  kelas_jurusan?: string;
  divisi?: string;
  status?: string;
  search?: string;
  sort_by?: 'tanggal' | 'nama' | 'waktu';
  sort_order?: 'asc' | 'desc';
}

export interface CatatanUKS {
  id: number;
  anggota_id: number;
  nama_snapshot: string;
  kelas_snapshot: string;
  divisi_snapshot: string;
  status_keanggotaan_snapshot: StatusKeanggotaan;
  jabatan_snapshot?: string;
  keluhan: string;
  tindakan: string;
  suhu_tubuh?: string;
  tanggal: string;
  waktu: string;
  petugas_pencatat: string;
  created_at: string;
}

export interface CatatanPiket {
  id: number;
  anggota_id: number;
  nama_snapshot: string;
  kelas_snapshot: string;
  divisi_snapshot: string;
  status_keanggotaan_snapshot: StatusKeanggotaan;
  jabatan_snapshot?: string;
  shift: string;
  area_tugas: string;
  keterangan: string;
  tanggal: string;
  waktu: string;
  tanda_tangan?: string;
  created_at: string;
}
