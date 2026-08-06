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
        Schema::create('app_historis_kejadian', function (Blueprint $table) {
            $table->id('id_historis');
            $table->foreignId('id_laporan')->constrained('app_laporan_bencana', 'id_laporan')->onDelete('cascade');
            $table->foreignId('id_bencana')->constrained('app_md_bencana', 'id_bencana')->onDelete('cascade');
            $table->foreignId('id_kelurahan')->constrained('app_md_kelurahan', 'id_kelurahan')->onDelete('cascade');
            $table->date('tanggal_kejadian');
            $table->date('tanggal_selesai')->nullable();
            $table->text('ringkasan');
            $table->integer('total_korban')->default(0);
            $table->decimal('total_kerugian', 15, 2)->default(0);
            $table->text('tindakan_yang_dilakukan')->nullable();
            $table->text('pelajaran_yang_dipetik')->nullable();
            $table->string('file_laporan_url', 255)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_historis_kejadian');
    }
};
