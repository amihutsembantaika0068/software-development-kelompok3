const fs = require("fs");
const csv = require("csv-parser");
const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
  multipleStatements: true
});

db.connect((err) => {
  if (err) {
    console.error("❌ Koneksi Cloud Aiven gagal:", err.message);
    return;
  }
  console.log("⚡ Sukses terhubung ke Cloud Aiven!");
  
  const sqlCreateTables = `
    CREATE TABLE IF NOT EXISTS \dataset_ikan\ (
      \id\ int(11) NOT NULL AUTO_INCREMENT,
      \sequence\ text NOT NULL,
      \family\ varchar(100) DEFAULT NULL,
      \genus\ varchar(100) DEFAULT NULL,
      \species\ varchar(100) DEFAULT NULL,
      PRIMARY KEY (\id\)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS \riwayat_identifikasi\ (
      \id\ int(11) NOT NULL AUTO_INCREMENT,
      \input_sequence\ text NOT NULL,
      \hasil_family\ varchar(100) DEFAULT NULL,
      \hasil_genus\ varchar(100) DEFAULT NULL,
      \hasil_species\ varchar(100) DEFAULT NULL,
      \akurasi\ varchar(20) DEFAULT NULL,
      \tanggal\ timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (\id\)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    DELETE FROM dataset_ikan;
  `;

  console.log("⏳ Menyiapkan struktur tabel kosong di cloud...");
  
  db.query(sqlCreateTables, (err) => {
    if (err) {
      console.error("❌ Gagal menyusun struktur tabel:", err.message);
      return;
    }
    
    console.log("🚀 Memulai pemindahan seluruh baris data CSV ke Cloud Aiven...");

    fs.createReadStream("dataset/clean_fish_dna.csv")
      .pipe(csv())
      .on("data", (row) => {
        const sequence = row.sequence || row.Sequence;
        const family = row.family || row.Family;
        const genus = row.genus || row.Genus;
        const species = row.species || row.Species;

        const sqlInsert = `
          INSERT INTO dataset_ikan (sequence, family, genus, species)
          VALUES (?, ?, ?, ?)
        `;

        db.query(sqlInsert, [sequence, family, genus, species], (err) => {
          if (err) console.error("❌ Gagal memasukkan baris data:", err.message);
        });
      })
      .on("end", () => {
        console.log("✅ SELESAI! Seluruh data sekuens DNA ikan sukses di-upload ke Cloud Aiven!");
        db.end();
      });
  });
});
