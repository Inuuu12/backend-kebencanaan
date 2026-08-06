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
        Schema::create('app_notifikasi', function (Blueprint $table) {
            $table->id('id_notifikasi');
            $table->foreignId('id_user')->constrained('app_users', 'id_user')->onDelete('cascade');
            $table->string('judul', 255);
            $table->text('pesan');
            $table->boolean('is_read')->default(false);
            $table->string('tipe', 20)->default('INFO');
            $table->foreignId('id_laporan')->nullable()->constrained('app_laporan_bencana', 'id_laporan')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_notifikasi');
    }
};
