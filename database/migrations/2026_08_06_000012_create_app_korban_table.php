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
        Schema::create('app_korban', function (Blueprint $table) {
            $table->id('id_korban');
            $table->foreignId('id_laporan')->constrained('app_laporan_bencana', 'id_laporan')->onDelete('cascade');
            $table->foreignId('id_kelurahan')->constrained('app_md_kelurahan', 'id_kelurahan')->onDelete('cascade');
            $table->integer('jumlah_meninggal')->default(0);
            $table->integer('jumlah_luka_berat')->default(0);
            $table->integer('jumlah_luka_ringan')->default(0);
            $table->integer('jumlah_mengungsi')->default(0);
            $table->integer('jumlah_hilang')->default(0);
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_korban');
    }
};
