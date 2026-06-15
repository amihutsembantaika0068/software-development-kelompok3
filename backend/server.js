const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

db.connect((err) => {
  if (err) {
    console.error("❌ Koneksi database cloud server gagal:", err.message);
    return;
  }
  console.log("⚡ [KNN Backend] MySQL Server aktif di Cloud Aiven.io");
});

function hitungJarakHamming(input, target) {
  let jarak = 0;
  const panjangMinimal = Math.min(input.length, target.length);

  for (let i = 0; i < panjangMinimal; i++) {
    if (input[i] !== target[i]) {
      jarak++;
    }
  }

  const selisihPanjang = Math.abs(input.length - target.length);
  jarak += selisihPanjang;

  return jarak;
}

app.get("/", (req, res) => {
  res.send("Backend KNN Identifikasi Spesies Ikan Berjalan Lancar di Cloud");
});

app.post("/predict", (req, res) => {
  const inputSequence = req.body.sequence;

  if (!inputSequence || inputSequence.trim() === "") {
    return res.status(400).json({ error: "Sequence DNA tidak boleh kosong" });
  }

  const sql = "SELECT * FROM dataset_ikan";

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Terjadi kesalahan pada database cloud" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Dataset referensi belum tersedia di Cloud Aiven" });
    }

    const nilaiK = 1;
    const daftarTetangga = [];
    const cleanInput = inputSequence.toUpperCase().trim();

    results.forEach((data) => {
      const cleanTarget = data.sequence.toUpperCase().trim();
      const jarak = hitungJarakHamming(cleanInput, cleanTarget);

      const panjangMaksimal = Math.max(cleanInput.length, cleanTarget.length);
      const akurasi = panjangMaksimal === 0 ? 0 : ((panjangMaksimal - jarak) / panjangMaksimal) * 100;

      daftarTetangga.push({
        data: data,
        jarak: jarak,
        accuracy: akurasi
      });
    });

    daftarTetangga.sort((a, b) => a.jarak - b.jarak);

    const tetanggaTerdekat = daftarTetangga[0];

    if (!tetanggaTerdekat || tetanggaTerdekat.accuracy === 0) {
      return res.json({
        family: "Tidak Diketahui",
        genus: "Tidak Diketahui",
        species: "Spesies Tidak Teridentifikasi",
        akurasi: "0.00%"
      });
    }

    const akurasiFinal = tetanggaTerdekat.accuracy.toFixed(2) + "%";
    const hasilModel = tetanggaTerdekat.data;

    const insertRiwayat = `
      INSERT INTO riwayat_identifikasi 
      (input_sequence, hasil_family, hasil_genus, hasil_species, akurasi)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      insertRiwayat,
      [cleanInput, hasilModel.family, hasilModel.genus, hasilModel.species, akurasiFinal],
      (err) => {
        if (err) console.error("❌ Gagal menyimpan riwayat ke cloud database:", err.message);
      }
    );

    res.json({
      family: hasilModel.family,
      genus: hasilModel.genus,
      species: hasilModel.species,
      akurasi: akurasiFinal
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(🚀 Server KNN berjalan lancar di http://localhost:${PORT});
});
