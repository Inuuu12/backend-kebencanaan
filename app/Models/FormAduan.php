<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormAduan extends Model
{
    protected $table = 'app_md_formaduan';
    protected $primaryKey = 'id_formaduan';

    protected $fillable = [
        'nama_bencana',
        'latitude',
        'longitude',
        'foto_laporan',
        'jumlah_korban',
        'status',
        'deskripsi',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'jumlah_korban' => 'integer',
    ];
}
