// js/hafal.js

import { auth, db } from "./firebase.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Elemen-elemen
const surahSelect = document.getElementById("surah-select");
const ayatContainer = document.getElementById("ayat-container");

// 🔍 Input cari surah
const searchInput = document.createElement("input");
searchInput.type = "text";
searchInput.placeholder = "Cari Surah...";
searchInput.id = "search-surah";
surahSelect.parentNode.insertBefore(searchInput, surahSelect);

// 🔁 Tombol ke baca
const toBacaBtn = document.createElement("button");
toBacaBtn.textContent = "🔁 Pindah ke Mode Membaca";
toBacaBtn.classList.add("button");
toBacaBtn.onclick = () => window.location.href = "baca.html";
surahSelect.parentNode.appendChild(toBacaBtn);

// 🔙 Tombol ke menu siswa
const toSiswaBtn = document.createElement("button");
toSiswaBtn.textContent = "🏠 Kembali ke Menu Siswa";
toSiswaBtn.classList.add("button");
toSiswaBtn.onclick = () => window.location.href = "siswa.html";
surahSelect.parentNode.appendChild(toSiswaBtn);

// 🚪 Tombol logout
const logoutBtn = document.createElement("button");
logoutBtn.textContent = "🚪 Logout";
logoutBtn.classList.add("button");
logoutBtn.style.backgroundColor = "#e74c3c";
logoutBtn.onclick = () => {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
};
surahSelect.parentNode.appendChild(logoutBtn);

// 🔢 Info total hafalan
const totalInfo = document.createElement("div");
totalInfo.id = "total-hafalan";
surahSelect.parentNode.appendChild(totalInfo);

let semuaSurah = [];
let hafalanData = {};

// Ambil daftar surah
async function loadSurahList() {
  const res = await fetch("https://equran.id/api/surat");
  semuaSurah = await res.json();
  tampilkanSurah(semuaSurah);
}

function tampilkanSurah(list) {
  surahSelect.innerHTML = "<option value=''>Pilih Surah</option>";
  list.forEach(surah => {
    const option = document.createElement("option");
    option.value = surah.nomor;
    option.textContent = `${surah.nomor}. ${surah.nama_latin}`;
    surahSelect.appendChild(option);
  });
}

searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase();
  const hasil = semuaSurah.filter(s => s.nama_latin.toLowerCase().includes(keyword));
  tampilkanSurah(hasil);
});

// Ambil dan tampilkan ayat
async function loadAyat(nomorSurah) {
  ayatContainer.innerHTML = "<p>Memuat ayat...</p>";
  const res = await fetch(`https://equran.id/api/surat/${nomorSurah}`);
  const data = await res.json();
  const namaSurah = data.nama_latin;

  const user = auth.currentUser;
  if (!user) return alert("Silakan login terlebih dahulu.");

  const ref = doc(db, "hafalan", user.uid);
  const snap = await getDoc(ref);
  hafalanData = snap.exists() ? snap.data() : {};

  tampilkanTotalHafalan();

  ayatContainer.innerHTML = "";
  data.ayat.forEach((ayat) => {
    const sudahHafal = hafalanData[namaSurah]?.includes(ayat.nomor);
    const ayatDiv = document.createElement("div");
    ayatDiv.classList.add("ayat");
    ayatDiv.innerHTML = `
      <p class="arab">${ayat.ar} <span class="lingkaran">(${ayat.nomor})</span></p>
      <p class="terjemah">${ayat.nomor}. ${ayat.idn}</p>
      <button class="button kecil" ${sudahHafal ? "disabled" : ""} onclick="tandaiHafal('${namaSurah}', ${ayat.nomor})">
        ${sudahHafal ? "Sudah Hafal ✅" : "Saya Hafal ✅"}
      </button>
    `;
    ayatContainer.appendChild(ayatDiv);
  });
}

window.tandaiHafal = async function(surah, ayatNomor) {
  const user = auth.currentUser;
  if (!user) return alert("Login terlebih dahulu!");

  const ref = doc(db, "hafalan", user.uid);
  const snap = await getDoc(ref);
  let data = snap.exists() ? snap.data() : {};

  if (!data[surah]) data[surah] = [];
  if (!data[surah].includes(ayatNomor)) data[surah].push(ayatNomor);

  await setDoc(ref, data);
  alert(`Ayat ${ayatNomor} dari surah ${surah} berhasil ditandai sebagai hafal.`);
  loadAyat(surahSelect.value);
};

function tampilkanTotalHafalan() {
  let total = 0;
  for (const surah in hafalanData) {
    total += hafalanData[surah].length;
  }
  totalInfo.innerHTML = `<p><strong>Total Hafalan:</strong> ${total} ayat</p>`;
}

surahSelect.addEventListener("change", () => {
  const selected = surahSelect.value;
  if (selected) loadAyat(selected);
});

loadSurahList();
