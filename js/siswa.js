// js/siswa.js

import { db, auth } from "./firebase.js";
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Fungsi untuk menandai ayat yang dihafal
window.tandaiHafal = async function(surah, ayat) {
  const user = auth.currentUser;
  if (!user) {
    alert("Kamu harus login terlebih dahulu.");
    return;
  }

  const uid = user.uid;
  const userRef = doc(db, "hafalan", uid);

  try {
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      // Jika dokumen sudah ada, tambahkan ayat ke array surah yang sesuai
      await updateDoc(userRef, {
        [surah]: arrayUnion(ayat)
      });
    } else {
      // Jika belum ada, buat baru
      await setDoc(userRef, {
        [surah]: [ayat]
      });
    }

    alert(`Ayat ${ayat} dari Surah ${surah} ditandai sebagai hafal ✅`);

  } catch (error) {
    console.error("Gagal menyimpan hafalan:", error);
    alert("Terjadi kesalahan saat menyimpan hafalan.");
  }
};
