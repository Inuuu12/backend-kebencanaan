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
        Schema::create('app_distribusi_bantuan', function (Blueprint $table) {
            $table->id('id_distribusi');
            $table->foreignId('id_laporan')->constrained('app_laporan_bencana', 'id_laporan')->onDelete('cascade');
            $table->foreignId('id_kelurahan')->constrained('app_md_kelurahan', 'id_kelurahan')->onDelete('cascade');
            $table->foreignId('id_stok')->constrained('app_stok_bantuan', 'id_stok')->onDelete('cascade');
            $table->integer('jumlah');
            $table->string('satuan', 50);
            $table->date('tanggal_kirim')->nullable();
            $table->date('tanggal_terima')->nullable();
            $table->string('status', 20)->default('DIPROSES');
            $table->string('penerima', 150)->nullable();
            $table->text('keterangan')->nullable();
            $table->foreignId('dikirim_oleh')->constrained('app_users', 'id_user')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_distribusi_bantuan');
    }
};
