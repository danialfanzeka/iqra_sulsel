import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Elemen HTML
const selectSurah = document.getElementById("search-surah");
const ayatContainer = document.getElementById("ayat-container");
const timerEl = document.getElementById("timer");
const selesaiBtn = document.getElementById("selesai-btn");

let semuaSurah = [];
let timerInterval;
let timerSeconds = 0;

// 🔎 Inisialisasi TomSelect
const tomSelect = new TomSelect(selectSurah, {
  placeholder: "Cari surah...",
  allowEmptyOption: true
});

// 🔽 Ambil daftar surah dari Al-Qur'an Cloud
async function ambilDaftarSurah() {
  try {
    const res = await fetch("https://api.alquran.cloud/v1/surah");
    const hasil = await res.json();
    semuaSurah = hasil.data;

    semuaSurah.forEach((surah) => {
      tomSelect.addOption({
        value: surah.number,
        text: `${surah.number}. ${surah.englishName} (${surah.name})`
      });
    });

    tomSelect.refreshOptions(false);
    console.log("✅ Surah berhasil dimuat:", semuaSurah.length);
  } catch (error) {
    console.error("❌ Gagal memuat daftar surah:", error);
  }
}
ambilDaftarSurah();

// ⏱️ Timer
function mulaiTimer() {
  clearInterval(timerInterval);
  timerSeconds = 0;
  timerEl.textContent = "Durasi: 0m 0s";

  timerInterval = setInterval(() => {
    timerSeconds++;
    const menit = Math.floor(timerSeconds / 60);
    const detik = timerSeconds % 60;
    timerEl.textContent = `Durasi: ${menit}m ${detik}s`;
  }, 1000);
}

// 🔢 Angka Arab
function angkaArab(angka) {
  const arab = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
  return angka.toString().split('').map(d => arab[d]).join('');
}

// 📖 Tampilkan ayat dari Al-Qur'an Cloud
async function loadAyat(nomorSurah) {
  ayatContainer.innerHTML = "<p>Memuat ayat...</p>";
  try {
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${nomorSurah}/editions/quran-uthmani,id.indonesian`);
    const hasil = await res.json();

    const [arabData, indoData] = hasil.data;

    ayatContainer.innerHTML = "";
    arabData.ayahs.forEach((ayat, index) => {
      const indoAyat = indoData.ayahs[index];
      const ayatDiv = document.createElement("div");
      ayatDiv.classList.add("ayat");
      ayatDiv.innerHTML = `
        <div class="nomor-arab">${angkaArab(ayat.numberInSurah)}</div>
        <p style="font-size: 1.5em;">${ayat.text}</p>
        <p class="terjemah"><strong>${ayat.numberInSurah}.</strong> ${indoAyat.text}</p>
      `;
      ayatContainer.appendChild(ayatDiv);
    });

    mulaiTimer();
  } catch (error) {
    console.error("❌ Gagal memuat ayat:", error);
    ayatContainer.innerHTML = "<p>Gagal memuat ayat. Coba lagi.</p>";
  }
}

// ▶️ Surah dipilih
tomSelect.on('change', (value) => {
  if (value) loadAyat(value);
});

// 💾 Simpan ke Firestore
async function simpanRiwayat(namaSurah, jumlahAyat, durasi) {
  const user = auth.currentUser;
  const role = localStorage.getItem("role");

  if (!user) {
    alert("Anda belum login.");
    return;
  }

  if (role !== "siswa") {
    console.warn("Role bukan siswa. Data tidak disimpan.");
    return;
  }

  try {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : {};

    await addDoc(collection(db, "bacaan"), {
      uid: user.uid,
      nama: data.nama || "Tanpa Nama",
      surah: namaSurah,
      jumlahAyat,
      durasi,
      timestamp: serverTimestamp()
    });

    console.log("✅ Riwayat membaca berhasil disimpan.");
  } catch (error) {
    console.error("❌ Gagal menyimpan riwayat:", error);
  }
}

// 📌 Popup selesai
function tampilkanPopup(namaSurah, jumlahAyat, durasi) {
  const popup = document.createElement("div");
  popup.classList.add("popup");
  popup.innerHTML = `
    <div class="popup-content">
      <h3>📖 Membaca Selesai</h3>
      <p><strong>Surah:</strong> ${namaSurah}</p>
      <p><strong>Jumlah Ayat:</strong> ${jumlahAyat}</p>
      <p><strong>Durasi:</strong> ${durasi}</p>
      <button onclick="window.location.reload()">Tutup</button>
    </div>
  `;
  document.body.appendChild(popup);
}

// ✅ Tombol selesai ditekan
selesaiBtn.addEventListener("click", () => {
  const namaSurah = selectSurah.options[selectSurah.selectedIndex]?.text || "-";
  const jumlahAyat = document.querySelectorAll(".ayat").length;
  const durasi = Math.floor(timerSeconds / 60) + "m " + (timerSeconds % 60) + "s";

  simpanRiwayat(namaSurah, jumlahAyat, durasi);
  tampilkanPopup(namaSurah, jumlahAyat, durasi);
});
