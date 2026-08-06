<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Penduduk extends Model
{
    protected $table = 'app_penduduk';
    protected $primaryKey = 'id_penduduk';

    protected $fillable = [
        'id_kelurahan',
        'tahun',
        'jumlah_jiwa',
        'jumlah_kk',
        'jumlah_laki',
        'jumlah_perempuan',
        'jumlah_rentan',
        'keterangan',
    ];

    protected $casts = [
        'tahun' => 'integer',
        'jumlah_jiwa' => 'integer',
        'jumlah_kk' => 'integer',
        'jumlah_laki' => 'integer',
        'jumlah_perempuan' => 'integer',
        'jumlah_rentan' => 'integer',
    ];

    public function kelurahan(): BelongsTo
    {
        return $this->belongsTo(Kelurahan::class, 'id_kelurahan', 'id_kelurahan');
    }
}
