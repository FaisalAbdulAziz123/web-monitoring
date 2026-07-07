import React from 'react';

const Card = ({ title, value, unit }) => {
  // Logika untuk mengecilkan font secara otomatis jika nilainya berupa teks panjang (seperti durasi)
  // Ini mencegah teks "1j 20m 30s" keluar dari kotak kartu
  const isLongText = typeof value === 'string' && value.length > 5;
  
  const valueStyle = {
    fontSize: isLongText ? '1.6rem' : '2.5rem', 
    margin: 0, 
    color: '#333',
    transition: 'font-size 0.3s ease' // Efek transisi halus saat angka berubah
  };

  const cardStyle = {
    background: 'silver',
    padding: '25px 20px',
    borderRadius: '16px', // Sudut lebih halus
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)', // Shadow lebih modern
    flex: '1',
    minWidth: '220px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', // Konten rata tengah agar lebih simetris
    textAlign: 'center'
  };

  return (
    <div className="card-item" style={cardStyle}>
      <h4 style={{ 
        color: '#718096', 
        margin: '0 0 12px 0', 
        fontSize: '0.9rem', 
        textTransform: 'uppercase', 
        letterSpacing: '0.05em' 
      }}>
        {title}
      </h4>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'baseline', 
        justifyContent: 'center', 
        gap: '4px' 
      }}>
        <h2 style={valueStyle}>{value}</h2>
        {unit && (
          <span style={{ 
            fontSize: '1rem', 
            color: '#A0AEC0', 
            fontWeight: '500' 
          }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
};

export default Card;