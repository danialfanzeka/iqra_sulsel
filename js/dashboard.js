import { auth } from './firebase.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

document.getElementById("logout-btn")?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    localStorage.clear();
    window.location.href = "index.html"; // ganti dengan 'login.html' kalau kamu punya halaman login
  } catch (error) {
    alert("Gagal logout: " + error.message);
  }
});
