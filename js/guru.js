// js/guru.js

import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Ambil elemen tabel dari HTML
const bacaanTable = document.querySelector("#bacaan-table tbody");
const hafalanTable = document.querySelector("#hafalan-table tbody");

// Fungsi untuk menampilkan riwayat bacaan siswa
async function tampilkanRiwayatBacaan() {
  try {
    const snapshot = await getDocs(collection(db, "bacaan"));
    if (snapshot.empty) {
      bacaanTable.innerHTML = `<tr><td colspan="5" style="text-align: center;">Belum ada data bacaan</td></tr>`;
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.nama || "-"}</td>
        <td>${data.surah || "-"}</td>
        <td>${data.jumlahAyat || "-"}</td>
        <td>${data.durasi || "-"}</td>
        <td>${formatWaktu(data.timestamp)}</td>
      `;
      bacaanTable.appendChild(row);
    });
  } catch (error) {
    console.error("Gagal memuat data bacaan:", error);
    bacaanTable.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Gagal memuat data</td></tr>`;
  }
}

// Fungsi untuk menampilkan hafalan siswa
async function tampilkanHafalanSiswa() {
  try {
    const snapshot = await getDocs(collection(db, "hafalan"));
    if (snapshot.empty) {
      hafalanTable.innerHTML = `<tr><td colspan="3" style="text-align: center;">Belum ada data hafalan</td></tr>`;
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.nama || "-"}</td>
        <td>${data.surah || "-"}</td>
        <td>${Array.isArray(data.jumlahAyat) ? data.jumlahAyat.join(", ") : data.jumlahAyat || "-"}</td>
      `;
      hafalanTable.appendChild(row);
    });
  } catch (error) {
    console.error("Gagal memuat data hafalan:", error);
    hafalanTable.innerHTML = `<tr><td colspan="3" style="text-align: center; color: red;">Gagal memuat data</td></tr>`;
  }
}


// Format timestamp Firebase ke format tanggal lokal
function formatWaktu(timestamp) {
  if (!timestamp?.toDate) return "-";
  const date = timestamp.toDate();
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  })}`;
}

// Jalankan fungsi saat halaman dimuat
tampilkanRiwayatBacaan();
tampilkanHafalanSiswa();
