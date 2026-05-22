/**
 * Fungsi Navigasi Smooth Scroll ke Form Input
 */
function scrollKeForm() {
  document.getElementById("form-section").scrollIntoView({
    behavior: "smooth"
  });
}

/**
 * Fungsi Utama Mengirim Data DNA ke Backend KNN (Fetch API)
 */
function identifikasiIkan() {
  const dnaInput = document.getElementById("dnaInput").value.trim();
  const hasilDiv = document.getElementById("hasil");
  const loadingDiv = document.getElementById("loading");

  // Reset tampilan area output setiap kali tombol diklik
  hasilDiv.innerHTML = "";
  hasilDiv.style.display = "none";

  // Validasi sederhana jika input teks kosong
  if (dnaInput === "") {
    hasilDiv.innerHTML = `<p class="error">⚠️ Sekuens DNA tidak boleh kosong. Harap masukkan data terlebih dahulu.</p>`;
    hasilDiv.style.display = "block";
    return;
  }

  // Tampilkan efek loading animasi teks
  loadingDiv.innerHTML = "⏳ Sedang menghitung jarak Hamming terhadap database (Model KNN)...";
  loadingDiv.style.display = "block";

  // Menembak REST API backend local komputer masing-masing anggota secara asynchronous
  fetch("http://localhost:3000/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      sequence: dnaInput
    })
  })
    .then(response => {
      if (!response.ok) throw new Error("Server Lokal Bermasalah");
      return response.json();
    })
    .then(data => {
      // Sembunyikan efek loading setelah data didapatkan
      loadingDiv.innerHTML = "";
      loadingDiv.style.display = "none";

      if (data.error) {
        hasilDiv.innerHTML = `<p class="error">❌ Error: ${data.error}</p>`;
        hasilDiv.style.display = "block";
        return;
      }

      // Render data taksonomi ikan hasil klasifikasi KNN terdekat ke elemen HTML
      hasilDiv.innerHTML = `
        <h3>🧬 Hasil Klasifikasi K-Nearest Neighbors (K=1)</h3>
        <hr class="divider">
        <p><strong>Family:</strong> <em>${data.family}</em></p>
        <p><strong>Genus:</strong> <em>${data.genus}</em></p>
        <p><strong>Spesies:</strong> <em class="highlight-species">${data.species}</em></p>
        <p><strong>Persentase Kemiripan:</strong> <span class="badge-akurasi">${data.akurasi}</span></p>
      `;
      hasilDiv.style.display = "block";
    })
    .catch(error => {
      // Menangani error jika server backend belum dinyalakan (npm start)
      loadingDiv.innerHTML = "";
      loadingDiv.style.display = "none";
      hasilDiv.innerHTML = `
        <div class="error">
          <p><strong>❌ Gagal Terhubung ke Backend Lokal!</strong></p>
          <p style="font-size: 13px; font-weight: normal; margin-top: 5px;">
            Pastikan Anda sudah mengaktifkan XAMPP MySQL dan mengetik <code>npm start</code> di terminal folder backend laptop Anda sebelum menekan tombol proses.
          </p>
        </div>
      `;
      hasilDiv.style.display = "block";
      console.error("Fetch Error:", error);
    });
}
