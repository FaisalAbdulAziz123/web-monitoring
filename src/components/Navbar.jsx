import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';

export default function Navbar({ isOpen, setIsOpen }) {
  const [isMobile, setIsMobile] = useState(false);

  // Deteksi ukuran layar secara real-time untuk penyesuaian responsif mobile UI
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (typeof setIsOpen === 'function') {
      setIsOpen((prev) => !prev);
    } else {
      console.warn(
        "Fungsi 'setIsOpen' tidak ditemukan pada props Navbar. Pastikan Anda menulis: <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />"
      );
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        padding: isMobile ? '12px 14px' : '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        boxSizing: 'border-box',
        borderRadius: '16px',
        border: '1px solid #efefef',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.01)',
        gap: '12px',
      }}
    >
      {/* BAGIAN KIRI: tombol hamburger (selalu tampil, jadi tidak pernah "hilang") + judul */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, flex: 1 }}>
        <button
          onClick={toggleSidebar}
          aria-label={isOpen ? 'Tutup sidebar' : 'Buka sidebar'}
          style={{
            background: '#ffffff',
            border: '1px solid #efefef',
            cursor: 'pointer',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '12px',
            boxShadow: '0px 2px 6px rgba(0,0,0,0.03)',
            flexShrink: 0,
            transition: 'background 0.2s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#f4f5f6')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#ffffff')}
        >
          <Menu size={20} color="#1a1d1f" />
        </button>

        {/* Judul — menyusut rapi, tidak pernah tertimpa tombol hamburger */}
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontSize: isMobile ? '15px' : '20px',
              fontWeight: 700,
              color: '#1a1d1f',
              letterSpacing: '-0.5px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Dashboard Monitoring
          </h1>
          <span
            style={{
              fontSize: isMobile ? '11px' : '12px',
              color: '#6f767e',
              fontWeight: 500,
              marginTop: '2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Monitoring Jarak Aman Mata
          </span>
        </div>
      </div>

      {/* BAGIAN KANAN: status koneksi */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#f4fbf7',
          padding: isMobile ? '6px 10px' : '8px 16px',
          borderRadius: '12px',
          border: '1px solid #e1f5eb',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#00a35c',
          }}
        />
        <span style={{ fontSize: isMobile ? '11px' : '13px', fontWeight: 700, color: '#00a35c' }}>
          Terhubung
        </span>
      </div>
    </div>
  );
}