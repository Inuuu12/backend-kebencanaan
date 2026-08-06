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
        Schema::create('app_md_formaduan', function (Blueprint $table) {
            $table->id('id_formaduan');
            $table->string('nama_bencana', 100);
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('foto_laporan', 255)->nullable();
            $table->integer('jumlah_korban')->default(0);
            $table->string('status', 20)->default('MENUNGGU');
            $table->text('deskripsi')->nullable();
            $table->timestamps();
        });

        DB::table('app_md_formaduan')->insert([
            ['nama_bencana' => 'Laporan Bencana Alam', 'latitude' => 0, 'longitude' => 0, 'foto_laporan' => '', 'jumlah_korban' => 0, 'status' => 'MENUNGGU', 'deskripsi' => 'Laporan Bencana Alam', 'created_at' => now(), 'updated_at' => now()],
            ['nama_bencana' => 'Laporan Bencana Non Alam', 'latitude' => 0, 'longitude' => 0, 'foto_laporan' => '', 'jumlah_korban' => 0, 'status' => 'MENUNGGU', 'deskripsi' => 'Laporan Bencana Non Alam', 'created_at' => now(), 'updated_at' => now()],
            ['nama_bencana' => 'Laporan Bantuan Sosial', 'latitude' => 0, 'longitude' => 0, 'foto_laporan' => '', 'jumlah_korban' => 0, 'status' => 'MENUNGGU', 'deskripsi' => 'Laporan Bantuan Sosial', 'created_at' => now(), 'updated_at' => now()],
            ['nama_bencana' => 'Laporan Layanan Publik', 'latitude' => 0, 'longitude' => 0, 'foto_laporan' => '', 'jumlah_korban' => 0, 'status' => 'MENUNGGU', 'deskripsi' => 'Laporan Layanan Publik', 'created_at' => now(), 'updated_at' => now()],
            ['nama_bencana' => 'Laporan Fasilitas Umum', 'latitude' => 0, 'longitude' => 0, 'foto_laporan' => '', 'jumlah_korban' => 0, 'status' => 'MENUNGGU', 'deskripsi' => 'Laporan Fasilitas Umum', 'created_at' => now(), 'updated_at' => now()],
            ['nama_bencana' => 'Laporan Keamanan dan Ketertiban', 'latitude' => 0, 'longitude' => 0, 'foto_laporan' => '', 'jumlah_korban' => 0, 'status' => 'MENUNGGU', 'deskripsi' => 'Laporan Keamanan dan Ketertiban', 'created_at' => now(), 'updated_at' => now()],
            ['nama_bencana' => 'Laporan Kesehatan', 'latitude' => 0, 'longitude' => 0, 'foto_laporan' => '', 'jumlah_korban' => 0, 'status' => 'MENUNGGU', 'deskripsi' => 'Laporan Kesehatan', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_md_formaduan');
    }
};
