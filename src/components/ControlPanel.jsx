import React from 'react';

export default function ControlPanel({ settings, updateSetting }) {
  return (
    <div
      style={{
        background: 'white',
        padding: '25px',
        borderRadius: '15px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        textAlign: 'left'
      }}
    >
      <h2 style={{ marginBottom: '20px' }}>⚙️ Pengaturan LED & Alarm</h2>

      {/* MODE ALARM */}
      <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
        🚨 Mode Alarm
      </label>
      <select
        value={settings.modeAlarm}
        onChange={(e) => updateSetting('modeAlarm', e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '10px',
          border: '1px solid #ccc',
          marginBottom: '25px',
          fontSize: '16px'
        }}
      >
        <option value="NORMAL">NORMAL</option>
        <option value="SIREN">SIREN</option>
      </select>

      {/* RED DELAY */}
      <label>🚨 Red Delay: {settings.redDelay} ms</label>
      <input
        type="range"
        min="10"
        max="1000"
        value={settings.redDelay}
        onChange={(e) => updateSetting('redDelay', e.target.value)}
        style={{ width: '100%', marginBottom: '20px' }}
      />

      {/* YELLOW DELAY */}
      <label>⚠️ Yellow Delay: {settings.yellowDelay} ms</label>
      <input
        type="range"
        min="10"
        max="1000"
        value={settings.yellowDelay}
        onChange={(e) => updateSetting('yellowDelay', e.target.value)}
        style={{ width: '100%', marginBottom: '20px' }}
      />

      {/* GREEN DELAY */}
      <label>✅ Green Delay: {settings.greenDelay} ms</label>
      <input
        type="range"
        min="100"
        max="3000"
        value={settings.greenDelay}
        onChange={(e) => updateSetting('greenDelay', e.target.value)}
        style={{ width: '100%', marginBottom: '20px' }}
      />

      {/* BUZZER DELAY */}
      <label>🚑 Sirine Speed: {settings.buzzerDelay} ms</label>
      <input
        type="range"
        min="5"
        max="100"
        value={settings.buzzerDelay}
        onChange={(e) => updateSetting('buzzerDelay', e.target.value)}
        style={{ width: '100%' }}
      />
    </div>
  );
}