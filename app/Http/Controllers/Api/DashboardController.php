<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LaporanBencana;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get dashboard summary and statistics
     */
    public function summary(Request $request)
    {
        // Calculate Summary
        $total = LaporanBencana::count();
        $pending = LaporanBencana::whereIn('status', ['Pending', 'MENUNGGU'])->count();
        $handling = LaporanBencana::whereIn('status', ['Penanganan', 'Proses'])->count();
        $resolved = LaporanBencana::whereIn('status', ['Selesai'])->count();

        // Calculate Stats by type
        // Group by id_bencana and get the count, then map to bencana name
        $statsRaw = LaporanBencana::with('bencana')
            ->selectRaw('id_bencana, count(*) as count')
            ->groupBy('id_bencana')
            ->get();

        $stats = [
            'banjir' => 0,
            'longsor' => 0,
            'kebakaran' => 0,
            'puting_beliung' => 0,
            'gempa' => 0,
            'lainnya' => 0,
        ];

        foreach ($statsRaw as $row) {
            $type = strtolower($row->bencana ? $row->bencana->nama_bencana : '');
            if (str_contains($type, 'banjir')) {
                $stats['banjir'] += $row->count;
            } elseif (str_contains($type, 'longsor')) {
                $stats['longsor'] += $row->count;
            } elseif (str_contains($type, 'kebakaran')) {
                $stats['kebakaran'] += $row->count;
            } elseif (str_contains($type, 'puting') || str_contains($type, 'angin')) {
                $stats['puting_beliung'] += $row->count;
            } elseif (str_contains($type, 'gempa')) {
                $stats['gempa'] += $row->count;
            } else {
                $stats['lainnya'] += $row->count;
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => [
                    'total' => $total,
                    'pending' => $pending,
                    'handling' => $handling,
                    'resolved' => $resolved,
                ],
                'stats' => $stats
            ]
        ]);
    }
}
