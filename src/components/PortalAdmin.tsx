import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { RekapAbsensiView } from './RekapAbsensiView.js';
import { DataAnggotaView } from './DataAnggotaView.js';
import { PengaturanAdminView } from './PengaturanAdminView.js';
import loginBotanicalImage from '../assets/images/botanical_login_split_1794136771214.jpg';
import { apiFetch } from '../services/mockApi.js';

const LOGIN_BOTANICAL_IMAGE = loginBotanicalImage;

interface PortalAdminProps {
  token: string | null;
  adminUsername: string | null;
  onLoginSuccess: (token: string, username: string) => void;
  onLogout: () => void;
  onUpdateAdmin: (newUsername: string, newToken: string) => void;
  enableVisiMisi: boolean;
  onToggleVisiMisi: (enabled: boolean) => void;
}

export const PortalAdmin: React.FC<PortalAdminProps> = ({
  token,
  adminUsername,
  onLoginSuccess,
  onLogout,
  onUpdateAdmin,
  enableVisiMisi,
  onToggleVisiMisi,
}) => {
  const [loginUsername, setLoginUsername] = useState('sekretaris');
  const [loginPassword, setLoginPassword] = useState('pmr123');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Default active view is Rekap Absensi
  const [activeMenu, setActiveMenu] = useState<'rekap' | 'anggota' | 'pengaturan'>('rekap');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileDrawerOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await apiFetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login gagal');
      }

      onLoginSuccess(data.token, data.admin.username);
      setActiveMenu('rekap');
    } catch (err: any) {
      setLoginError(err.message || 'Gagal terhubung ke server');
    } finally {
      setLoginLoading(false);
    }
  };

  // Split-layout botanical login page if not logged in
  if (!token) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-16">
        <div className="bg-[#FFFDF8] rounded-3xl border border-[#EAE3D7] shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Side: Botanical Illustration (compact on mobile, editorial on desktop) */}
          <div className="md:col-span-5 relative bg-[#F8F6F0] p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#EAE3D7]">
            <div>
              <span className="text-[10px] font-sans font-semibold tracking-widest uppercase text-[#77846B] block">
                Palang Merah Remaja
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#343630] mt-0.5">
                Portal Sekretariat
              </h3>
              <p className="text-xs font-editorial italic text-[#85847D] mt-0.5">
                "Siamo Tutti Fratelli" — Kita Semua Bersaudara
              </p>
            </div>

            {/* Botanical Artwork */}
            <div className="my-4 sm:my-6 relative rounded-2xl overflow-hidden border border-[#EAE3D7]/80 shadow-2xs">
              <img
                src={LOGIN_BOTANICAL_IMAGE}
                alt="Botanical watercolor study"
                className="w-full h-36 sm:h-64 object-cover object-center"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="text-[11px] font-editorial italic text-[#85847D] hidden sm:block border-t border-[#EAE3D7] pt-3">
              Administrasi Resmi Presensi & Data Anggota PMR Wira
            </div>
          </div>

          {/* Right Side: Clean Login Form */}
          <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-5">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#F8F6F0] border border-[#EAE3D7] flex items-center justify-center text-[#984B50] mb-2 sm:mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#343630]">
                Masuk ke Portal Admin
              </h2>
              <p className="text-xs sm:text-sm text-[#85847D] mt-1 font-sans">
                Akses terbatas untuk sekretaris dan pengurus PMR Wira.
              </p>
            </div>

            {loginError && (
              <div className="p-3.5 bg-[#FFFDF8] border border-[#C99491] rounded-xl text-[#984B50] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#984B50]" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#343630] mb-1.5 font-sans">
                  Nama Pengguna (Username)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#85847D]">
                    <User className="w-4 h-4" />
                  </div>
                  {/* Font size 16px (text-base) on mobile prevents iOS viewport auto-zoom */}
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Masukkan username admin"
                    required
                    className="w-full pl-10 pr-4 py-2.5 sm:py-2.5 min-h-[44px] bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl text-base sm:text-sm text-[#343630] focus:ring-1 focus:ring-[#984B50] focus:border-[#984B50] focus:outline-none transition-all placeholder:text-[#85847D]/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#343630] mb-1.5 font-sans">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#85847D]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan password admin"
                    required
                    className="w-full pl-10 pr-11 py-2.5 min-h-[44px] bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl text-base sm:text-sm text-[#343630] focus:ring-1 focus:ring-[#984B50] focus:border-[#984B50] focus:outline-none transition-all placeholder:text-[#85847D]/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#85847D] hover:text-[#343630] cursor-pointer"
                    aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl text-[11px] text-[#85847D] flex items-center justify-between font-editorial italic">
                <span>Kredensial Default:</span>
                <span className="font-sans font-medium text-[#343630] bg-[#FFFDF8] px-2 py-0.5 rounded border border-[#EAE3D7]">
                  sekretaris / pmr123
                </span>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full min-h-[44px] py-2.5 bg-[#984B50] hover:bg-[#853f44] disabled:bg-[#D8D1C3] text-[#FFFDF8] font-medium text-sm rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loginLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#FFFDF8] border-t-transparent rounded-full animate-spin"></div>
                    <span>Memverifikasi Akses...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Masuk ke Portal Admin</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Navigation Items
  const navigationItems = [
    {
      id: 'rekap' as const,
      label: 'Rekap Absensi',
      subtitle: 'Tabel arsip, filter & ekspor',
      icon: ClipboardList,
    },
    {
      id: 'anggota' as const,
      label: 'Data Anggota',
      subtitle: 'Kelola anggota, kelas & divisi',
      icon: Users,
    },
    {
      id: 'pengaturan' as const,
      label: 'Pengaturan Admin',
      subtitle: 'Ubah password & keamanan',
      icon: Settings,
    },
  ];

  const currentNav = navigationItems.find((n) => n.id === activeMenu);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-8">
      {/* 1. MOBILE TOP NAVIGATION BAR (< lg) */}
      <div className="lg:hidden mb-4 bg-[#FFFDF8] rounded-2xl border border-[#EAE3D7] px-3.5 py-2.5 flex items-center justify-between shadow-2xs sticky top-16 z-30">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="w-10 h-10 -ml-1 flex items-center justify-center rounded-xl bg-[#F8F6F0] text-[#343630] border border-[#EAE3D7] hover:bg-[#EAE3D7]/60 transition-colors cursor-pointer"
            aria-label="Buka menu navigasi admin"
          >
            <Menu className="w-5 h-5 text-[#984B50]" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-sans font-semibold tracking-wider uppercase text-[#77846B]">
                Admin
              </span>
              <span className="text-[#D8D1C3]">·</span>
              <span className="font-serif font-bold text-sm text-[#343630]">
                {currentNav?.label}
              </span>
            </div>
          </div>
        </div>

        {/* Small admin username pill on mobile */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 pl-2 py-1 pr-2.5 rounded-lg bg-[#F8F6F0] border border-[#EAE3D7] text-xs font-medium text-[#343630]">
            <div className="w-5 h-5 rounded-md bg-[#984B50] text-[#FFFDF8] flex items-center justify-center text-[10px] font-bold">
              {adminUsername?.charAt(0).toUpperCase() || 'S'}
            </div>
            <span className="hidden xs:inline truncate max-w-[80px]">{adminUsername}</span>
          </div>
        </div>
      </div>

      {/* 2. MOBILE SLIDE-IN NAVIGATION DRAWER (< lg) */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-[#343630]/60 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-4/5 max-w-[320px] bg-[#FFFDF8] h-full shadow-2xl border-r border-[#EAE3D7] flex flex-col justify-between p-5 z-10 animate-in slide-in-from-left duration-200">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#EAE3D7]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F8F6F0] border border-[#EAE3D7] text-[#984B50] flex items-center justify-center font-bold text-sm">
                    {adminUsername?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div>
                    <span className="text-[10px] font-sans font-semibold text-[#77846B] tracking-wider uppercase block">
                      Sekretariat PMR
                    </span>
                    <h4 className="text-sm font-serif font-bold text-[#343630]">
                      {adminUsername}
                    </h4>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-[#85847D] hover:text-[#343630] hover:bg-[#F8F6F0] transition-colors cursor-pointer"
                  aria-label="Tutup menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items (Touch friendly >= 48px) */}
              <nav className="mt-4 space-y-1.5">
                <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#85847D] px-2 block mb-1">
                  Menu Utama
                </span>
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMenu === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveMenu(item.id);
                        setIsMobileDrawerOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all cursor-pointer min-h-[48px] ${
                        isActive
                          ? 'bg-[#984B50] text-[#FFFDF8] shadow-xs'
                          : 'text-[#343630] hover:bg-[#F8F6F0] hover:text-[#984B50]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#FFFDF8]' : 'text-[#77846B]'}`} />
                      <div className="overflow-hidden">
                        <span className="text-sm font-semibold block truncate">
                          {item.label}
                        </span>
                        <span
                          className={`text-[11px] block truncate font-editorial italic ${
                            isActive ? 'text-[#FFFDF8]/85' : 'text-[#85847D]'
                          }`}
                        >
                          {item.subtitle}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-[#EAE3D7] space-y-2">
              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-left text-xs font-semibold text-[#984B50] hover:bg-[#F8F6F0] transition-colors cursor-pointer min-h-[44px]"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar (Logout)</span>
              </button>

              <div className="text-[10px] font-editorial italic text-[#85847D] text-center pt-1">
                PMR Wira • Waktu Baku WITA (UTC+8)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN LAYOUT (DESKTOP SIDEBAR + MAIN CONTENT VIEW) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Editorial Sidebar (Persistent on lg+) */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="bg-[#FFFDF8] rounded-2xl border border-[#EAE3D7] p-4 shadow-2xs space-y-4 sticky top-24">
            {/* Admin Profile Plaque */}
            <div className="p-3.5 bg-[#F8F6F0] rounded-xl border border-[#EAE3D7] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFFDF8] border border-[#EAE3D7] text-[#984B50] flex items-center justify-center font-serif font-bold text-base shadow-2xs">
                {adminUsername?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] font-sans font-semibold text-[#77846B] tracking-wider uppercase block">
                  Sekretariat PMR
                </span>
                <h4 className="text-sm font-serif font-bold text-[#343630] truncate">
                  {adminUsername}
                </h4>
              </div>
            </div>

            {/* Desktop Navigation Menus */}
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveMenu(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all cursor-pointer min-h-[44px] ${
                      isActive
                        ? 'bg-[#984B50] text-[#FFFDF8] shadow-xs'
                        : 'text-[#343630] hover:bg-[#F8F6F0] hover:text-[#984B50]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FFFDF8]' : 'text-[#77846B]'}`} />
                    <div className="overflow-hidden">
                      <span className="text-xs font-semibold block truncate">
                        {item.label}
                      </span>
                      <span
                        className={`text-[10px] block truncate font-editorial italic ${
                          isActive ? 'text-[#FFFDF8]/80' : 'text-[#85847D]'
                        }`}
                      >
                        {item.subtitle}
                      </span>
                    </div>
                  </button>
                );
              })}

              {/* Logout Button */}
              <div className="pt-2 border-t border-[#EAE3D7]">
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-medium text-[#85847D] hover:text-[#984B50] hover:bg-[#F8F6F0] transition-colors cursor-pointer min-h-[44px]"
                >
                  <LogOut className="w-4 h-4 text-[#85847D]" />
                  <span>Keluar (Logout)</span>
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-9 w-full min-w-0">
          {activeMenu === 'rekap' && <RekapAbsensiView token={token} />}
          {activeMenu === 'anggota' && <DataAnggotaView token={token} />}
          {activeMenu === 'pengaturan' && (
            <PengaturanAdminView
              token={token}
              adminUsername={adminUsername || 'sekretaris'}
              onUpdateAdmin={onUpdateAdmin}
              enableVisiMisi={enableVisiMisi}
              onToggleVisiMisi={onToggleVisiMisi}
            />
          )}
        </main>
      </div>
    </div>
  );
};
