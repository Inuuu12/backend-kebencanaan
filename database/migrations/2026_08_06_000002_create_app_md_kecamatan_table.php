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
        Schema::create('app_md_kecamatan', function (Blueprint $table) {
            $table->id('id_kecamatan');
            $table->foreignId('id_kabupaten')->constrained('app_md_kabupaten', 'id_kabupaten')->onDelete('cascade');
            $table->string('nama_kecamatan', 100);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_md_kecamatan');
    }
};
