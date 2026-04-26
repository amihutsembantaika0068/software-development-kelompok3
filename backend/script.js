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
    console.error("Koneksi database gagal:", err.message);
    return;
  }

  console.log("Database terhubung");
});

const sqlDelete = "DELETE FROM dataset_ikan";

db.query(sqlDelete, (err) => {
  if (err) {
    console.error("Gagal menghapus data lama:", err.message);
    return;
  }

  console.log("Data lama berhasil dihapus");

  fs.createReadStream("dataset/clean_fish_dna.csv")
    .pipe(csv())
    .on("data", (row) => {
      const sequence = row.sequence;
      const family = row.Family;
      const genus = row.Genus;
      const species = row.Species;

      const sqlInsert = `
        INSERT INTO dataset_ikan (sequence, family, genus, species)
        VALUES (?, ?, ?, ?)
      `;

      db.query(sqlInsert, [sequence, family, genus, species], (err) => {
        if (err) {
          console.error("Gagal memasukkan data:", err.message);
        }
      });
    })
    .on("end", () => {
      console.log("Dataset berhasil dimasukkan ke database");
      db.end();
    });
});
