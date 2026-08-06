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
        Schema::create('app_berita', function (Blueprint $table) {
            $table->id('id_berita');
            $table->string('judul', 255);
            $table->text('isi');
            $table->text('gambar')->nullable();
            $table->string('sumber', 255)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_berita');
    }
};
