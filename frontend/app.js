function showSection(id) {
  // sembunyikan semua section
  document.querySelectorAll(".card").forEach(section => {
    section.classList.remove("active");
  });

  // tampilkan section yang dipilih
  document.getElementById(id).classList.add("active");
}

function identifikasiDNA() {
  // ambil input DNA
  let dna = document.getElementById("dnaInput").value.trim();

  // tampilkan DNA yang diinput
  document.getElementById("outDNA").innerText = dna || "-";

  // hasil dummy (sementara)
  document.getElementById("outSpecies").innerText = "Oncorhynchus nerka";
  document.getElementById("outGenus").innerText = "Oncorhynchus";
  document.getElementById("outFamily").innerText = "Salmonidae";
  document.getElementById("outConfidence").innerText = "92%";

  // pindah ke halaman hasil
  showSection("hasil");
}
