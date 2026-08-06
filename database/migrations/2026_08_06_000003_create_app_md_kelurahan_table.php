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
        Schema::create('app_md_kelurahan', function (Blueprint $table) {
            $table->id('id_kelurahan');
            $table->foreignId('id_kecamatan')->constrained('app_md_kecamatan', 'id_kecamatan')->onDelete('cascade');
            $table->string('nama_kelurahan', 100);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_md_kelurahan');
    }
};
