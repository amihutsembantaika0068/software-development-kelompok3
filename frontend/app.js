function scrollKeForm() {
  document.getElementById("form-section").scrollIntoView({
    behavior: "smooth"
  });
}

function identifikasiIkan() {
  const dnaInput = document.getElementById("dnaInput").value.trim();
  const hasilDiv = document.getElementById("hasil");
  const loadingDiv = document.getElementById("loading");

  hasilDiv.innerHTML = "";

  if (dnaInput === "") {
    hasilDiv.innerHTML = `<p class="error">Sekuens DNA tidak boleh kosong.</p>`;
    return;
  }

  loadingDiv.innerHTML = "Memproses data DNA...";

  fetch("http://localhost:3000/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      sequence: dnaInput
    })
  })
    .then(response => response.json())
    .then(data => {
      loadingDiv.innerHTML = "";

      if (data.error) {
        hasilDiv.innerHTML = `<p class="error">${data.error}</p>`;
        return;
      }

      hasilDiv.innerHTML = `
        <h3>Hasil Identifikasi</h3>
        <p><strong>Family:</strong> ${data.family}</p>
        <p><strong>Genus:</strong> ${data.genus}</p>
        <p><strong>Species:</strong> ${data.species}</p>
        <p><strong>Akurasi:</strong> ${data.akurasi}</p>
      `;
    })
    .catch(error => {
      loadingDiv.innerHTML = "";
      hasilDiv.innerHTML = `
        <p class="error">
          Gagal terhubung ke backend. Pastikan backend sudah berjalan di http://localhost:3000
        </p>
      `;
      console.error("Error:", error);
    });
}
