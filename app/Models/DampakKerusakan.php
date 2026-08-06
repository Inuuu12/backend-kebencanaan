<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DampakKerusakan extends Model
{
    protected $table = 'app_dampak_kerusakan';
    protected $primaryKey = 'id_dampak';

    protected $fillable = [
        'id_laporan',
        'id_kelurahan',
        'dicatat_oleh',
        'jenis_kerusakan',
        'tingkat_kerusakan',
        'jumlah_unit',
        'estimasi_kerugian',
        'deskripsi',
        'foto_url',
    ];

    protected $casts = [
        'jumlah_unit' => 'integer',
        'estimasi_kerugian' => 'decimal:2',
    ];

    public function laporanBencana(): BelongsTo
    {
        return $this->belongsTo(LaporanBencana::class, 'id_laporan', 'id_laporan');
    }

    public function kelurahan(): BelongsTo
    {
        return $this->belongsTo(Kelurahan::class, 'id_kelurahan', 'id_kelurahan');
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dicatat_oleh', 'id_user');
    }
}
