<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Konfigurasi CORS untuk SIGAB API. Mengizinkan Flutter mobile app dan
    | React Admin Dashboard mengakses endpoint API dari origin yang berbeda.
    |
    | Autentikasi menggunakan Bearer token (Laravel Sanctum stateless),
    | BUKAN cookie session, sehingga supports_credentials = false.
    |
    | PERHATIAN: allowed_origins ['*'] hanya untuk DEVELOPMENT.
    | Untuk PRODUCTION, ganti dengan domain spesifik, misalnya:
    | 'allowed_origins' => ['https://sigab.diskominfo.go.id'],
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // false karena autentikasi pakai Bearer token, bukan cookie session
    'supports_credentials' => false,

];
