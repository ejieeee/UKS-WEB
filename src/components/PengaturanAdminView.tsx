import React, { useState } from 'react';
import { KeyRound, Shield, CheckCircle2, AlertCircle, Palette, BookOpen, Download } from 'lucide-react';
import { getMakassarDateTime } from '../utils/timezone.js';
import { apiFetch } from '../services/mockApi.js';
import { ThemeSwitcher } from './ThemeSwitcher.js';

interface PengaturanAdminViewProps {
  token: string;
  adminUsername: string;
  onUpdateAdmin: (newUsername: string, newToken: string) => void;
  enableVisiMisi: boolean;
  onToggleVisiMisi: (enabled: boolean) => void;
}

export const PengaturanAdminView: React.FC<PengaturanAdminViewProps> = ({
  token,
  adminUsername,
  onUpdateAdmin,
  enableVisiMisi,
  onToggleVisiMisi,
}) => {
  const [username, setUsername] = useState(adminUsername);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [visiMisiNotif, setVisiMisiNotif] = useState<string | null>(null);

  const currentMakassar = getMakassarDateTime();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPassword) {
      setErrorMsg('Password saat ini wajib diisi untuk verifikasi keamanan.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi password baru tidak cocok.');
      return;
    }

    if (newPassword && newPassword.length < 5) {
      setErrorMsg('Password baru minimal 5 karakter.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiFetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_username: username,
          new_password: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memperbarui profil admin.');
      }

      setSuccessMsg('Profil dan keamanan admin berhasil diperbarui.');
      onUpdateAdmin(data.admin.username, data.token);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#343630] tracking-tight flex items-center gap-2">
          <span>Pengaturan Akun & Tampilan</span>
        </h2>
        <p className="text-xs sm:text-sm font-editorial italic text-[#85847D] mt-0.5">
          Kelola tema tampilan aplikasi, kredensial sekretaris, dan preferensi keamanan.
        </p>
      </div>

      {/* TEMA TAMPILAN APLIKASI */}
      <div className="bg-[#FFFDF8] rounded-2xl border border-[#EAE3D7] p-5 sm:p-6 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#984B50]" />
          <h3 className="font-serif font-bold text-base text-[#343630]">
            Tema Tampilan Aplikasi (3 Mode)
          </h3>
        </div>
        <p className="text-xs text-[#85847D] font-sans">
          Pilih suasana visual antarmuka presensi digital PMR Wira. Perubahan tema langsung diterapkan di seluruh aplikasi.
        </p>

        <ThemeSwitcher variant="cards" className="pt-1" />
      </div>

      {/* PENGATURAN HALAMAN VISI & MISI */}
      <div className="bg-[#FFFDF8] rounded-2xl border border-[#EAE3D7] p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#984B50]" />
            <h3 className="font-serif font-bold text-base text-[#343630]">
              Halaman Pembuka Visi & Misi PMR
            </h3>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded font-medium border ${
            enableVisiMisi 
              ? 'bg-[var(--color-accent-secondary-bg)] text-[var(--color-accent-secondary)] border-[var(--color-border-main)]' 
              : 'bg-[var(--color-subtle)] text-[var(--color-text-muted)] border-[var(--color-border-main)]'
          }`}>
            {enableVisiMisi ? 'Aktif' : 'Nonaktif'}
          </span>
        </div>

        <p className="text-xs text-[#85847D] font-sans leading-relaxed">
          Tentukan apakah halaman piagam Visi, Misi, Tri Bakti, dan 7 Prinsip Dasar Kepalangmerahan ditampilkan sebagai pengantar sebelum anggota masuk ke formulir presensi.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              onToggleVisiMisi(true);
              setVisiMisiNotif('Halaman Visi & Misi telah diaktifkan sebagai pengantar presensi.');
              setTimeout(() => setVisiMisiNotif(null), 3500);
            }}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              enableVisiMisi
                ? 'bg-[#F8F6F0] border-[#984B50] ring-1 ring-[#984B50]'
                : 'bg-[#FFFDF8] border-[#EAE3D7] hover:border-[#D8D1C3]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-[#343630]">Aktif (Tampilkan Pengantar)</span>
              {enableVisiMisi && <CheckCircle2 className="w-4 h-4 text-[#984B50]" />}
            </div>
            <p className="text-[11px] text-[#85847D] leading-snug">
              Menampilkan Piagam Visi Misi & semboyan "Siamo Tutti Fratelli" terlebih dahulu dengan tombol lanjut ke absensi.
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              onToggleVisiMisi(false);
              setVisiMisiNotif('Halaman Visi & Misi dinonaktifkan. Pengunjung akan langsung menuju form presensi.');
              setTimeout(() => setVisiMisiNotif(null), 3500);
            }}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              !enableVisiMisi
                ? 'bg-[#F8F6F0] border-[#984B50] ring-1 ring-[#984B50]'
                : 'bg-[#FFFDF8] border-[#EAE3D7] hover:border-[#D8D1C3]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-[#343630]">Nonaktif (Langsung Presensi)</span>
              {!enableVisiMisi && <CheckCircle2 className="w-4 h-4 text-[#984B50]" />}
            </div>
            <p className="text-[11px] text-[#85847D] leading-snug">
              Bypass halaman pengantar. Pengunjung langsung disajikan formulir pencarian nama dan tanda tangan digital.
            </p>
          </button>
        </div>

        {visiMisiNotif && (
          <div className="p-3 bg-[#F8F6F0] border border-[#A5B19B] text-[#77846B] rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{visiMisiNotif}</span>
          </div>
        )}
      </div>

      {successMsg && (
        <div className="p-4 bg-[#FFFDF8] border border-[#A5B19B] text-[#77846B] rounded-xl text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#77846B] shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-[#FFFDF8] border border-[#C99491] text-[#984B50] rounded-xl text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-[#984B50] shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="bg-[#FFFDF8] rounded-2xl border border-[#EAE3D7] p-6 sm:p-7 shadow-2xs">
        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-medium text-[#343630] mb-1.5 font-sans">
              Nama Pengguna (Username)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl text-base sm:text-sm text-[#343630] focus:ring-1 focus:ring-[#984B50] focus:outline-none"
            />
          </div>

          <div className="pt-2 border-t border-[#EAE3D7]">
            <span className="text-xs font-semibold text-[#343630] uppercase tracking-wider block mb-3 font-sans">
              Ganti Kata Sandi
            </span>

            <div className="space-y-3">
              <div>
                <label className="block font-medium text-[#343630] mb-1.5 font-sans">
                  Password Saat Ini <span className="text-[#984B50]">*</span>
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan password admin saat ini"
                  required
                  className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl text-base sm:text-sm text-[#343630] focus:ring-1 focus:ring-[#984B50] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[#343630] mb-1.5 font-sans">
                  Password Baru (Kosongkan jika tidak ingin mengganti)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 5 karakter"
                  className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl text-base sm:text-sm text-[#343630] focus:ring-1 focus:ring-[#984B50] focus:outline-none"
                />
              </div>

              {newPassword && (
                <div>
                  <label className="block font-medium text-[#343630] mb-1.5 font-sans">
                    Konfirmasi Password Baru <span className="text-[#984B50]">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang password baru"
                    required
                    className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl text-base sm:text-sm text-[#343630] focus:ring-1 focus:ring-[#984B50] focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] bg-[#984B50] hover:bg-[#853f44] text-[#FFFDF8] font-medium rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* EKSPOR & MIGRASI KE AI STUDIO AKUN LAIN */}
      <div className="bg-[#FFFDF8] rounded-2xl border border-[#EAE3D7] p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-[#984B50]" />
          <h3 className="font-serif font-bold text-base text-[#343630]">
            Pindahkan Proyek ke Akun AI Studio Lain (Import)
          </h3>
        </div>

        <p className="text-xs text-[#85847D] leading-relaxed">
          Agar proyek ini dapat dibuka dan dilanjutkan pada akun Google AI Studio di laptop lain dengan tampilan dan kode 100% persis, ikuti salah satu dari dua metode di bawah ini:
        </p>

        {/* METODE 1: GITHUB (REKOMENDASI RESMI AI STUDIO) */}
        <div className="p-4 rounded-xl bg-[#F8F6F0] border border-[#EAE3D7] space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-xs text-[#984B50]">Metode 1: Import dari GitHub (Resmi & Otomatis)</span>
          </div>
          <ol className="text-xs text-[#343630] space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>Di layar AI Studio akun ini, klik tombol <strong>"Export to GitHub"</strong> (ikon GitHub di bilah atas AI Studio).</li>
            <li>Simpan proyek ke repositori GitHub Anda (misal: <code>absensi-digital-pmr</code>).</li>
            <li>Di laptop / akun Google lain: Buka <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-[#984B50] underline">Google AI Studio</a>.</li>
            <li>Pilih <strong>"Create New App"</strong> lalu klik <strong>"Import from GitHub"</strong> dan pilih repositori Anda. AI Studio akan langsung mengkloning dan menjalankan seluruh sistem dengan persis.</li>
          </ol>
        </div>

        {/* METODE 2: UNDUH ZIP LENGKAP */}
        <div className="p-4 rounded-xl bg-[#F8F6F0] border border-[#EAE3D7] space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-xs text-[#77846B]">Metode 2: Unduh File ZIP Lengkap (.zip)</span>
          </div>
          <p className="text-xs text-[#85847D] leading-relaxed">
            Paket ZIP bersih terbaru telah disiapkan berisi seluruh kode frontend, backend Express, aset tema, dan konfigurasi Vite.
          </p>
          <div>
            <a
              href="/absensi-digital-pmr-terbaru.zip"
              download="absensi-digital-pmr-terbaru.zip"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#984B50] hover:bg-[#853f44] text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh File absensi-digital-pmr-terbaru.zip (4.7 MB)</span>
            </a>
          </div>
        </div>
      </div>

      {/* System info plaque */}
      <div className="bg-[#FFFDF8] rounded-2xl border border-[#EAE3D7] p-5 text-xs text-[#85847D] space-y-2">
        <div className="flex items-center gap-2 font-serif font-bold text-[#343630]">
          <Shield className="w-4 h-4 text-[#77846B]" />
          <span>Informasi Sistem & Parameter Keamanan</span>
        </div>
        <p className="font-editorial italic">
          • <strong>Zona Waktu Terdaftar:</strong> Asia/Makassar (WITA, UTC+8) — {currentMakassar.formattedDateIndo} pukul {currentMakassar.waktu} WITA.
        </p>
        <p>
          • <strong>Autentikasi:</strong> Enkripsi sandi menggunakan standar Bcrypt Salted Hashing dan JSON Web Token (JWT) dengan masa aktif 12 jam.
        </p>
        <p>
          • <strong>Integritas Database:</strong> SQLite WAL mode dengan snapshot histori absensi independen dari siklus hidup data anggota.
        </p>
      </div>
    </div>
  );
};
