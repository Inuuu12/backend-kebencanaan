<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DaerahRawan extends Model
{
    protected $table = 'app_daerah_rawan';
    protected $primaryKey = 'id_daerah_rawan';

    protected $fillable = [
        'id_kelurahan',
        'id_bencana',
        'zona',
        'keterangan',
        'latitude',
        'longitude',
        'radius_meter',
        'is_active',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'radius_meter' => 'integer',
        'is_active' => 'boolean',
    ];

    public function kelurahan(): BelongsTo
    {
        return $this->belongsTo(Kelurahan::class, 'id_kelurahan', 'id_kelurahan');
    }

    public function bencana(): BelongsTo
    {
        return $this->belongsTo(Bencana::class, 'id_bencana', 'id_bencana');
    }
}
