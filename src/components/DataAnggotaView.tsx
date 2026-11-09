import React, { useState, useEffect, useMemo } from 'react';
import {
  UserPlus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Users,
  Building2,
  Layers,
  GraduationCap,
  Filter,
  RotateCcw,
  ShieldCheck,
  Award
} from 'lucide-react';
import {
  Anggota,
  Angkatan,
  DAFTAR_ANGKATAN,
  DAFTAR_KELAS_JURUSAN,
  DAFTAR_DIVISI,
  Divisi,
  StatusKeanggotaan,
  DAFTAR_STATUS_KEANGGOTAAN,
  PRESET_JABATAN_PENGURUS
} from '../types.js';
import { apiFetch } from '../services/mockApi.js';
import { MemberStatusBadge, MemberJabatanBadge } from './MemberBadges.js';

interface DataAnggotaViewProps {
  token: string;
}

export const DataAnggotaView: React.FC<DataAnggotaViewProps> = ({ token }) => {
  const [members, setMembers] = useState<Anggota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [filterAngkatan, setFilterAngkatan] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [filterDivisi, setFilterDivisi] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Anggota | null>(null);
  const [deletingMember, setDeletingMember] = useState<Anggota | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Form states for Add/Edit
  const [formData, setFormData] = useState({
    nama: '',
    angkatan: 'XI' as Angkatan,
    kelas_jurusan: 'PPLG 1',
    divisi: 'LITBANG' as Divisi,
    status_keanggotaan: 'Anggota' as StatusKeanggotaan,
    jabatan: '',
  });

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (filterAngkatan) params.append('angkatan', filterAngkatan);
      if (filterDivisi) params.append('divisi', filterDivisi);
      if (filterKelas) params.append('kelas', filterKelas);
      if (filterStatus) params.append('status', filterStatus);

      const res = await apiFetch(`/api/anggota?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Gagal memuat data anggota');
      const data = await res.json();
      setMembers(data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memuat data anggota');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [search, filterAngkatan, filterDivisi, filterKelas, filterStatus]);

  const handleOpenAddModal = () => {
    setFormData({
      nama: '',
      angkatan: 'XI',
      kelas_jurusan: 'PPLG 1',
      divisi: 'LITBANG',
      status_keanggotaan: 'Anggota',
      jabatan: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (member: Anggota) => {
    setEditingMember(member);
    setFormData({
      nama: member.nama,
      angkatan: member.angkatan,
      kelas_jurusan: member.kelas_jurusan,
      divisi: member.divisi,
      status_keanggotaan: member.status_keanggotaan || 'Anggota',
      jabatan: member.jabatan || '',
    });
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      alert('Nama lengkap wajib diisi');
      return;
    }

    try {
      const isEdit = !!editingMember;
      const url = isEdit ? `/api/anggota/${editingMember.id}` : '/api/anggota';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan anggota');

      setActionSuccessMsg(isEdit ? 'Data anggota berhasil diperbarui.' : 'Anggota baru berhasil dicatat.');
      setTimeout(() => setActionSuccessMsg(null), 3000);
      setIsAddModalOpen(false);
      setEditingMember(null);
      fetchMembers();
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan');
    }
  };

  const handleDeleteMember = async () => {
    if (!deletingMember) return;

    try {
      const res = await apiFetch(`/api/anggota/${deletingMember.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus anggota');

      setActionSuccessMsg(data.message || 'Data anggota berhasil dihapus.');
      setTimeout(() => setActionSuccessMsg(null), 3000);
      setDeletingMember(null);
      fetchMembers();
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilterAngkatan('');
    setFilterKelas('');
    setFilterDivisi('');
  };

  const hasActiveFilters = Boolean(search || filterAngkatan || filterKelas || filterDivisi);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. TOP SECTION (Header + Total Count Text + Prominent Action Button) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFDF8] sm:bg-transparent p-4 sm:p-0 rounded-2xl border sm:border-0 border-[#EAE3D7]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl sm:text-3xl font-bold text-[#343630] tracking-tight">
              Data Anggota
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EAE3D7] text-[#77846B]">
              Total: {members.length} Anggota
            </span>
          </div>
          <p className="text-xs text-[#85847D] mt-0.5 font-sans">
            Daftar lengkap anggota resmi Palang Merah Remaja Wira.
          </p>
        </div>

        {/* Prominent Tambah Anggota Button (Full width on mobile, min touch target 44px) */}
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-[#984B50] hover:bg-[#853f44] text-[#FFFDF8] text-xs sm:text-sm font-medium rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4 shrink-0" />
          <span>Tambah Anggota</span>
        </button>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-[#FFFDF8] border border-[#A5B19B] text-[#77846B] rounded-xl text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#77846B]" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* 2. SEARCH & QUICK FILTERS */}
      <div className="bg-[#FFFDF8] rounded-2xl border border-[#EAE3D7] p-3.5 sm:p-4 shadow-2xs space-y-3">
        {/* Search Input (16px font size on mobile to prevent auto-zoom, min 44px height) */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#85847D]">
            <Search className="w-4 h-4 text-[#984B50]" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama anggota..."
            className="w-full pl-10 pr-10 py-2.5 min-h-[44px] bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl text-base sm:text-xs text-[#343630] placeholder:text-[#85847D]/60 focus:ring-1 focus:ring-[#984B50] focus:outline-none transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-3 min-w-[40px] flex items-center justify-center text-[#85847D] hover:text-[#343630]"
              aria-label="Hapus kata kunci pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Row: Angkatan, Kelas, Divisi, Status (Responsive grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
          {/* Angkatan Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#85847D] font-sans font-medium shrink-0 text-[11px] sm:text-xs">
              Angkatan:
            </span>
            <select
              value={filterAngkatan}
              onChange={(e) => setFilterAngkatan(e.target.value)}
              className="w-full px-2.5 py-2 min-h-[42px] sm:min-h-[36px] bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl text-base sm:text-xs text-[#343630] focus:ring-1 focus:ring-[#984B50] focus:outline-none"
            >
              <option value="">Semua Angkatan</option>
              <option value="XI">Kelas 11 (XI)</option>
              <option value="X">Kelas 10 (X)</option>
            </select>
          </div>

          {/* Kelas Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#85847D] font-sans font-medium shrink-0 text-[11px] sm:text-xs">
              Kelas:
            </span>
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="w-full px-2.5 py-2 min-h-[42px] sm:min-h-[36px] bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl text-base sm:text-xs text-[#343630] focus:ring-1 focus:ring-[#984B50] focus:outline-none"
            >
              <option value="">Semua Kelas</option>
              {DAFTAR_KELAS_JURUSAN.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Divisi Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#85847D] font-sans font-medium shrink-0 text-[11px] sm:text-xs">
              Divisi:
            </span>
            <select
              value={filterDivisi}
              onChange={(e) => setFilterDivisi(e.target.value)}
              className="w-full px-2.5 py-2 min-h-[42px] sm:min-h-[36px] bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl text-base sm:text-xs text-[#343630] focus:ring-1 focus:ring-[#984B50] focus:outline-none"
            >
              <option value="">Semua Divisi</option>
              {DAFTAR_DIVISI.map((d) => (
                <option key={d} value={d}>
                  Divisi {d}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#85847D] font-sans font-medium shrink-0 text-[11px] sm:text-xs">
              Status:
            </span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-2 min-h-[42px] sm:min-h-[36px] bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl text-base sm:text-xs text-[#343630] focus:ring-1 focus:ring-[#984B50] focus:outline-none"
            >
              <option value="">Semua Status</option>
              <option value="Anggota">Anggota PMR</option>
              <option value="Pengurus">Pengurus Organisasi</option>
            </select>
          </div>
        </div>

        {/* Reset Filter Button if active */}
        {hasActiveFilters && (
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs font-editorial italic text-[#984B50] hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Semua Filter</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. MEMBER LIST (MOBILE CARDS + DESKTOP TABLE) */}
      {loading ? (
        <div className="bg-[#FFFDF8] rounded-2xl border border-[#EAE3D7] p-12 text-center text-[#85847D] space-y-2 font-editorial italic shadow-2xs">
          <div className="w-6 h-6 border-2 border-[#984B50] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs">Memuat data keanggotaan...</p>
        </div>
      ) : error ? (
        <div className="bg-[#FFFDF8] rounded-2xl border border-[#EAE3D7] p-8 text-center text-[#984B50] space-y-2 shadow-2xs">
          <p className="text-xs sm:text-sm font-medium">{error}</p>
          <button
            type="button"
            onClick={fetchMembers}
            className="px-4 py-2 bg-[#EAE3D7] text-[#343630] text-xs font-medium rounded-xl cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-[#FFFDF8] rounded-2xl border border-[#EAE3D7] p-10 text-center text-[#85847D] space-y-2 shadow-2xs">
          <Users className="w-8 h-8 mx-auto text-[#D8D1C3]" />
          <h4 className="font-serif text-base font-bold text-[#343630]">
            {hasActiveFilters ? 'Anggota tidak ditemukan.' : 'Belum ada anggota terdaftar. Tambahkan anggota untuk memulai.'}
          </h4>
          <p className="text-xs text-[#85847D]">
            {hasActiveFilters
              ? 'Periksa kembali kata kunci pencarian atau kombinasi filter.'
              : 'Gunakan tombol Tambah Anggota di atas untuk mendaftarkan anggota baru.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* A. MOBILE MEMBER CARDS (< md) */}
          <div className="md:hidden space-y-3">
            {members.map((m, index) => (
              <div
                key={m.id}
                className="bg-[#FFFDF8] rounded-2xl border border-[#EAE3D7] p-4 shadow-2xs space-y-3 transition-shadow hover:shadow-xs"
              >
                {/* Card Top: Name & Badges */}
                <div className="flex items-start justify-between gap-2 border-b border-[#EAE3D7]/60 pb-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#F8F6F0] border border-[#EAE3D7] text-[#85847D] text-[11px] font-mono flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-base text-[#343630] leading-tight">
                        {m.nama}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <MemberStatusBadge status={m.status_keanggotaan || 'Anggota'} size="sm" />
                        <MemberJabatanBadge status={m.status_keanggotaan || 'Anggota'} jabatan={m.jabatan} size="sm" />
                      </div>
                      <p className="text-xs text-[#85847D] font-medium pt-0.5">
                        Kelas: <strong className="text-[#343630]">{m.angkatan} {m.kelas_jurusan}</strong>
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide bg-[#A5B19B]/20 text-[#77846B] border border-[#A5B19B]/30 shrink-0">
                    {m.divisi}
                  </span>
                </div>

                {/* Card Details & Quick Actions */}
                <div className="flex items-center justify-between gap-2 pt-0.5 text-xs">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#85847D] bg-[#F8F6F0] px-2.5 py-1 rounded-lg border border-[#EAE3D7]">
                    <Layers className="w-3 h-3 text-[#77846B]" />
                    <span>Angkatan {m.angkatan === 'XI' ? '11 (XI)' : '10 (X)'}</span>
                  </span>

                  {/* Accessible Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(m)}
                      className="inline-flex items-center gap-1 px-3 py-2 min-h-[40px] text-xs font-medium text-[#77846B] hover:text-[#5e6954] hover:bg-[#F8F6F0] rounded-xl transition-colors cursor-pointer"
                      title="Edit Anggota"
                      aria-label={`Edit data anggota ${m.nama}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingMember(m)}
                      className="inline-flex items-center gap-1 px-3 py-2 min-h-[40px] text-xs font-medium text-[#984B50] hover:text-[#853f44] hover:bg-[#F8F6F0] rounded-xl transition-colors cursor-pointer"
                      title="Hapus Anggota"
                      aria-label={`Hapus data anggota ${m.nama}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* B. DESKTOP FULL TABLE (>= md) */}
          <div className="hidden md:block bg-[#FFFDF8] rounded-2xl border border-[#EAE3D7] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F6F0] border-b border-[#EAE3D7] text-[#85847D] uppercase font-sans font-semibold text-[10px] tracking-wider">
                    <th className="py-3 px-3.5 w-10 text-center">No</th>
                    <th className="py-3 px-3.5">Nama Lengkap</th>
                    <th className="py-3 px-3.5">Status & Jabatan</th>
                    <th className="py-3 px-3.5">Angkatan & Kelas</th>
                    <th className="py-3 px-3.5">Divisi</th>
                    <th className="py-3 px-3.5 text-center w-20">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D7]/60">
                  {members.map((m, index) => (
                    <tr
                      key={m.id}
                      className="hover:bg-[#F8F6F0]/70 transition-colors group"
                    >
                      <td className="py-2.5 px-3.5 text-center font-mono text-[#85847D] tabular-nums">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className="font-serif font-bold text-[#343630] group-hover:text-[#984B50] block text-sm">
                          {m.nama}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <MemberStatusBadge status={m.status_keanggotaan || 'Anggota'} size="sm" />
                          <MemberJabatanBadge status={m.status_keanggotaan || 'Anggota'} jabatan={m.jabatan} size="sm" />
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5 font-medium text-[#343630]">
                        {m.angkatan} {m.kelas_jurusan}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#A5B19B]/20 text-[#77846B] border border-[#A5B19B]/30">
                          {m.divisi}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(m)}
                            title="Edit Anggota"
                            className="p-1.5 text-[#85847D] hover:text-[#77846B] hover:bg-[#F8F6F0] rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingMember(m)}
                            title="Hapus Anggota"
                            className="p-1.5 text-[#85847D] hover:text-[#984B50] hover:bg-[#F8F6F0] rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL / BOTTOM SHEET: TAMBAH & EDIT ANGGOTA */}
      {(isAddModalOpen || editingMember) && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#343630]/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
          {/* Bottom sheet on mobile, centered modal on desktop */}
          <div className="bg-[#FFFDF8] rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-[#EAE3D7] max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D7]">
              <div>
                <span className="text-[10px] font-sans font-semibold tracking-wider uppercase text-[#77846B] block">
                  Administrasi Keanggotaan
                </span>
                <h3 className="font-serif font-bold text-[#343630] text-lg sm:text-xl">
                  {editingMember ? 'Edit Data Anggota' : 'Tambah Anggota Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingMember(null);
                }}
                className="w-10 h-10 flex items-center justify-center text-[#85847D] hover:text-[#343630] rounded-xl cursor-pointer"
                aria-label="Tutup form anggota"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4 mt-4 text-xs sm:text-sm">
              {/* Field 1: Nama Lengkap (Font size 16px to prevent iOS auto-zoom, min 44px height) */}
              <div>
                <label className="block font-medium text-[#343630] mb-1.5 font-sans">
                  1. Nama Lengkap <span className="text-[#984B50]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Salma Rahmawati"
                  required
                  className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl text-base sm:text-sm text-[#343630] focus:ring-1 focus:ring-[#984B50] focus:outline-none transition-all placeholder:text-[#85847D]/60"
                />
              </div>

              {/* Field 2: Angkatan (Toggle buttons with comfortable touch targets) */}
              <div>
                <label className="block font-medium text-[#343630] mb-1.5 flex items-center gap-1 font-sans">
                  <Layers className="w-3.5 h-3.5 text-[#77846B]" />
                  <span>2. Angkatan</span>
                  <span className="text-[#984B50]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DAFTAR_ANGKATAN.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, angkatan: opt.value })}
                      className={`py-2.5 px-3 min-h-[44px] rounded-xl font-medium text-xs sm:text-sm border text-center transition-all cursor-pointer flex items-center justify-center ${
                        formData.angkatan === opt.value
                          ? 'bg-[#984B50] text-[#FFFDF8] border-[#984B50] shadow-2xs'
                          : 'bg-[#F8F6F0] text-[#343630] border-[#EAE3D7] hover:bg-[#EAE3D7]/60'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 3: Kelas / Jurusan */}
              <div>
                <label className="block font-medium text-[#343630] mb-1.5 flex items-center gap-1 font-sans">
                  <GraduationCap className="w-3.5 h-3.5 text-[#77846B]" />
                  <span>3. Kelas / Jurusan</span>
                  <span className="text-[#984B50]">*</span>
                </label>
                <select
                  value={formData.kelas_jurusan}
                  onChange={(e) => setFormData({ ...formData, kelas_jurusan: e.target.value })}
                  className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl text-base sm:text-sm text-[#343630] focus:ring-1 focus:ring-[#984B50] focus:outline-none"
                >
                  {DAFTAR_KELAS_JURUSAN.map((k) => (
                    <option key={k} value={k}>
                      {formData.angkatan} {k}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 4: Divisi PMR */}
              <div>
                <label className="block font-medium text-[#343630] mb-1.5 flex items-center gap-1 font-sans">
                  <Building2 className="w-3.5 h-3.5 text-[#77846B]" />
                  <span>4. Divisi PMR</span>
                  <span className="text-[#984B50]">*</span>
                </label>
                <select
                  value={formData.divisi}
                  onChange={(e) => setFormData({ ...formData, divisi: e.target.value as Divisi })}
                  className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl text-base sm:text-sm text-[#343630] focus:ring-1 focus:ring-[#984B50] focus:outline-none"
                >
                  {DAFTAR_DIVISI.map((d) => (
                    <option key={d} value={d}>
                      Divisi {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 5: Status Keanggotaan (Anggota vs Pengurus) */}
              <div>
                <label className="block font-medium text-[#343630] mb-1.5 flex items-center gap-1 font-sans">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#984B50]" />
                  <span>5. Status Keanggotaan</span>
                  <span className="text-[#984B50]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DAFTAR_STATUS_KEANGGOTAAN.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          status_keanggotaan: opt.value,
                          jabatan: opt.value === 'Anggota' ? '' : (formData.jabatan || 'Pengurus Harian'),
                        })
                      }
                      className={`py-2.5 px-3 min-h-[44px] rounded-xl font-medium text-xs sm:text-sm border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        formData.status_keanggotaan === opt.value
                          ? opt.value === 'Pengurus'
                            ? 'bg-[#984B50] text-[#FFFDF8] border-[#984B50] shadow-2xs'
                            : 'bg-[#77846B] text-[#FFFDF8] border-[#77846B] shadow-2xs'
                          : 'bg-[#F8F6F0] text-[#343630] border-[#EAE3D7] hover:bg-[#EAE3D7]/60'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 6: Jabatan Organisasi (Khusus Pengurus) */}
              {formData.status_keanggotaan === 'Pengurus' && (
                <div className="p-3 bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl space-y-2 animate-in fade-in duration-150">
                  <label className="block font-semibold text-[#343630] text-xs flex items-center gap-1.5 font-sans">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>6. Jabatan Organisasi (Khusus Pengurus)</span>
                    <span className="text-[#984B50]">*</span>
                  </label>
                  <select
                    value={PRESET_JABATAN_PENGURUS.includes(formData.jabatan as any) ? formData.jabatan : 'Lainnya'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val !== 'Lainnya') {
                        setFormData({ ...formData, jabatan: val });
                      } else {
                        setFormData({ ...formData, jabatan: 'Pengurus Harian' });
                      }
                    }}
                    className="w-full px-3 py-2 min-h-[42px] bg-[#FFFDF8] border border-[#EAE3D7] rounded-xl text-base sm:text-xs text-[#343630] focus:ring-1 focus:ring-[#984B50] focus:outline-none"
                  >
                    {PRESET_JABATAN_PENGURUS.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                    <option value="Lainnya">Kustom (Tulis Manual)...</option>
                  </select>

                  {(!PRESET_JABATAN_PENGURUS.includes(formData.jabatan as any) ||
                    formData.jabatan === 'Lainnya') && (
                    <input
                      type="text"
                      value={formData.jabatan}
                      onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                      placeholder="Masukkan nama jabatan..."
                      required
                      className="w-full px-3 py-2 min-h-[42px] bg-[#FFFDF8] border border-[#EAE3D7] rounded-xl text-base sm:text-xs text-[#343630] focus:ring-1 focus:ring-[#984B50] focus:outline-none"
                    />
                  )}
                </div>
              )}

              {/* Action Buttons: Full width on mobile, comfortable touch targets */}
              <div className="pt-3 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingMember(null);
                  }}
                  className="flex-1 min-h-[44px] py-2.5 border border-[#EAE3D7] text-[#85847D] font-medium text-xs sm:text-sm rounded-xl hover:bg-[#F8F6F0] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] py-2.5 bg-[#984B50] hover:bg-[#853f44] text-[#FFFDF8] font-medium text-xs sm:text-sm rounded-xl shadow-xs cursor-pointer"
                >
                  {editingMember ? 'Simpan Perubahan' : 'Daftarkan Anggota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: HAPUS ANGGOTA */}
      {deletingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#343630]/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-[#FFFDF8] rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-xl border border-[#EAE3D7] space-y-4">
            <div className="w-12 h-12 bg-[#984B50]/15 text-[#984B50] rounded-full flex items-center justify-center mx-auto border border-[#984B50]/20">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="font-serif font-bold text-[#343630] text-base sm:text-lg">
                Hapus Data Anggota Ini?
              </h3>
              <p className="text-xs text-[#85847D] mt-1.5 font-sans leading-relaxed">
                Profil anggota <strong>{deletingMember.nama}</strong> ({deletingMember.angkatan} {deletingMember.kelas_jurusan}) akan dihapus.
              </p>
              <div className="mt-2.5 p-2.5 bg-[#F8F6F0] border border-[#EAE3D7] rounded-xl text-left text-[11px] font-editorial italic text-[#85847D]">
                Catatan: Riwayat presensi lampau dari anggota ini tetap aman tersimpan dalam Rekap Absensi.
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingMember(null)}
                className="flex-1 min-h-[44px] py-2 border border-[#EAE3D7] text-[#85847D] text-xs font-medium rounded-xl hover:bg-[#F8F6F0] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteMember}
                className="flex-1 min-h-[44px] py-2 bg-[#984B50] hover:bg-[#853f44] text-[#FFFDF8] text-xs font-medium rounded-xl cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
