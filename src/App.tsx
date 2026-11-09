import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { PortalAbsensi } from './components/PortalAbsensi.js';
import { PortalAdmin } from './components/PortalAdmin.js';
import { VisiMisiView } from './components/VisiMisiView.js';
import { apiFetch } from './services/mockApi.js';

export default function App() {
  const [enableVisiMisi, setEnableVisiMisi] = useState<boolean>(() => {
    const saved = localStorage.getItem('pmr_enable_visi_misi');
    return saved === null ? true : saved === 'true';
  });

  const [activePortal, setActivePortal] = useState<'visimisi' | 'absensi' | 'admin'>(() => {
    const saved = localStorage.getItem('pmr_enable_visi_misi');
    const isEnabled = saved === null ? true : saved === 'true';
    return isEnabled ? 'visimisi' : 'absensi';
  });

  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('pmr_admin_token') || null;
  });
  const [adminUsername, setAdminUsername] = useState<string | null>(() => {
    return localStorage.getItem('pmr_admin_username') || null;
  });

  useEffect(() => {
    if (adminToken) {
      apiFetch('/api/admin/me', {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
        .then((res) => {
          if (!res.ok) {
            handleLogout();
          }
        })
        .catch(() => {
          // Network issue
        });
    }
  }, [adminToken]);

  const handleLoginSuccess = (token: string, username: string) => {
    setAdminToken(token);
    setAdminUsername(username);
    localStorage.setItem('pmr_admin_token', token);
    localStorage.setItem('pmr_admin_username', username);
  };

  const handleLogout = () => {
    setAdminToken(null);
    setAdminUsername(null);
    localStorage.removeItem('pmr_admin_token');
    localStorage.removeItem('pmr_admin_username');
  };

  const handleUpdateAdmin = (newUsername: string, newToken: string) => {
    setAdminToken(newToken);
    setAdminUsername(newUsername);
    localStorage.setItem('pmr_admin_token', newToken);
    localStorage.setItem('pmr_admin_username', newUsername);
  };

  const handleToggleVisiMisi = (enabled: boolean) => {
    setEnableVisiMisi(enabled);
    localStorage.setItem('pmr_enable_visi_misi', String(enabled));
    if (!enabled && activePortal === 'visimisi') {
      setActivePortal('absensi');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] flex flex-col text-[var(--color-text-main)] transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        activePortal={activePortal}
        onSelectPortal={(portal) => setActivePortal(portal)}
        isAdminLoggedIn={!!adminToken}
        enableVisiMisi={enableVisiMisi}
      />

      {/* Main Content Portals */}
      <div className="flex-1">
        {enableVisiMisi && activePortal === 'visimisi' ? (
          <VisiMisiView
            onContinueToAbsensi={() => setActivePortal('absensi')}
            onGoToAdmin={() => setActivePortal('admin')}
          />
        ) : activePortal === 'absensi' ? (
          <PortalAbsensi
            onBackToVisiMisi={enableVisiMisi ? () => setActivePortal('visimisi') : undefined}
          />
        ) : (
          <PortalAdmin
            token={adminToken}
            adminUsername={adminUsername}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
            onUpdateAdmin={handleUpdateAdmin}
            enableVisiMisi={enableVisiMisi}
            onToggleVisiMisi={handleToggleVisiMisi}
          />
        )}
      </div>

      {/* Editorial Stationery Footer */}
      <footer className="border-t border-[var(--color-border-main)] bg-[var(--color-canvas)]/80 py-6 mt-auto transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--color-text-muted)]">
          <div className="flex items-center gap-2">
            <span className="font-serif font-medium text-[var(--color-text-main)]">Palang Merah Remaja Wira</span>
            <span>·</span>
            <span className="font-editorial italic">"Siamo Tutti Fratelli" (Kita Semua Bersaudara)</span>
          </div>
          <div className="font-sans text-[11px] text-[#85847D]">
            Buku Induk Presensi Digital · Standar Waktu: Asia/Makassar (WITA, UTC+8)
          </div>
        </div>
      </footer>
    </div>
  );
}
