import React from 'react';
import { LayoutDashboard, History, BellRing, X, LogOut } from 'lucide-react';

const SIDEBAR_WIDTH = 260;

export default function Sidebar({ activePage, setActivePage, isOpen, setIsOpen, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Monitoring', icon: LayoutDashboard },
    { id: 'riwayat', label: 'Halaman Riwayat Data', icon: History },
    { id: 'notifikasi', label: 'Halaman Notifikasi', icon: BellRing },
  ];

  return (
    <>
      {/* OVERLAY — hanya tampil di mobile saat sidebar terbuka, menutup sidebar saat area luar diklik */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 17, 20, 0.35)',
            zIndex: 900,
          }}
          className="sidebar-overlay"
        />
      )}

      {/* PANEL SIDEBAR */}
      <aside
        style={{
          width: `${SIDEBAR_WIDTH}px`,
          height: '100vh',
          background: '#f4f5f6',
          color: '#1a1d1f',
          position: 'fixed',
          top: 0,
          left: isOpen ? 0 : `-${SIDEBAR_WIDTH}px`,
          padding: '20px 16px 24px',
          borderRight: '1px solid #efefef',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          transition: 'left 0.25s ease-in-out',
        }}
      >
        {/* Header: judul brand + tombol tutup (satu-satunya kontrol tutup, khusus dalam panel ini) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            minHeight: '40px',
            padding: '0 4px',
            marginBottom: '32px',
          }}
        >
          <h3
            style={{
              margin: 0,
              color: '#1a1d1f',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.4px',
              lineHeight: 1.4,
              textTransform: 'uppercase',
            }}
          >
            Monitoring Jarak Mata
          </h3>

          <button
            onClick={() => setIsOpen(false)}
            aria-label="Tutup sidebar"
            style={{
              background: '#ffffff',
              border: '1px solid #efefef',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '10px',
              boxShadow: '0px 2px 6px rgba(0,0,0,0.02)',
              flexShrink: 0,
              transition: 'background 0.2s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#f4f5f6')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#ffffff')}
          >
            <X size={18} color="#1a1d1f" />
          </button>
        </div>

        {/* Menu Navigasi */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map((item) => {
            const isActive = activePage === item.id;
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? '#1a1d1f' : '#6f767e',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: isActive ? '0px 4px 12px rgba(0, 0, 0, 0.03)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <IconComponent size={20} color={isActive ? '#1a1d1f' : '#6f767e'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Tombol Logout */}
        <button
          onClick={onLogout}
          style={{
            marginTop: 'auto',
            width: '100%',
            padding: '12px',
            background: 'transparent',
            color: '#ef4444',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            textAlign: 'left',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'background 0.2s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#ffeeef')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <LogOut size={20} color="#ef4444" />
          Keluar Akun
        </button>
      </aside>

      {/* Overlay hanya tampil di layar sempit — di desktop sidebar & konten berdampingan */}
      <style>{`
        @media (min-width: 769px) {
          .sidebar-overlay { display: none; }
        }
      `}</style>
    </>
  );
}