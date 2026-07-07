import React from 'react';

export default function DangerAlert({ isDanger }) {
  if (!isDanger) return null;

  return (
    <div
      className="alert-box danger-blink"
      style={{
        marginTop: '20px',
        padding: '15px',
        background: 'red',
        color: 'white',
        borderRadius: '10px'
      }}
    >
      <strong>PERINGATAN:</strong> Segera menjauh dari layar!
    </div>
  );
}