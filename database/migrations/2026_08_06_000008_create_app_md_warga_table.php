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
        Schema::create('app_md_warga', function (Blueprint $table) {
            $table->id('id_warga');
            $table->foreignId('id_kelurahan')->constrained('app_md_kelurahan', 'id_kelurahan')->onDelete('cascade');
            $table->string('nama_warga', 100);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_md_warga');
    }
};
