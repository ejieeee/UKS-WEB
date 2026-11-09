import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';
import { useTheme, THEME_OPTIONS, AppTheme } from '../context/ThemeContext.js';

interface ThemeSwitcherProps {
  variant?: 'dropdown' | 'cards';
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = 'dropdown',
  className = '',
}) => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'cards') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3.5 ${className}`}>
        {THEME_OPTIONS.map((opt) => {
          const isSelected = theme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              className={`p-4 rounded-2xl text-left border transition-all cursor-pointer relative flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-[#FFFDF8] border-[#984B50] ring-2 ring-[#984B50]/20 shadow-xs'
                  : 'bg-[#FFFDF8]/70 border-[#EAE3D7] hover:border-[#D8D1C3] hover:bg-[#FFFDF8]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-sm text-[#343630]">
                    {opt.name}
                  </span>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-[#984B50] text-[#FFFDF8] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#85847D] mt-1 font-sans leading-relaxed">
                  {opt.description}
                </p>
              </div>

              {/* Color Swatch Preview Pill */}
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#F8F6F0] border border-[#EAE3D7] justify-between text-[11px] text-[#85847D]">
                <span>Pratinjau:</span>
                <div className="flex items-center gap-1">
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                    style={{ backgroundColor: opt.previewBg }}
                    title="Latar Belakang"
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                    style={{ backgroundColor: opt.previewCard }}
                    title="Kartu"
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                    style={{ backgroundColor: opt.previewAccent }}
                    title="Aksen Utama"
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                    style={{ backgroundColor: opt.previewSecondary }}
                    title="Aksen Sekunder"
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // Dropdown Variant for Navbar
  const currentOption = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-medium text-[#343630] bg-[#FFFDF8] hover:bg-[#F8F6F0] border border-[#EAE3D7] shadow-2xs transition-all cursor-pointer"
        title="Ubah Tema Tampilan"
        aria-label="Ubah Tema Tampilan"
      >
        <Palette className="w-3.5 h-3.5 text-[#984B50]" />
        <span className="hidden sm:inline font-sans font-medium">{currentOption.name}</span>
        <span
          className="w-3 h-3 rounded-full border border-black/10 shrink-0"
          style={{ backgroundColor: currentOption.previewBg }}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-64 bg-[#FFFDF8] rounded-2xl shadow-xl border border-[#EAE3D7] p-2 z-50 animate-in fade-in-50 slide-in-from-top-1 duration-150 space-y-1">
          <div className="px-2.5 py-1.5 border-b border-[#EAE3D7]/70 text-[11px] font-sans font-semibold uppercase tracking-wider text-[#85847D] flex items-center justify-between">
            <span>Pilih Tema (3 Mode)</span>
            <Sparkles className="w-3 h-3 text-[#984B50]" />
          </div>

          {THEME_OPTIONS.map((opt) => {
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setTheme(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-center justify-between group cursor-pointer ${
                  isSelected
                    ? 'bg-[#F8F6F0] text-[#343630] font-semibold border border-[#EAE3D7]'
                    : 'hover:bg-[#F8F6F0]/70 text-[#85847D] hover:text-[#343630]'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="flex items-center shrink-0 -space-x-1">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: opt.previewBg }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: opt.previewAccent }}
                    />
                  </div>
                  <span className="truncate">{opt.name}</span>
                </div>

                {isSelected && <Check className="w-3.5 h-3.5 text-[#984B50] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
