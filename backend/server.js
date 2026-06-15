require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

// 1. Keamanan Dasar: Menambah batasan ukuran request agar tidak kena serangan DDoS
app.use(cors());
app.use(express.json({ limit: '10kb' })); 

// 2. Menggunakan Pool: Jauh lebih aman dan tangguh untuk koneksi Cloud
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Fungsi pembantu Hamming
function hitungJarakHamming(input, target) {
  let jarak = 0;
  const len = Math.min(input.length, target.length);
  for (let i = 0; i < len; i++) {
    if (input[i] !== target[i]) jarak++;
  }
  return jarak + Math.abs(input.length - target.length);
}

// 3. Endpoint Utama
app.post("/predict", (req, res) => {
  const { sequence } = req.body;

  // Validasi input ketat
  if (!sequence || typeof sequence !== 'string' || sequence.trim().length === 0) {
    return res.status(400).json({ error: "Sequence DNA tidak valid" });
  }

  const cleanInput = sequence.toUpperCase().trim();

  // Menggunakan pool untuk query yang aman
  pool.query("SELECT * FROM dataset_ikan", (err, results) => {
    if (err) {
      console.error("Database Query Error:", err);
      return res.status(500).json({ error: "Gagal mengambil data referensi" });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ error: "Dataset kosong" });
    }

    // Algoritma KNN
    let minJarak = Infinity;
    let bestMatch = null;

    results.forEach((data) => {
      const target = data.sequence.toUpperCase().trim();
      const jarak = hitungJarakHamming(cleanInput, target);
      const panjangMaks = Math.max(cleanInput.length, target.length);
      const akurasi = ((panjangMaks - jarak) / panjangMaks) * 100;

      if (jarak < minJarak) {
        minJarak = jarak;
        bestMatch = { ...data, akurasi: akurasi.toFixed(2) + "%" };
      }
    });

    // Simpan ke Riwayat secara Asinkron (tidak memblokir respon)
    const sqlLog = "INSERT INTO riwayat_identifikasi (input_sequence, hasil_family, hasil_genus, hasil_species, akurasi) VALUES (?, ?, ?, ?, ?)";
    pool.query(sqlLog, [cleanInput, bestMatch.family, bestMatch.genus, bestMatch.species, bestMatch.akurasi], (err) => {
      if (err) console.error("Gagal simpan riwayat:", err);
    });

    res.json({
      family: bestMatch.family,
      genus: bestMatch.genus,
      species: bestMatch.species,
      akurasi: bestMatch.akurasi
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(🚀 Server berjalan aman di http://localhost:${PORT});
});
