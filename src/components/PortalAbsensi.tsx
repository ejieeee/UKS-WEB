import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  CheckCircle2,
  RotateCcw,
  Send,
  AlertCircle,
  Clock,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Anggota } from '../types.js';
import { SignaturePad } from './SignaturePad.js';
import { getMakassarDateTime } from '../utils/timezone.js';
import { apiFetch } from '../services/mockApi.js';
import { MemberStatusBadge, MemberJabatanBadge, MemberDetailsCard } from './MemberBadges.js';

interface PortalAbsensiProps {
  onBackToVisiMisi?: () => void;
}

export const PortalAbsensi: React.FC<PortalAbsensiProps> = ({ onBackToVisiMisi }) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Anggota[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Selected member state
  const [selectedMember, setSelectedMember] = useState<Anggota | null>(null);

  // Signature state
  const [signatureData, setSignatureData] = useState<string | null>(null);

  // Status checks & submissions
  const [isCheckingToday, setIsCheckingToday] = useState(false);
  const [alreadyAttendedInfo, setAlreadyAttendedInfo] = useState<{
    alreadyAttended: boolean;
    waktu?: string;
    tanggal?: string;
    message?: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<{
    nama: string;
    waktu: string;
    tanggal: string;
    kelas: string;
    divisi: string;
    status_keanggotaan: string;
    jabatan?: string;
  } | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Real-time ticker in Makassar timezone
  const [currentTime, setCurrentTime] = useState(getMakassarDateTime());

  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getMakassarDateTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live autocomplete search with debouncing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const res = await apiFetch(`/api/anggota/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data: Anggota[] = await res.json();
          // Show top 5 results for clean display
          setSearchResults(data.slice(0, 5));
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Failed to search members:', err);
      } finally {
        setIsSearching(false);
      }
    }, 120);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const checkMemberAttendance = async (member: Anggota) => {
    setIsCheckingToday(true);
    setAlreadyAttendedInfo(null);
    setErrorMessage(null);
    try {
      const res = await apiFetch(`/api/absensi/check-today?anggota_id=${member.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.alreadyAttended) {
          setAlreadyAttendedInfo(data);
        }
      }
    } catch (err) {
      console.error('Failed to check attendance:', err);
    } finally {
      setIsCheckingToday(false);
    }
  };

  const handleSelectMember = (member: Anggota) => {
    setSelectedMember(member);
    setSearchQuery('');
    setShowDropdown(false);
    setSignatureData(null);
    setSubmitSuccess(null);
    setErrorMessage(null);
    checkMemberAttendance(member);
  };

  const handleResetForm = () => {
    setSelectedMember(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
    setSignatureData(null);
    setAlreadyAttendedInfo(null);
    setErrorMessage(null);
    setSubmitSuccess(null);
  };

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) {
      setErrorMessage('Silakan pilih nama anggota terlebih dahulu.');
      return;
    }

    if (alreadyAttendedInfo?.alreadyAttended) {
      setErrorMessage(
        `Pemberitahuan: ${selectedMember.nama} sudah melakukan absensi hari ini pada pukul ${alreadyAttendedInfo.waktu} WITA.`
      );
      return;
    }

    if (!signatureData) {
      setErrorMessage('Tanda tangan digital wajib dibubuhkan sebelum mengirim absensi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await apiFetch('/api/absensi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anggota_id: selectedMember.id,
          tanda_tangan: signatureData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.sudahAbsen) {
          setAlreadyAttendedInfo({
            alreadyAttended: true,
            waktu: data.waktu,
            message: data.error,
          });
        }
        setErrorMessage(data.error || 'Gagal mengirim absensi.');
        return;
      }

      // Elegant watercolor confetti
      try {
        confetti({
          particleCount: 60,
          spread: 55,
          origin: { y: 0.6 },
          colors: ['#984B50', '#C99491', '#A5B19B', '#77846B', '#F8F6F0'],
        });
      } catch (e) {
        // Ignored
      }

      setSubmitSuccess({
        nama: data.absensi.nama,
        waktu: data.absensi.waktu,
        tanggal: data.absensi.tanggal,
        kelas: `${data.absensi.angkatan} ${data.absensi.kelas_jurusan}`,
        divisi: data.absensi.divisi,
        status_keanggotaan: data.absensi.status_keanggotaan || selectedMember.status_keanggotaan,
        jabatan: data.absensi.jabatan || selectedMember.jabatan,
      });

      setSelectedMember(null);
      setSignatureData(null);
      setAlreadyAttendedInfo(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi gangguan saat mengirim absensi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
      {onBackToVisiMisi && (
        <button
          type="button"
          onClick={onBackToVisiMisi}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-subtle)] transition-colors mb-6 cursor-pointer border border-transparent hover:border-[var(--color-border-main)]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Visi & Misi PMR</span>
        </button>
      )}

      {/* 1. HERO SECTION */}
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-widest font-sans text-[var(--color-text-muted)] mb-2">
          Palang Merah Remaja Wira
        </p>

        <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[var(--color-text-main)] tracking-tight text-balance">
          Presensi Kehadiran Anggota
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[var(--color-text-muted)] max-w-md mx-auto leading-relaxed">
          Pilih nama anggota dan bubuhkan tanda tangan digital Anda untuk memvalidasi kehadiran hari ini.
        </p>
      </div>

      {/* 2. SUCCESS FEEDBACK STATE */}
      {submitSuccess && (
        <div className="mb-6 p-6 sm:p-7 bg-[#FFFDF8] border border-[#A5B19B] rounded-2xl shadow-xs text-center animate-in fade-in duration-200">
          <div className="w-12 h-12 bg-[#A5B19B]/20 text-[#77846B] rounded-full flex items-center justify-center mx-auto mb-3 border border-[#A5B19B]/40">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#343630]">
            Absensi Berhasil Dicatat
          </h2>
          <p className="text-xs text-[#77846B] font-editorial italic mt-0.5">
            Terima kasih telah melakukan presensi kehadiran tepat waktu.
          </p>

          <div className="mt-5 max-w-md mx-auto bg-[#F8F6F0] rounded-xl p-4 border border-[#EAE3D7] text-left text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[#85847D]">Nama Anggota:</span>
              <span className="font-serif font-bold text-[#343630] text-sm">{submitSuccess.nama}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#85847D]">Status Keanggotaan:</span>
              <div className="flex items-center gap-1.5">
                <MemberStatusBadge status={submitSuccess.status_keanggotaan} size="sm" />
                <MemberJabatanBadge status={submitSuccess.status_keanggotaan} jabatan={submitSuccess.jabatan} size="sm" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#85847D]">Kelas / Divisi:</span>
              <span className="font-medium text-[#343630]">
                {submitSuccess.kelas} • Divisi {submitSuccess.divisi}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-[#EAE3D7] pt-2">
              <span className="text-[#85847D]">Waktu Absensi:</span>
              <span className="font-medium text-[#984B50] tabular-nums">
                {submitSuccess.waktu} WITA ({submitSuccess.tanggal})
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleResetForm}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#984B50] hover:bg-[#853f44] text-[#FFFDF8] text-xs sm:text-sm font-medium rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <span>Selesai</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. MAIN ATTENDANCE CARD */}
      {!submitSuccess && (
        <div className="bg-[#FFFDF8] rounded-2xl border border-[#EAE3D7] shadow-xs p-6 sm:p-8 space-y-6">
          {/* SEARCH BAR */}
          <div ref={searchContainerRef} className="relative space-y-1.5">
            <label
              htmlFor="member-search-input"
              className="block text-xs font-semibold text-[#343630] font-sans"
            >
              Cari Nama Anggota
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#85847D]">
                <Search className="w-4 h-4 text-[#984B50]" />
              </div>

              <input
                id="member-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowDropdown(true);
                }}
                placeholder="Cari nama anggota..."
                autoComplete="off"
                className="w-full pl-10 pr-4 py-3 bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl text-sm text-[#343630] placeholder:text-[#85847D]/60 focus:ring-1 focus:ring-[#984B50] focus:border-[#984B50] focus:outline-none transition-all shadow-2xs"
              />

              {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                  <div className="w-4 h-4 border-2 border-[#984B50] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            <p className="text-[11px] text-[#85847D] font-sans">
              Ketik nama Anda untuk memulai absensi.
            </p>

            {/* AUTOCOMPLETE DROPDOWN WITH BADGES */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-[#FFFDF8] rounded-xl shadow-lg border border-[#EAE3D7] divide-y divide-[#EAE3D7]/60 overflow-hidden animate-in fade-in-50 slide-in-from-top-1 duration-150">
                {searchResults.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleSelectMember(member)}
                    className="w-full text-left p-3.5 hover:bg-[#F8F6F0] transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="space-y-1">
                      {/* Nama Anggota & Visual Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-serif font-bold text-[#343630] group-hover:text-[#984B50]">
                          {member.nama}
                        </h4>
                        <MemberStatusBadge status={member.status_keanggotaan || 'Anggota'} size="sm" />
                        <MemberJabatanBadge
                          status={member.status_keanggotaan || 'Anggota'}
                          jabatan={member.jabatan}
                          size="sm"
                        />
                      </div>
                      {/* Format Pendukung: Kelas • Angkatan • Divisi */}
                      <p className="text-xs text-[#85847D] font-sans">
                        {member.angkatan} {member.kelas_jurusan} • Divisi {member.divisi}
                      </p>
                    </div>

                    <span className="text-xs font-medium text-[#984B50] group-hover:translate-x-0.5 transition-transform font-editorial italic shrink-0 ml-3">
                      Pilih &rarr;
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Empty State */}
            {showDropdown && searchQuery.trim() !== '' && searchResults.length === 0 && !isSearching && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-[#FFFDF8] rounded-xl shadow-md border border-[#EAE3D7] p-4 text-center text-xs text-[#85847D]">
                Nama anggota tidak ditemukan. Periksa kembali ejaan nama Anda.
              </div>
            )}
          </div>

          {/* INFORMASI ANGGOTA TERPILIH */}
          {selectedMember && (
            <div className="pt-4 border-t border-[#EAE3D7] space-y-5 animate-in fade-in duration-150">
              <MemberDetailsCard
                nama={selectedMember.nama}
                kelas={`${selectedMember.angkatan} ${selectedMember.kelas_jurusan}`}
                divisi={selectedMember.divisi}
                status={selectedMember.status_keanggotaan || 'Anggota'}
                jabatan={selectedMember.jabatan}
                waktuText={`${currentTime.formattedDateIndo} • ${currentTime.waktu} WITA`}
                onReset={handleResetForm}
                moduleLabel="Anggota Terpilih"
              />

              {/* Status Checking Indicator */}
              {isCheckingToday && (
                <div className="p-3 bg-[#FFFDF8] border border-[#EAE3D7] rounded-xl text-center text-xs text-[#85847D] flex items-center justify-center gap-2 font-editorial italic">
                  <div className="w-3.5 h-3.5 border-2 border-[#984B50] border-t-transparent rounded-full animate-spin"></div>
                  <span>Memeriksa catatan kehadiran hari ini...</span>
                </div>
              )}

              {/* Already Attended Warning */}
              {alreadyAttendedInfo?.alreadyAttended && (
                <div className="p-4 bg-[#FFFDF8] border border-[#C99491] rounded-xl text-[#343630] flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#984B50] shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm">
                    <h5 className="font-serif font-bold text-[#984B50]">
                      Sudah Melakukan Absensi Hari Ini
                    </h5>
                    <p className="mt-1 text-[#85847D] leading-relaxed">
                      {selectedMember.nama} telah tercatat hadir pada hari ini pukul{' '}
                      <strong className="text-[#343630] font-sans">{alreadyAttendedInfo.waktu} WITA</strong>.
                    </p>
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 bg-[#EAE3D7] hover:bg-[#ded6c7] text-[#343630] text-xs font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Pilih Anggota Lain
                    </button>
                  </div>
                </div>
              )}

              {/* AREA TANDA TANGAN (If not already attended) */}
              {!alreadyAttendedInfo?.alreadyAttended && (
                <div className="space-y-4 pt-2">
                  <SignaturePad
                    hasSignature={!!signatureData}
                    onSave={(dataUrl) => {
                      setSignatureData(dataUrl);
                      if (dataUrl && errorMessage) setErrorMessage(null);
                    }}
                  />

                  {errorMessage && (
                    <div className="p-3 bg-[#FFFDF8] border border-[#C99491] rounded-xl text-[#984B50] text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-[#984B50]" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* TOMBOL KIRIM ABSENSI */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSubmitAttendance}
                      disabled={isSubmitting || !signatureData}
                      className="w-full py-3 bg-[#984B50] hover:bg-[#853f44] disabled:bg-[#D8D1C3] disabled:cursor-not-allowed text-[#FFFDF8] text-sm font-medium rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#FFFDF8] border-t-transparent rounded-full animate-spin"></div>
                          <span>Mengirim Absensi...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Kirim Absensi</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer Info Note */}
      <div className="mt-8 text-center text-xs font-editorial italic text-[#85847D]">
        <p>Palang Merah Remaja Wira • Waktu Layanan: Asia/Makassar (WITA, UTC+8)</p>
      </div>
    </div>
  );
};
