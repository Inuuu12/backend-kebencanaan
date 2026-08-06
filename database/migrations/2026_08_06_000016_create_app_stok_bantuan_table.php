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
        Schema::create('app_stok_bantuan', function (Blueprint $table) {
            $table->id('id_stok');
            $table->foreignId('id_kategori')->constrained('app_md_kategori_stok', 'id_kategori')->onDelete('cascade');
            $table->string('tipe', 10);
            $table->string('nama_item', 150);
            $table->integer('jumlah');
            $table->string('satuan', 50);
            $table->date('tanggal');
            $table->string('sumber', 255)->nullable();
            $table->string('tujuan', 255)->nullable();
            $table->text('keterangan')->nullable();
            $table->foreignId('dicatat_oleh')->constrained('app_users', 'id_user')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_stok_bantuan');
    }
};
