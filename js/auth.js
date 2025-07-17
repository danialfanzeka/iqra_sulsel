// js/auth.js
import { auth, db } from "./firebase.js";
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      const role = data.role;

      localStorage.setItem("role", role);

      if (role === "guru") {
        window.location.href = "guru.html";
      } else if (role === "siswa") {
        window.location.href = "dashboard.html";
      } else {
        alert("Role tidak dikenali. Hubungi admin.");
      }
    } else {
      alert("Data pengguna tidak ditemukan.");
    }

  } catch (error) {
    console.error("Login gagal:", error);
    alert("Email atau password salah.");
  }
});
