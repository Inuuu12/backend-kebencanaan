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
        Schema::create('app_penduduk', function (Blueprint $table) {
            $table->id('id_penduduk');
            $table->foreignId('id_kelurahan')->constrained('app_md_kelurahan', 'id_kelurahan')->onDelete('cascade');
            $table->integer('tahun');
            $table->integer('jumlah_jiwa')->default(0);
            $table->integer('jumlah_kk')->default(0);
            $table->integer('jumlah_laki')->default(0);
            $table->integer('jumlah_perempuan')->default(0);
            $table->integer('jumlah_rentan')->default(0);
            $table->text('keterangan')->nullable();
            $table->timestamps();

            $table->unique(['id_kelurahan', 'tahun']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_penduduk');
    }
};
