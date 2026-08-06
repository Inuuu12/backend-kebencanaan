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
        Schema::create('app_md_bencana', function (Blueprint $table) {
            $table->id('id_bencana');
            $table->string('nama_bencana', 100);
            $table->text('deskripsi')->nullable();
            $table->string('icon_url', 255)->nullable();
            $table->timestamps();
        });

        DB::table('app_md_bencana')->insert([
            ['nama_bencana' => 'Banjir', 'deskripsi' => 'Bencana akibat meluapnya air yang menggenangi daratan', 'created_at' => now(), 'updated_at' => now()],
            ['nama_bencana' => 'Gempa Bumi', 'deskripsi' => 'Getaran atau goncangan yang terjadi di permukaan bumi', 'created_at' => now(), 'updated_at' => now()],
            ['nama_bencana' => 'Tanah Longsor', 'deskripsi' => 'Pergerakan massa tanah atau batuan menuruni lereng', 'created_at' => now(), 'updated_at' => now()],
            ['nama_bencana' => 'Kebakaran', 'deskripsi' => 'Bencana akibat api yang tidak terkendali', 'created_at' => now(), 'updated_at' => now()],
            ['nama_bencana' => 'Angin Puting Beliung', 'deskripsi' => 'Angin kencang yang berputar dengan kecepatan tinggi', 'created_at' => now(), 'updated_at' => now()],
            ['nama_bencana' => 'Tsunami', 'deskripsi' => 'Gelombang laut besar akibat gempa atau letusan gunung berapi', 'created_at' => now(), 'updated_at' => now()],
            ['nama_bencana' => 'Gunung Meletus', 'deskripsi' => 'Erupsi gunung berapi yang mengeluarkan material vulkanik', 'created_at' => now(), 'updated_at' => now()],
            ['nama_bencana' => 'Kekeringan', 'deskripsi' => 'Kondisi kekurangan air dalam jangka waktu yang lama', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_md_bencana');
    }
};
