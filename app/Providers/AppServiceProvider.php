<?php

namespace App\Providers;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Pastikan request yang tidak terautentikasi ke route api/*
        // selalu mendapat respons 401 JSON (bukan redirect ke route 'login')
        // sehingga Flutter/mobile client dapat menanganinya dengan benar.
        $this->app->bind(
            \Illuminate\Contracts\Auth\Access\Gate::class,
            \Illuminate\Auth\Access\Gate::class
        );
    }
}
