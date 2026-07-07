// src/config/firebase.js
import { initializeApp } from "firebase/app";
// Ganti getAnalytics menjadi getDatabase untuk Realtime Database
import { getDatabase } from "firebase/database"; 

const firebaseConfig = {
  apiKey: "AIzaSyA95AfpwF7nqMovUMQLJHux3OqYkgwx7Cc",
  authDomain: "eye-monitoring-dashboard.firebaseapp.com",
  databaseURL: "https://eye-monitoring-dashboard-default-rtdb.firebaseio.com",
  projectId: "eye-monitoring-dashboard",
  storageBucket: "eye-monitoring-dashboard.firebasestorage.app",
  messagingSenderId: "321734862168",
  appId: "1:321734862168:web:72303a8d96c52504f6712d",
  measurementId: "G-KZSKQ7L4D5"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// BAGIAN PENTING: Ekspor variabel 'db' agar bisa dipanggil di App.js
export const db = getDatabase(app);