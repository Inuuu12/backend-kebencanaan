<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrediksiBencana extends Model
{
    protected $table = 'app_prediksi_bencana';
    protected $primaryKey = 'id_prediksi';

    protected $fillable = [
        'id_bencana',
        'id_kelurahan',
        'level_risiko',
        'tanggal_prediksi',
        'probabilitas',
        'faktor_risiko',
        'rekomendasi',
        'sumber_data',
    ];

    protected $casts = [
        'tanggal_prediksi' => 'date',
        'probabilitas' => 'decimal:2',
    ];

    public function bencana(): BelongsTo
    {
        return $this->belongsTo(Bencana::class, 'id_bencana', 'id_bencana');
    }

    public function kelurahan(): BelongsTo
    {
        return $this->belongsTo(Kelurahan::class, 'id_kelurahan', 'id_kelurahan');
    }
}
