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
            $table->text('foto_laporan')->nullable()->change();
            $table->text('kebutuhan_logistik')->nullable()->after('foto_laporan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_laporan_bencana', function (Blueprint $table) {
            $table->string('foto_laporan', 255)->nullable()->change();
            $table->dropColumn('kebutuhan_logistik');
        });
    }
};
