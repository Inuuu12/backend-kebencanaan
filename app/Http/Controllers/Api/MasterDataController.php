<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bencana;
use App\Models\Kabupaten;
use App\Models\Kecamatan;
use App\Models\Kelurahan;
use Illuminate\Http\Request;

class MasterDataController extends Controller
{
    /**
     * Get list of disaster types (Master Data)
     */
    public function bencana()
    {
        $bencana = Bencana::all();

        return response()->json([
            'success' => true,
            'data' => $bencana
        ]);
    }

    /**
     * Get GeoJSON boundaries / polygon coordinates for map
     */
    public function boundaries()
    {
        $boundaries = [
            [
                'id' => 'menteng_zone',
                'name' => 'Kecamatan Menteng (Zona Rawan)',
                'risk_level' => 'Sedang',
                'points' => [
                    ['lat' => -6.1950, 'lng' => 106.8250],
                    ['lat' => -6.1950, 'lng' => 106.8450],
                    ['lat' => -6.2100, 'lng' => 106.8450],
                    ['lat' => -6.2100, 'lng' => 106.8250],
                ]
            ],
            [
                'id' => 'ciliwung_riverbank',
                'name' => 'Bantaran Ciliwung (Banjir Waspada)',
                'risk_level' => 'Tinggi',
                'points' => [
                    ['lat' => -6.2150, 'lng' => 106.8550],
                    ['lat' => -6.2180, 'lng' => 106.8580],
                    ['lat' => -6.2250, 'lng' => 106.8620],
                    ['lat' => -6.2200, 'lng' => 106.8520],
                ]
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $boundaries
        ]);
    }

    /**
     * Get regencies list
     */
    public function kabupaten()
    {
        $kabupaten = Kabupaten::all();

        return response()->json([
            'success' => true,
            'data' => $kabupaten
        ]);
    }

    /**
     * Get districts list
     */
    public function kecamatan(Request $request)
    {
        $query = Kecamatan::query();
        if ($request->has('id_kabupaten')) {
            $query->where('id_kabupaten', $request->id_kabupaten);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get()
        ]);
    }

    /**
     * Get subdistricts list
     */
    public function kelurahan(Request $request)
    {
        $query = Kelurahan::query();
        if ($request->has('id_kecamatan')) {
            $query->where('id_kecamatan', $request->id_kecamatan);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get()
        ]);
    }
}
