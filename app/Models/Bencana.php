<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bencana extends Model
{
    protected $table = 'app_md_bencana';
    protected $primaryKey = 'id_bencana';

    protected $fillable = [
        'nama_bencana',
        'deskripsi',
        'icon_url',
    ];

    public function laporanBencana(): HasMany
    {
        return $this->hasMany(LaporanBencana::class, 'id_bencana', 'id_bencana');
    }

    public function daerahRawan(): HasMany
    {
        return $this->hasMany(DaerahRawan::class, 'id_bencana', 'id_bencana');
    }

    public function prediksiBencana(): HasMany
    {
        return $this->hasMany(PrediksiBencana::class, 'id_bencana', 'id_bencana');
    }
}
