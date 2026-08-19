<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\MasterDataController;
use App\Http\Controllers\Api\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes for Pelaporan Bencana (SIGAB Mobile & Web)
|--------------------------------------------------------------------------
*/

// Authentication Routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/reports/submit', [ReportController::class, 'submit']);
    Route::get('/reports/my-history', [ReportController::class, 'myHistory']);
    Route::get('/notifications', [NotificationController::class, 'index']);
});

// Weather & Home Info
Route::get('/weather', [HomeController::class, 'weather']);
Route::get('/emergency-contacts', [HomeController::class, 'emergencyContacts']);

// Dashboard
use App\Http\Controllers\Api\DashboardController;
Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

// Disaster Reports
Route::get('/reports/map', [ReportController::class, 'mapReports']);
Route::get('/reports/{id}', [ReportController::class, 'show']);

// News Bulletins
Route::get('/news', [NewsController::class, 'index']);
Route::get('/news/{id}', [NewsController::class, 'show']);

// Master Data & Regional Boundaries
Route::get('/bencana', [MasterDataController::class, 'bencana']);
Route::get('/boundaries', [MasterDataController::class, 'boundaries']);
Route::get('/wilayah/kabupaten', [MasterDataController::class, 'kabupaten']);
Route::get('/wilayah/kecamatan', [MasterDataController::class, 'kecamatan']);
Route::get('/wilayah/kelurahan', [MasterDataController::class, 'kelurahan']);
