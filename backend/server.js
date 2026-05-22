const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_identifikasi_ikan"
});

db.connect((err) => {
  if (err) {
    console.error("❌ Koneksi database server gagal:", err.message);
    return;
  }
  console.log("⚡ [KNN Backend] MySQL Server aktif di localhost");
});

/**
 * METRIK JARAK KNN: Hamming Distance
 * Menghitung perbedaan jumlah karakter string DNA pada posisi/indeks yang sama.
 * Semakin kecil nilai jarak, semakin dekat/mirip sekuensnya (Tetangga Terdekat).
 */
function hitungJarakHamming(input, target) {
  let jarak = 0;
  const panjangMinimal = Math.min(input.length, target.length);

  // 1. Hitung perbedaan karakter per indeks posisi huruf DNA
  for (let i = 0; i < panjangMinimal; i++) {
    if (input[i] !== target[i]) {
      jarak++;
    }
  }

  // 2. Berikan penalti jarak jika ada selisih panjang karakter string
  const selisihPanjang = Math.abs(input.length - target.length);
  jarak += selisihPanjang;

  return jarak;
}

app.get("/", (req, res) => {
  res.send("Backend KNN Identifikasi Spesies Ikan Berjalan Lancar");
});

/**
 * ENDPOINT UTAMA PREDIKSI MENGGUNAKAN ALGORITMA KNN (K=1)
 */
app.post("/predict", (req, res) => {
  const inputSequence = req.body.sequence;

  if (!inputSequence || inputSequence.trim() === "") {
    return res.status(400).json({ error: "Sequence DNA tidak boleh kosong" });
  }

  const sql = "SELECT * FROM dataset_ikan";

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Terjadi kesalahan pada database" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Dataset referensi lokal belum tersedia di MySQL" });
    }

    const nilaiK = 1; // Menetapkan K=1 untuk mencari 1 tetangga terdekat
    const daftarTetangga = [];
    const cleanInput = inputSequence.toUpperCase().trim();

    // PROSES KNN LANGKAH 1: Hitung jarak Hamming ke seluruh data referensi di database
    results.forEach((data) => {
      const cleanTarget = data.sequence.toUpperCase().trim();
      const jarak = hitungJarakHamming(cleanInput, cleanTarget);

      // Konversi nilai jarak Hamming menjadi persentase akurasi teks
      const panjangMaksimal = Math.max(cleanInput.length, cleanTarget.length);
      const akurasi = panjangMaksimal === 0 ? 0 : ((panjangMaksimal - jarak) / panjangMaksimal) * 100;

      daftarTetangga.push({
        data: data,
        jarak: jarak,
        akurasi: akurasi
      });
    });

    // PROSES KNN LANGKAH 2: Urutkan data dari jarak terkecil ke terbesar (Sorting Ascending)
    daftarTetangga.sort((a, b) => a.jarak - b.jarak);

    // PROSES KNN LANGKAH 3: Ambil objek tetangga dengan jarak terdekat teratas (K=1)
    const tetanggaTerdekat = daftarTetangga[0];

    // Proteksi utama: Jika input ngawur / akurasi 0%, server tidak akan crash/mati
    if (!tetanggaTerdekat || tetanggaTerdekat.akurasi === 0) {
      return res.json({
        family: "Tidak Diketahui",
        genus: "Tidak Diketahui",
        species: "Spesies Tidak Teridentifikasi",
        akurasi: "0.00%"
      });
    }

    const akurasiFinal = tetanggaTerdekat.akurasi.toFixed(2) + "%";
    const hasilModel = tetanggaTerdekat.data;

    // PROSES LANGKAH 4: Simpan riwayat keputusan model KNN ke database fiks kelompok (kolom huruf kecil)
    const insertRiwayat = `
      INSERT INTO riwayat_identifikasi 
      (input_sequence, hasil_family, hasil_genus, hasil_species, akurasi)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      insertRiwayat,
      [cleanInput, hasilModel.family, hasilModel.genus, hasilModel.species, akurasiFinal],
      (err) => {
        if (err) console.error("❌ Gagal menyimpan riwayat ke database:", err.message);
      }
    );

    // PROSES LANGKAH 5: Kembalikan hasil klasifikasi akhir KNN ke Frontend (kolom huruf kecil)
    res.json({
      family: hasilModel.family,
      genus: hasilModel.genus,
      species: hasilModel.species,
      akurasi: akurasiFinal
    });
  });
});

app.listen(3000, () => {
  console.log("🚀 Server KNN berjalan lancar di http://localhost:3000");
});
