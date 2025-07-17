// js/hafalan.js
import { auth, db } from "./firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// DOM Elements
const kontrolSurah = document.getElementById("kontrol-surah");
const ayatContainer = document.getElementById("ayat-container");
const totalInfo = document.getElementById("total-hafalan");

let semuaSurah = [];
let hafalanData = {};

// Dropdown TomSelect
const dropdown = document.createElement("select");
dropdown.id = "search-hafalan";
kontrolSurah.appendChild(dropdown);

const tomSelect = new TomSelect(dropdown, {
  placeholder: "Cari surah...",
  allowEmptyOption: true,
  maxOptions: 114,
});

// Tombol Navigasi & Logout
const tombolGroup = document.createElement("div");
tombolGroup.style.marginTop = "10px";
tombolGroup.innerHTML = `
  <button class="button" onclick="window.location.href='baca.html'">🔁 Pindah ke Mode Membaca</button>
  <button class="button" id="logout-btn">🚪 Logout</button>
`;
kontrolSurah.appendChild(tombolGroup);

document.getElementById("logout-btn").addEventListener("click", () => {
  auth.signOut().then(() => window.location.href = "index.html");
});

// 🔄 Ambil daftar surah dari AlQuranCloud
async function loadSurahList() {
  try {
    const res = await fetch("https://api.alquran.cloud/v1/surah");
    const data = await res.json();
    semuaSurah = data.data;

    semuaSurah.forEach((surah) => {
      tomSelect.addOption({
        value: surah.number,
        text: `${surah.number}. ${surah.englishName} (${surah.name})`,
      });
    });

    tomSelect.refreshOptions(false);
    console.log("✅ Surah hafalan berhasil dimuat:", semuaSurah.length);
  } catch (err) {
    console.error("❌ Gagal memuat surah:", err);
  }
}

// 📖 Tampilkan ayat dari AlQuranCloud
async function loadAyat(nomorSurah) {
  ayatContainer.innerHTML = "<p>Memuat ayat...</p>";

  try {
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${nomorSurah}/editions/quran-uthmani,id.indonesian`);
    const data = await res.json();

    const arabData = data.data[0].ayahs;
    const indoData = data.data[1].ayahs;
    const namaSurah = data.data[0].englishName;

    const user = auth.currentUser;
    if (!user) return alert("Silakan login terlebih dahulu.");

    const hafalanRef = collection(db, `hafalan/${user.uid}/hafalan`);
    const snap = await getDocs(hafalanRef);
    hafalanData = {};

    snap.forEach(doc => {
      hafalanData[doc.id] = Object.keys(doc.data()).map(k => parseInt(k));
    });

    tampilkanTotalHafalan();

    ayatContainer.innerHTML = "";
    for (let i = 0; i < arabData.length; i++) {
      const arab = arabData[i].text;
      const indo = indoData[i].text;
      const ayatNomor = arabData[i].numberInSurah;

      const sudahHafal = hafalanData[namaSurah]?.includes(ayatNomor);
      const ayatDiv = document.createElement("div");
      ayatDiv.classList.add("ayat");
      ayatDiv.innerHTML = `
        <p class="arab">${arab} <span class="nomor-arab">${ayatNomor}</span></p>
        <p class="indo">${indo}</p>
        <button class="button kecil" ${sudahHafal ? "disabled" : ""} onclick="tandaiHafal('${namaSurah}', ${ayatNomor})">
          ${sudahHafal ? "Sudah Hafal ✅" : "Saya Hafal ✅"}
        </button>
      `;
      ayatContainer.appendChild(ayatDiv);
    }
  } catch (err) {
    console.error("❌ Gagal memuat ayat:", err);
    ayatContainer.innerHTML = "<p>Gagal memuat ayat.</p>";
  }
}

// ✅ Tandai Hafalan
window.tandaiHafal = async function (surah, ayatNomor) {
  const user = auth.currentUser;
  if (!user) return alert("Login terlebih dahulu!");

  const ref = doc(db, `hafalan/${user.uid}/hafalan/${surah}`);
  const snap = await getDoc(ref);
  let data = snap.exists() ? snap.data() : {};

  data[ayatNomor] = true;

  await setDoc(ref, data);
  alert(`Ayat ${ayatNomor} dari surah ${surah} berhasil ditandai sebagai hafal.`);
  loadAyat(tomSelect.getValue()); // reload ayat untuk update tombol
};

// ✅ Total Hafalan
function tampilkanTotalHafalan() {
  let total = 0;
  for (const surah in hafalanData) {
    total += hafalanData[surah].length;
  }
  totalInfo.innerHTML = `<p><strong>Total Hafalan:</strong> ${total} ayat</p>`;
}

// 📌 Ketika dropdown berubah
tomSelect.on("change", (value) => {
  if (value) loadAyat(value);
});

// 🚀 Jalankan saat halaman dimuat
loadSurahList();
