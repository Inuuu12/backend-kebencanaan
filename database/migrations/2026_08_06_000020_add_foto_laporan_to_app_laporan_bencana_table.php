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
        Schema::table('app_laporan_bencana', function (Blueprint $table) {
            $table->string('foto_laporan', 255)->nullable()->after('alamat_detail');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_laporan_bencana', function (Blueprint $table) {
            $table->dropColumn('foto_laporan');
        });
    }
};
