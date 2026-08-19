<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\BeritaController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\MasterDataController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UserController;

/*
|--------------------------------------------------------------------------
| API Routes for Pelaporan Bencana (SIGAB Mobile & Web)
|--------------------------------------------------------------------------
*/

// ═══════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES — Tidak memerlukan autentikasi
// ═══════════════════════════════════════════════════════════════════════

// Authentication
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

// Informasi umum (Weather, Emergency Contacts)
Route::get('/weather', [HomeController::class, 'weather']);
Route::get('/emergency-contacts', [HomeController::class, 'emergencyContacts']);

// Dashboard (dapat diakses tanpa login untuk web admin preview)
Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

// Peta bencana publik (route spesifik harus SEBELUM wildcard {id})
Route::get('/reports/map', [ReportController::class, 'mapReports']);

// Berita & Buletin
Route::get('/news', [BeritaController::class, 'index']);
Route::get('/news/{id}', [BeritaController::class, 'show']);

// Master Data Wilayah & Referensi
Route::get('/bencana', [MasterDataController::class, 'bencana']);
Route::get('/boundaries', [MasterDataController::class, 'boundaries']);
Route::get('/wilayah/kabupaten', [MasterDataController::class, 'kabupaten']);
Route::get('/wilayah/kecamatan', [MasterDataController::class, 'kecamatan']);
Route::get('/wilayah/kelurahan', [MasterDataController::class, 'kelurahan']);

// ═══════════════════════════════════════════════════════════════════════
// PROTECTED ROUTES — Wajib login (Bearer token via Laravel Sanctum)
// Request tanpa token valid akan otomatis mendapat respon 401 Unauthorized
// ═══════════════════════════════════════════════════════════════════════
Route::middleware('auth:sanctum')->group(function () {
    // Profil pengguna yang sedang login
    Route::get('/me', [AuthController::class, 'me']);

    // Laporan bencana: submit & riwayat milik pengguna sendiri
    Route::post('/reports/submit', [ReportController::class, 'submit']);
    Route::get('/reports/my-history', [ReportController::class, 'myHistory']);

    // Notifikasi personal (terfilter per pengguna)
    Route::get('/notifications', [NotificationController::class, 'index']);
    // Manajemen Berita (Admin)
    Route::post('/admin/news', [BeritaController::class, 'store']);
    Route::put('/admin/news/{id}', [BeritaController::class, 'update']);
    Route::delete('/admin/news/{id}', [BeritaController::class, 'destroy']);
    Route::post('/admin/news/scrape', [BeritaController::class, 'scrape']);

    // Manajemen Pengguna (Super Admin)
    Route::get('/admin/users', [UserController::class, 'index']);
    Route::put('/admin/users/{id}', [UserController::class, 'update']);
    Route::delete('/admin/users/{id}', [UserController::class, 'destroy']);
});

// PENTING: Wildcard /reports/{id} HARUS didaftarkan PALING TERAKHIR dari semua
// route /reports/* agar tidak menangkap 'map', 'my-history', dan 'submit' lebih dulu.
Route::get('/reports/{id}', [ReportController::class, 'show']);

