<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Berita extends Model
{
    protected $table = 'app_berita';
    protected $primaryKey = 'id_berita';

    protected $fillable = [
        'judul',
        'isi',
        'gambar',
        'sumber',
        'url_tautan',
        'author',
        'publisher'
    ];
}
