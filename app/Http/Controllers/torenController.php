<?php

namespace App\Http\Controllers;

use App\Models\Toren;
use Illuminate\Http\Request;

class TorenController extends Controller
{
    public function index()
    {
        $torens = Toren::all();
        return response()->json($torens->append(['persentase_air', 'status_warna']));

    }
}