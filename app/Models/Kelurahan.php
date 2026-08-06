<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kelurahan extends Model
{
    protected $table = 'app_md_kelurahan';
    protected $primaryKey = 'id_kelurahan';

    protected $fillable = [
        'id_kecamatan',
        'nama_kelurahan',
    ];

    public function kecamatan(): BelongsTo
    {
        return $this->belongsTo(Kecamatan::class, 'id_kecamatan', 'id_kecamatan');
    }

    public function warga(): HasMany
    {
        return $this->hasMany(Warga::class, 'id_kelurahan', 'id_kelurahan');
    }

    public function penduduk(): HasMany
    {
        return $this->hasMany(Penduduk::class, 'id_kelurahan', 'id_kelurahan');
    }

    public function laporanBencana(): HasMany
    {
        return $this->hasMany(LaporanBencana::class, 'id_kelurahan', 'id_kelurahan');
    }
}
