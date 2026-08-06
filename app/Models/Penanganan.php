<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Penanganan extends Model
{
    protected $table = 'app_penanganan';
    protected $primaryKey = 'id_penanganan';

    protected $fillable = [
        'id_laporan',
        'catatan',
        'status_baru',
        'updated_by',
    ];

    public function laporanBencana(): BelongsTo
    {
        return $this->belongsTo(LaporanBencana::class, 'id_laporan', 'id_laporan');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by', 'id_user');
    }
}
