CREATE DATABASE IF NOT EXISTS db_identifikasi_ikan;

USE db_identifikasi_ikan;

CREATE TABLE IF NOT EXISTS dataset_ikan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sequence TEXT NOT NULL,
    family VARCHAR(100),
    genus VARCHAR(100),
    species VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS riwayat_identifikasi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    input_sequence TEXT NOT NULL,
    hasil_family VARCHAR(100),
    hasil_genus VARCHAR(100),
    hasil_species VARCHAR(100),
    akurasi VARCHAR(20),
    tanggal TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
