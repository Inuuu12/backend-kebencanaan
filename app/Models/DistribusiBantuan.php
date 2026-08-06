<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DistribusiBantuan extends Model
{
    protected $table = 'app_distribusi_bantuan';
    protected $primaryKey = 'id_distribusi';

    protected $fillable = [
        'id_laporan',
        'id_kelurahan',
        'id_stok',
        'jumlah',
        'satuan',
        'tanggal_kirim',
        'tanggal_terima',
        'status',
        'penerima',
        'keterangan',
        'dikirim_oleh',
    ];

    protected $casts = [
        'jumlah' => 'integer',
        'tanggal_kirim' => 'date',
        'tanggal_terima' => 'date',
    ];

    public function laporanBencana(): BelongsTo
    {
        return $this->belongsTo(LaporanBencana::class, 'id_laporan', 'id_laporan');
    }

    public function kelurahan(): BelongsTo
    {
        return $this->belongsTo(Kelurahan::class, 'id_kelurahan', 'id_kelurahan');
    }

    public function stokBantuan(): BelongsTo
    {
        return $this->belongsTo(StokBantuan::class, 'id_stok', 'id_stok');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dikirim_oleh', 'id_user');
    }
}
