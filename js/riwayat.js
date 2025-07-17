// js/riwayat.js
import { db, auth } from "./firebase.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const riwayatList = document.getElementById("riwayat-list");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    riwayatList.innerHTML = "<p>Anda belum login.</p>";
    return;
  }

  const q = query(collection(db, "riwayat"), where("uid", "==", user.uid));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    riwayatList.innerHTML = "<p>Belum ada riwayat bacaan.</p>";
    return;
  }

  riwayatList.innerHTML = "";
  snapshot.forEach((doc) => {
    const data = doc.data();
    const div = document.createElement("div");
    div.className = "riwayat-item";
    div.innerHTML = `
      <strong>${data.surah}</strong>
      <span>Ayat: ${data.ayat}</span>
      <span>Durasi: ${data.durasi}</span>
      <span>Waktu: ${new Date(data.waktu).toLocaleString("id-ID")}</span>
    `;
    riwayatList.appendChild(div);
  });
});
