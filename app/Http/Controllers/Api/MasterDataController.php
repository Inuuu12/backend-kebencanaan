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
    public function boundaries(Request $request)
    {
        $levels = $request->query('level')
            ? array_filter(array_map('trim', explode(',', $request->query('level'))))
            : ['kabupaten', 'kecamatan'];

        $boundaries = $this->loadAdminBoundaries($levels);

        return response()->json([
            'success' => true,
            'data' => $boundaries
        ]);
    }

    private function loadAdminBoundaries(array $levels): array
    {
        ini_set('memory_limit', '512M');

        $zipPath = base_path('rencana/sumber/json admin wil.zip');

        if (!file_exists($zipPath) || !class_exists(\ZipArchive::class)) {
            return [];
        }

        $zip = new \ZipArchive();
        if ($zip->open($zipPath) !== true) {
            return [];
        }

        $sources = [
            [
                'file' => 'admin_kab.json',
                'level' => 'kabupaten',
                'id_key' => 'CKAB',
                'name_key' => 'NKAB',
            ],
            [
                'file' => 'admin_kec.json',
                'level' => 'kecamatan',
                'id_key' => 'CKEC',
                'name_key' => 'NKEC',
            ],
            [
                'file' => 'admin_kel.json',
                'level' => 'kelurahan',
                'id_key' => 'CKEL',
                'name_key' => 'NKEL',
                'parent_key' => 'NKEC',
            ],
        ];

        $boundaries = [];

        foreach ($sources as $source) {
            if (!in_array($source['level'], $levels, true)) {
                continue;
            }

            $contents = $zip->getFromName($source['file']);
            if ($contents === false) {
                continue;
            }

            $collection = json_decode($contents, true);
            if (!is_array($collection) || !isset($collection['features']) || !is_array($collection['features'])) {
                continue;
            }

            foreach ($collection['features'] as $feature) {
                $properties = $feature['properties'] ?? [];
                $id = $properties[$source['id_key']] ?? count($boundaries) + 1;
                $name = $properties[$source['name_key']] ?? $source['level'];
                $parentName = isset($source['parent_key']) ? ($properties[$source['parent_key']] ?? null) : null;

                $boundaries[] = [
                    'id' => $source['level'] . '-' . $id,
                    'level' => $source['level'],
                    'name' => $name,
                    'parent_name' => $parentName,
                    'properties' => $properties,
                    'geojson' => $feature,
                ];
            }
        }

        $zip->close();

        return $boundaries;
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
