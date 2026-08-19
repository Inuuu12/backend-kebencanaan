<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notifikasi;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get user notifications
     *
     * Route diproteksi auth:sanctum — hanya mengembalikan notifikasi milik
     * pengguna yang sedang login. User A tidak dapat membaca notifikasi user B.
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id_user;

        $notifications = Notifikasi::where('id_user', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }
}
