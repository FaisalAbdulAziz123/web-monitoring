import React, { useState, useEffect, useCallback, useRef } from 'react';
import { db } from './config/firebase';
import { ref, onValue, set, update } from 'firebase/database';
import { Eye, Shield, Info, Clock, Camera, AlertTriangle, BarChart2, Trash2, Download, RefreshCw, Bell, Radio, Power, PowerOff } from 'lucide-react';

// Import Library Grafik
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Import Komponen UI
import Navbar from './components/Navbar';
import AlertServiceCard from './components/AlertServiceCard';
import ControlPanel from './components/ControlPanel';
import DangerAlert from './components/DangerAlert';
import Sidebar from './components/Sidebar';
import Login from './Auth/Login';
import Register from './Auth/Register';

import './App.css';

// ============================================================================
// ANIMASI GLOBAL — hanya menyentuh tampilan, tidak menyentuh logika apapun
// ============================================================================
const GlobalMotionStyles = () => (
  <style>{`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulseRing {
      0%   { box-shadow: 0 0 0 0 rgba(0, 163, 92, 0.35); }
      70%  { box-shadow: 0 0 0 8px rgba(0, 163, 92, 0); }
      100% { box-shadow: 0 0 0 0 rgba(0, 163, 92, 0); }
    }
    @keyframes pulseRingDanger {
      0%   { box-shadow: 0 0 0 0 rgba(234, 78, 78, 0.35); }
      70%  { box-shadow: 0 0 0 8px rgba(234, 78, 78, 0); }
      100% { box-shadow: 0 0 0 0 rgba(234, 78, 78, 0); }
    }
    .fade-in-up {
      animation: fadeInUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .hover-lift {
      transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
    }
    .hover-lift:hover {
      transform: translateY(-3px);
      box-shadow: 0px 14px 28px rgba(0, 0, 0, 0.06);
    }
    .press-effect {
      transition: transform 0.12s ease;
    }
    .press-effect:active {
      transform: scale(0.97);
    }
    .row-hover:hover {
      background: #fafbfb;
    }
  `}</style>
);

function App() {
  // SINKRONISASI INITIAL STATE LOGIN VIA LOCALSTORAGE AGAR TAHAN REFRESH
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const savedSession = localStorage.getItem('isLoggedIn');
    return savedSession === 'true';
  }); 
  const [authPage, setAuthPage] = useState('login'); 

  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 

  // STATE BARU: Deteksi Ukuran Layar Otomatis untuk Optimalisasi Mobile UI
  const [isMobile, setIsMobile] = useState(false);

  const [data, setData] = useState({ jarak: 0, status: "AMAN" });
  const [statusMata, setStatusMata] = useState("MEMUAT...");
  const [grafikData, setGrafikData] = useState([]);

  // SINKRONISASI: STATE & REF DETEKSI HEARTBEAT ALAT REAL-TIME
  const [isDeviceOnline, setIsDeviceOnline] = useState(false);
  const lastDataTimeRef = useRef(Date.now()); 

  // STATISTIK SESI DUDUK
  const [totalPelanggaran, setTotalPelanggaran] = useState(0);
  const [rataRataJarak, setRataRataJarak] = useState(0);

  // REFERENSI VARIABEL LOKAL UNTUK MENCEGAH RE-RENDER WARNING SAAT PERHITUNGAN REALTIME
  const totalDataMasukRef = useRef(0);
  const jumlahSemuaJarakRef = useRef(0);

  // STATE RIWAYAT DATA LOG TABEL
  const [riwayatData, setRiwayatData] = useState([]);

  // STATE RIWAYAT TIMELINE KHUSUS KEDARURATAN
  const [riwayatNotifikasi, setRiwayatNotifikasi] = useState([]);

  // STATE STATUS LOADING ALARM MANUAL
  const [isTestingAlarm, setIsTestingAlarm] = useState(false);

  const wasDangerRef = useRef(false);
  const wasDangerNotifRef = useRef(false); 

  // REVISI FIX SINKRONISASI DATABASE SLIDER DASHBOARD
  const [settings, setSettings] = useState({
    redDelay: 100,
    yellowDelay: 150,
    greenDelay: 1000,
    buzzerDelay: 15,
    modeAlarm: "NORMAL"
  });
  const [isServiceActive, setIsServiceActive] = useState(false);

  // DURASI KERJA (TIMER)
  const [detikBekerja, setDetikBekerja] = useState(0);

  // DETEKSI BREAKPOINT LAYAR SECARA REAL-TIME
  useEffect(() => {
    const handleResize = () => {
      const mobileStatus = window.innerWidth <= 768;
      setIsMobile(mobileStatus);
      // Jika di layar HP, tutup sidebar secara default agar tidak menutupi bodi
      if (mobileStatus) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let intervalWork = null;
    if (isServiceActive) {
      intervalWork = setInterval(() => {
        setDetikBekerja((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalWork) clearInterval(intervalWork);
    }
    return () => {
      if (intervalWork) clearInterval(intervalWork);
    };
  }, [isServiceActive]);

  const formatDurasiKerja = (totalDetik) => {
    const jam = Math.floor(totalDetik / 3600);
    const menit = Math.floor((totalDetik % 3600) / 60);
    const detik = totalDetik % 60;
    return `${jam.toString().padStart(2, '0')}:${menit.toString().padStart(2, '0')}:${detik.toString().padStart(2, '0')}`;
  };

  const audioRef = useRef(null);
  const lastAlertTime = useRef(0);

  useEffect(() => {
    audioRef.current = new Audio('/alrm.mp3');
    audioRef.current.load();
  }, []);

  const playAlertSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => console.error(err));
      }
    }
  }, []);

  const stopAlertSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const triggerWarning = useCallback(() => {
    const now = Date.now();
    if (now - lastAlertTime.current < 3000) return;
    lastAlertTime.current = now;

    playAlertSound();

    if ("vibrate" in navigator) {
      navigator.vibrate([500, 200, 500]);
    }

    if (Notification.permission === "granted") {
      new Notification("⚠️ JARAK BERBAHAYA!", {
        body: "Jarak mata terlalu dekat!",
        icon: "/logo192.png",
      });
    }
  }, [playAlertSound]);

  const enableAlerts = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          setIsServiceActive(true);
          playAlertSound();
          setTimeout(() => stopAlertSound(), 100);
        }
      });
    }
  };

  const updateSetting = (key, value) => {
    const finalValue = key === "modeAlarm" ? value : Number(value);
    
    setSettings(prev => ({ ...prev, [key]: finalValue }));
    
    update(ref(db, 'monitoring'), {
      [key]: finalValue
    }).catch(err => console.error("Gagal update Firebase:", err));
  };

  useEffect(() => {
    const checkerInterval = setInterval(() => {
      const timeSinceLastData = Date.now() - lastDataTimeRef.current;
      if (timeSinceLastData > 5000) {
        setIsDeviceOnline(false);
      }
    }, 2000);

    return () => clearInterval(checkerInterval);
  }, []);

  useEffect(() => {
    if (!isServiceActive) {
      setTotalPelanggaran(0);
      totalDataMasukRef.current = 0;
      jumlahSemuaJarakRef.current = 0;
      setRataRataJarak(0);
      setRiwayatData([]); 
      setRiwayatNotifikasi([]); 
      wasDangerRef.current = false;
      wasDangerNotifRef.current = false;
    }
  }, [isServiceActive]);

  useEffect(() => {
    const monitoringRef = ref(db, 'monitoring');
    const unsubscribe = onValue(monitoringRef, (snapshot) => {
      const firebaseData = snapshot.val();
      if (firebaseData) {
        const currentJarak = firebaseData.jarak || 0;
        const currentStatus = firebaseData.status || "AMAN";

        setData({
          jarak: currentJarak,
          status: currentStatus
        });

        if (currentJarak > 0) {
          lastDataTimeRef.current = Date.now(); 
          setIsDeviceOnline(true);
        }
        
        const waktuSekarang = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        if (isServiceActive && currentJarak > 0) {
          if (currentJarak < 90) {
            
            // Kalkulasi real-time tanpa memicu warning un-used state di server produksi
            totalDataMasukRef.current += 1;
            jumlahSemuaJarakRef.current += currentJarak;
            setRataRataJarak(jumlahSemuaJarakRef.current / totalDataMasukRef.current);

            const isCurrentlyDanger = currentJarak < 50;
            if (isCurrentlyDanger) {
              if (!wasDangerRef.current) {
                setTotalPelanggaran(prev => prev + 1);
              }

              setRiwayatData(prevRiwayat => [
                {
                  id: Date.now() + Math.random(),
                  waktu: waktuSekarang,
                  jarak: Number(currentJarak.toFixed(1)),
                  status: "BAHAYA"
                },
                ...prevRiwayat
              ]);
            } else {
              setRiwayatData(prevRiwayat => [
                {
                  id: Date.now() + Math.random(),
                  waktu: waktuSekarang,
                  jarak: Number(currentJarak.toFixed(1)),
                  status: "AMAN"
                },
                ...prevRiwayat
              ]);
            }

            if (isCurrentlyDanger && !wasDangerNotifRef.current) {
              setRiwayatNotifikasi(prev => [
                {
                  id: Date.now(),
                  waktu: waktuSekarang,
                  tipe: "BAHAYA",
                  pesan: `Peringatan Kritis! Jarak mata terlalu dekat (${currentJarak.toFixed(1)} cm). Infrastruktur alarm dipicu.`
                },
                ...prev
              ]);
              wasDangerNotifRef.current = true;
            } else if (!isCurrentlyDanger && wasDangerNotifRef.current) {
              setRiwayatNotifikasi(prev => [
                {
                  id: Date.now(),
                  waktu: waktuSekarang,
                  tipe: "AMAN",
                  pesan: `Kondisi kembali normal. Jarak terukur aman (${currentJarak.toFixed(1)} cm).`
                },
                ...prev
              ]);
              wasDangerNotifRef.current = false;
            }

            wasDangerRef.current = isCurrentlyDanger;
          }
        }

        setGrafikData((prevData) => {
          const newData = [...prevData, { waktu: waktuSekarang, Jarak: Number(currentJarak.toFixed(1)) }];
          if (newData.length > 10) { 
            return newData.slice(1);
          }
          return newData;
        });

        if (currentStatus === "BAHAYA") {
          setStatusMata("MATA TERDETEKSI (DEKAT)");
        } else if (currentJarak > 0) {
          setStatusMata("MATA TERBUKA (AMAN)");
        } else {
          setStatusMata("MATA TERTUTUP / TIDAK ADA");
        }

        setSettings({
          redDelay: firebaseData.redDelay !== undefined ? firebaseData.redDelay : 100,
          yellowDelay: firebaseData.yellowDelay !== undefined ? firebaseData.yellowDelay : 150,
          greenDelay: firebaseData.greenDelay !== undefined ? firebaseData.greenDelay : 1000,
          buzzerDelay: firebaseData.buzzerDelay !== undefined ? firebaseData.buzzerDelay : 15,
          modeAlarm: firebaseData.modeAlarm || "NORMAL"
        });

        if (isServiceActive) {
          if (currentJarak > 0 && currentJarak < 50) {
            triggerWarning();
          } else {
            stopAlertSound();
          }
        }
      }
    });
    return () => unsubscribe();
  }, [isServiceActive, triggerWarning, stopAlertSound]);

  const tesAlarmManual = () => {
    if (isTestingAlarm) return;
    
    setIsTestingAlarm(true);
    playAlertSound(); 

    if ("vibrate" in navigator) {
      navigator.vibrate([300, 100, 300, 100, 300]);
    }

    set(ref(db, 'monitoring/status'), "BAHAYA");

    if (Notification.permission === "granted") {
      new Notification("🚨 PENGUJIAN SISTEM NOTIFIKASI", {
        body: "Infrastruktur alarm nirkabel bekerja dengan normal!",
        icon: "/logo192.png",
      });
    }

    const waktuSekarang = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setRiwayatNotifikasi(prev => [
      {
        id: Date.now(),
        waktu: waktuSekarang,
        tipe: "TEST",
        pesan: "Pengujian manual infrastruktur kedaruratan (Audio, Vibrasi, & Push Notif) berhasil dijalankan."
      },
      ...prev
    ]);

    setTimeout(() => {
      stopAlertSound();
      set(ref(db, 'monitoring/status'), "AMAN");
      setIsTestingAlarm(false);
    }, 3000);
  };

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.removeItem('isLoggedIn');
      setIsLoggedIn(false);
      setIsServiceActive(false);
    }
  };

  const hapusRiwayatSatuBaris = (idTarget) => {
    setRiwayatData(prev => prev.filter(item => item.id !== idTarget));
  };

  const hapusSemuaRiwayat = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus seluruh log aktivitas sensor pada sesi ini?")) {
      setRiwayatData([]);
    }
  };

  const exportKeCSV = () => {
    if (riwayatData.length === 0) {
      alert("Tidak ada data log yang bisa di-export!");
      return;
    }
    let isiCSV = "Waktu Log,Jarak Pemindaian (cm),Kategori Status\n";
    riwayatData.forEach(item => {
      isiCSV += `${item.waktu},${item.jarak},${item.status}\n`;
    });
    const blob = new Blob([isiCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const linkUnduhan = document.createElement("a");
    linkUnduhan.setAttribute("href", url);
    linkUnduhan.setAttribute("download", `Log_Jarak_Mata_${new Date().toLocaleDateString('id-ID')}.csv`);
    document.body.appendChild(linkUnduhan);
    linkUnduhan.click();
    document.body.removeChild(linkUnduhan);
  };

  const isDanger = data.jarak > 0 && data.jarak < 50;

  // Kartu dasar dipakai berulang — helper tampilan murni, tidak menyentuh logika
  const cardBaseStyle = {
    background: '#ffffff',
    padding: '20px',
    borderRadius: '24px',
    border: '1px solid #efefef',
    textAlign: 'left',
    boxSizing: 'border-box',
  };

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <>
            {/* BANNER NOTIFIKASI ALAT AKTIF / MATI */}
            <div className="fade-in-up" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: isMobile ? '12px 16px' : '16px 24px',
              borderRadius: '20px',
              marginBottom: '24px',
              border: isDeviceOnline ? '1px solid #e1f5eb' : '1px solid #fbe2e2',
              background: isDeviceOnline ? '#f4fbf7' : '#fdf3f3',
              color: isDeviceOnline ? '#00a35c' : '#ea4e4e',
              textAlign: 'left',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: isDeviceOnline ? '#e3f6ec' : '#fce8e8',
                animation: isDeviceOnline ? 'pulseRing 2.2s infinite' : 'pulseRingDanger 1.4s infinite'
              }}>
                {isDeviceOnline ? <Power size={18} /> : <PowerOff size={18} />}
              </div>
              <div>
                <h4 style={{ margin: '0 0 2px 0', fontSize: isMobile ? '14px' : '15px', fontWeight: '700' }}>
                  {isDeviceOnline ? 'Alat Berhasil Terkoneksi' : 'Alat Monitoring Terputus'}
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#6f767e', lineHeight: '1.4' }}>
                  {isDeviceOnline ? 'Perangkat keras ESP32 dan sensor ultrasonik terdeteksi aktif dicolokkan.' : 'Web tidak menerima respons data. Pastikan kabel power alat sudah dicolokkan ke laptop.'}
                </p>
              </div>
            </div>

            {/* GRID UTAMA RESPONSIVE CARD — 1 kolom di HP, 3 kolom sejajar di desktop */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                gap: isMobile ? '16px' : '24px',
                marginBottom: '24px',
              }}
            >
              <div className="fade-in-up hover-lift" style={{ ...cardBaseStyle, animationDelay: '0.05s' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#6f767e' }}>
                  <Eye size={16} /> Jarak Terukur
                </span>
                <h1 style={{ margin: '12px 0 0 0', fontSize: isMobile ? '32px' : '40px', fontWeight: '700', color: '#1a1d1f' }}>
                  {data.jarak.toFixed(1)} <span style={{ fontSize: '18px', color: '#6f767e', fontWeight: '500' }}>cm</span>
                </h1>
              </div>

              <div className="fade-in-up hover-lift" style={{ ...cardBaseStyle, animationDelay: '0.1s' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#6f767e' }}>
                  <Camera size={16} /> Deteksi YOLOv8
                </span>
                <div style={{ marginTop: '12px' }}>
                  <span style={{
                    padding: '8px 14px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    background: statusMata.includes('DEKAT') || statusMata.includes('TERTUTUP') ? '#fce8e8' : '#e3f6ec',
                    color: statusMata.includes('DEKAT') || statusMata.includes('TERTUTUP') ? '#ea4e4e' : '#00a35c',
                    display: 'inline-block',
                    transition: 'all 0.3s ease'
                  }}>
                    {statusMata}
                  </span>
                </div>
              </div>

              <div className="fade-in-up hover-lift" style={{ ...cardBaseStyle, animationDelay: '0.15s' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#6f767e' }}>
                  <Shield size={16} /> Klasifikasi Sistem
                </span>
                <div style={{ marginTop: '12px' }}>
                  <span style={{
                    padding: '8px 14px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    background: data.status === 'AMAN' ? '#e3f6ec' : '#fce8e8',
                    color: data.status === 'AMAN' ? '#00a35c' : '#ea4e4e',
                    display: 'inline-block',
                    transition: 'all 0.3s ease'
                  }}>
                    {data.status === 'AMAN' ? 'AMAN' : 'WASPADA / BAHAYA'}
                  </span>
                </div>
              </div>
            </div>

            {/* WRAPPER GRAFIK ANTI-OVERFLOW */}
            <div className="fade-in-up" style={{ width: '100%', overflowX: 'hidden', background: '#fff', padding: '16px 8px', borderRadius: '20px', border: '1px solid #efefef', boxSizing: 'border-box', animationDelay: '0.2s' }}>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={grafikData} margin={{ top: 5, right: 10, left: -30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f5f6" />
                  <XAxis dataKey="waktu" stroke="#6f767e" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                  <YAxis domain={[0, 100]} stroke="#6f767e" style={{ fontSize: '10px' }} />
                  <Tooltip contentStyle={{ background: '#1a1d1f', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="Jarak" stroke="#2f80ed" strokeWidth={2.5} dot={{ r: 2 }} activeDot={{ r: 5 }} animationDuration={400} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* STATUS STATISTIK BAWAH — sejajar di desktop, bertumpuk di HP */}
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px', marginTop: '24px', marginBottom: '24px' }}>
              <div className="fade-in-up hover-lift" style={{ ...cardBaseStyle, flex: 1, animationDelay: '0.25s' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#6f767e' }}>
                  <AlertTriangle size={16} /> Total Pelanggaran Jarak
                </span>
                <h2 style={{ margin: '12px 0 0 0', fontSize: '26px', fontWeight: '700', color: totalPelanggaran > 0 ? '#ea4e4e' : '#1a1d1f', transition: 'color 0.3s ease' }}>
                  {totalPelanggaran} <span style={{ fontSize: '14px', color: '#6f767e', fontWeight: '500' }}>Kali</span>
                </h2>
              </div>

              <div className="fade-in-up hover-lift" style={{ ...cardBaseStyle, flex: 1, animationDelay: '0.3s' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#6f767e' }}>
                  <BarChart2 size={16} /> Rata-rata Jarak Sesi Ini
                </span>
                <h2 style={{ margin: '12px 0 0 0', fontSize: '26px', fontWeight: '700', color: '#1a1d1f' }}>
                  {rataRataJarak > 0 ? rataRataJarak.toFixed(1) : "0.0"} <span style={{ fontSize: '14px', color: '#6f767e', fontWeight: '500' }}>cm</span>
                </h2>
              </div>
            </div>

            <div className="fade-in-up" style={{ animationDelay: '0.35s' }}>
              <ControlPanel settings={settings} updateSetting={updateSetting} />
            </div>
          </>
        );

      case 'riwayat':
        return (
          <>
            <div className="fade-in-up hover-lift" style={{ ...cardBaseStyle, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f4f5f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Clock size={18} color="#1a1d1f" />
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#6f767e' }}>Total Durasi Kerja Hari Ini</span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '700', color: '#1a1d1f', fontFamily: 'monospace' }}>{formatDurasiKerja(detikBekerja)}</h2>
              </div>
            </div>

            <div className="fade-in-up" style={{ background: 'white', padding: isMobile ? '16px' : '32px', borderRadius: '24px', border: '1px solid #efefef', textAlign: 'left', boxSizing: 'border-box', animationDelay: '0.1s' }}>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '14px', alignItems: isMobile ? 'start' : 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a1d1f' }}>Riwayat Log Aktivitas Sensor</h2>
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <button
                    onClick={exportKeCSV}
                    className="press-effect"
                    style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#f4f5f6', border: '1px solid #efefef', padding: '10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', color: '#1a1d1f', cursor: 'pointer', transition: 'background 0.2s ease' }}
                    onMouseOver={(e) => (e.currentTarget.style.background = '#ebecee')}
                    onMouseOut={(e) => (e.currentTarget.style.background = '#f4f5f6')}
                  >
                    <Download size={14} /> Export
                  </button>
                  <button
                    onClick={hapusSemuaRiwayat}
                    className="press-effect"
                    style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#fff', border: '1px solid #fca5a5', padding: '10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', color: '#ef4444', cursor: 'pointer', transition: 'background 0.2s ease' }}
                    onMouseOver={(e) => (e.currentTarget.style.background = '#fff5f5')}
                    onMouseOut={(e) => (e.currentTarget.style.background = '#fff')}
                  >
                    <RefreshCw size={14} /> Clear
                  </button>
                </div>
              </div>

              {/* WRAPPER TABEL SCROLL HORIZONTAL DI MOBILE */}
              <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #efefef' }}>
                      <th style={{ padding: '12px 8px', fontSize: '12px', color: '#6f767e', fontWeight: '600' }}>Waktu</th>
                      <th style={{ padding: '12px 8px', fontSize: '12px', color: '#6f767e', fontWeight: '600' }}>Jarak</th>
                      <th style={{ padding: '12px 8px', fontSize: '12px', color: '#6f767e', fontWeight: '600' }}>Status</th>
                      <th style={{ padding: '12px 8px', fontSize: '12px', color: '#6f767e', fontWeight: '600', textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riwayatData.length === 0 ? (
                      <tr><td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#6f767e', fontSize: '13px' }}>Belum ada riwayat aktivitas sensor.</td></tr>
                    ) : (
                      riwayatData.map((log) => (
                        <tr key={log.id} className="row-hover" style={{ borderBottom: '1px solid #efefef', transition: 'background 0.15s ease' }}>
                          <td style={{ padding: '12px 8px', fontSize: '13px', color: '#1a1d1f', fontFamily: 'monospace' }}>{log.waktu}</td>
                          <td style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#1a1d1f' }}>{log.jarak} cm</td>
                          <td style={{ padding: '12px 8px' }}>
                            <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', background: log.status === 'AMAN' ? '#e3f6ec' : '#fce8e8', color: log.status === 'AMAN' ? '#00a35c' : '#ea4e4e' }}>{log.status}</span>
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                            <button
                              onClick={() => hapusRiwayatSatuBaris(log.id)}
                              className="press-effect"
                              style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', color: '#ef4444', borderRadius: '8px', transition: 'background 0.15s ease' }}
                              onMouseOver={(e) => (e.currentTarget.style.background = '#fce8e8')}
                              onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );

      case 'notifikasi':
        return (
          <div className="fade-in-up" style={{ background: 'white', padding: isMobile ? '16px' : '32px', borderRadius: '24px', border: '1px solid #efefef', textAlign: 'left', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#1a1d1f' }}>Pusat Kontrol Notifikasi Kedaruratan</h2>
                <p style={{ color: '#6f767e', fontSize: '13px', margin: 0 }}>Log pemicu infrastruktur alarm nirkabel secara aktual:</p>
              </div>
              <button
                onClick={tesAlarmManual}
                disabled={isTestingAlarm}
                className="press-effect"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: isTestingAlarm ? '#fecaca' : '#ef4444',
                  color: isTestingAlarm ? '#991b1b' : '#ffffff',
                  border: 'none', padding: '12px', borderRadius: '14px',
                  width: '100%', fontSize: '13px', fontWeight: '700', cursor: isTestingAlarm ? 'not-allowed' : 'pointer',
                  boxShadow: '0px 4px 12px rgba(239, 68, 68, 0.2)',
                  transition: 'background 0.25s ease, box-shadow 0.25s ease'
                }}
              >
                <Radio size={16} className={isTestingAlarm ? "animate-pulse" : ""} />
                {isTestingAlarm ? "MENGUJI ALARM..." : "TES INFRASTRUKTUR ALARM"}
              </button>
            </div>

            <div style={{ 
              padding: '16px', borderRadius: '16px', background: isDanger ? '#fdf3f3' : '#f4fbf7', border: isDanger ? '1px solid #fbe2e2' : '1px solid #e1f5eb', color: isDanger ? '#991b1b' : '#00a35c', display: 'flex', gap: '10px', alignItems: 'start', marginBottom: '24px', transition: 'all 0.3s ease'
            }}>
              <Info size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600' }}>{isDanger ? 'SISTEM PERINGATAN AKTIF' : 'KONDISI SISTEM NORMAL'}</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#6f767e', lineHeight: '1.4' }}>
                  {isDanger ? 'Infrastruktur internal (Vibration API, Audio dan Push Notification desktop) dipicu secara serentak.' : 'Seluruh sensor mendeteksi jarak aman mata berada di luar batas ambang kritis.'}
                </p>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1a1d1f', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={16} /> Live Timeline Notifikasi Masuk
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {riwayatNotifikasi.length === 0 ? (
                  <div style={{ padding: '32px 16px', border: '2px dashed #f4f5f6', borderRadius: '16px', textAlign: 'center', color: '#9a9fa5', fontSize: '13px' }}>
                    Belum ada riwayat aktivitas pemicu kedaruratan nirkabel pada sesi ini.
                  </div>
                ) : (
                  riwayatNotifikasi.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="fade-in-up hover-lift"
                      style={{ 
                        padding: '12px', borderRadius: '12px', background: '#ffffff', border: '1px solid #efefef',
                        display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left',
                        boxShadow: '0px 2px 8px rgba(0,0,0,0.01)',
                        animationDelay: `${Math.min(index, 6) * 0.05}s`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#6f767e', fontFamily: 'monospace', background: '#f4f5f6', padding: '2px 6px', borderRadius: '4px' }}>
                          {item.waktu}
                        </span>
                        <span style={{
                          fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px',
                          background: item.tipe === "BAHAYA" ? "#fce8e8" : item.tipe === "AMAN" ? "#e3f6ec" : "#e0f2fe",
                          color: item.tipe === "BAHAYA" ? "#ea4e4e" : item.tipe === "AMAN" ? "#00a35c" : "#0369a1"
                        }}>
                          {item.tipe}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: '#1a1d1f', fontWeight: '500', lineHeight: '1.4' }}>
                        {item.pesan}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        );

      default:
        return <p>Halaman tidak ditemukan.</p>;
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        width: '100vw',           
        background: '#f4f5f6', 
        fontFamily: 'system-ui, sans-serif',
        boxSizing: 'border-box',
        padding: '16px'
      }}>
        <GlobalMotionStyles />
        <div className="fade-in-up" style={{ width: '100%' }}>
          {authPage === 'login' ? (
            <Login setAuthPage={setAuthPage} onLoginSuccess={() => {
              localStorage.setItem('isLoggedIn', 'true'); 
              setIsLoggedIn(true);
            }} />
          ) : (
            <Register setAuthPage={setAuthPage} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="App" style={{ display: 'flex', background: '#fafafa', minHeight: '100vh', overflowX: 'hidden', width: '100vw' }}>
      <GlobalMotionStyles />

      {/* SIDEBAR DRAWER DENGAN OVERLAY PENGUNCI DI MOBILE */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} onLogout={handleLogout} isMobile={isMobile} />
      
      {/* BACKDROP COVER: Menutup konten utama saat menu sidebar mobile terbuka */}
      {isMobile && isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 17, 20, 0.35)', zIndex: 99,
            animation: 'fadeInUp 0.2s ease',
          }} 
        />
      )}

      {/* BODY KONTEN UTAMA DENGAN ADJUSTMENT MARGIN DINAMIS */}
      <div style={{ 
        flexGrow: 1, 
        marginLeft: isMobile ? '0px' : (isSidebarOpen ? '260px' : '0px'), 
        boxSizing: 'border-box', 
        transition: 'margin-left 0.3s cubic-bezier(0.22, 1, 0.36, 1)', 
        minWidth: 0,
        width: '100%'
      }}>
        
        {/* HEADER NAVBAR CONTAINER — satu-satunya tombol hamburger ada di dalam Navbar */}
        <div style={{ 
          background: '#fafafa', 
          padding: isMobile ? '12px 16px' : '20px 40px 8px', 
          width: '100%', 
          boxSizing: 'border-box',
          position: 'sticky',
          top: 0,
          zIndex: 90
        }}>
          <Navbar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        </div>

        {/* MAIN BODY CONTENT AREA */}
        <main style={{ padding: isMobile ? '16px' : '24px 40px 40px', boxSizing: 'border-box', width: '100%' }}>
          {/* key={activePage} membuat seluruh isi halaman fade-in setiap kali menu berpindah */}
          <div key={activePage} className="fade-in-up" style={{ maxWidth: '1120px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <AlertServiceCard isServiceActive={isServiceActive} enableAlerts={enableAlerts} />
            {renderContent()}
            <DangerAlert isDanger={isDanger} />
          </div>
        </main>

      </div>
    </div>
  );
}

export default App;