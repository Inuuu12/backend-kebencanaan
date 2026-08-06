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
        Schema::create('app_laporan_bencana', function (Blueprint $table) {
            $table->id('id_laporan');
            $table->foreignId('id_user')->constrained('app_users', 'id_user')->onDelete('cascade');
            $table->foreignId('id_bencana')->constrained('app_md_bencana', 'id_bencana')->onDelete('cascade');
            $table->foreignId('id_kecamatan')->constrained('app_md_kecamatan', 'id_kecamatan')->onDelete('cascade');
            $table->foreignId('id_kelurahan')->constrained('app_md_kelurahan', 'id_kelurahan')->onDelete('cascade');
            $table->string('judul', 255);
            $table->text('deskripsi');
            $table->integer('jumlah_korban')->default(0);
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->text('alamat_detail')->nullable();
            $table->string('status', 20)->default('MENUNGGU');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_laporan_bencana');
    }
};
