import React from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { getMakassarDateTime } from '../utils/timezone.js';

interface VisiMisiViewProps {
  onContinueToAbsensi: () => void;
  onGoToAdmin: () => void;
}

export const VisiMisiView: React.FC<VisiMisiViewProps> = ({
  onContinueToAbsensi,
  onGoToAdmin,
}) => {
  const makassarTime = getMakassarDateTime();

  const prinsipList = [
    {
      num: '01',
      title: 'Kemanusiaan',
      sub: 'Humanity',
      desc: 'Mencegah dan meringankan penderitaan sesama manusia di mana pun berada, melindungi jiwa dan kesehatan, serta menjamin penghormatan terhadap martabat setiap insan.',
    },
    {
      num: '02',
      title: 'Kesamaan',
      sub: 'Impartiality',
      desc: 'Tidak membeda-bedakan atas dasar kebangsaan, ras, agama, status sosial, atau pandangan politik. Pertolongan semata-mata diprioritaskan berdasarkan beratnya penderitaan.',
    },
    {
      num: '03',
      title: 'Kenetralan',
      sub: 'Neutrality',
      desc: 'Demi senantiasa mempertahankan kepercayaan semua pihak, Gerakan menahan diri untuk tidak memihak dalam permusuhan maupun pertentangan politik, ras, agama, atau ideologi.',
    },
    {
      num: '04',
      title: 'Kemandirian',
      sub: 'Independence',
      desc: 'Gerakan bersifat mandiri. Meskipun bertindak sebagai pembantu pemerintah dalam bidang kemanusiaan, perhimpunan nasional wajib mempertahankan otonomi nilai kepalangmerahan.',
    },
    {
      num: '05',
      title: 'Kesukarelaan',
      sub: 'Voluntary Service',
      desc: 'Gerakan pemberi bantuan kemanusiaan yang berlandaskan kerelaan tulus ikhlas, tanpa motif pencarian keuntungan pribadi atau imbalan materi.',
    },
    {
      num: '06',
      title: 'Kesatuan',
      sub: 'Unity',
      desc: 'Di setiap negara hanya diperkenankan ada satu Perhimpunan Palang Merah atau Bulan Sabit Merah, yang terbuka bagi semua orang dan meliputi seluruh wilayah kedaulatan negara.',
    },
    {
      num: '07',
      title: 'Kesemestaan',
      sub: 'Universality',
      desc: 'Gerakan Palang Merah dan Bulan Sabit Merah bersifat semesta, di mana setiap perhimpunan memiliki status setara serta saling berbagi tanggung jawab dan kewajiban.',
    },
  ];

  const triBakti = [
    {
      num: 'I',
      title: 'Meningkatkan Keterampilan Hidup Sehat',
      desc: 'Mempraktikkan perilaku hidup bersih, tanggap gawat darurat pertolongan pertama, serta mengedukasi sesama rekan sebaya di sekolah.',
    },
    {
      num: 'II',
      title: 'Berkarya dan Berbakti di Masyarakat',
      desc: 'Melaksanakan bakti sosial, kesiapsiagaan bencana, dan aksi donor darah sukarela secara berkesinambungan bagi warga sekitar.',
    },
    {
      num: 'III',
      title: 'Mempererat Persahabatan Nasional & Global',
      desc: 'Menjalin persaudaraan tanpa sekat perbedaan budaya, memupuk empati kemanusiaan, dan membina solidaritas relawan remaja sedunia.',
    },
  ];

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-14 animate-fadeIn">
      {/* 1. INSTITUTIONAL MASTHEAD */}
      <header className="text-center pb-8 border-b border-[var(--color-border-main)]">
        {/* Authoritative Red Cross Geometric Emblem */}
        <div className="mx-auto mb-5 w-10 h-10 flex items-center justify-center bg-[var(--color-card)] border border-[var(--color-border-main)] rounded-lg">
          <div className="relative w-5 h-5 flex items-center justify-center">
            <div className="absolute w-1.5 h-5 bg-[var(--color-accent-primary)]"></div>
            <div className="absolute w-5 h-1.5 bg-[var(--color-accent-primary)]"></div>
          </div>
        </div>

        {/* Headline with text-wrap: balance */}
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[var(--color-text-main)] tracking-tight leading-tight text-balance">
          Piagam Kemanusiaan & Nilai Dasar PMR
        </h1>

        {/* Editorial Motto with top/bottom hairlines */}
        <div className="my-6 py-3.5 border-y border-[var(--color-border-main)] max-w-xl mx-auto">
          <p className="font-editorial italic text-base sm:text-lg text-[var(--color-accent-primary)] tracking-wide">
            "Siamo Tutti Fratelli"
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Kita Semua Bersaudara · Semboyan Gerakan Palang Merah Internasional (Solferino, 1859)
          </p>
        </div>

        {/* Operational context bar */}
        <p className="text-xs text-[var(--color-text-muted)] max-w-lg mx-auto leading-relaxed">
          Sebelum membubuhkan tanda tangan kehadiran pada buku induk hari ini, luangkan sejenak untuk membaca kembali ikrar pengabdian dan komitmen kemanusiaan relawan muda.
        </p>

        {/* Primary Action Button Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onContinueToAbsensi}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white text-xs sm:text-sm font-medium tracking-wide transition-colors cursor-pointer shadow-xs"
          >
            <span>Lanjut ke Formulir Presensi</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onGoToAdmin}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors py-2 px-1 cursor-pointer"
          >
            <span>Buka Portal Sekretaris & Rekap</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. ASYMMETRIC EDITORIAL COLUMNS: VISI & MISI */}
      <section className="py-10 border-b border-[var(--color-border-main)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Kolom Kiri: Visi (5 Kolom) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider font-sans font-medium text-[var(--color-text-muted)] mb-2">
                01. Visi Utama
              </p>
              <h2 className="font-serif text-2xl font-normal text-[var(--color-text-main)] tracking-tight mb-4">
                Cita-Cita & Karakter Relawan
              </h2>

              <p className="font-editorial text-sm sm:text-base leading-relaxed text-[var(--color-text-main)] first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-2.5 first-letter:leading-none first-letter:text-[var(--color-accent-primary)]">
                Terwujudnya anggota Palang Merah Remaja yang berkarakter kemanusiaan, tangguh, berakhlak mulia, berjiwa relawan, serta kompeten dalam memberikan pertolongan pertama bagi sesama demi terwujudnya generasi muda yang sehat dan peduli sosial.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--color-border-main)] text-[11px] text-[var(--color-text-muted)] flex items-center justify-between">
              <span>Palang Merah Indonesia</span>
              <span>Unit Wira / Pelajar</span>
            </div>
          </div>

          {/* Kolom Kanan: Misi (7 Kolom) */}
          <div className="lg:col-span-7 lg:pl-6 lg:border-l lg:border-[var(--color-border-main)]">
            <p className="text-xs uppercase tracking-wider font-sans font-medium text-[var(--color-text-muted)] mb-2">
              02. Empat Komitmen Misi
            </p>
            <h2 className="font-serif text-2xl font-normal text-[var(--color-text-main)] tracking-tight mb-4">
              Pengabdian & Keterampilan
            </h2>

            <div className="space-y-4">
              <div className="flex gap-4">
                <span className="font-serif text-sm font-semibold text-[var(--color-accent-primary)] shrink-0 pt-0.5">
                  01
                </span>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-main)] mb-1">
                    Internalisasi Nilai Kemanusiaan
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                    Menanamkan dan mengamalkan 7 Prinsip Dasar Gerakan Palang Merah dan Bulan Sabit Merah Internasional ke dalam setiap perilaku kehidupan sehari-hari.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="font-serif text-sm font-semibold text-[var(--color-accent-primary)] shrink-0 pt-0.5">
                  02
                </span>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-main)] mb-1">
                    Kecakapan Medis & Pertolongan Pertama
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                    Meningkatkan keterampilan Pertolongan Pertama (PP), Perawatan Keluarga (PK), dan kesiapsiagaan mitigasi bencana secara terstruktur dan teruji.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="font-serif text-sm font-semibold text-[var(--color-accent-primary)] shrink-0 pt-0.5">
                  03
                </span>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-main)] mb-1">
                    Keteladanan Hidup Bersih & Sehat
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                    Menjadi pelopor Pola Hidup Bersih dan Sehat (PHBS) serta penyuluh sebaya kesehatan remaja di lingkungan sekolah dan keluarga.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="font-serif text-sm font-semibold text-[var(--color-accent-primary)] shrink-0 pt-0.5">
                  04
                </span>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-main)] mb-1">
                    Persaudaraan & Solidaritas Tanpa Batas
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                    Memupuk jiwa kerelawanan ikhlas tanpa pamrih, kepemimpinan demokratis, serta mempererat persahabatan antarsesama tanpa membedakan latar belakang.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRI BAKTI PALANG MERAH REMAJA (3-Column Strip) */}
      <section className="py-10 border-b border-[var(--color-border-main)]">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wider font-sans font-medium text-[var(--color-text-muted)] mb-1">
            03. Kode Kehormatan
          </p>
          <h2 className="font-serif text-2xl font-normal text-[var(--color-text-main)] tracking-tight">
            Tri Bakti Palang Merah Remaja
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Tiga pilar dedikasi yang senantiasa diikrarkan dan dijalankan oleh seluruh anggota PMR di Indonesia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {triBakti.map((item) => (
            <div
              key={item.num}
              className="p-5 rounded-lg bg-[var(--color-card)] border border-[var(--color-border-main)] flex flex-col justify-between"
            >
              <div>
                <span className="font-serif text-lg font-bold text-[var(--color-accent-primary)] block mb-2">
                  {item.num}
                </span>
                <h3 className="font-serif text-sm font-semibold text-[var(--color-text-main)] mb-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 7 PRINSIP DASAR KEPALANGMERAHAN (Authoritative Charter List) */}
      <section className="py-10 border-b border-[var(--color-border-main)]">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wider font-sans font-medium text-[var(--color-text-muted)] mb-1">
            04. Konstitusi Internasional
          </p>
          <h2 className="font-serif text-2xl font-normal text-[var(--color-text-main)] tracking-tight">
            Tujuh Prinsip Dasar Palang Merah & Bulan Sabit Merah
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Ditetapkan dalam Konferensi Palang Merah Internasional XX di Wina, Austria (1965).
          </p>
        </div>

        <div className="divide-y divide-[var(--color-border-main)] border-y border-[var(--color-border-main)]">
          {prinsipList.map((p) => (
            <div key={p.num} className="py-4 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-6 items-baseline">
              <div className="md:col-span-4 flex items-baseline gap-2">
                <span className="font-serif text-xs font-semibold text-[var(--color-accent-primary)]">
                  {p.num}.
                </span>
                <span className="font-serif text-sm font-semibold text-[var(--color-text-main)]">
                  {p.title}
                </span>
                <span className="text-xs font-editorial italic text-[var(--color-text-muted)]">
                  ({p.sub})
                </span>
              </div>
              <div className="md:col-span-8">
                <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. OPERATIONAL FOOTER ACTION */}
      <footer className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-xs font-serif font-semibold text-[var(--color-text-main)]">
            Presensi Kegiatan Hari Ini Telah Dibuka
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {makassarTime.formattedDateIndo} · Standar Waktu Asia/Makassar (WITA, UTC+8)
          </p>
        </div>

        <button
          type="button"
          onClick={onContinueToAbsensi}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white text-xs sm:text-sm font-medium tracking-wide transition-colors cursor-pointer shadow-xs"
        >
          <span>Masuk ke Formulir Presensi</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </footer>
    </article>
  );
};
