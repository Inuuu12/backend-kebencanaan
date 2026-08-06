<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Korban extends Model
{
    protected $table = 'app_korban';
    protected $primaryKey = 'id_korban';

    protected $fillable = [
        'id_laporan',
        'id_kelurahan',
        'jumlah_meninggal',
        'jumlah_luka_berat',
        'jumlah_luka_ringan',
        'jumlah_mengungsi',
        'jumlah_hilang',
        'keterangan',
    ];

    protected $casts = [
        'jumlah_meninggal' => 'integer',
        'jumlah_luka_berat' => 'integer',
        'jumlah_luka_ringan' => 'integer',
        'jumlah_mengungsi' => 'integer',
        'jumlah_hilang' => 'integer',
    ];

    public function laporanBencana(): BelongsTo
    {
        return $this->belongsTo(LaporanBencana::class, 'id_laporan', 'id_laporan');
    }

    public function kelurahan(): BelongsTo
    {
        return $this->belongsTo(Kelurahan::class, 'id_kelurahan', 'id_kelurahan');
    }
}
