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
        Schema::create('app_prediksi_bencana', function (Blueprint $table) {
            $table->id('id_prediksi');
            $table->foreignId('id_bencana')->constrained('app_md_bencana', 'id_bencana')->onDelete('cascade');
            $table->foreignId('id_kelurahan')->constrained('app_md_kelurahan', 'id_kelurahan')->onDelete('cascade');
            $table->string('level_risiko', 20)->default('RENDAH');
            $table->date('tanggal_prediksi');
            $table->decimal('probabilitas', 5, 2)->default(0);
            $table->text('faktor_risiko')->nullable();
            $table->text('rekomendasi')->nullable();
            $table->string('sumber_data', 255)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_prediksi_bencana');
    }
};
