-- =======================================================
-- MYSQL: Jalankan file ini di phpMyAdmin, HeidiSQL,
-- atau import langsung lewat MySQL CLI di Laragon.
-- =======================================================

CREATE DATABASE IF NOT EXISTS early_warning_bencana;
USE early_warning_bencana;

SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- TABLE: app_users
-- =============================================
DROP TABLE IF EXISTS app_users;
CREATE TABLE app_users (
    id_user     INT AUTO_INCREMENT PRIMARY KEY,
    nama        VARCHAR(150) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    no_telp     VARCHAR(20) NULL,
    foto_profil VARCHAR(255) NULL,
    role        VARCHAR(20) DEFAULT 'USER',
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =============================================
-- TABLE: app_md_kabupaten
-- =============================================
DROP TABLE IF EXISTS app_md_kabupaten;
CREATE TABLE app_md_kabupaten (
    id_kabupaten   INT AUTO_INCREMENT PRIMARY KEY,
    nama_kabupaten VARCHAR(100) NOT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =============================================
-- TABLE: app_md_kecamatan
-- =============================================
DROP TABLE IF EXISTS app_md_kecamatan;
CREATE TABLE app_md_kecamatan (
    id_kecamatan   INT AUTO_INCREMENT PRIMARY KEY,
    id_kabupaten   INT NOT NULL,
    nama_kecamatan VARCHAR(100) NOT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_kecamatan_kabupaten FOREIGN KEY (id_kabupaten) REFERENCES app_md_kabupaten(id_kabupaten) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- TABLE: app_md_kelurahan
-- =============================================
DROP TABLE IF EXISTS app_md_kelurahan;
CREATE TABLE app_md_kelurahan (
    id_kelurahan   INT AUTO_INCREMENT PRIMARY KEY,
    id_kecamatan   INT NOT NULL,
    nama_kelurahan VARCHAR(100) NOT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_kelurahan_kecamatan FOREIGN KEY (id_kecamatan) REFERENCES app_md_kecamatan(id_kecamatan) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- TABLE: app_md_bencana
-- =============================================
DROP TABLE IF EXISTS app_md_bencana;
CREATE TABLE app_md_bencana (
    id_bencana   INT AUTO_INCREMENT PRIMARY KEY,
    nama_bencana VARCHAR(100) NOT NULL,
    deskripsi    TEXT NULL,
    icon_url     VARCHAR(255) NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Seed data for app_md_bencana
INSERT INTO app_md_bencana (nama_bencana, deskripsi) VALUES
    ('Banjir', 'Bencana akibat meluapnya air yang menggenangi daratan'),
    ('Gempa Bumi', 'Getaran atau goncangan yang terjadi di permukaan bumi'),
    ('Tanah Longsor', 'Pergerakan massa tanah atau batuan menuruni lereng'),
    ('Kebakaran', 'Bencana akibat api yang tidak terkendali'),
    ('Angin Puting Beliung', 'Angin kencang yang berputar dengan kecepatan tinggi'),
    ('Tsunami', 'Gelombang laut besar akibat gempa atau letusan gunung berapi'),
    ('Gunung Meletus', 'Erupsi gunung berapi yang mengeluarkan material vulkanik'),
    ('Kekeringan', 'Kondisi kekurangan air dalam jangka waktu yang lama');

-- =============================================
-- TABLE: app_md_formaduan
-- =============================================
DROP TABLE IF EXISTS app_md_formaduan;
CREATE TABLE app_md_formaduan (
    id_formaduan   INT AUTO_INCREMENT PRIMARY KEY,
    nama_bencana   VARCHAR(100) NOT NULL,
    latitude       DECIMAL(10, 8) NULL,
    longitude      DECIMAL(11, 8) NULL,
    foto_laporan   VARCHAR(255) NULL,
    jumlah_korban  INT DEFAULT 0,
    status         VARCHAR(20) DEFAULT 'MENUNGGU',
    deskripsi      TEXT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Seed data for app_md_formaduan
INSERT INTO app_md_formaduan (nama_bencana, latitude, longitude, foto_laporan, jumlah_korban, status, deskripsi) VALUES
    ('Laporan Bencana Alam', 0, 0, '', 0, 'MENUNGGU', 'Laporan Bencana Alam'),
    ('Laporan Bencana Non Alam', 0, 0, '', 0, 'MENUNGGU', 'Laporan Bencana Non Alam'),
    ('Laporan Bantuan Sosial', 0, 0, '', 0, 'MENUNGGU', 'Laporan Bantuan Sosial'),
    ('Laporan Layanan Publik', 0, 0, '', 0, 'MENUNGGU', 'Laporan Layanan Publik'),
    ('Laporan Fasilitas Umum', 0, 0, '', 0, 'MENUNGGU', 'Laporan Fasilitas Umum'),
    ('Laporan Keamanan dan Ketertiban', 0, 0, '', 0, 'MENUNGGU', 'Laporan Keamanan dan Ketertiban'),
    ('Laporan Kesehatan', 0, 0, '', 0, 'MENUNGGU', 'Laporan Kesehatan');

-- =============================================
-- TABLE: app_md_kategori_stok
-- =============================================
DROP TABLE IF EXISTS app_md_kategori_stok;
CREATE TABLE app_md_kategori_stok (
    id_kategori     INT AUTO_INCREMENT PRIMARY KEY,
    nama_kategori   VARCHAR(100) NOT NULL,
    satuan          VARCHAR(50) NOT NULL,
    deskripsi       TEXT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Seed data for app_md_kategori_stok
INSERT INTO app_md_kategori_stok (nama_kategori, satuan, deskripsi) VALUES
    ('Pangan', 'kg', 'Stok bahan pangan seperti beras, mie, dll'),
    ('Sandang', 'pcs', 'Stok pakaian dan perlengkapan sandang'),
    ('Papan / Perlengkapan Tempat Tinggal', 'unit', 'Stok tenda, terpal, dan perlengkapan hunian'),
    ('Kesehatan', 'pcs', 'Stok obat-obatan dan alat kesehatan');

-- =============================================
-- TABLE: app_berita
-- =============================================
DROP TABLE IF EXISTS app_berita;
CREATE TABLE app_berita (
    id_berita INT AUTO_INCREMENT PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    isi TEXT NOT NULL,
    gambar TEXT NULL,
    sumber VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =============================================
-- TABLE: app_md_warga
-- =============================================
DROP TABLE IF EXISTS app_md_warga;
CREATE TABLE app_md_warga (
    id_warga   INT AUTO_INCREMENT PRIMARY KEY,
    id_kelurahan   INT NOT NULL,
    nama_warga VARCHAR(100) NOT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_warga_kelurahan FOREIGN KEY (id_kelurahan) REFERENCES app_md_kelurahan(id_kelurahan) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- TABLE: app_penduduk
-- =============================================
DROP TABLE IF EXISTS app_penduduk;
CREATE TABLE app_penduduk (
    id_penduduk     INT AUTO_INCREMENT PRIMARY KEY,
    id_kelurahan    INT NOT NULL,
    tahun           INT NOT NULL,
    jumlah_jiwa     INT DEFAULT 0,
    jumlah_kk       INT DEFAULT 0,
    jumlah_laki     INT DEFAULT 0,
    jumlah_perempuan INT DEFAULT 0,
    jumlah_rentan   INT DEFAULT 0,
    keterangan      TEXT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_penduduk_kelurahan FOREIGN KEY (id_kelurahan) REFERENCES app_md_kelurahan(id_kelurahan) ON DELETE CASCADE,
    UNIQUE KEY uq_kelurahan_tahun (id_kelurahan, tahun)
) ENGINE=InnoDB;

-- =============================================
-- TABLE: app_laporan_bencana
-- =============================================
DROP TABLE IF EXISTS app_laporan_bencana;
CREATE TABLE app_laporan_bencana (
    id_laporan       INT AUTO_INCREMENT PRIMARY KEY,
    id_user          INT NOT NULL,
    id_bencana       INT NOT NULL,
    id_kecamatan     INT NOT NULL,
    id_kelurahan     INT NOT NULL,
    judul            VARCHAR(255) NOT NULL,
    deskripsi        TEXT NOT NULL,
    jumlah_korban    INT DEFAULT 0,
    latitude         DECIMAL(10, 8) NULL,
    longitude        DECIMAL(11, 8) NULL,
    alamat_detail    TEXT NULL,
    status           VARCHAR(20) DEFAULT 'MENUNGGU',
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_laporan_user      FOREIGN KEY (id_user)      REFERENCES app_users(id_user) ON DELETE CASCADE,
    CONSTRAINT fk_laporan_jenis     FOREIGN KEY (id_bencana)   REFERENCES app_md_bencana(id_bencana) ON DELETE CASCADE,
    CONSTRAINT fk_laporan_kecamatan FOREIGN KEY (id_kecamatan) REFERENCES app_md_kecamatan(id_kecamatan) ON DELETE CASCADE,
    CONSTRAINT fk_laporan_kelurahan FOREIGN KEY (id_kelurahan) REFERENCES app_md_kelurahan(id_kelurahan) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- TABLE: app_penanganan
-- =============================================
DROP TABLE IF EXISTS app_penanganan;
CREATE TABLE app_penanganan (
    id_penanganan INT AUTO_INCREMENT PRIMARY KEY,
    id_laporan    INT NOT NULL,
    catatan       TEXT NOT NULL,
    status_baru   VARCHAR(20) NOT NULL,
    updated_by    INT NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_penanganan_laporan FOREIGN KEY (id_laporan) REFERENCES app_laporan_bencana(id_laporan) ON DELETE CASCADE,
    CONSTRAINT fk_penanganan_user FOREIGN KEY (updated_by) REFERENCES app_users(id_user) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- TABLE: app_korban
-- =============================================
DROP TABLE IF EXISTS app_korban;
CREATE TABLE app_korban (
    id_korban       INT AUTO_INCREMENT PRIMARY KEY,
    id_laporan      INT NOT NULL,
    id_kelurahan    INT NOT NULL,
    jumlah_meninggal    INT DEFAULT 0,
    jumlah_luka_berat   INT DEFAULT 0,
    jumlah_luka_ringan  INT DEFAULT 0,
    jumlah_mengungsi    INT DEFAULT 0,
    jumlah_hilang       INT DEFAULT 0,
    keterangan      TEXT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_korban_laporan    FOREIGN KEY (id_laporan)   REFERENCES app_laporan_bencana(id_laporan) ON DELETE CASCADE,
    CONSTRAINT fk_korban_kelurahan  FOREIGN KEY (id_kelurahan) REFERENCES app_md_kelurahan(id_kelurahan) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- TABLE: app_dampak_kerusakan
-- =============================================
DROP TABLE IF EXISTS app_dampak_kerusakan;
CREATE TABLE app_dampak_kerusakan (
    id_dampak           INT AUTO_INCREMENT PRIMARY KEY,
    id_laporan          INT NOT NULL,
    id_kelurahan        INT NOT NULL,
    dicatat_oleh        INT NOT NULL,
    jenis_kerusakan     VARCHAR(100) NOT NULL,
    tingkat_kerusakan   VARCHAR(20) NOT NULL,
    jumlah_unit         INT DEFAULT 0,
    estimasi_kerugian   DECIMAL(15, 2) DEFAULT 0,
    deskripsi           TEXT NULL,
    foto_url            VARCHAR(255) NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_dampak_laporan    FOREIGN KEY (id_laporan)   REFERENCES app_laporan_bencana(id_laporan) ON DELETE CASCADE,
    CONSTRAINT fk_dampak_kelurahan  FOREIGN KEY (id_kelurahan) REFERENCES app_md_kelurahan(id_kelurahan) ON DELETE CASCADE,
    CONSTRAINT fk_dampak_petugas    FOREIGN KEY (dicatat_oleh) REFERENCES app_users(id_user) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- TABLE: app_daerah_rawan
-- =============================================
DROP TABLE IF EXISTS app_daerah_rawan;
CREATE TABLE app_daerah_rawan (
    id_daerah_rawan INT AUTO_INCREMENT PRIMARY KEY,
    id_kelurahan    INT NOT NULL,
    id_bencana      INT NOT NULL,
    zona            VARCHAR(20) NOT NULL DEFAULT 'HIJAU',
    keterangan      TEXT NULL,
    latitude        DECIMAL(10, 8) NULL,
    longitude       DECIMAL(11, 8) NULL,
    radius_meter    INT DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_rawan_kelurahan FOREIGN KEY (id_kelurahan) REFERENCES app_md_kelurahan(id_kelurahan) ON DELETE CASCADE,
    CONSTRAINT fk_rawan_bencana   FOREIGN KEY (id_bencana)   REFERENCES app_md_bencana(id_bencana) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- TABLE: app_prediksi_bencana
-- =============================================
DROP TABLE IF EXISTS app_prediksi_bencana;
CREATE TABLE app_prediksi_bencana (
    id_prediksi      INT AUTO_INCREMENT PRIMARY KEY,
    id_bencana       INT NOT NULL,
    id_kelurahan     INT NOT NULL,
    level_risiko     VARCHAR(20) NOT NULL DEFAULT 'RENDAH',
    tanggal_prediksi DATE NOT NULL,
    probabilitas     DECIMAL(5, 2) DEFAULT 0,
    faktor_risiko    TEXT NULL,
    rekomendasi      TEXT NULL,
    sumber_data      VARCHAR(255) NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_prediksi_bencana   FOREIGN KEY (id_bencana)   REFERENCES app_md_bencana(id_bencana) ON DELETE CASCADE,
    CONSTRAINT fk_prediksi_kelurahan FOREIGN KEY (id_kelurahan) REFERENCES app_md_kelurahan(id_kelurahan) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- TABLE: app_stok_bantuan
-- =============================================
DROP TABLE IF EXISTS app_stok_bantuan;
CREATE TABLE app_stok_bantuan (
    id_stok         INT AUTO_INCREMENT PRIMARY KEY,
    id_kategori     INT NOT NULL,
    tipe            VARCHAR(10) NOT NULL,
    nama_item       VARCHAR(150) NOT NULL,
    jumlah          INT NOT NULL,
    satuan          VARCHAR(50) NOT NULL,
    tanggal         DATE NOT NULL,
    sumber          VARCHAR(255) NULL,
    tujuan          VARCHAR(255) NULL,
    keterangan      TEXT NULL,
    dicatat_oleh    INT NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_stok_kategori FOREIGN KEY (id_kategori)  REFERENCES app_md_kategori_stok(id_kategori) ON DELETE CASCADE,
    CONSTRAINT fk_stok_user     FOREIGN KEY (dicatat_oleh) REFERENCES app_users(id_user) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- TABLE: app_distribusi_bantuan
-- =============================================
DROP TABLE IF EXISTS app_distribusi_bantuan;
CREATE TABLE app_distribusi_bantuan (
    id_distribusi   INT AUTO_INCREMENT PRIMARY KEY,
    id_laporan      INT NOT NULL,
    id_kelurahan    INT NOT NULL,
    id_stok         INT NOT NULL,
    jumlah          INT NOT NULL,
    satuan          VARCHAR(50) NOT NULL,
    tanggal_kirim   DATE NULL,
    tanggal_terima  DATE NULL,
    status          VARCHAR(20) DEFAULT 'DIPROSES',
    penerima        VARCHAR(150) NULL,
    keterangan      TEXT NULL,
    dikirim_oleh    INT NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_distribusi_laporan    FOREIGN KEY (id_laporan)   REFERENCES app_laporan_bencana(id_laporan) ON DELETE CASCADE,
    CONSTRAINT fk_distribusi_kelurahan  FOREIGN KEY (id_kelurahan) REFERENCES app_md_kelurahan(id_kelurahan) ON DELETE CASCADE,
    CONSTRAINT fk_distribusi_stok       FOREIGN KEY (id_stok)      REFERENCES app_stok_bantuan(id_stok) ON DELETE CASCADE,
    CONSTRAINT fk_distribusi_user       FOREIGN KEY (dikirim_oleh) REFERENCES app_users(id_user) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- TABLE: app_historis_kejadian
-- =============================================
DROP TABLE IF EXISTS app_historis_kejadian;
CREATE TABLE app_historis_kejadian (
    id_historis     INT AUTO_INCREMENT PRIMARY KEY,
    id_laporan      INT NOT NULL,
    id_bencana      INT NOT NULL,
    id_kelurahan    INT NOT NULL,
    tanggal_kejadian DATE NOT NULL,
    tanggal_selesai  DATE NULL,
    ringkasan        TEXT NOT NULL,
    total_korban     INT DEFAULT 0,
    total_kerugian   DECIMAL(15, 2) DEFAULT 0,
    tindakan_yang_dilakukan TEXT NULL,
    pelajaran_yang_dipetik  TEXT NULL,
    file_laporan_url VARCHAR(255) NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_historis_laporan    FOREIGN KEY (id_laporan)   REFERENCES app_laporan_bencana(id_laporan) ON DELETE CASCADE,
    CONSTRAINT fk_historis_bencana    FOREIGN KEY (id_bencana)   REFERENCES app_md_bencana(id_bencana) ON DELETE CASCADE,
    CONSTRAINT fk_historis_kelurahan  FOREIGN KEY (id_kelurahan) REFERENCES app_md_kelurahan(id_kelurahan) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- TABLE: app_notifikasi
-- =============================================
DROP TABLE IF EXISTS app_notifikasi;
CREATE TABLE app_notifikasi (
    id_notifikasi INT AUTO_INCREMENT PRIMARY KEY,
    id_user       INT NOT NULL,
    judul         VARCHAR(255) NOT NULL,
    pesan         TEXT NOT NULL,
    is_read       BOOLEAN DEFAULT FALSE,
    tipe          VARCHAR(20) DEFAULT 'INFO',
    id_laporan    INT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifikasi_user FOREIGN KEY (id_user) REFERENCES app_users(id_user) ON DELETE CASCADE,
    CONSTRAINT fk_notifikasi_laporan FOREIGN KEY (id_laporan) REFERENCES app_laporan_bencana(id_laporan) ON DELETE SET NULL
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
