<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\torenController;

Route::get('/',function () {
    return view ('welcome');

});

Route::resource('toren',torenController::class);