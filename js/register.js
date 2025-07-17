import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const nama = document.getElementById("name").value;
  const role = document.querySelector('input[name="role"]:checked').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      email,
      nama,
      role
    });

    alert("Pendaftaran berhasil! Silakan login.");
    window.location.href = "index.html";

  } catch (error) {
    console.error("Gagal daftar:", error);
    alert("Pendaftaran gagal: " + error.message);
  }
});
