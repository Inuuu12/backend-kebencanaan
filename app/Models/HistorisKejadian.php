<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HistorisKejadian extends Model
{
    protected $table = 'app_historis_kejadian';
    protected $primaryKey = 'id_historis';

    protected $fillable = [
        'id_laporan',
        'id_bencana',
        'id_kelurahan',
        'tanggal_kejadian',
        'tanggal_selesai',
        'ringkasan',
        'total_korban',
        'total_kerugian',
        'tindakan_yang_dilakukan',
        'pelajaran_yang_dipetik',
        'file_laporan_url',
    ];

    protected $casts = [
        'tanggal_kejadian' => 'date',
        'tanggal_selesai' => 'date',
        'total_korban' => 'integer',
        'total_kerugian' => 'decimal:2',
    ];

    public function laporanBencana(): BelongsTo
    {
        return $this->belongsTo(LaporanBencana::class, 'id_laporan', 'id_laporan');
    }

    public function bencana(): BelongsTo
    {
        return $this->belongsTo(Bencana::class, 'id_bencana', 'id_bencana');
    }

    public function kelurahan(): BelongsTo
    {
        return $this->belongsTo(Kelurahan::class, 'id_kelurahan', 'id_kelurahan');
    }
}
