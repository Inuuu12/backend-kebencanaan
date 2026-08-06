<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KategoriStok extends Model
{
    protected $table = 'app_md_kategori_stok';
    protected $primaryKey = 'id_kategori';

    protected $fillable = [
        'nama_kategori',
        'satuan',
        'deskripsi',
    ];

    public function stokBantuan(): HasMany
    {
        return $this->hasMany(StokBantuan::class, 'id_kategori', 'id_kategori');
    }
}
