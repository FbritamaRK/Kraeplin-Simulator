# 🧠 Kraepelin & Pauli Simulator - Simulasi Psikotes Koran (Hitungan Cepat)

Aplikasi web **Kraepelin & Pauli Simulator** dirancang secara khusus untuk persiapan dan latihan intensif ujian psikotes seleksi penerimaan kerja perusahaan (BUMN, Perbankan, Swasta Nasional/Multinasional, serta CPNS/Kedinasan). Aplikasi ini memberikan simulasi realistis pengerjaan **Tes Kraepelin** dan **Tes Pauli** (biasa dikenal dengan *Tes Koran*) sesuai standar asesmen psikologi kerja profesional.

Kamu bisa memainkan simulasi ini pada kraeplinpaulisimulator.vercel.app
---

## 🚀 Fitur Utama

### 1. Pilihan Jenis Tes: Kraepelin & Pauli
- **Tes Kraepelin**:
  - Penjumlahan angka vertikal dari **bawah ke atas** (Bottom to Top).
  - Layar dan kursor otomatis meluncur ke angka paling bawah pada awal setiap lajur.
  - Setelah mengetik jawaban, kursor otomatis meluncur naik ke pasangan angka di atasnya.
- **Tes Pauli**:
  - Penjumlahan angka vertikal dari **atas ke bawah** (Top to Down).
  - Layar dan kursor otomatis berfokus pada angka paling atas pada awal setiap lajur.
  - Setelah mengetik jawaban, kursor otomatis meluncur turun ke pasangan angka di bawahnya.
- **Aturan Angka Satuan**: Input hanya mengambil angka satuan dari hasil penjumlahan (Contoh: `7 + 8 = 15` &rarr; ketik `5`, `3 + 4 = 7` &rarr; ketik `7`).
- **Posisi Isian Realistis**: Kotak isian jawaban diposisikan bergeser ke kanan di antara 2 angka soal, meniru persis lembar kertas ujian psikotes asli.

### 2. Timer Otomatis & Kontrol Pergeseran Kolom (Lajur)
- **Timer per Lajur**: 15 detik per lajur dengan indikator progress bar dan bunyi sinyal peringatan (*beep warning*) pada 3 detik terakhir.
- **Sinyal "PINDAH!"**: Setiap habis 15 detik, sistem membunyikan lonceng sinyal (*shift chime*) dan visual alert **"PINDAH LAJUR!"** serta menggeser fokus kursor otomatis ke kolom berikutnya.
- **Durasi Standar**: 50 lajur &times; 15 detik = **12 menit 30 detik** (Standar ujian psikotes perusahaan).

### 3. Otomatisasi Navigasi & Adaptive Auto-Scroll
- **Auto-Scroll Awal Lajur**: Menyesuaikan otomatis dengan jenis tes yang dipilih (ke angka paling bawah untuk Kraepelin, atau angka paling atas untuk Pauli).
- **Directional Focus Tracking**: Layar melakukan smooth auto-scroll mengikuti pergerakan kursor saat pengguna mengetik jawaban (naik untuk Kraepelin, turun untuk Pauli).
- **Dukungan Keyboard & Touchscreen**: Kontrol keyboard numpad angka (0-9), tombol panah, backspace, serta **Virtual Keypad** bawaan untuk pengguna ponsel/tablet.

### 4. Pilihan Mode Durasi & Lajur
- **Mode Standar Perusahaan**: 50 Lajur @ 15 detik (Total 12m 30s) – *Simulasi ujian asli*.
- **Mode Latihan Sedang**: 20 Lajur @ 15 detik (Total 5m) – *Sesi pemanasan*.
- **Mode Quick Practice**: 10 Lajur @ 15 detik (Total 2m 30s) – *Latihan respon cepat*.
- **Mode Kustom**: Bebas memilih **1 hingga 60 lajur** dan durasi 5-30 detik per lajur.

### 5. Modal Konfirmasi & Hentikan Tes
- Tombol **Hentikan Tes** membuka modal konfirmasi interaktif dengan opsi:
  - 📊 **Selesaikan & Lihat Hasil Sekarang** (Menghitung laporan hingga lajur yang dikerjakan).
  - 🏠 **Batalkan & Ke Menu Utama**.
  - ▶️ **Lanjutkan Tes**.

### 6. Executive Results & Analytics Dashboard (Halaman Hasil)
- **9 Indikator Utama**:
  1. Total Soal Dibuka
  2. Soal Dijawab (dengan persentase)
  3. Soal Tidak Dijawab / Terlewati
  4. Jawaban Benar
  5. Jawaban Salah
  6. Tingkat Akurasi (%)
  7. Rata-Rata Waktu per Jawaban (detik)
  8. Kecepatan Menjawab (soal/menit)
  9. Total Durasi Pengerjaan
- **Grafik Kurva Kerja Psikotes (Work Curve)**: Line chart interaktif berbasis Chart.js yang menampilkan jumlah jawaban benar vs total jawaban di setiap lajur (Lajur 1 s.d. Lajur Akhir).
- **Analisis Psikogram & Sikap Kerja HR**:
  - **Kecepatan Kerja (Pace)**: Mengukur dinamika respon motorik dan tempo kerja.
  - **Ketelitian Kerja (Accuracy)**: Evaluasi tingkat presisi dan kontrol kesalahan.
  - **Kestabilan Kerja (Stability)**: Analisis fluktuasi konsistensi antar lajur (Deviasi Standar).
  - **Ketahanan Kerja (Endurance)**: Evaluasi tren grafik dari lajur awal hingga akhir (Deteksi faktor fatigue/kelelahan).
  - **Saran & Tips Evaluasi Karir**.
- **Rincian Performa per Lajur**: Tabel detail statistik per lajur lengkap dengan grafik bar mini.
- **Cetak Laporan PDF**: Fitur cetak laporan ringkas yang dapat disimpan dalam bentuk dokumen PDF.
- **Notifikasi Panduan Hasil**: Toast card modern di pojok kanan bawah yang mengarahkan pengguna untuk scroll melihat grafik kurva kerja.

---

## 🛠️ Teknologi yang Digunakan

- **HTML5**: Struktur halaman web semantik & aksesibel.
- **CSS3 Vanilla**: Desain modern dengan variabel CSS, Glassmorphism, Dark/Light Mode, dan animasi micro-interactions.
- **JavaScript (ES6+)**: Engine dual Kraepelin & Pauli, sistem timer 100ms, kalkulasi psikogram, dan navigasi keyboard/touch screen.
- **Web Audio API**: Synthesizer audio lokal bawaan tanpa ketergantungan berkas mp3 external.
- **Chart.js**: Render grafik area Kurva Kerja dinamis dan responsif.
- **FontAwesome 6**: Ikonografi UI modern.

---

## 💡 Petunjuk Pengerjaan Tes

### A. Untuk Tes Kraepelin (Bawah ke Atas):
1. Posisikan tangan rileks di atas **Numpad Keyboard (0-9)**. Pada smartphone/tablet, aktifkan **Virtual Keypad**.
2. Fokus pada 2 angka paling bawah di kolom aktif. Hitung jumlahnya dan ketik **angka satuannya**.
3. Begitu angka diketik, kursor otomatis berpindah ke pasangan angka di atasnya (**bergerak naik**).
4. Ketika terdengar bunyi lonceng & peringatan **"PINDAH LAJUR!"**, alihkan fokus mata langsung ke angka paling bawah di kolom berikutnya tanpa memikirkan soal yang terlewati.

### B. Untuk Tes Pauli (Atas ke Bawah):
1. Posisikan tangan rileks di atas **Numpad Keyboard (0-9)** atau gunakan **Virtual Keypad**.
2. Fokus pada 2 angka paling atas di kolom aktif. Hitung jumlahnya dan ketik **angka satuannya**.
3. Begitu angka diketik, kursor otomatis berpindah ke pasangan angka di bawahnya (**bergerak turun**).
4. Ketika terdengar bunyi lonceng & peringatan **"PINDAH LAJUR!"**, alihkan fokus mata langsung ke angka paling atas di kolom berikutnya.
