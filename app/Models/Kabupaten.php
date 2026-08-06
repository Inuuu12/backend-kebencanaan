<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kabupaten extends Model
{
    protected $table = 'app_md_kabupaten';
    protected $primaryKey = 'id_kabupaten';

    protected $fillable = [
        'nama_kabupaten',
    ];

    public function kecamatan(): HasMany
    {
        return $this->hasMany(Kecamatan::class, 'id_kabupaten', 'id_kabupaten');
    }
}
