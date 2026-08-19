<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Aktifkan HandleCors untuk semua request API
        // (mengizinkan Flutter mobile & React admin mengakses API dari origin berbeda)
        $middleware->api(prepend: [
            HandleCors::class,
        ]);
        // Catatan: statefulApi() TIDAK dipakai karena autentikasi menggunakan
        // Bearer token stateless (Sanctum token), bukan cookie session (SPA).
        // Guard 'auth:sanctum' di routes/api.php sudah cukup untuk token auth.
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Render JSON error untuk semua request ke api/*
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        // Pastikan request API yang tidak terautentikasi mendapat 401 JSON,
        // bukan redirect 302 ke route 'login' (yang tidak ada di API-only app)
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated. Token tidak valid atau tidak disertakan.',
                ], 401);
            }
        });
    })->create();
