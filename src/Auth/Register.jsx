import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { UserPlus, Eye, EyeOff, Lock, Mail, User, Camera, RefreshCw, Loader2, ArrowRight } from 'lucide-react';

// ====================================================================
// CONFIG HOST API DINAMIS (KUNCI SINKRONISASI MOBILE NGROK)
// ====================================================================
// ⚠️ LANGKAH WAJIB: Ganti URL di bawah ini dengan URL acak terbaru yang muncul di terminal ngrok kamu!
const BASE_URL_SERVER_AI = "  https://ec32-103-180-198-13.ngrok-free.app";

export default function Register({ setAuthPage }) {
  // State untuk manajemen langkah/step halaman (1 = Isi Form, 2 = Scan Face ID)
  const [step, setStep] = useState(1);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ nama: '', email: '', password: '' });
  
  // State untuk Fitur Scan Wajah & Status Pengiriman
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fungsi untuk validasi form sebelum lanjut ke halaman scan wajah
  const handleNextStep = (e) => {
    e.preventDefault();
    // Jika semua input form valid, arahkan ke step 2 (Kamera Face ID)
    setStep(2);
  };

  // Fungsi mengambil snapshot dari kamera
  const captureWajah = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc); 
  };

  // Fungsi untuk foto ulang jika hasilnya kurang pas
  const retakeFoto = () => {
    setImgSrc(null);
  };

  // Fungsi akhir untuk menembak seluruh fusi data ke Backend Python
  const handleFinalSubmit = async () => {
    if (!imgSrc) {
      alert('Wajib melakukan Scan Wajah terlebih dahulu untuk keamanan Face ID!');
      return;
    }

    // Gabungkan data form step 1 dan foto wajah step 2
    const payloadRegistrasi = {
      nama: formData.nama,
      email: formData.email,
      password: formData.password,
      fotoWajah: imgSrc 
    };

    setIsSubmitting(true);
    console.log('Mengirim fusi data registrasi ke backend Python:', payloadRegistrasi.email);
    
    try {
      // PERBAIKAN: Memastikan pemanggilan URL menembak endpoint lengkap /api/register-face secara akurat
      const res = await fetch(`${BASE_URL_SERVER_AI}/api/register-face`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payloadRegistrasi),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        alert(data.message || 'Registrasi akun dan pemindaian wajah berhasil!');
        setAuthPage('login'); // SUKSES: Langsung lempar otomatis ke halaman login
      } else {
        alert(data.message || 'Gagal mendaftarkan biometrik wajah.');
      }
    } catch (err) {
      console.error('Koneksi ke server AI Flask gagal:', err);
      alert('Gagal mengirim data aman ke Server AI. Pastikan server python app.py dan ngrok port 5000 sudah berjalan aktif.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Tambahkan div pembungkus (container) untuk memusatkan UI di layar
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Inject Style Animasi Putar */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>

        {/* ====================================================================
            HALAMAN STEP 1: PENGISIAN FORM REGISTRASI DATA UTAMA AKUN
            ==================================================================== */}
        {step === 1 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#1a1d1f' }}>Buat Akun Baru</h2>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#6f767e' }}>Langkah 1: Masukkan kredensial data akun Anda</p>
            </div>

            <form onSubmit={handleNextStep} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Nama Lengkap</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#6f767e" style={iconStyle} />
                  <input type="text" name="nama" required placeholder="Masukkan nama lengkap" value={formData.nama} onChange={handleChange} style={inputStyle} />
                </div>
              </div>

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
                Lanjutkan ke Scan Wajah <ArrowRight size={16} />
              </button>
            </form>

            <div style={footerTextStyle}>
              Sudah memiliki akun?{' '}
              <span onClick={() => setAuthPage('login')} style={linkStyle}>Log in di sini</span>
            </div>
          </>
        )}

        {/* ====================================================================
            HALAMAN STEP 2: KHUSUS PEMINDAIAN BIOMETRIK (FACE ID)
            ==================================================================== */}
        {step === 2 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#1a1d1f' }}>Verifikasi Face ID</h2>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#6f767e' }}>Langkah 2: Pindai wajah untuk aktivasi sistem proteksi mata</p>
            </div>

            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ 
                width: '100%', 
                height: '220px', 
                background: '#1a1d1f', 
                borderRadius: '12px', 
                overflow: 'hidden', 
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #efefef'
              }}>
                {imgSrc === null ? (
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ width: 420, height: 220, facingMode: "user" }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <img src={imgSrc} alt="Hasil Scan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}

                {imgSrc === null && (
                  <div style={{
                    position: 'absolute', width: '70%', height: '75%', 
                    border: '2px dashed rgba(255,255,255,0.4)', borderRadius: '50%'
                  }}></div>
                )}
              </div>

              <div style={{ marginTop: '10px' }}>
                {imgSrc === null ? (
                  <button type="button" onClick={captureWajah} style={cameraBtnStyle}>
                    <Camera size={14} /> Ambil Foto Wajah
                  </button>
                ) : (
                  <button type="button" onClick={retakeFoto} disabled={isSubmitting} style={{ ...cameraBtnStyle, background: '#f4f5f6', color: '#1a1d1f', opacity: isSubmitting ? 0.6 : 1 }}>
                    <RefreshCw size={14} /> Foto Ulang
                  </button>
                )}
              </div>
            </div>

            {/* Tombol Eksekusi Akhir Registrasi */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                type="button" 
                onClick={handleFinalSubmit} 
                disabled={isSubmitting} 
                style={{ ...submitBtnStyle, opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Memproses Biometrik...
                  </>
                ) : (
                  <>
                    <UserPlus size={16} /> Selesaikan Pendaftaran
                  </>
                )}
              </button>

              {/* Tombol Kembali ke Step 1 jika ingin edit form nama/email */}
              <button 
                type="button" 
                onClick={() => !isSubmitting && setStep(1)} 
                disabled={isSubmitting} 
                style={{ background: 'none', border: 'none', color: '#6f767e', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: '8px', textDecoration: 'underline' }}
              >
                Kembali ke Pengisian Data
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Objek Desain Styles
// Style baru untuk pembungkus (container) agar posisinya di tengah layar
const containerStyle = { 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  minHeight: '100vh', 
  backgroundColor: '#f8f9fa', // Background opsional agar card terlihat menonjol
  padding: '20px' 
};

// Penambahan boxSizing agar padding tidak mengubah ukuran layout card
const cardStyle = { 
  width: '100%', 
  maxWidth: '420px', 
  background: '#ffffff', 
  borderRadius: '16px', 
  padding: '32px', 
  boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.04)', 
  border: '1px solid #efefef',
  boxSizing: 'border-box'
};

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#1a1d1f' };
const iconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' };
const inputStyle = { width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #efefef', background: '#fafafa', borderRadius: '12px', fontSize: '14px', outline: 'none', color: '#1a1d1f', boxSizing: 'border-box' };
const eyeBtnStyle = { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const submitBtnStyle = { width: '100%', padding: '12px', background: '#1a1d1f', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' };
const cameraBtnStyle = { display: 'inline-flex', alignItems : 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', border: '1px solid #efefef', background: '#1a1d1f', color: '#ffffff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' };
const footerTextStyle = { textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#6f767e' };
const linkStyle = { color: '#1a1d1f', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' };