// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Ganti konfigurasi di bawah ini dengan milikmu
const firebaseConfig = {
  apiKey: "AIzaSyBeW3xpks6sYp7ZYzkYqmPv7x2rZGFMbOI",
  authDomain: "iqra-sulsel.firebaseapp.com",
  projectId: "iqra-sulsel",
  storageBucket: "iqra-sulsel.appspot.com", // <- sudah saya perbaiki (.app jadi .appspot.com)
  messagingSenderId: "821731184828",
  appId: "1:821731184828:web:b1597a56b50cf8d4be00b9",
  measurementId: "G-C2EGLHEKVP"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Ekspor agar bisa digunakan di file lain
export { auth, db };
