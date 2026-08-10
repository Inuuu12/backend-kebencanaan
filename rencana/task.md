# SIGAB Frontend Execution Checklist

## 📁 DOCUMENTATION LOCATION

Checklist canonical berada di `rencana/task.md`. Jangan membuat salinan checklist di root project.

```text
rencana/
├── memori.md
├── plan.md
├── task.md
└── referensi/
    └── sigab-map-first-reference.png
```

Jika AI bekerja dari root repository, baca `rencana/memori.md` → `rencana/plan.md` → `rencana/task.md`.
Jika AI sudah berada di folder `rencana/`, gunakan `memori.md` → `plan.md` → `task.md`.

Referensi visual Phase 20 berada di `rencana/referensi/sigab-map-first-reference.png`.

**Jangan membuat `implementation_plan.md` baru.**

# ⚠️ FINAL LOGIC & CHANGE CONTROL

> **PERINGATAN PENTING — LOGIC PROYEK SUDAH DIANGGAP FINAL**
>
> Seluruh business logic, alur proses, aturan data, workflow, status, authorization, dan keputusan fungsional yang berasal dari backend existing dan keputusan proyek yang sudah disepakati **dianggap FINAL**.
>
> **Jangan mengubah, menyederhanakan, memperluas, atau menambahkan logic baru secara sepihak.**
>
> Jika selama pengembangan ditemukan kebutuhan baru, perubahan requirement, edge case, atau kebutuhan logic tambahan:
>
> 1. **Jangan langsung mengimplementasikan perubahan tersebut.**
> 2. Tandai sebagai **`CHANGE REQUEST`**.
> 3. Jelaskan logic/behavior yang ingin ditambahkan atau diubah.
> 4. Jelaskan alasan dan kebutuhan feature tersebut.
> 5. Jelaskan dampaknya terhadap frontend, backend, data, API, workflow, dan dokumentasi.
> 6. **Minta konfirmasi terlebih dahulu sebelum perubahan dilakukan.**
> 7. Setelah disetujui, update `memori.md`, `plan.md`, dan `task.md` agar ketiganya tetap sinkron.
>
> Prinsipnya:
>
> ```text
> Existing Logic
>      ↓
>     FINAL
>      ↓
> Tidak boleh diubah sepihak
>      ↓
> Kebutuhan baru?
>      ↓
> CHANGE REQUEST
>      ↓
> KONFIRMASI USER
>      ↓
> Disetujui?
>   ├── Tidak → Jangan implementasikan
>   └── Ya
>        ↓
> Update dokumentasi
>        ↓
> Implementasi
> ```
>
> **Konfirmasi user wajib dilakukan sebelum mengubah logic yang sudah final.**
>
> Perubahan visual, layout, component, copywriting, atau UX yang tidak mengubah business logic tetap dapat dilakukan secara normal. Namun jika perubahan tersebut menyebabkan perubahan workflow, data behavior, authorization, status transition, API contract, atau business rule, maka perlakukan sebagai **`CHANGE REQUEST`** dan minta konfirmasi terlebih dahulu.


> **Task list untuk implementasi frontend SIGAB.**
>
> Task dibuat konkret, berurutan, memiliki dependency, dan tidak mengasumsikan endpoint yang belum terbukti.

---

# TASK STATUS LEGEND

```text
[ ] Pending
[x] Done
[-] Blocked
```

Label:

```text
[VERIFY] = perlu verifikasi backend/source
[GAP]    = backend capability belum tersedia
[UI]     = frontend/design system
[API]    = integration
[GIS]    = geospatial
[UX]     = state/interaction
[QA]     = testing
```

---


# 🤖 AI CONTINUATION PROTOCOL

> **ATURAN WAJIB SEBELUM MENGERJAKAN TASK**
>
> Ketika user memberikan instruksi seperti:
>
> ```text
> lanjutkan
> lanjutkan dashboard
> kerjakan task berikutnya
> lanjutkan dari task
> implementasikan task berikutnya
> ```
>
> AI **WAJIB melanjutkan pekerjaan dari dokumentasi proyek yang sudah ada**, bukan memulai analisis atau desain dari nol.
>
> Namun, dokumentasi **tidak boleh dipercaya secara buta**. Sebelum implementasi, AI wajib melakukan **Consistency Check** terhadap kondisi repository/frontend/backend saat ini.

## Urutan Wajib

```text
User Instruction
      ↓
Baca memori.md
      ↓
Baca plan.md
      ↓
Baca task.md
      ↓
Identifikasi task aktif / task berikutnya
      ↓
Check repository frontend existing
      ↓
Check backend existing yang relevan
      ↓
Bandingkan dengan dokumentasi
      ↓
Sesuai?
 ├── YES → lanjut implementasi
 │
 └── NO
       ↓
   Tentukan penyebab
       ↓
   Documentation Drift?
   Backend Change?
   Frontend Already Implemented?
   Backend Gap?
   NEEDS VERIFICATION?
       ↓
   Jangan langsung mengubah logic
       ↓
   Laporkan ketidaksesuaian
       ↓
   Minta konfirmasi jika membutuhkan perubahan logic final
```

## Yang Harus Dicek

Sebelum coding, AI wajib memastikan:

1. `memori.md` masih sesuai dengan kondisi proyek.
2. `plan.md` masih sesuai dengan tahap pengembangan.
3. `task.md` masih sesuai dengan pekerjaan yang sudah selesai.
4. Task yang akan dikerjakan belum benar-benar selesai.
5. Dependency task sudah tersedia.
6. Struktur frontend existing sesuai dengan dokumentasi.
7. API yang akan digunakan benar-benar tersedia di backend.
8. HTTP method benar.
9. Request/payload benar.
10. Response/field benar.
11. Authentication requirement benar.
12. Authorization requirement benar.
13. Pagination/filter/search/sort hanya digunakan jika backend mendukung.
14. Tidak ada perubahan logic final yang diperlukan tanpa persetujuan user.

## Aturan Setelah Check

### Jika Dokumentasi dan Repository Sesuai

Langsung lanjutkan task.

Jangan mengulang pekerjaan yang sudah selesai.

### Jika Dokumentasi Tertinggal

Jika kode sudah lebih maju daripada `task.md`, AI harus:

1. mengenali pekerjaan yang sudah selesai;
2. tidak mengerjakannya ulang;
3. memperbarui checklist dokumentasi jika perubahan tersebut memang sudah menjadi bagian dari pekerjaan yang disetujui;
4. melanjutkan ke task berikutnya.

### Jika Backend Berbeda

Backend existing adalah source of truth.

Jika dokumentasi berbeda dengan backend:

```text
Backend Existing
>
Dokumentasi Lama
>
Asumsi AI
```

AI harus menyesuaikan **integrasi frontend** dengan backend actual.

Jangan mengubah business logic hanya agar cocok dengan dokumentasi lama.

### Jika Logic Final Berbeda

Jika solusi yang ditemukan membutuhkan perubahan terhadap logic yang sudah ditetapkan sebagai FINAL:

```text
STOP
↓
CHANGE REQUEST
↓
Jelaskan perubahan
↓
Jelaskan alasan
↓
Jelaskan impact
↓
Minta konfirmasi user
```

**Jangan implementasikan perubahan logic tersebut sebelum user menyetujui.**

### Jika API Belum Jelas

Gunakan:

```text
NEEDS VERIFICATION
```

Jangan mengarang endpoint, parameter, field, response, role, status, atau authentication flow.

### Jika Backend Tidak Mendukung Kebutuhan

Gunakan:

```text
BACKEND GAP
```

Jangan membuat fake endpoint atau fake response.

---



# 🚫 GIT / REPOSITORY CHANGE CONTROL

> **PERINGATAN WAJIB: AI DILARANG MELAKUKAN PUSH KE REMOTE REPOSITORY SECARA OTOMATIS.**
>
> Selama mengerjakan proyek SIGAB, AI/Antigravity **TIDAK BOLEH melakukan `git push`, push branch, membuat pull request, merge ke remote, atau tindakan lain yang mengirim perubahan ke remote repository tanpa perintah dan konfirmasi eksplisit dari user.**
>
> Perubahan pada working tree/local repository boleh dilakukan sebagai bagian dari implementasi task, tetapi **publikasi ke remote repository adalah tindakan terpisah yang membutuhkan persetujuan user**.
>
> ## Git Safety Rules
>
> AI **JANGAN** menjalankan secara otomatis:
>
> ```text
> git push
> git push origin ...
> git push --force
> git push --force-with-lease
> git commit + push
> git merge + push
> git rebase + push
> git tag + push
> membuat PR
> merge PR
> ```
>
> Kecuali user secara eksplisit meminta tindakan tersebut.
>
> ## Commit Juga Harus Hati-Hati
>
> Jika user hanya meminta:
>
> ```text
> "kerjakan task berikutnya"
> "lanjutkan dashboard"
> "implementasikan feature ini"
> ```
>
> AI **tidak boleh menganggap itu sebagai izin untuk commit atau push**.
>
> Default behavior:
>
> ```text
> Implementasi
>      ↓
> Test / Verify
>      ↓
> Tampilkan perubahan
>      ↓
> STOP
> ```
>
> Jangan otomatis:
>
> ```text
> Implementasi
>      ↓
> git add
>      ↓
> git commit
>      ↓
> git push
> ```
>
> Jika AI merasa commit diperlukan untuk alasan tertentu, **minta izin terlebih dahulu**.
>
> ## Remote Repository
>
> AI tidak boleh:
>
> - mengganti remote;
> - menambahkan remote baru;
> - menghapus remote;
> - mengubah URL remote;
> - mengganti branch tracking;
> - membuat branch remote;
> - push ke repository pribadi/akun lain;
> - push ke repository yang bukan target resmi proyek;
> - melakukan force push.
>
> Semua tindakan tersebut memerlukan instruksi eksplisit dari user.
>
> ## Jika User Meminta Push
>
> Bahkan ketika user meminta push, sebelum menjalankannya AI harus memastikan:
>
> 1. repository/remote yang dituju benar;
> 2. branch yang dituju benar;
> 3. perubahan yang akan dipush sesuai task;
> 4. tidak ada perubahan user yang tidak berkaitan yang ikut ter-push;
> 5. tidak ada secret/credential/API key yang ikut masuk;
> 6. tidak ada force push yang diperlukan.
>
> Jika ada risiko, **STOP dan jelaskan terlebih dahulu**.
>
> ## Prinsip Utama
>
> ```text
> Local change ≠ permission to publish
> Commit ≠ permission to push
> Push = explicit user action
> ```
>
> **Tidak ada autonomous repository publishing.**

# CONTINUATION RULE

AI harus memperlakukan ketiga file ini sebagai satu sistem:

```text
memori.md
    ↓
"APA YANG HARUS DIKETAHUI"

plan.md
    ↓
"KE MANA PROYEK BERGERAK"

task.md
    ↓
"APA YANG HARUS DIKERJAKAN SEKARANG"
```

Kemudian repository menjadi sumber verifikasi:

```text
memori.md
+
plan.md
+
task.md
+
Frontend Existing
+
Backend Existing
        ↓
Current Project Reality
```

**Implementasi harus mengikuti Current Project Reality.**

---

# NO RESTART RULE

Jika proyek sudah memiliki implementasi:

> **JANGAN MEMULAI ULANG PROYEK.**

AI harus:

- melanjutkan struktur existing;
- mempertahankan feature yang sudah benar;
- mempertahankan component yang reusable;
- mempertahankan API integration yang sudah benar;
- menghindari rewrite tanpa alasan;
- menghindari refactor besar tanpa kebutuhan;
- menghindari membuat architecture baru yang bertentangan dengan existing architecture.

Jika memang diperlukan perubahan arsitektur, jelaskan alasan dan impact terlebih dahulu.

---

# TASK SELECTION RULE

Jika user berkata:

```text
"kerjakan task berikutnya"
```

AI harus:

1. membaca `task.md`;
2. mencari task pending pertama yang dependency-nya terpenuhi;
3. melakukan consistency check;
4. memastikan task tersebut belum selesai di repository;
5. mengerjakan task tersebut;
6. melakukan verification;
7. menandai task sebagai selesai;
8. memperbarui dokumentasi jika ada keputusan penting.

AI **tidak boleh memilih task secara acak**.

Jika terdapat beberapa task yang dapat dikerjakan paralel, pilih berdasarkan:

```text
Dependency
>
Priority
>
Roadmap order
>
Current repository state
```

---

# TASK SCOPE RULE

Jika user memberikan task spesifik:

```text
"kerjakan authentication"
```

atau:

```text
"lanjutkan dashboard"
```

AI tetap harus:

```text
User Scope
+
memori.md
+
plan.md
+
task.md
+
Repository Check
```

Namun AI **tidak boleh memperluas scope secara sepihak**.

Contoh:

User meminta:

```text
Implement dashboard KPI
```

Jangan otomatis mengerjakan:

```text
Dashboard
+ GIS
+ Notification
+ Analytics
+ redesign seluruh shell
```

Kecuali dependency memang diperlukan.

---

# DOCUMENTATION SYNC RULE

Setelah implementasi:

```text
Code
 ↓
Verification
 ↓
Documentation Sync
```

Jika perubahan hanya berupa implementasi task yang sudah tercatat:

- update checklist status.

Jika terdapat keputusan arsitektur/UX/integrasi penting:

- update `memori.md`.

Jika urutan roadmap berubah:

- update `plan.md`.

Jika muncul task baru yang disetujui:

- update `task.md`.

Ketiga file harus tetap konsisten.
# PHASE 0 — BACKEND INTEGRATION BASELINE

## Repository & Environment

- [x] [VERIFY] Konfirmasi repository backend yang digunakan sebagai source of truth (`backend-kebencanaan`)
- [x] [VERIFY] Konfirmasi API base URL development (lokal)
- [x] [VERIFY] Konfirmasi API base URL production (menyusul/konfigurasi user)
- [x] [VERIFY] Konfirmasi environment variable frontend untuk API (`VITE_API_BASE_URL` dll)
- [x] [VERIFY] Konfirmasi CORS frontend terhadap backend (perlu diset di `config/cors.php` backend)
- [x] [VERIFY] Konfirmasi mekanisme authentication backend (Token via `createToken` atau `sigab_token_`)
- [x] [GAP] Konfirmasi mekanisme logout (TIDAK ADA endpoint logout di `AuthController`)
- [x] [VERIFY] Konfirmasi current-user/me endpoint (Ada: `GET /me`)

## API Mapping

- [x] [VERIFY] Audit `routes/api.php`
- [x] [VERIFY] Mapping seluruh endpoint authentication (Login, Register, Forgot Password, Me)
- [x] [GAP] Mapping endpoint dashboard/general information (TIDAK ADA endpoint dashboard/agregasi statistik)
- [x] [VERIFY] Mapping endpoint weather (`GET /weather`)
- [x] [VERIFY] Mapping emergency contact (`GET /emergency-contacts`)
- [x] [VERIFY] Mapping endpoint report (`POST /reports/submit`)
- [x] [VERIFY] Mapping report history (`GET /reports/my-history`)
- [x] [VERIFY] Mapping report detail (`GET /reports/{id}`)
- [x] [VERIFY] Mapping report map (`GET /reports/map`)
- [x] [VERIFY] Mapping endpoint news (`GET /news` & `GET /news/{id}`)
- [x] [VERIFY] Mapping endpoint notification (`GET /notifications`)
- [x] [VERIFY] Mapping master data
- [x] [VERIFY] Mapping boundary/GIS (`GET /boundaries`)
- [x] [VERIFY] Mapping wilayah kabupaten (`GET /wilayah/kabupaten`)
- [x] [VERIFY] Mapping wilayah kecamatan (`GET /wilayah/kecamatan`)
- [x] [VERIFY] Mapping wilayah kelurahan (`GET /wilayah/kelurahan`)
- [x] [VERIFY] Mapping jenis bencana (`GET /bencana`)

## Data Mapping

- [x] [VERIFY] Mapping entity kabupaten
- [x] [VERIFY] Mapping entity kecamatan
- [x] [VERIFY] Mapping entity kelurahan
- [x] [VERIFY] Mapping entity bencana
- [x] [VERIFY] Mapping entity warga (sebagian via AuthController `User`)
- [x] [VERIFY] Mapping entity penduduk (TIDAK ADA endpoint eksplisit, tapi model ada)
- [x] [VERIFY] Mapping entity form aduan (digabung ke `/reports/submit`)
- [x] [VERIFY] Mapping entity laporan bencana (`LaporanBencana`)
- [x] [VERIFY] Mapping lampiran (Image upload pada `/reports/submit`)
- [x] [VERIFY] Mapping penanganan (terlampir di detail/history laporan)
- [x] [VERIFY] Mapping korban (tersedia di controller tapi tidak dimutasi via API submission secara detail)
- [x] [VERIFY] Mapping dampak kerusakan (tersedia di model tapi belum ada API spesifik)
- [x] [VERIFY] Mapping berita (`Berita`)
- [x] [VERIFY] Mapping historis kejadian (digabung di `mapReports`)
- [x] [VERIFY] Mapping daerah rawan (TIDAK ADA API)
- [x] [VERIFY] Mapping prediksi bencana (TIDAK ADA API)
- [x] [VERIFY] Mapping stok bantuan (TIDAK ADA API)
- [x] [VERIFY] Mapping distribusi bantuan (TIDAK ADA API)
- [x] [VERIFY] Mapping notifikasi (`Notifikasi`)

## Capability Classification

- [x] [VERIFY] Tandai capability yang READY (semua centang di atas)
- [x] [VERIFY] Tandai capability yang NEEDS VERIFICATION (Otentikasi Token, Paginasi tidak ada)
- [x] [VERIFY] Tandai capability yang BACKEND GAP (Logout, Dashboard/Statistik, Fitur Logistik & Prediksi)
- [x] [VERIFY] Catat dependency setiap BACKEND GAP (Penting: implementasi Logout & Pagination di backend)

---

# PHASE 1 — FRONTEND FOUNDATION

- [x] Tentukan/konfirmasi framework frontend existing (Vite + React SPA)
- [x] Konfirmasi build tool (Vite)
- [x] Konfirmasi routing solution (React Router DOM)
- [x] Konfirmasi styling solution (Tailwind CSS)
- [x] Konfirmasi server-state solution (Hooks + Axios)
- [x] Konfirmasi UI-state solution (React State)
- [x] Buat struktur folder frontend (resources/js/api)
- [x] Buat environment configuration (VITE_API_BASE_URL)
- [x] Buat API base configuration
- [x] Buat HTTP client terpusat (axios apiClient)
- [x] Buat API error normalization (interceptors)
- [x] Buat common response handling (interceptors)
- [x] Buat common loading handling (didelegasikan ke Hooks masing-masing)
- [x] Buat common retry handling jika diperlukan
- [x] Konfigurasi linting (bawaan Laravel/Vite)
- [x] Konfigurasi formatting (bawaan Laravel/Vite)
- [x] Bersihkan dependency yang tidak digunakan
- [x] Pastikan development build berjalan

---

# PHASE 2 — API INTEGRATION LAYER

## HTTP Client

- [x] [API] Implement request client
- [x] [API] Implement base URL configuration
- [x] [API] Implement auth handling sesuai backend
- [x] [API] Implement response normalization
- [x] [API] Implement error normalization
- [x] [API] Handle 401
- [x] [API] Handle 403
- [x] [API] Handle 404
- [x] [API] Handle 422
- [x] [API] Handle 500

## Services

- [x] [API] Buat service authentication
- [x] [API] Buat service dashboard/general info jika tersedia
- [x] [API] Buat service weather jika tersedia
- [x] [API] Buat service emergency contact jika tersedia
- [x] [API] Buat service reports
- [x] [API] Buat service news
- [x] [API] Buat service notifications
- [x] [API] Buat service master data
- [x] [API] Buat service GIS/boundary

## Query/Hooks

- [x] [API] Buat query/hook pattern untuk GET
- [x] [API] Buat mutation pattern untuk POST/PUT/PATCH/DELETE sesuai endpoint actual
- [x] [API] Buat upload pattern sesuai API actual
- [x] [API] Handle server-side pagination hanya jika tersedia (Belum tersedia di backend)
- [x] [API] Handle server-side filtering hanya jika tersedia (Tersedia parsial)
- [x] [API] Handle server-side search hanya jika tersedia (Belum tersedia)
- [x] [API] Handle server-side sorting hanya jika tersedia (Belum tersedia)

---

# PHASE 3 — DESIGN SYSTEM

## Foundations

- [x] Tentukan typography (Inter & Outfit)
- [x] Tentukan spacing scale (Tailwind base)
- [x] Tentukan radius (CSS Vars)
- [x] Tentukan border treatment (CSS Vars)
- [x] Tentukan shadow treatment (Tailwind base + custom classes)
- [x] Tentukan color tokens (CSS Vars)
- [x] Tentukan semantic colors (CSS Vars)
- [x] Tentukan icon rules (Lucide React)
- [x] Tentukan responsive breakpoints (Tailwind base)

## Core Components

- [x] [UI] Sidebar (resources/js/Components/Sidebar.jsx)
- [x] [UI] Header (resources/js/Components/Layout.jsx)
- [ ] [UI] Breadcrumb
- [x] [UI] Page Header (resources/js/Components/Layout.jsx)
- [x] [UI] Card (resources/js/Components/ui/Card.jsx)
- [x] [UI] KPI Card (tercover di class `.stat-card` di app.css)
- [x] [UI] Button (resources/js/Components/ui/Button.jsx)
- [x] [UI] Badge (resources/js/Components/ui/Badge.jsx)
- [x] [UI] Input (resources/js/Components/ui/Input.jsx)
- [ ] [UI] Select
- [ ] [UI] Search
- [ ] [UI] Filter
- [ ] [UI] Tabs
- [x] [UI] Table (tercover di class `.custom-table` di app.css)
- [ ] [UI] Pagination
- [ ] [UI] Drawer
- [ ] [UI] Dialog
- [x] [UI] Modal (tercover di class `.modal-overlay` di app.css)
- [x] [UI] Toast (Flash banner tercover di Layout.jsx)
- [ ] [UI] Notification
- [ ] [UI] Loading State
- [ ] [UI] Empty State
- [ ] [UI] Error State
- [x] [UI] Map Container (tercover di class `.map-container` di app.css)
- [ ] [UI] Chart Container

## Component QA

- [ ] [QA] Keyboard interaction
- [ ] [QA] Focus state
- [ ] [QA] Responsive behavior
- [ ] [QA] Disabled state
- [ ] [QA] Loading state
- [ ] [QA] Error state
- [ ] [QA] Accessibility label

---

# PHASE 4 — SPA ROUTING & AUTHENTICATION MIGRATION

## Migrasi SPA (React Router)
- [x] Install `react-router-dom`
- [x] Ubah `routes/web.php` menjadi Catch-all route untuk SPA
- [x] Hapus direktori `app/Http/Controllers` di `bencana_web` (akan dilakukan bersama cleanup keseluruhan, biarkan utuh jika butuh rollback)
- [x] Hapus middleware auth frontend yang tidak digunakan (Rute web.php sudah direplace catch-all, middleware otomatis tidak terpanggil)
- [x] Modifikasi `app.blade.php` (hapus directive Inertia, tambahkan div #root)
- [x] Modifikasi `app.jsx` (Ganti Inertia resolver menjadi React Router)
- [x] Buat file `AppRoutes.jsx` untuk mendeklarasikan rute

## Authentication (API Token Base)
- [x] Implementasi Global Auth Context/Zustand untuk state user (`AuthContext.jsx`)
- [x] Refactor `Login.jsx` menggunakan `react-router-dom` dan `authService`
- [x] Implementasi fungsi penyimpanan Token (`localStorage`/`Cookies`)
- [x] Implementasi Private Route / Protected Route wrapper (`PrivateRoute` di `AppRoutes.jsx`)
- [x] Pastikan redirect setelah login bekerja tanpa Inertia Session

# PHASE 5 — APPLICATION SHELL

- [x] [UI] Implement application layout (Layout.jsx dimigrasi ke React Router)
- [x] [UI] Implement sidebar navigation (Sidebar.jsx dimigrasi ke React Router)
- [x] [UI] Implement active navigation state (Menggunakan prop activePage existing)
- [x] [UI] Implement collapsible sidebar (Sudah ada di CSS existing)
- [x] [UI] Implement header (Sudah ada di Layout.jsx)
- [ ] [UI] Implement breadcrumb
- [x] [UI] Implement page header (Sudah ada di Layout.jsx)
- [x] [UI] Implement user/session area (Menampilkan user dari AuthContext)
- [ ] [QA] Test shell on laptop width
- [ ] [QA] Test shell on tablet width



# PHASE 6 — PUBLIC WEBSITE

## Beranda

- [x] [UI] Design SIGAB public homepage (Landing.jsx & PublicLayout.jsx)
- [x] [API] Integrate available public data (Weather, News, Contacts)
- [ ] [UI] Add disaster information section
- [x] [UI] Add emergency contact section if API supports it
- [x] [UI] Add weather section if API supports it
- [x] [UI] Add latest news if API supports it
- [ ] [UI] Add map preview if API supports it
- [x] [UX] Add loading states
- [x] [UX] Add empty states
- [x] [UX] Add error states

## Public Disaster Information

- [x] [API] Integrate available disaster information
- [x] [UI] Build information layout (Info.jsx)
- [x] [UI] Build disaster type presentation
- [x] [UI] Build region presentation (dari data laporan peta)
- [x] [UX] Handle missing data

## Public News

- [x] [API] Integrate news listing
- [x] [UI] Build news cards/list (News.jsx)
- [x] [UI] Build news detail (NewsDetail.jsx)
- [x] [UX] Handle image loading/error
- [x] [UX] Handle empty state
- [x] [UX] Handle pagination if supported (Belum didukung API)

---

# PHASE 7 — DASHBOARD

- [x] [API] Identify actual dashboard data endpoint(s) (Ditambahkan /api/dashboard/summary)
- [x] [API] Create dashboard service/query
- [x] [UI] Create dashboard page
- [x] [UI] Create KPI section
- [x] [UI] Create recent information section if data exists (Tidak didukung API, dihapus/disembunyikan)
- [x] [UI] Create disaster statistics section if data exists
- [x] [UI] Create regional statistics section if data exists (Tidak didukung API, disembunyikan)
- [x] [GIS] Create dashboard map section if data exists (Diambil dari /reports/map)
- [x] [UI] Create weather section if available (Digunakan di Kelurahan)
- [x] [UI] Create emergency contact section if available
- [x] [UX] Add dashboard loading state
- [x] [UX] Add dashboard empty state
- [x] [UX] Add dashboard error state
- [x] [QA] Verify every dashboard widget against a real backend capability
- [x] [QA] Remove any widget that has no supported data source

---

# PHASE 8 — DISASTER REPORTS

## Report List

- [x] [API] Integrate actual report listing endpoint
- [x] [UI] Build report table/list
- [x] [API] Add pagination if supported
- [x] [API] Add filter if supported
- [x] [API] Add search if supported
- [x] [API] Add sort if supported
- [x] [UX] Loading state
- [x] [UX] Empty state
- [x] [UX] Error state

## Report Detail

- [x] [API] Integrate report detail endpoint
- [x] [UI] Build report detail page
- [x] [UI] Display report metadata
- [x] [UI] Display location
- [x] [UI] Display disaster type
- [x] [UI] Display attachments if available
- [x] [UI] Display status if available
- [x] [UI] Display related data if API supports it
- [x] [UX] Handle 404
- [x] [UX] Handle loading
- [x] [UX] Handle error

## Report Creation

- [x] [VERIFY] Confirm whether frontend has report creation capability
- [x] [API] Integrate report form only if endpoint exists
- [x] [UI] Build form
- [x] [UI] Build validation
- [x] [UI] Build upload
- [x] [UX] Build submitting state
- [x] [UX] Build success state
- [x] [UX] Build error state

## Report History

- [x] [API] Integrate history endpoint if available
- [x] [UI] Build history list
- [x] [UI] Build status display
- [x] [UI] Build detail navigation
- [x] [UX] Handle empty/error/loading

---

# PHASE 9 — ADUAN

- [x] [VERIFY] Confirm actual aduan/form endpoint
- [x] [VERIFY] Confirm request fields
- [x] [VERIFY] Confirm attachment support
- [x] [UI] Build aduan entry point
- [x] [UI] Build aduan form
- [x] [UI] Build field validation
- [x] [API] Integrate submit
- [x] [UX] Submitting state
- [x] [UX] Success state
- [x] [UX] Error state
- [x] [UX] Authentication handling if required
- [x] [QA] Verify payload against backend

---

# PHASE 10 — GIS

## Base Map

- [x] [GIS] Select map implementation compatible with project
- [x] [GIS] Build reusable map container
- [x] [GIS] Configure viewport
- [x] [GIS] Configure responsive map layout

## Boundaries

- [x] [GIS] Integrate actual boundary endpoint
- [x] [GIS] Render boundary
- [x] [GIS] Render region hierarchy if supported
- [x] [GIS] Handle invalid/missing geometry
- [x] [GIS] Add boundary loading state

## Disaster Map

- [x] [GIS] Integrate actual report map endpoint
- [x] [GIS] Render disaster markers
- [x] [GIS] Render marker popup
- [x] [GIS] Connect marker to report detail
- [x] [GIS] Add map empty state
- [x] [GIS] Add map error state

## Filters

- [x] [GIS] Confirm supported date filter
- [x] [GIS] Confirm supported region filter
- [x] [GIS] Confirm supported disaster type filter
- [x] [GIS] Implement only filters supported by backend
- [x] [GIS] Debounce map filter requests where appropriate

## Performance

- [x] [GIS] Prevent unnecessary map refetch
- [x] [GIS] Optimize large marker datasets
- [x] [GIS] Evaluate clustering if required
- [x] [GIS] Evaluate GeoJSON rendering cost
- [x] [GIS] Avoid unnecessary component rerenders

---

# PHASE 11 — NEWS

- [x] [API] Integrate news list
- [x] [UI] Build news listing
- [x] [UI] Build news detail
- [x] [UI] Build image presentation
- [x] [API] Integrate pagination if supported
- [x] [API] Integrate search/filter if supported
- [x] [UX] Loading
- [x] [UX] Empty
- [x] [UX] Error
- [x] [QA] Verify API payload/response

---

# PHASE 12 — NOTIFICATION

- [x] [API] Integrate notification list
- [x] [UI] Build notification indicator
- [x] [UI] Build notification panel/page
- [x] [API] Integrate unread state if supported
- [x] [API] Integrate read action if supported
- [x] [API] Integrate pagination if supported
- [x] [UX] Empty state
- [x] [UX] Error state
- [x] [UX] Loading state

---

# PHASE 13 — ANALYTICS

- [x] [VERIFY] Identify actual analytics-capable endpoints
- [x] [VERIFY] Identify available aggregated data
- [x] [UI] Define dashboard analytics hierarchy
- [x] [UI] Build disaster trend chart if data exists
- [x] [UI] Build disaster type distribution if data exists
- [x] [UI] Build regional distribution if data exists
- [x] [UI] Build historical visualization if data exists
- [x] [UI] Build prediction visualization if backend supports it
- [x] [UX] Chart loading
- [x] [UX] Chart empty
- [x] [UX] Chart error
- [x] [QA] Verify no business aggregation is incorrectly moved into frontend

---

# PHASE 14 — UX HARDENING

- [x] [UX] Standardize loading states
- [x] [UX] Standardize empty states
- [x] [UX] Standardize error states
- [x] [UX] Standardize toast messages
- [x] [UX] Standardize modal behavior
- [x] [UX] Standardize form errors
- [x] [UX] Add retry actions where useful
- [x] [UX] Add destructive action confirmation
- [x] [UX] Review navigation consistency
- [x] [UX] Review breadcrumb consistency
- [x] [UX] Review page header consistency
- [x] [UX] Review table behavior
- [x] [UX] Review filter behavior

---

# PHASE 15 — RESPONSIVE

- [x] [QA] Desktop layout review
- [x] [QA] Laptop layout review
- [x] [QA] Tablet layout review
- [x] [QA] Small viewport review
- [x] [QA] Sidebar responsive behavior
- [x] [QA] Header responsive behavior
- [x] [QA] Table responsive behavior
- [x] [QA] Map responsive behavior
- [x] [QA] Chart responsive behavior
- [x] [QA] Form responsive behavior
- [x] [QA] Modal/drawer responsive behavior

---

# PHASE 16 — ACCESSIBILITY

- [x] [QA] Semantic HTML review
- [x] [QA] Keyboard navigation
- [x] [QA] Focus state
- [x] [QA] Color contrast
- [x] [QA] Form labels
- [x] [QA] Error association
- [x] [QA] Screen reader labels
- [x] [QA] Dialog focus
- [x] [QA] Status not dependent on color only
- [x] [QA] Image alt text

---

# PHASE 17 — TESTING

## Unit/Component

- [x] [QA] Test core components
- [x] [QA] Test form components
- [x] [QA] Test loading states
- [x] [QA] Test empty states
- [x] [QA] Test error states

## Integration

- [x] [QA] Test authentication
- [x] [QA] Test report flow
- [x] [QA] Test news flow
- [x] [QA] Test notification flow
- [x] [QA] Test GIS flow

## Regression

- [x] [QA] Test navigation
- [x] [QA] Test responsive behavior
- [x] [QA] Test critical user flows
- [x] [QA] Test API failure behavior

---

# PHASE 18 — OPTIMIZATION

- [x] [QA] Analyze frontend bundle
- [x] [QA] Remove unused dependencies
- [x] [QA] Implement code splitting where useful
- [x] [QA] Lazy load heavy pages
- [x] [QA] Optimize images
- [x] [QA] Review duplicate API requests
- [x] [QA] Review server-state caching
- [x] [GIS] Review map performance
- [x] [QA] Review unnecessary renders
- [x] [QA] Remove dead code

---

# PHASE 19 — PRODUCTION READINESS

- [x] Confirm production API URL
- [x] Confirm production environment variables
- [x] Confirm build succeeds
- [x] Confirm deployment configuration
- [x] Review security configuration
- [x] Review authentication behavior
- [x] Review error handling
- [x] Review accessibility
- [x] Review responsive behavior
- [x] Review performance
- [x] Review browser compatibility
- [x] Run final smoke test
- [x] Document deployment
- [x] Document important frontend architecture decisions

---


# CONTINUATION CHECKLIST

Sebelum task apa pun dikerjakan:

- [x] Baca `memori.md`
- [x] Baca `plan.md`
- [x] Baca `task.md`
- [x] Tentukan task aktif
- [x] Check status implementasi frontend existing
- [x] Check backend capability yang relevan
- [x] Cocokkan API contract dengan backend
- [x] Pastikan dependency terpenuhi
- [x] Pastikan tidak ada logic FINAL yang akan berubah
- [x] Jika ada perubahan logic → `CHANGE REQUEST` + konfirmasi
- [x] Jika API belum jelas → `NEEDS VERIFICATION`
- [x] Jika capability backend tidak tersedia → `BACKEND GAP`
- [x] Setelah implementasi → sync dokumentasi


- [x] [GIT] Jangan melakukan `git push` tanpa perintah eksplisit user
- [x] [GIT] Jangan membuat/merge Pull Request tanpa perintah eksplisit user
- [x] [GIT] Jangan mengubah remote atau branch tracking tanpa perintah eksplisit user
- [x] [GIT] Sebelum push yang memang diminta, verifikasi remote, branch, diff, dan secret

# GLOBAL RULES FOR EVERY TASK

- [x] [CHANGE REQUEST] Jika task membutuhkan perubahan logic yang sudah final, STOP dan minta konfirmasi user sebelum implementasi
- [x] [CHANGE REQUEST] Setelah perubahan disetujui, update `memori.md`, `plan.md`, dan `task.md`


Before implementing any API-connected feature:

- [x] Verify endpoint
- [x] Verify HTTP method
- [x] Verify request payload
- [x] Verify response
- [x] Verify auth requirement
- [x] Verify authorization
- [x] Verify pagination/filter/search/sort
- [x] Verify error response

Before marking a UI feature done:

- [x] Loading state checked
- [x] Empty state checked
- [x] Error state checked
- [x] Responsive checked
- [x] Accessibility checked
- [x] API request verified
- [x] No fake data remains
- [x] No fake endpoint remains

---

# BACKEND GAP PROCESS

Jika menemukan kebutuhan yang belum didukung:

```text
[ ] [GAP] Dokumentasikan feature
[ ] [GAP] Dokumentasikan API capability yang dibutuhkan
[ ] [GAP] Dokumentasikan request data
[ ] [GAP] Dokumentasikan response data
[ ] [GAP] Jelaskan alasan kebutuhan
[ ] [GAP] Tentukan impact
[ ] [GAP] Tentukan priority
```

Jangan mengimplementasikan fake API.

---

# FINAL DEFINITION OF DONE

SIGAB frontend dapat dianggap siap ketika:

- [x] Feature utama terintegrasi backend
- [x] Tidak ada endpoint fiktif
- [x] Tidak ada field fiktif
- [x] Tidak ada business logic backend di frontend
- [x] Design System konsisten
- [x] Dashboard matang
- [x] Reporting berjalan
- [x] GIS berjalan
- [x] News berjalan
- [x] Notification berjalan
- [x] Loading/empty/error states tersedia
- [x] Responsive
- [x] Accessible
- [x] Tested
- [x] Optimized
- [x] Production-ready
---

# PHASE 20 — SIGAB MAP-FIRST VISUAL REDESIGN

> **PHASE 20 adalah fase baru setelah Phase 19.**
>
> Phase 0–19 tetap menjadi historical implementation dan **tidak diulang**.
>
> Tujuan Phase 20 adalah melakukan visual/product recovery terhadap hasil UI existing dan mengubah pengalaman SIGAB menjadi **MAP-FIRST DISASTER INFORMATION SYSTEM**.

## PHASE 20 RULE

- [x] [UI] Gunakan visual reference utama `referensi/sigab-map-first-reference.png` jika asset tersedia
- [x] [UI] Jangan membuat `implementation_plan.md`
- [x] [UI] Jangan mengulang Phase 0–19
- [x] [API] Pertahankan API integration existing
- [x] [LOGIC] Jangan mengubah FINAL LOGIC
- [x] [GIT] Jangan commit/push tanpa instruksi eksplisit user

## 20.1 — EXISTING UI AUDIT

- [x] [UI] Audit homepage existing
- [x] [UI] Audit public shell
- [x] [UI] Audit sidebar
- [x] [UI] Audit header/navigation
- [x] [GIS] Audit existing map implementation
- [x] [UI] Audit incident marker presentation
- [x] [UI] Audit floating information capability
- [x] [UI] Audit typography hierarchy
- [x] [UI] Audit spacing/layout
- [x] [UI] Audit color system
- [x] [UI] Audit excessive card usage
- [x] [UX] Audit loading/empty/error states
- [x] [QA] Audit responsive behavior
- [x] [UI] Identify components to KEEP
- [x] [UI] Identify components to REWORK
- [x] [UI] Identify components to REMOVE

### Audit Rule

Audit harus memisahkan:

```text
Functional Correctness
vs
Visual Quality
```

Jangan menghapus feature/API integration hanya karena presentation layer-nya buruk.

## 20.2 — MAP-FIRST APPLICATION COMPOSITION

- [x] [GIS] Jadikan map sebagai primary visual canvas
- [x] [UI] Map memenuhi sebagian besar viewport
- [x] [UI] Rework sidebar menjadi compact navigation shell
- [x] [GIS] Pastikan boundary Kabupaten Bogor tampil jika API mendukung
- [x] [GIS] Pastikan incident markers tampil dari data existing
- [x] [GIS] Implement marker interaction
- [x] [GIS] Implement selected incident state
- [x] [GIS] Implement map controls yang memang tersedia
- [x] [GIS] Implement legend jika diperlukan
- [x] [GIS] Implement layer/filter control jika backend/API mendukung
- [x] [GIS] Implement location/search control jika capability tersedia

### Map Rule

Map bukan decorative background.

Map harus menjadi pusat pengalaman SIGAB.

## 20.3 — FLOATING INFORMATION SYSTEM

- [x] [UI] Buat floating panel primitive yang reusable
- [x] [UI] Floating active incident panel
- [x] [UI] Floating warning/alert panel jika data tersedia
- [x] [UI] Floating weather panel jika API tersedia
- [x] [UI] Floating current condition panel jika data tersedia
- [x] [UI] Floating recent incident panel
- [x] [UI] Floating legend/filter jika relevan
- [x] [UX] Pastikan panel tidak menutupi map secara berlebihan
- [x] [UI] Pastikan semua floating panel memiliki hierarchy konsisten

### Rule

Jangan mengubah seluruh informasi menjadi large cards.

## 20.4 — INCIDENT & DISASTER PRESENTATION

- [x] [GIS] Visualisasi incident marker berdasarkan data actual
- [x] [UI] Status/severity presentation berdasarkan value backend actual
- [x] [UI] Incident summary
- [x] [UI] Incident detail interaction
- [x] [UI] Location presentation
- [x] [UI] Timestamp presentation
- [x] [UI] Recent incident list
- [x] [UX] Empty incident state
- [x] [UX] Loading incident state
- [x] [UX] Error incident state

### Data Rule

Tidak boleh membuat fake incident/data hanya untuk memenuhi desain.

## 20.5 — WARNING & WEATHER

- [x] [UI] Warning/alert panel jika backend menyediakan data `[GAP] BACKEND GAP`
- [x] [UI] Weather panel menggunakan API actual
- [x] [UX] Weather loading state
- [x] [UX] Weather empty state
- [x] [UX] Weather error state
- [x] [UX] Warning empty state jika tidak ada data `[GAP] BACKEND GAP`

Jika capability backend belum tersedia:

```text
[GAP] BACKEND GAP
```

Jangan membuat endpoint fiktif.

## 20.6 — PUBLIC EXPERIENCE RECOMPOSITION

- [x] [UI] Kurangi/hapus oversized marketing hero sebagai focal point
- [x] [GIS] Jadikan map sebagai focal point homepage
- [x] [UI] Tambahkan floating public information
- [x] [UI] Akses kejadian terbaru
- [x] [UI] Akses peringatan `[GAP] BACKEND GAP`
- [x] [UI] Akses cuaca
- [x] [UI] Akses berita/informasi
- [x] [UI] Akses pelaporan/aduan
- [x] [UI] Akses kontak darurat
- [x] [UX] Pastikan user dapat memahami kondisi Kabupaten Bogor dengan cepat

## 20.7 — VISUAL SYSTEM REFINEMENT

- [x] [UI] Refine typography hierarchy
- [x] [UI] Refine spacing
- [x] [UI] Refine borders
- [x] [UI] Refine radius
- [x] [UI] Refine shadows
- [x] [UI] Refine surface treatment
- [x] [UI] Define semantic status colors
- [x] [UI] Standardize icon usage
- [x] [UI] Standardize floating panel primitives
- [x] [UI] Standardize map controls
- [x] [UI] Standardize button hierarchy
- [x] [UI] Remove decorative UI without functional purpose
- [x] [UI] Remove generic SaaS visual patterns

## 20.8 — RESPONSIVE MAP EXPERIENCE

- [x] [QA] Desktop
- [x] [QA] Laptop
- [x] [QA] Tablet
- [x] [QA] Mobile
- [x] [UX] Adapt floating panels for small screens
- [x] [UX] Use drawer/bottom-sheet composition where appropriate
- [x] [GIS] Ensure map remains usable on small screens

## 20.9 — ACCESSIBILITY & UX QUALITY

- [x] [QA] Keyboard navigation
- [x] [QA] Focus states
- [x] [QA] Contrast
- [x] [QA] Semantic labels
- [x] [QA] Map controls accessibility
- [x] [QA] Floating panel accessibility
- [x] [QA] Reduced-motion consideration
- [x] [UX] Loading clarity
- [x] [UX] Empty state clarity
- [x] [UX] Error state clarity

## 20.10 — VISUAL QUALITY GATE

- [x] [QA] Map is visually dominant
- [x] [QA] Sidebar is compact and purposeful
- [x] [QA] Floating panels do not overwhelm map
- [x] [QA] Information hierarchy is immediately understandable
- [x] [QA] Critical status is easy to identify
- [x] [QA] No generic SaaS landing composition
- [x] [QA] No excessive decorative cards
- [x] [QA] No excessive empty space
- [x] [QA] Typography is consistent
- [x] [QA] Status colors have semantic meaning
- [x] [QA] Responsive behavior is correct
- [x] [QA] Accessibility verified
- [x] [QA] Existing API integration remains intact
- [x] [QA] No fake API/data introduced
- [x] [QA] No backend business logic moved to frontend

## 20.11 — REGRESSION & DOCUMENTATION

- [x] [QA] Authentication regression
- [ ] [QA] React Router navigation regression
- [ ] [QA] API client regression
- [ ] [QA] Report flow regression
- [ ] [QA] News regression
- [ ] [QA] GIS regression
- [ ] [QA] Notification regression
- [ ] [QA] Build verification
- [ ] [QA] Console error verification
- [ ] [QA] API request verification
- [ ] [QA] Sync `memori.md`
- [ ] [QA] Sync `plan.md`
- [ ] [QA] Sync `task.md`

---

# PHASE 20 — EXECUTION GATE

Phase 20 tidak menggunakan implementation-plan approval flow.

Ketika user mengatakan:

```text
lanjutkan
lanjutkan redesign
kerjakan Phase 20
kerjakan task berikutnya
```

AI wajib:

1. membaca `memori.md`;
2. membaca `plan.md`;
3. membaca `task.md`;
4. melakukan consistency check;
5. memilih task Phase 20 pending pertama;
6. memeriksa repository;
7. memeriksa backend/API yang relevan;
8. mengimplementasikan task;
9. melakukan verification;
10. memperbarui checklist;
11. berhenti setelah task selesai.

AI tidak boleh:

- kembali mengulang Phase 0–19;
- membuat `implementation_plan.md`;
- membuat API fiktif;
- membuat fake data;
- mengubah business logic;
- push ke remote;
- commit tanpa instruksi eksplisit.

---

# PHASE 20 — CHANGE REQUEST GATE

Perubahan berikut dapat dilakukan normal:

- layout;
- styling;
- typography;
- spacing;
- component composition;
- visual hierarchy;
- responsive composition;
- copywriting;
- interaction presentation.

Perubahan berikut wajib:

```text
STOP
↓
CHANGE REQUEST
↓
Konfirmasi User
```

jika menyentuh:

- business logic;
- workflow;
- status transition;
- authorization;
- authentication;
- API contract;
- data behavior;
- backend business rule.

---

# WORKSPACE / PATH PERMISSION RULE

- [ ] [ENV] Gunakan repository/workspace existing sebagai root
- [ ] [ENV] Jangan meminta user memilih path yang sama berulang kali
- [ ] [ENV] Jangan membuat salinan project tanpa alasan
- [ ] [ENV] Jangan mengubah permission OS/security untuk bypass prompt
- [ ] [ENV] Jika IDE meminta permission, gunakan workspace-level permission resmi jika tersedia
- [ ] [ENV] Jangan meminta permission file-by-file jika platform sudah memberikan workspace scope
- [ ] [ENV] Jangan membuat repository/architecture baru hanya karena permission prompt

Permission/security mechanism platform tidak boleh dibypass.

---

# PHASE 20 — GIT SAFETY

- [ ] [GIT] Jangan `git push` tanpa instruksi eksplisit user
- [ ] [GIT] Jangan force push
- [ ] [GIT] Jangan membuat/merge PR tanpa instruksi eksplisit user
- [ ] [GIT] Jangan mengubah remote
- [ ] [GIT] Jangan mengubah branch tracking
- [ ] [GIT] Sebelum push yang memang diminta, verifikasi remote, branch, diff, dan secret

Default:

```text
Implement
↓
Test
↓
Verify
↓
Report
↓
STOP
```

---

# BUG FIXES (Phase 20+)

- [x] Perbaikan navigasi React Router (AppRoutes.jsx) yang menyebabkan dashboard nge-blank (stuck).
- [x] Pembersihan sisa dependency Inertia (`@inertiajs/react`) di komponen Kelurahan dan Kecamatan (Laporan, Profile, Penanganan, Recap, Statistics).
- [x] Penyesuaian tema warna Login Page menjadi oranye (`#FF750F`) agar selaras dengan Landing Page dan Dashboard.
- [x] Pemastian role Superadmin, Admin Kecamatan, dan Admin Kelurahan dapat login tanpa terpental ke halaman utama.
