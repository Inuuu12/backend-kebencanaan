<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('app_md_kategori_stok', function (Blueprint $table) {
            $table->id('id_kategori');
            $table->string('nama_kategori', 100);
            $table->string('satuan', 50);
            $table->text('deskripsi')->nullable();
            $table->timestamps();
        });

        DB::table('app_md_kategori_stok')->insert([
            ['nama_kategori' => 'Pangan', 'satuan' => 'kg', 'deskripsi' => 'Stok bahan pangan seperti beras, mie, dll', 'created_at' => now(), 'updated_at' => now()],
            ['nama_kategori' => 'Sandang', 'satuan' => 'pcs', 'deskripsi' => 'Stok pakaian dan perlengkapan sandang', 'created_at' => now(), 'updated_at' => now()],
            ['nama_kategori' => 'Papan / Perlengkapan Tempat Tinggal', 'satuan' => 'unit', 'deskripsi' => 'Stok tenda, terpal, dan perlengkapan hunian', 'created_at' => now(), 'updated_at' => now()],
            ['nama_kategori' => 'Kesehatan', 'satuan' => 'pcs', 'deskripsi' => 'Stok obat-obatan dan alat kesehatan', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_md_kategori_stok');
    }
};
