import React from 'react';
import { ShieldCheck, User, GraduationCap, Building2, RotateCcw } from 'lucide-react';
import { StatusKeanggotaan } from '../types.js';

interface StatusBadgeProps {
  status: StatusKeanggotaan | string;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * MemberStatusBadge - Anti-Slop Editorial Stamp Badge
 * Clean, structured typographic indicator without candy pill enclosures.
 */
export const MemberStatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const isPengurus = status === 'Pengurus';

  if (isPengurus) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-sans font-bold uppercase tracking-wider rounded-md bg-[#984B50]/10 text-[#984B50] border border-[#984B50]/35 transition-colors ${
          size === 'sm'
            ? 'text-[9px] px-2 py-0.5'
            : 'text-[10px] px-2.5 py-1'
        } ${className}`}
        title="Status Keanggotaan: Pengurus Organisasi"
      >
        <ShieldCheck className={size === 'sm' ? 'w-3 h-3 text-[#984B50]' : 'w-3.5 h-3.5 text-[#984B50]'} />
        <span>Pengurus</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-sans font-semibold uppercase tracking-wider rounded-md bg-[#77846B]/10 text-[#77846B] border border-[#77846B]/35 transition-colors ${
        size === 'sm'
          ? 'text-[9px] px-2 py-0.5'
          : 'text-[10px] px-2.5 py-1'
      } ${className}`}
      title="Status Keanggotaan: Anggota PMR"
    >
      <User className={size === 'sm' ? 'w-3 h-3 text-[#77846B]' : 'w-3.5 h-3.5 text-[#77846B]'} />
      <span>Anggota</span>
    </span>
  );
};

interface JabatanBadgeProps {
  jabatan?: string | null;
  status?: StatusKeanggotaan | string;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * MemberJabatanBadge - Anti-Slop Prestigious Editorial Title Plaque
 * Displays official organizational roles for Pengurus with crisp pure typography.
 */
export const MemberJabatanBadge: React.FC<JabatanBadgeProps> = ({
  jabatan,
  status = 'Pengurus',
  size = 'md',
  className = '',
}) => {
  // Requirement: "tampilkan jabatan hanya untuk Pengurus"
  if (status !== 'Pengurus' || !jabatan?.trim()) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center font-serif font-bold rounded-md bg-[#FFFDF8] text-[#634914] border border-[#D4AF37]/60 shadow-2xs ${
        size === 'sm'
          ? 'text-[10px] px-2 py-0.5'
          : 'text-[11px] px-2.5 py-1'
      } ${className}`}
      title={`Jabatan Organisasi: ${jabatan}`}
    >
      <span className="tracking-tight">{jabatan}</span>
    </span>
  );
};

interface MemberDetailsCardProps {
  nama: string;
  kelas: string;
  divisi: string;
  status: StatusKeanggotaan | string;
  jabatan?: string;
  waktuText?: string;
  onReset?: () => void;
  resetLabel?: string;
  moduleLabel?: string;
}

/**
 * MemberDetailsCard - Anti-Slop Vintage Botanical Identity Plaque
 * Replaces generic cards with a clean, unboxed stationery layout.
 */
export const MemberDetailsCard: React.FC<MemberDetailsCardProps> = ({
  nama,
  kelas,
  divisi,
  status,
  jabatan,
  waktuText,
  onReset,
  resetLabel = 'Ganti Anggota',
  moduleLabel = 'Anggota Terpilih',
}) => {
  return (
    <div className="bg-[#F8F6F0] border border-[#EAE3D7] rounded-2xl p-4 sm:p-5 relative shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2.5">
          {/* Status & Jabatan Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-sans font-bold tracking-widest uppercase text-[#77846B]">
              {moduleLabel}
            </span>
            <span className="text-[#D8D1C3]" aria-hidden="true">•</span>
            <MemberStatusBadge status={status} size="sm" />
            <MemberJabatanBadge status={status} jabatan={jabatan} size="sm" />
          </div>

          {/* Member Full Name */}
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#343630] leading-tight">
            {nama}
          </h3>

          {/* Clean Unboxed Metadata Line with Typographic Separators */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#85847D] font-sans">
            <span className="inline-flex items-center gap-1 font-medium text-[#343630]">
              <GraduationCap className="w-3.5 h-3.5 text-[#77846B]" />
              {kelas}
            </span>
            <span className="text-[#D8D1C3]" aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 font-medium text-[#77846B]">
              <Building2 className="w-3.5 h-3.5 text-[#984B50]" />
              Divisi {divisi}
            </span>
          </div>

          {waktuText && (
            <p className="text-[11px] text-[#85847D]/85 font-editorial italic pt-1 border-t border-[#EAE3D7]/70 mt-2">
              {waktuText}
            </p>
          )}
        </div>

        {/* Change Member Button */}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#85847D] hover:text-[#984B50] bg-[#FFFDF8] hover:bg-[#EAE3D7]/50 border border-[#EAE3D7] rounded-xl transition-colors cursor-pointer shrink-0 self-start"
            title="Pilih anggota lain"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{resetLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};
