<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\Hasfactory;
use Illuminate\Database\Eloquent\Model;

class torenCotroller extends Model
{
 use  Hasfactory;
 protected $fillable = [
     'nama_daerah',
     'lokasi',
     'kapasitas_maksimal',
     'volume_air',
 ];
}
