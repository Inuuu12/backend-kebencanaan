<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StokBantuan extends Model
{
    protected $table = 'app_stok_bantuan';
    protected $primaryKey = 'id_stok';

    protected $fillable = [
        'id_kategori',
        'tipe',
        'nama_item',
        'jumlah',
        'satuan',
        'tanggal',
        'sumber',
        'tujuan',
        'keterangan',
        'dicatat_oleh',
    ];

    protected $casts = [
        'jumlah' => 'integer',
        'tanggal' => 'date',
    ];

    public function kategoriStok(): BelongsTo
    {
        return $this->belongsTo(KategoriStok::class, 'id_kategori', 'id_kategori');
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dicatat_oleh', 'id_user');
    }

    public function distribusiBantuan(): HasMany
    {
        return $this->hasMany(DistribusiBantuan::class, 'id_stok', 'id_stok');
    }
}
