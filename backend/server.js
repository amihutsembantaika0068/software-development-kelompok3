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
    console.error("Koneksi database gagal:", err.message);
    return;
  }

  console.log("Database terhubung");
});

function hitungKemiripan(input, target) {
  const panjang = Math.min(input.length, target.length);
  let cocok = 0;

  for (let i = 0; i < panjang; i++) {
    if (input[i] === target[i]) {
      cocok++;
    }
  }

  const akurasi = (cocok / Math.max(input.length, target.length)) * 100;
  return akurasi;
}

app.get("/", (req, res) => {
  res.send("Backend Identifikasi Spesies Ikan Berjalan");
});

app.get("/dataset", (req, res) => {
  const sql = "SELECT id, family, genus, species FROM dataset_ikan";

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: "Gagal mengambil dataset"
      });
    }

    res.json(results);
  });
});

app.post("/predict", (req, res) => {
  const inputSequence = req.body.sequence;

  if (!inputSequence || inputSequence.trim() === "") {
    return res.status(400).json({
      error: "Sequence DNA tidak boleh kosong"
    });
  }

  const sql = "SELECT * FROM dataset_ikan";

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: "Terjadi kesalahan pada database"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        error: "Dataset belum tersedia"
      });
    }

    let hasilTerbaik = null;
    let akurasiTertinggi = 0;

    results.forEach((data) => {
      const akurasi = hitungKemiripan(
        inputSequence.toUpperCase(),
        data.sequence.toUpperCase()
      );

      if (akurasi > akurasiTertinggi) {
        akurasiTertinggi = akurasi;
        hasilTerbaik = data;
      }
    });

    const akurasiFinal = akurasiTertinggi.toFixed(2) + "%";

    const insertRiwayat = `
      INSERT INTO riwayat_identifikasi 
      (input_sequence, hasil_family, hasil_genus, hasil_species, akurasi)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      insertRiwayat,
      [
        inputSequence,
        hasilTerbaik.family,
        hasilTerbaik.genus,
        hasilTerbaik.species,
        akurasiFinal
      ],
      (err) => {
        if (err) {
          console.error("Gagal menyimpan riwayat:", err.message);
        }
      }
    );

    res.json({
      family: hasilTerbaik.family,
      genus: hasilTerbaik.genus,
      species: hasilTerbaik.species,
      akurasi: akurasiFinal
    });
  });
});

app.get("/history", (req, res) => {
  const sql = `
    SELECT * FROM riwayat_identifikasi 
    ORDER BY tanggal DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: "Gagal mengambil riwayat identifikasi"
      });
    }

    res.json(results);
  });
});

app.delete("/history", (req, res) => {
  const sql = "DELETE FROM riwayat_identifikasi";

  db.query(sql, (err) => {
    if (err) {
      return res.status(500).json({
        error: "Gagal menghapus riwayat"
      });
    }

    res.json({
      message: "Riwayat berhasil dihapus"
    });
  });
});

app.listen(3000, () => {
  console.log("Server berjalan di http://localhost:3000");
});
