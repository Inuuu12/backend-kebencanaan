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
        $user = $request->user();
        $isKecamatan = $user && $user->role === 'kecamatan';
        $isKelurahan = $user && $user->role === 'kelurahan';

        $query = LaporanBencana::query();
        if ($isKecamatan) {
            $query->where('id_kecamatan', $user->id_kecamatan);
        } elseif ($isKelurahan) {
            $query->where('id_kelurahan', $user->id_kelurahan);
        }

        // Calculate Summary
        $total = (clone $query)->count();
        $pending = (clone $query)->whereIn('status', ['Pending', 'MENUNGGU'])->count();
        $handling = (clone $query)->whereIn('status', ['Penanganan', 'Proses'])->count();
        $resolved = (clone $query)->whereIn('status', ['Selesai'])->count();

        // Calculate Stats by type
        $statsRaw = (clone $query)->with('bencana')
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

        // Calculate Regional Stats for dynamic charts
        $regionalStatsRaw = (clone $query)->with(['kecamatan', 'kelurahan', 'korban', 'dampakKerusakan'])->get();
        $regionalStats = [];

        foreach ($regionalStatsRaw as $lap) {
            // Group by kecamatan if user is kabupaten/superadmin, otherwise by kelurahan
            if (!$isKecamatan && !$isKelurahan) {
                $regionName = $lap->kecamatan ? $lap->kecamatan->nama_kecamatan : 'Tidak Diketahui';
            } else {
                $regionName = $lap->kelurahan ? ($lap->kelurahan->nama_kelurahan ?? $lap->kelurahan->nama_desa) : 'Tidak Diketahui';
            }

            if (!isset($regionalStats[$regionName])) {
                $regionalStats[$regionName] = [
                    'nama_wilayah' => $regionName,
                    'total_kejadian' => 0,
                    'korban_meninggal' => 0,
                    'korban_luka' => 0,
                    'korban_mengungsi' => 0,
                    'unit_rusak' => 0,
                    'estimasi_kerugian' => 0,
                ];
            }
            
            $regionalStats[$regionName]['total_kejadian']++;
            
            foreach ($lap->korban as $korban) {
                $regionalStats[$regionName]['korban_meninggal'] += $korban->jumlah_meninggal;
                $regionalStats[$regionName]['korban_luka'] += ($korban->jumlah_luka_berat + $korban->jumlah_luka_ringan);
                $regionalStats[$regionName]['korban_mengungsi'] += $korban->jumlah_mengungsi;
            }
            
            foreach ($lap->dampakKerusakan as $dampak) {
                $regionalStats[$regionName]['unit_rusak'] += $dampak->jumlah_unit;
                $regionalStats[$regionName]['estimasi_kerugian'] += $dampak->estimasi_kerugian;
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
                'stats' => $stats,
                'regionalStats' => array_values($regionalStats)
            ]
        ]);
    }
}
