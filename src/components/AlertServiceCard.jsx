import React from 'react';
import { Shield, Radio } from 'lucide-react';

export default function AlertServiceCard({ isServiceActive, enableAlerts, isMobile }) {
  // Gunakan fallback jika properti isMobile tidak di-passing dari parent
  const mobileMode = isMobile !== undefined ? isMobile : (window.innerWidth <= 768);

  return (
    <div style={{ 
      background: '#ffffff', 
      padding: mobileMode ? '16px' : '20px', 
      borderRadius: '24px', 
      border: '1px solid #efefef', 
      boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.01)', 
      boxSizing: 'border-box',
      width: '100%',
      textAlign: 'left',
      marginBottom: '24px'
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: mobileMode ? 'column' : 'row', // Otomatis turun ke bawah di mobile agar tidak sempit
        gap: '14px', 
        alignItems: mobileMode ? 'stretch' : 'center', 
        justifyContent: 'space-between' 
      }}>
        
        {/* SISI KIRI: Icon dan Info Status Deskripsi */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{ 
            padding: '10px', 
            background: isServiceActive ? '#e3f6ec' : '#f4f5f6', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0 
          }}>
            <Shield size={20} color={isServiceActive ? '#00a35c' : '#6f767e'} />
          </div>

          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#1a1d1f' }}>
              Sistem Peringatan {isServiceActive ? 'Aktif' : 'Nonaktif'}
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#6f767e', lineHeight: '1.4' }}>
              Alarm suara, getar, dan push notification memantau posisi duduk Anda.
            </p>
          </div>
        </div>

        {/* SISI KANAN: Tombol Kontrol yang Diperkecil (Slim, Simple, & Pas di HP) */}
        <button 
          onClick={isServiceActive ? () => {} : enableAlerts} // Menyesuaikan fungsi trigger bawaan App.jsx kamu
          style={{ 
            padding: '10px 18px', 
            background: isServiceActive ? '#fce8e8' : '#1a1d1f', 
            color: isServiceActive ? '#ea4e4e' : '#ffffff', 
            border: 'none', 
            borderRadius: '12px', 
            fontWeight: '600', 
            fontSize: '13px', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: isServiceActive ? 'none' : '0px 4px 12px rgba(26, 29, 31, 0.1)',
            transition: 'all 0.2s ease',
            marginTop: mobileMode ? '8px' : '0px', // Jeda tipis di mobile saat layout vertikal
            whiteSpace: 'nowrap'
          }}
        >
          <Radio size={14} className={isServiceActive ? "animate-pulse" : ""} />
          {isServiceActive ? 'Nonaktifkan' : 'Aktifkan Peringatan'}
        </button>

      </div>
    </div>
  );
}