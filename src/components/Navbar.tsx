import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldCheck, Clock, BookOpen } from 'lucide-react';
import { getMakassarDateTime } from '../utils/timezone.js';
import { ThemeSwitcher } from './ThemeSwitcher.js';

interface NavbarProps {
  activePortal: 'visimisi' | 'absensi' | 'admin';
  onSelectPortal: (portal: 'visimisi' | 'absensi' | 'admin') => void;
  isAdminLoggedIn: boolean;
  enableVisiMisi: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePortal,
  onSelectPortal,
  isAdminLoggedIn,
  enableVisiMisi,
}) => {
  const [timeInfo, setTimeInfo] = useState(getMakassarDateTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeInfo(getMakassarDateTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-canvas)]/95 backdrop-blur-md border-b border-[var(--color-border-main)] transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo & Name */}
          <div
            onClick={() => onSelectPortal(enableVisiMisi ? 'visimisi' : 'absensi')}
            className="flex items-center gap-3 cursor-pointer group whitespace-nowrap shrink-0"
            title={enableVisiMisi ? 'Ke Halaman Visi & Misi' : 'Ke Presensi'}
          >
            <div className="relative flex items-center justify-center w-8 h-8 bg-[var(--color-card)] rounded-lg border border-[var(--color-border-main)] shrink-0 group-hover:border-[var(--color-accent-primary)] transition-colors">
              <div className="relative w-3.5 h-3.5 flex items-center justify-center">
                <div className="absolute w-1 h-3.5 bg-[var(--color-accent-primary)]"></div>
                <div className="absolute w-3.5 h-1 bg-[var(--color-accent-primary)]"></div>
              </div>
            </div>

            <span className="font-serif text-lg font-normal tracking-tight text-[var(--color-text-main)]">
              PMR Wira
            </span>
          </div>

          {/* Center / Navigation Links on desktop */}
          {enableVisiMisi && (
            <div className="hidden sm:flex items-center gap-1 bg-[var(--color-subtle)] p-1 rounded-xl border border-[var(--color-border-main)]">
              <button
                type="button"
                onClick={() => onSelectPortal('visimisi')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activePortal === 'visimisi'
                    ? 'bg-[var(--color-card)] text-[var(--color-text-main)] shadow-2xs'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                <span>Visi & Misi</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectPortal('absensi')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activePortal === 'absensi'
                    ? 'bg-[var(--color-card)] text-[var(--color-text-main)] shadow-2xs font-semibold'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-[var(--color-accent-secondary)]" />
                <span>Presensi</span>
              </button>
            </div>
          )}

          {/* Right Action: Theme Switcher & Admin Portal Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Switcher Dropdown */}
            <ThemeSwitcher variant="dropdown" />

            {/* Live Time WITA (subtle badge) */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FFFDF8] border border-[#EAE3D7] text-xs text-[#85847D]">
              <Clock className="w-3.5 h-3.5 text-[#984B50]" />
              <span className="tabular-nums font-medium text-[#343630]">{timeInfo.waktu}</span>
              <span className="text-[10px] font-semibold text-[#984B50]">WITA</span>
            </div>

            {activePortal === 'admin' ? (
              <button
                type="button"
                onClick={() => onSelectPortal('absensi')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-medium text-[var(--color-accent-secondary)] hover:bg-[var(--color-card)] border border-[var(--color-border-main)] transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Presensi</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSelectPortal('admin')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-card)] border border-transparent hover:border-[var(--color-border-main)] transition-colors cursor-pointer"
                title="Masuk ke Portal Admin / Sekretaris"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                <span className="hidden sm:inline">Portal Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
