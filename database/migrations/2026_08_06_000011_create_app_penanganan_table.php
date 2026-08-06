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
        Schema::create('app_penanganan', function (Blueprint $table) {
            $table->id('id_penanganan');
            $table->foreignId('id_laporan')->constrained('app_laporan_bencana', 'id_laporan')->onDelete('cascade');
            $table->text('catatan');
            $table->string('status_baru', 20);
            $table->foreignId('updated_by')->constrained('app_users', 'id_user')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_penanganan');
    }
};
