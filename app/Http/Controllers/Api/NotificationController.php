<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notifikasi;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get user notifications
     */
    public function index(Request $request)
    {
        $userId = $request->user() ? $request->user()->id_user : null;

        $query = Notifikasi::orderBy('created_at', 'desc');
        if ($userId) {
            $query->where('id_user', $userId);
        }

        $notifications = $query->get();

        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }
}
