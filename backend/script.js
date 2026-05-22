const fs = require("fs");
const csv = require("csv-parser");
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_identifikasi_ikan"
});

db.connect((err) => {
  if (err) {
    console.error("❌ Koneksi database gagal:", err.message);
    return;
  }
  console.log("⚡ Database terhubung secara lokal");
});

const sqlDelete = "DELETE FROM dataset_ikan";

db.query(sqlDelete, (err) => {
  if (err) {
    console.error("❌ Gagal membersihkan data lama:", err.message);
    return;
  }

  console.log("⏳ Membersihkan data lama dan memulai proses import dataset...");

  // Membaca file CSV dari folder dataset lokal laptop masing-masing
  fs.createReadStream("dataset/clean_fish_dna.csv")
    .pipe(csv())
    .on("data", (row) => {
      // Menangani fleksibilitas jika di file CSV menggunakan huruf kapital awal (Family, Genus, Species)
      const sequence = row.sequence || row.Sequence;
      const family = row.Family || row.family;
      const genus = row.Genus || row.genus;
      const species = row.Species || row.species;

      // Menembak ke nama kolom database fiks kamu yang menggunakan huruf kecil semua
      const sqlInsert = `
        INSERT INTO dataset_ikan (sequence, family, genus, species)
        VALUES (?, ?, ?, ?)
      `;

      db.query(sqlInsert, [sequence, family, genus, species], (err) => {
        if (err) {
          console.error("❌ Gagal memasukkan baris data:", err.message);
        }
      });
    })
    .on("end", () => {
      console.log("✅ Dataset sukses di-import ke MySQL lokal laptop Anda!");
      db.end();
    });
});
