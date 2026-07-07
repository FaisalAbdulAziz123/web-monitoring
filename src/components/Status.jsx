import React from 'react';

const Status = ({ kondisi }) => {
  // Logika warna: merah jika bahaya, hijau jika aman
  const isDanger = kondisi === "BAHAYA" || kondisi === "TERLALU DEKAT";
  
  const statusStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: isDanger ? '#ff4d4d' : '#4caf50',
    color: 'white',
    fontSize: '1.2rem',
    transition: '0.3s'
  };

  return (
    <div style={statusStyle}>
      STATUS: {kondisi}
    </div>
  );
};

export default Status;