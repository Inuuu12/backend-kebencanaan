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
        Schema::create('app_dampak_kerusakan', function (Blueprint $table) {
            $table->id('id_dampak');
            $table->foreignId('id_laporan')->constrained('app_laporan_bencana', 'id_laporan')->onDelete('cascade');
            $table->foreignId('id_kelurahan')->constrained('app_md_kelurahan', 'id_kelurahan')->onDelete('cascade');
            $table->foreignId('dicatat_oleh')->constrained('app_users', 'id_user')->onDelete('cascade');
            $table->string('jenis_kerusakan', 100);
            $table->string('tingkat_kerusakan', 20);
            $table->integer('jumlah_unit')->default(0);
            $table->decimal('estimasi_kerugian', 15, 2)->default(0);
            $table->text('deskripsi')->nullable();
            $table->string('foto_url', 255)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_dampak_kerusakan');
    }
};
