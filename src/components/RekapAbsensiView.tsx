import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Building2,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  User,
  GraduationCap
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Absensi, DAFTAR_KELAS_JURUSAN, DAFTAR_DIVISI } from '../types.js';
import { formatIndoDate, getMakassarDateTime } from '../utils/timezone.js';
import emptyBotanicalImage from '../assets/images/botanical_empty_state_1794136771538.jpg';
import { apiFetch } from '../services/mockApi.js';
import { MemberStatusBadge, MemberJabatanBadge } from './MemberBadges.js';

const EMPTY_BOTANICAL_IMAGE = emptyBotanicalImage;

interface RekapAbsensiViewProps {
  token: string;
}

const BULAN_OPTIONS = [
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

const ITEMS_PER_PAGE = 10;

export const RekapAbsensiView: React.FC<RekapAbsensiViewProps> = ({ token }) => {
  const [records, setRecords] = useState<Absensi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Period Filters
  const currentMakassar = getMakassarDateTime();
  const [filterBulan, setFilterBulan] = useState<string>(String(currentMakassar.month));
  const [filterTahun, setFilterTahun] = useState<string>(String(currentMakassar.year));
  const [filterAngkatan, setFilterAngkatan] = useState<string>(''); // '', 'XI', 'X'

  // Expandable Additional Filters
  const [isFilterLainnyaOpen, setIsFilterLainnyaOpen] = useState(false);
  const [filterKelas, setFilterKelas] = useState<string>('');
  const [filterDivisi, setFilterDivisi] = useState<string>('');
  const [searchName, setSearchName] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals
  const [selectedSignature, setSelectedSignature] = useState<{
    imageUrl: string;
    nama: string;
    tanggal: string;
    waktu: string;
  } | null>(null);

  const [detailModalRecord, setDetailModalRecord] = useState<Absensi | null>(null);
  const [editModalRecord, setEditModalRecord] = useState<Absensi | null>(null);
  const [deleteConfirmRecord, setDeleteConfirmRecord] = useState<Absensi | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (filterBulan) params.append('bulan', filterBulan);
    if (filterTahun) params.append('tahun', filterTahun);
    if (filterAngkatan) params.append('angkatan', filterAngkatan);
    if (filterKelas) params.append('kelas_jurusan', filterKelas);
    if (filterDivisi) params.append('divisi', filterDivisi);
    if (searchName.trim()) params.append('search', searchName.trim());
    params.append('sort_by', 'tanggal');
    params.append('sort_order', 'desc');

    try {
      const res = await apiFetch(`/api/absensi?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Gagal memuat data rekap absensi');
      const data = await res.json();
      setRecords(data);
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [filterBulan, filterTahun, filterAngkatan, filterKelas, filterDivisi, searchName]);

  const handleResetFilter = () => {
    setFilterBulan('');
    setFilterTahun('');
    setFilterAngkatan('');
    setFilterKelas('');
    setFilterDivisi('');
    setSearchName('');
    setCurrentPage(1);
  };

  // Active filter chips list for mobile & desktop overview
  const activeChips = useMemo(() => {
    const list: { id: string; label: string; onClear: () => void }[] = [];
    if (filterBulan) {
      const bLabel = BULAN_OPTIONS.find((b) => b.value === filterBulan)?.label || filterBulan;
      list.push({ id: 'bulan', label: `Bulan: ${bLabel}`, onClear: () => setFilterBulan('') });
    }
    if (filterTahun) {
      list.push({ id: 'tahun', label: `Tahun: ${filterTahun}`, onClear: () => setFilterTahun('') });
    }
    if (filterAngkatan) {
      list.push({ id: 'angkatan', label: `Angkatan ${filterAngkatan}`, onClear: () => setFilterAngkatan('') });
    }
    if (filterKelas) {
      list.push({ id: 'kelas', label: `Kelas: ${filterKelas}`, onClear: () => setFilterKelas('') });
    }
    if (filterDivisi) {
      list.push({ id: 'divisi', label: `Divisi: ${filterDivisi}`, onClear: () => setFilterDivisi('') });
    }
    if (searchName.trim()) {
      list.push({ id: 'search', label: `"${searchName.trim()}"`, onClear: () => setSearchName('') });
    }
    return list;
  }, [filterBulan, filterTahun, filterAngkatan, filterKelas, filterDivisi, searchName]);

  const hasAdditionalFilters = Boolean(filterKelas || filterDivisi || searchName.trim());

  // Pagination calculation
  const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return records.slice(start, start + ITEMS_PER_PAGE);
  }, [records, currentPage]);

  const handleExportExcel = async () => {
    const params = new URLSearchParams();
    if (filterBulan) params.append('bulan', filterBulan);
    if (filterTahun) params.append('tahun', filterTahun);
    if (filterAngkatan) params.append('angkatan', filterAngkatan);
    if (filterKelas) params.append('kelas_jurusan', filterKelas);
    if (filterDivisi) params.append('divisi', filterDivisi);
    if (searchName.trim()) params.append('search', searchName.trim());
    params.append('sort_by', 'tanggal');
    params.append('sort_order', 'desc');

    try {
      const res = await apiFetch(`/api/export/excel?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Gagal mengunduh file Excel');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const angkatanSuffix = filterAngkatan ? `_Angkatan_${filterAngkatan}` : '';
      const bulanSuffix = filterBulan ? `_Bulan_${filterBulan}` : '';
      a.download = `Rekap_Absensi_PMR${angkatanSuffix}${bulanSuffix}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Gagal mengekspor Excel');
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4',
    });

    doc.setFillColor(152, 75, 80);
    doc.rect(0, 0, 842, 45, 'F');

    doc.setTextColor(255, 253, 248);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('PALANG MERAH REMAJA (PMR) WIRA', 40, 28);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('BUKU INDUK REKAPITULASI PRESENSI ANGGOTA', 570, 28);

    doc.setTextColor(52, 54, 48);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const bulanLabel = filterBulan ? BULAN_OPTIONS.find((b) => b.value === filterBulan)?.label : 'Semua Bulan';
    const tahunLabel = filterTahun || 'Semua Tahun';
    const angkatanLabel = filterAngkatan ? `Angkatan ${filterAngkatan === 'XI' ? 'Kelas 11 (XI)' : 'Kelas 10 (X)'}` : 'Semua Angkatan';
    doc.text(`Periode: ${bulanLabel} ${tahunLabel} | ${angkatanLabel} ${filterDivisi ? `| Divisi: ${filterDivisi}` : ''}`, 40, 70);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(133, 132, 125);
    doc.text(`Dicetak pada: ${currentMakassar.formattedDateIndo} pukul ${currentMakassar.waktu} WITA (Asia/Makassar)`, 40, 85);

    const tableBody = records.map((r, i) => [
      i + 1,
      r.nama_snapshot,
      `${r.angkatan_snapshot} ${r.kelas_jurusan_snapshot}`,
      r.angkatan_snapshot === 'XI' ? 'Kelas 11' : 'Kelas 10',
      r.divisi_snapshot,
      r.tanggal,
      `${r.waktu} WITA`,
      r.tanda_tangan ? 'Terverifikasi (Digital)' : 'Belum Ada',
    ]);

    autoTable(doc, {
      startY: 95,
      head: [['No', 'Nama Anggota', 'Kelas / Jurusan', 'Angkatan', 'Divisi', 'Tanggal', 'Jam Hadir', 'Tanda Tangan']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [152, 75, 80],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
      },
      styles: {
        fontSize: 8,
        cellPadding: 5,
        textColor: [52, 54, 48],
      },
      alternateRowStyles: {
        fillColor: [248, 246, 240],
      },
      margin: { left: 40, right: 40 },
    });

    const angkatanSuffix = filterAngkatan ? `_Angkatan_${filterAngkatan}` : '';
    const bulanSuffix = filterBulan ? `_Bulan_${filterBulan}` : '';
    doc.save(`Rekap_Absensi_PMR${angkatanSuffix}${bulanSuffix}.pdf`);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalRecord) return;

    try {
      const res = await apiFetch(`/api/absensi/${editModalRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tanggal: editModalRecord.tanggal,
          waktu: editModalRecord.waktu,
          nama_snapshot: editModalRecord.nama_snapshot,
          angkatan_snapshot: editModalRecord.angkatan_snapshot,
          kelas_jurusan_snapshot: editModalRecord.kelas_jurusan_snapshot,
          divisi_snapshot: editModalRecord.divisi_snapshot,
        }),
      });

      if (!res.ok) throw new Error('Gagal memperbarui data absensi');

      setActionSuccessMsg('Data absensi berhasil diperbarui.');
      setTimeout(() => setActionSuccessMsg(null), 3000);
      setEditModalRecord(null);
      fetchRecords();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan perubahan');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmRecord) return;

    try {
      const res = await apiFetch(`/api/absensi/${deleteConfirmRecord.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Gagal menghapus data absensi');

      setActionSuccessMsg('Catatan absensi berhasil dihapus.');
      setTimeout(() => setActionSuccessMsg(null), 3000);
      setDeleteConfirmRecord(null);
      fetchRecords();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus absensi');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* A. PAGE HEADING & COMPACT EXPORT BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFDF8] sm:bg-transparent p-4 sm:p-0 rounded-2xl border sm:border-0 border-[#EAE3D7]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl sm:text-3xl font-bold text-[#343630] tracking-tight">
              Rekap Absensi
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EAE3D7] text-[#77846B]">
              {records.length}
            </span>
          </div>
          <p className="text-xs text-[#85847D] mt-0.5 font-sans">
            Catatan kehadiran resmi anggota PMR Wira.
          </p>
        </div>

        {/* Compact Export Buttons (Min touch target 44px) */}
        <div className="flex items-center gap-2 pt-1 sm:pt-0">
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={records.length === 0}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[44px] text-xs font-medium text-[#FFFDF8] bg-[#77846B] hover:bg-[#68745d] rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            title="Ekspor format spreadsheet"
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>Excel</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            disabled={records.length === 0}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[44px] text-xs font-medium text-[#FFFDF8] bg-[#984B50] hover:bg-[#853f44] rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            title="Ekspor dokumen PDF resmi"
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-[#FFFDF8] border border-[#A5B19B] text-[#77846B] rounded-xl text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#77846B]" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* B & C. PERIOD CONTROLS (Month, Year, Angkatan) + D. EXPANDABLE ADDITIONAL FILTERS */}
      <div className="bg-[#FFFDF8] rounded-2xl border border-[#EAE3D7] p-3.5 sm:p-4 shadow-2xs space-y-3">
        {/* Month & Year Selectors (Side-by-side on mobile, compact on desktop) */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3">
          {/* Bulan */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
            <label className="text-[11px] sm:text-xs font-medium text-[#85847D] font-sans">
              Bulan:
            </label>
            <select
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="w-full sm:w-auto px-2.5 py-2 sm:py-1.5 min-h-[44px] sm:min-h-[36px] bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl text-base sm:text-xs font-medium text-[#343630] focus:ring-1 focus:ring-[#984B50] focus:outline-none"
            >
              <option value="">Semua Bulan</option>
              {BULAN_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tahun */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
            <label className="text-[11px] sm:text-xs font-medium text-[#85847D] font-sans">
              Tahun:
            </label>
            <select
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              className="w-full sm:w-auto px-2.5 py-2 sm:py-1.5 min-h-[44px] sm:min-h-[36px] bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl text-base sm:text-xs font-medium text-[#343630] focus:ring-1 focus:ring-[#984B50] focus:outline-none"
            >
              <option value="">Semua Tahun</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2027">2027</option>
            </select>
          </div>
        </div>

        {/* Angkatan Filter (Segmented Buttons with comfortable touch targets) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-[#EAE3D7]/70">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#85847D] font-sans shrink-0">
              Angkatan:
            </span>
            <div className="grid grid-cols-3 sm:inline-flex rounded-xl border border-[#EAE3D7] p-1 bg-[#F8F6F0] w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setFilterAngkatan('')}
                className={`py-2 sm:py-1 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer min-h-[38px] flex items-center justify-center ${
                  filterAngkatan === ''
                    ? 'bg-[#343630] text-[#FFFDF8] shadow-2xs'
                    : 'text-[#343630] hover:text-[#984B50]'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setFilterAngkatan('XI')}
                className={`py-2 sm:py-1 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer min-h-[38px] flex items-center justify-center ${
                  filterAngkatan === 'XI'
                    ? 'bg-[#984B50] text-[#FFFDF8] shadow-2xs'
                    : 'text-[#343630] hover:text-[#984B50]'
                }`}
              >
                XI (Kelas 11)
              </button>
              <button
                type="button"
                onClick={() => setFilterAngkatan('X')}
                className={`py-2 sm:py-1 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer min-h-[38px] flex items-center justify-center ${
                  filterAngkatan === 'X'
                    ? 'bg-[#984B50] text-[#FFFDF8] shadow-2xs'
                    : 'text-[#343630] hover:text-[#984B50]'
                }`}
              >
                X (Kelas 10)
              </button>
            </div>
          </div>

          {/* Toggle Additional Filters Button */}
          <button
            type="button"
            onClick={() => setIsFilterLainnyaOpen(!isFilterLainnyaOpen)}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[42px] sm:min-h-[36px] rounded-xl text-xs font-medium transition-colors cursor-pointer border ${
              isFilterLainnyaOpen || hasAdditionalFilters
                ? 'bg-[#EAE3D7] text-[#343630] border-[#D8D1C3]'
                : 'bg-[#F8F6F0] text-[#85847D] border-[#EAE3D7] hover:text-[#343630]'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-[#984B50]" />
            <span>Filter Lanjutan</span>
            {hasAdditionalFilters && (
              <span className="w-2 h-2 rounded-full bg-[#984B50]"></span>
            )}
            {isFilterLainnyaOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* D. Expandable Additional Filters Panel */}
        {isFilterLainnyaOpen && (
          <div className="pt-3 border-t border-[#EAE3D7] space-y-3 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Kelas / Jurusan */}
              <div>
                <label className="block text-xs font-medium text-[#343630] mb-1 font-sans">
                  Kelas / Jurusan
                </label>
                <select
                  value={filterKelas}
                  onChange={(e) => setFilterKelas(e.target.value)}
                  className="w-full px-3 py-2 min-h-[44px] bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl text-base sm:text-xs text-[#343630] focus:ring-1 focus:ring-[#984B50] focus:outline-none"
                >
                  <option value="">Semua Kelas</option>
                  {DAFTAR_KELAS_JURUSAN.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              {/* Divisi */}
              <div>
                <label className="block text-xs font-medium text-[#343630] mb-1 font-sans flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[#77846B]" />
                  Divisi PMR
                </label>
                <select
                  value={filterDivisi}
                  onChange={(e) => setFilterDivisi(e.target.value)}
                  className="w-full px-3 py-2 min-h-[44px] bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl text-base sm:text-xs text-[#343630] focus:ring-1 focus:ring-[#984B50] focus:outline-none"
                >
                  <option value="">Semua Divisi</option>
                  {DAFTAR_DIVISI.map((d) => (
                    <option key={d} value={d}>
                      Divisi {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Live Search Name */}
              <div>
                <label className="block text-xs font-medium text-[#343630] mb-1 font-sans flex items-center gap-1">
                  <Search className="w-3.5 h-3.5 text-[#984B50]" />
                  Cari Nama
                </label>
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Ketik nama anggota..."
                  className="w-full px-3 py-2 min-h-[44px] bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl text-base sm:text-xs text-[#343630] placeholder:text-[#85847D]/60 focus:ring-1 focus:ring-[#984B50] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleResetFilter}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] text-xs font-medium text-[#984B50] hover:bg-[#F8F6F0] rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filter Lanjutan
              </button>
            </div>
          </div>
        )}

        {/* Active Filter Chips */}
        {activeChips.length > 0 && (
          <div className="pt-2 border-t border-[#EAE3D7]/70 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-sans text-[#85847D] mr-1">Filter Aktif:</span>
            {activeChips.map((chip) => (
              <span
                key={chip.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#EAE3D7] text-[#343630] border border-[#D8D1C3]"
              >
                <span>{chip.label}</span>
                <button
                  type="button"
                  onClick={chip.onClear}
                  className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-[#984B50] hover:text-[#FFFDF8] transition-colors cursor-pointer"
                  aria-label={`Hapus filter ${chip.label}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={handleResetFilter}
              className="text-[11px] font-medium text-[#984B50] underline hover:no-underline ml-1 cursor-pointer"
            >
              Hapus Semua
            </button>
          </div>
        )}
      </div>

      {/* STATUS BAR SUMMARY */}
      <div className="flex items-center justify-between text-xs text-[#85847D] px-1">
        <span>
          Menampilkan <strong className="text-[#343630]">{records.length}</strong> catatan kehadiran
        </span>
        {totalPages > 1 && (
          <span>
            Halaman {currentPage} dari {totalPages}
          </span>
        )}
      </div>

      {/* E. ATTENDANCE RECORDS (MOBILE CARDS + DESKTOP TABLE) */}
      {loading ? (
        <div className="bg-[#FFFDF8] rounded-2xl border border-[#EAE3D7] p-12 text-center text-[#85847D] space-y-2 font-editorial italic shadow-2xs">
          <div className="w-6 h-6 border-2 border-[#984B50] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs">Memuat data rekapitulasi...</p>
        </div>
      ) : error ? (
        <div className="bg-[#FFFDF8] rounded-2xl border border-[#EAE3D7] p-8 text-center text-[#984B50] space-y-2 shadow-2xs">
          <AlertTriangle className="w-6 h-6 mx-auto" />
          <p className="text-xs sm:text-sm font-medium">{error}</p>
          <button
            type="button"
            onClick={fetchRecords}
            className="px-4 py-2 bg-[#EAE3D7] text-[#343630] text-xs font-medium rounded-xl cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-[#FFFDF8] rounded-2xl border border-[#EAE3D7] p-10 text-center space-y-3 shadow-2xs">
          <div className="w-20 h-20 mx-auto rounded-xl overflow-hidden border border-[#EAE3D7] bg-[#F8F6F0]">
            <img
              src={EMPTY_BOTANICAL_IMAGE}
              alt="Botanical watercolor empty state"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h4 className="font-serif text-base font-bold text-[#343630]">
            Belum ada catatan absensi pada periode ini.
          </h4>
          <p className="text-xs text-[#85847D] max-w-sm mx-auto font-sans">
            Sesuaikan pemilihan bulan, tahun, atau angkatan pada kontrol di atas.
          </p>
          <button
            type="button"
            onClick={handleResetFilter}
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] bg-[#343630] hover:bg-[#252722] text-[#FFFDF8] text-xs font-medium rounded-xl cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Tampilkan Semua Periode
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 1. MOBILE ATTENDANCE RECORD CARDS (< md) */}
          <div className="md:hidden space-y-3">
            {paginatedRecords.map((r, index) => {
              const rowNumber = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
              return (
                <div
                  key={r.id}
                  className="bg-[#FFFDF8] rounded-2xl border border-[#EAE3D7] p-4 shadow-2xs space-y-3 transition-shadow hover:shadow-xs"
                >
                  {/* Card Header: Member Name & Division */}
                  <div className="flex items-start justify-between gap-2 border-b border-[#EAE3D7]/60 pb-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#F8F6F0] border border-[#EAE3D7] text-[#85847D] text-[11px] font-mono flex items-center justify-center shrink-0 mt-0.5">
                        {rowNumber}
                      </span>
                      <div>
                        <h4 className="font-serif font-bold text-base text-[#343630] leading-tight">
                          {r.nama_snapshot}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <MemberStatusBadge status={r.status_keanggotaan_snapshot || 'Anggota'} size="sm" />
                          <MemberJabatanBadge status={r.status_keanggotaan_snapshot || 'Anggota'} jabatan={r.jabatan_snapshot} size="sm" />
                        </div>
                        <p className="text-xs text-[#77846B] font-medium mt-1">
                          {r.angkatan_snapshot} {r.kelas_jurusan_snapshot} • Angkatan {r.angkatan_snapshot}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide bg-[#A5B19B]/20 text-[#77846B] border border-[#A5B19B]/30 shrink-0">
                      {r.divisi_snapshot}
                    </span>
                  </div>

                  {/* Card Info: Date & Time */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-[#F8F6F0] p-2.5 rounded-xl border border-[#EAE3D7]/60">
                    <div className="flex items-center gap-1.5 text-[#343630]">
                      <Calendar className="w-3.5 h-3.5 text-[#77846B] shrink-0" />
                      <span className="font-editorial truncate">{formatIndoDate(r.tanggal)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#343630] justify-end">
                      <Clock className="w-3.5 h-3.5 text-[#984B50] shrink-0" />
                      <span className="font-sans font-medium tabular-nums">{r.waktu} WITA</span>
                    </div>
                  </div>

                  {/* Card Bottom: Signature Thumbnail & Actions */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    {/* Signature Preview Button */}
                    {r.tanda_tangan ? (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedSignature({
                            imageUrl: r.tanda_tangan,
                            nama: r.nama_snapshot,
                            tanggal: r.tanggal,
                            waktu: r.waktu,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[38px] bg-[#FFFDF8] border border-[#EAE3D7] hover:border-[#984B50] rounded-xl text-xs text-[#343630] transition-colors cursor-pointer"
                        title="Perbesar tanda tangan"
                      >
                        <img
                          src={r.tanda_tangan}
                          alt="Tanda tangan"
                          className="h-5 max-w-[50px] object-contain"
                        />
                        <span className="text-[11px] font-medium text-[#77846B]">Paraf</span>
                        <ZoomIn className="w-3.5 h-3.5 text-[#85847D]" />
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#85847D] italic">Tanpa paraf</span>
                    )}

                    {/* Action Buttons with comfortable touch targets (min 40-44px) */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setDetailModalRecord(r)}
                        className="w-10 h-10 flex items-center justify-center text-[#85847D] hover:text-[#343630] hover:bg-[#F8F6F0] rounded-xl transition-colors cursor-pointer"
                        title="Lihat Detail"
                        aria-label="Lihat Detail Absensi"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditModalRecord({ ...r })}
                        className="w-10 h-10 flex items-center justify-center text-[#85847D] hover:text-[#77846B] hover:bg-[#F8F6F0] rounded-xl transition-colors cursor-pointer"
                        title="Edit Data"
                        aria-label="Edit Data Absensi"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteConfirmRecord(r)}
                        className="w-10 h-10 flex items-center justify-center text-[#85847D] hover:text-[#984B50] hover:bg-[#F8F6F0] rounded-xl transition-colors cursor-pointer"
                        title="Hapus Data"
                        aria-label="Hapus Data Absensi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. DESKTOP FULL TABLE (>= md) */}
          <div className="hidden md:block bg-[#FFFDF8] rounded-2xl border border-[#EAE3D7] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F6F0] border-b border-[#EAE3D7] text-[#85847D] uppercase font-sans font-semibold text-[10px] tracking-wider">
                    <th className="py-3 px-3.5 w-10 text-center">No</th>
                    <th className="py-3 px-3.5">Nama Anggota</th>
                    <th className="py-3 px-3.5">Status & Jabatan</th>
                    <th className="py-3 px-3.5">Kelas</th>
                    <th className="py-3 px-3.5">Divisi</th>
                    <th className="py-3 px-3.5">Tanggal</th>
                    <th className="py-3 px-3.5">Jam</th>
                    <th className="py-3 px-3.5 text-center">Tanda Tangan</th>
                    <th className="py-3 px-3.5 text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D7]/60">
                  {paginatedRecords.map((r, index) => {
                    const rowNumber = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                    return (
                      <tr
                        key={r.id}
                        className="hover:bg-[#F8F6F0]/70 transition-colors group"
                      >
                        <td className="py-2.5 px-3.5 text-center font-mono text-[#85847D] tabular-nums">
                          {rowNumber}
                        </td>
                        <td className="py-2.5 px-3.5">
                          <span className="font-serif font-bold text-[#343630] block group-hover:text-[#984B50] text-sm">
                            {r.nama_snapshot}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <MemberStatusBadge status={r.status_keanggotaan_snapshot || 'Anggota'} size="sm" />
                            <MemberJabatanBadge status={r.status_keanggotaan_snapshot || 'Anggota'} jabatan={r.jabatan_snapshot} size="sm" />
                          </div>
                        </td>
                        <td className="py-2.5 px-3.5">
                          <span className="font-medium text-[#343630] bg-[#F8F6F0] border border-[#EAE3D7] px-2 py-0.5 rounded text-[11px]">
                            {r.angkatan_snapshot} {r.kelas_jurusan_snapshot}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#A5B19B]/20 text-[#77846B] border border-[#A5B19B]/30">
                            {r.divisi_snapshot}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 whitespace-nowrap text-[#343630] font-editorial">
                          {formatIndoDate(r.tanggal)}
                        </td>
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span className="font-sans font-medium text-[#343630] tabular-nums">
                            {r.waktu}
                          </span>{' '}
                          <span className="text-[10px] text-[#984B50] font-semibold">WITA</span>
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          {r.tanda_tangan ? (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedSignature({
                                  imageUrl: r.tanda_tangan,
                                  nama: r.nama_snapshot,
                                  tanggal: r.tanggal,
                                  waktu: r.waktu,
                                })
                              }
                              title="Lihat tanda tangan"
                              className="inline-flex items-center justify-center p-1 bg-[#FFFDF8] border border-[#EAE3D7] rounded-lg hover:border-[#984B50] transition-all cursor-pointer group/sign"
                            >
                              <img
                                src={r.tanda_tangan}
                                alt={`Tanda tangan ${r.nama_snapshot}`}
                                className="h-6 max-w-[70px] object-contain"
                              />
                              <ZoomIn className="w-3 h-3 text-[#85847D] group-hover/sign:text-[#984B50] ml-1" />
                            </button>
                          ) : (
                            <span className="text-[#85847D]/50 italic">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => setDetailModalRecord(r)}
                              title="Detail"
                              className="p-1.5 text-[#85847D] hover:text-[#343630] hover:bg-[#F8F6F0] rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditModalRecord({ ...r })}
                              title="Edit"
                              className="p-1.5 text-[#85847D] hover:text-[#77846B] hover:bg-[#F8F6F0] rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteConfirmRecord(r)}
                              title="Hapus"
                              className="p-1.5 text-[#85847D] hover:text-[#984B50] hover:bg-[#F8F6F0] rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* RESPONSIVE PAGINATION BAR */}
          {totalPages > 1 && (
            <div className="bg-[#FFFDF8] p-3 rounded-2xl border border-[#EAE3D7] flex items-center justify-between text-xs shadow-2xs">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-3 py-2 min-h-[40px] rounded-xl border border-[#EAE3D7] bg-[#F8F6F0] hover:bg-[#EAE3D7] text-[#343630] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden xs:inline">Sebelumnya</span>
              </button>

              <div className="flex items-center gap-1 text-xs text-[#85847D] font-medium">
                <span>Halaman</span>
                <span className="text-[#343630] font-bold">{currentPage}</span>
                <span>dari</span>
                <span className="text-[#343630] font-bold">{totalPages}</span>
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 px-3 py-2 min-h-[40px] rounded-xl border border-[#EAE3D7] bg-[#F8F6F0] hover:bg-[#EAE3D7] text-[#343630] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-medium"
              >
                <span className="hidden xs:inline">Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Signature Lightbox / Dedicated Bottom Sheet */}
      {selectedSignature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#343630]/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-[#FFFDF8] rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-xl border border-[#EAE3D7] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D7]">
              <h3 className="font-serif font-bold text-[#343630] text-base">
                Tanda Tangan Digital
              </h3>
              <button
                type="button"
                onClick={() => setSelectedSignature(null)}
                className="w-10 h-10 flex items-center justify-center text-[#85847D] hover:text-[#343630] rounded-xl cursor-pointer"
                aria-label="Tutup pratinjau tanda tangan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 p-4 bg-[#F8F6F0] border border-dashed border-[#EAE3D7] rounded-2xl flex items-center justify-center min-h-[140px]">
              <img
                src={selectedSignature.imageUrl}
                alt={`Tanda tangan ${selectedSignature.nama}`}
                className="max-h-40 max-w-full object-contain"
              />
            </div>

            <div className="bg-[#F8F6F0] p-3 rounded-xl text-xs space-y-1.5 text-[#85847D]">
              <div className="flex justify-between items-center">
                <span>Nama Anggota:</span>
                <strong className="text-[#343630] font-serif text-sm">{selectedSignature.nama}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span>Waktu Presensi:</span>
                <span className="font-sans text-[#343630] font-medium">
                  {selectedSignature.tanggal} • {selectedSignature.waktu} WITA
                </span>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => setSelectedSignature(null)}
                className="w-full min-h-[44px] py-2.5 bg-[#343630] hover:bg-[#252722] text-[#FFFDF8] text-xs sm:text-sm font-medium rounded-xl cursor-pointer transition-colors"
              >
                Tutup Lembar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Detail Absensi Modal */}
      {detailModalRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#343630]/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-[#FFFDF8] rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-[#EAE3D7] max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D7]">
              <h3 className="font-serif font-bold text-[#343630] text-base sm:text-lg">
                Detail Catatan Presensi
              </h3>
              <button
                type="button"
                onClick={() => setDetailModalRecord(null)}
                className="w-10 h-10 flex items-center justify-center text-[#85847D] hover:text-[#343630] rounded-xl cursor-pointer"
                aria-label="Tutup detail absensi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-sans font-semibold tracking-wider text-[#77846B] uppercase block">
                    Nama Anggota
                  </span>
                  <h4 className="text-lg font-serif font-bold text-[#343630]">
                    {detailModalRecord.nama_snapshot}
                  </h4>
                </div>
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#984B50] text-[#FFFDF8]">
                  Divisi {detailModalRecord.divisi_snapshot}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-[#F8F6F0] rounded-xl border border-[#EAE3D7]">
                  <span className="text-[#85847D] block mb-0.5 text-[10px]">Kelas & Angkatan</span>
                  <strong className="text-[#343630] text-xs">
                    {detailModalRecord.angkatan_snapshot} {detailModalRecord.kelas_jurusan_snapshot}
                  </strong>
                </div>
                <div className="p-2.5 bg-[#F8F6F0] rounded-xl border border-[#EAE3D7]">
                  <span className="text-[#85847D] block mb-0.5 text-[10px]">Waktu Presensi</span>
                  <strong className="text-[#984B50] text-xs">
                    {detailModalRecord.waktu} WITA
                  </strong>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-[#343630] block mb-1">
                  Bukti Paraf / Tanda Tangan
                </span>
                <div className="p-3 bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl flex items-center justify-center min-h-[90px]">
                  {detailModalRecord.tanda_tangan ? (
                    <img
                      src={detailModalRecord.tanda_tangan}
                      alt="Tanda tangan"
                      className="max-h-24 max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-[#85847D] italic text-xs">Tidak ada tanda tangan</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setDetailModalRecord(null)}
                className="w-full min-h-[44px] py-2.5 bg-[#343630] hover:bg-[#252722] text-[#FFFDF8] text-xs sm:text-sm font-medium rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Record Modal */}
      {editModalRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#343630]/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-[#FFFDF8] rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-[#EAE3D7] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D7]">
              <h3 className="font-serif font-bold text-[#343630] text-base">
                Edit Catatan Presensi
              </h3>
              <button
                type="button"
                onClick={() => setEditModalRecord(null)}
                className="w-10 h-10 flex items-center justify-center text-[#85847D] hover:text-[#343630] rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-medium text-[#343630] mb-1 font-sans">
                  Nama Anggota
                </label>
                <input
                  type="text"
                  value={editModalRecord.nama_snapshot}
                  onChange={(e) =>
                    setEditModalRecord({ ...editModalRecord, nama_snapshot: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 min-h-[44px] bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl text-base sm:text-xs text-[#343630] focus:ring-1 focus:ring-[#984B50] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-medium text-[#343630] mb-1 font-sans">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={editModalRecord.tanggal}
                    onChange={(e) =>
                      setEditModalRecord({ ...editModalRecord, tanggal: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 min-h-[44px] bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl text-base sm:text-xs text-[#343630] focus:ring-1 focus:ring-[#984B50] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#343630] mb-1 font-sans">
                    Waktu (WITA)
                  </label>
                  <input
                    type="text"
                    value={editModalRecord.waktu}
                    onChange={(e) =>
                      setEditModalRecord({ ...editModalRecord, waktu: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 min-h-[44px] bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl text-base sm:text-xs text-[#343630] focus:ring-1 focus:ring-[#984B50] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-medium text-[#343630] mb-1 font-sans">
                    Angkatan
                  </label>
                  <select
                    value={editModalRecord.angkatan_snapshot}
                    onChange={(e) =>
                      setEditModalRecord({
                        ...editModalRecord,
                        angkatan_snapshot: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 min-h-[44px] bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl text-base sm:text-xs text-[#343630] focus:ring-1 focus:ring-[#984B50] focus:outline-none"
                  >
                    <option value="XI">XI (Kelas 11)</option>
                    <option value="X">X (Kelas 10)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[#343630] mb-1 font-sans">
                    Divisi
                  </label>
                  <select
                    value={editModalRecord.divisi_snapshot}
                    onChange={(e) =>
                      setEditModalRecord({
                        ...editModalRecord,
                        divisi_snapshot: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 min-h-[44px] bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl text-base sm:text-xs text-[#343630] focus:ring-1 focus:ring-[#984B50] focus:outline-none"
                  >
                    {DAFTAR_DIVISI.map((d) => (
                      <option key={d} value={d}>
                        Divisi {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalRecord(null)}
                  className="flex-1 min-h-[44px] py-2 border border-[#EAE3D7] text-[#85847D] font-medium rounded-xl hover:bg-[#F8F6F0] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] py-2 bg-[#984B50] hover:bg-[#853f44] text-[#FFFDF8] font-medium rounded-xl cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Delete Confirmation */}
      {deleteConfirmRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#343630]/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-[#FFFDF8] rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-xl border border-[#EAE3D7] space-y-4">
            <div className="w-12 h-12 bg-[#984B50]/15 text-[#984B50] rounded-full flex items-center justify-center mx-auto border border-[#984B50]/20">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="font-serif font-bold text-[#343630] text-base sm:text-lg">
                Hapus Catatan Presensi Ini?
              </h3>
              <p className="text-xs text-[#85847D] mt-1.5 font-sans leading-relaxed">
                Data presensi <strong>{deleteConfirmRecord.nama_snapshot}</strong> tanggal{' '}
                <strong>{deleteConfirmRecord.tanggal}</strong> akan dihapus dari buku induk.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmRecord(null)}
                className="flex-1 min-h-[44px] py-2 border border-[#EAE3D7] text-[#85847D] text-xs font-medium rounded-xl hover:bg-[#F8F6F0] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 min-h-[44px] py-2 bg-[#984B50] hover:bg-[#853f44] text-[#FFFDF8] text-xs font-medium rounded-xl cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
