<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('app_berita', function (Blueprint $table) {
            $table->string('url_tautan', 500)->nullable()->after('sumber');
            $table->string('author', 255)->nullable()->after('url_tautan');
            $table->string('publisher', 255)->nullable()->after('author');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_berita', function (Blueprint $table) {
            //
        });
    }
};
