import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, Lock, Mail } from 'lucide-react';

export default function Login({ setAuthPage, onLoginSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Mengirim data login ke DB:', formData.email);
    
    // Nanti di sini kita pasang fungsi fetch/axios ke database
    // Untuk sementara, langsung loloskan ke dashboard:
    onLoginSuccess();
  };

  return (
    <div style={cardStyle}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#1a1d1f' }}>Selamat Datang Kembali</h2>
        <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#6f767e' }}>Silakan masuk ke sistem monitoring Anda</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Alamat Email</label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} color="#6f767e" style={iconStyle} />
            <input type="email" name="email" required placeholder="contoh@email.com" value={formData.email} onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} color="#6f767e" style={iconStyle} />
            <input type={showPassword ? 'text' : 'password'} name="password" required placeholder="••••••••" value={formData.password} onChange={handleChange} style={{ ...inputStyle, paddingRight: '40px' }} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={eyeBtnStyle}>
              {showPassword ? <EyeOff size={18} color="#6f767e" /> : <Eye size={18} color="#6f767e" />}
            </button>
          </div>
        </div>

        <button type="submit" style={submitBtnStyle}>
          <LogIn size={16} /> Masuk ke Dashboard
        </button>
      </form>

      <div style={footerTextStyle}>
        Belum punya akun?{' '}
        <span onClick={() => setAuthPage('register')} style={linkStyle}>Daftar sekarang</span>
      </div>
    </div>
  );
}

// Reusable Styles (Bisa dipindahkan ke file terpisah atau css jika mau)
const cardStyle = { width: '100%', maxWidth: '420px', background: '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.04)', border: '1px solid #efefef' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#1a1d1f' };
const iconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' };
const inputStyle = { width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #efefef', background: '#fafafa', borderRadius: '12px', fontSize: '14px', outline: 'none', color: '#1a1d1f', boxSizing: 'border-box' };
const eyeBtnStyle = { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const submitBtnStyle = { width: '100%', padding: '12px', background: '#1a1d1f', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' };
const footerTextStyle = { textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#6f767e' };
const linkStyle = { color: '#1a1d1f', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' };