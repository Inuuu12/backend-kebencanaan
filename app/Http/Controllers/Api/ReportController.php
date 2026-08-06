<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bencana;
use App\Models\Kecamatan;
use App\Models\Kelurahan;
use App\Models\LaporanBencana;
use App\Models\Penanganan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ReportController extends Controller
{
    /**
     * Submit disaster report from mobile app
     */
    public function submit(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'type' => 'required|string',
            'description' => 'required|string',
            'location_name' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi laporan gagal. ' . implode(' ', $validator->errors()->all()),
                'errors' => $validator->errors()
            ], 422);
        }

        // Match or fallback master bencana
        $bencana = Bencana::where('nama_bencana', 'LIKE', '%' . $request->type . '%')->first();
        if (!$bencana) {
            $bencana = Bencana::firstOrCreate([
                'nama_bencana' => $request->type
            ], [
                'deskripsi' => 'Bencana kategori ' . $request->type
            ]);
        }

        $idKecamatan = Kecamatan::value('id_kecamatan') ?? 1;
        $idKelurahan = Kelurahan::value('id_kelurahan') ?? 1;
        $userId = $request->user() ? $request->user()->id_user : 1;

        // Handle image upload if present
        $imageUrl = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('reports', 'public');
            $imageUrl = url('storage/' . $path);
        }

        $laporan = LaporanBencana::create([
            'id_user' => $userId,
            'id_bencana' => $bencana->id_bencana,
            'id_kecamatan' => $idKecamatan,
            'id_kelurahan' => $idKelurahan,
            'judul' => $request->title,
            'deskripsi' => $request->description,
            'jumlah_korban' => 0,
            'latitude' => $request->latitude ?? 0.0,
            'longitude' => $request->longitude ?? 0.0,
            'alamat_detail' => $request->location_name ?? 'Lokasi Warga',
            'foto_laporan' => $imageUrl,
            'status' => 'Pending',
        ]);

        // Add initial handling history
        Penanganan::create([
            'id_laporan' => $laporan->id_laporan,
            'catatan' => 'Laporan berhasil diterima oleh sistem SIGAB.',
            'status_baru' => 'Pending',
            'updated_by' => $userId,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Laporan bencana berhasil dikirim.',
            'data' => $this->transformReport($laporan->fresh(['bencana', 'penanganan']))
        ], 201);
    }

    /**
     * Get report history of the logged in user
     */
    public function myHistory(Request $request)
    {
        $userId = $request->user() ? $request->user()->id_user : null;

        $query = LaporanBencana::with(['bencana', 'penanganan']);
        if ($userId) {
            $query->where('id_user', $userId);
        }

        $reports = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $reports->map(fn($item) => $this->transformReport($item))
        ]);
    }

    /**
     * Get all active disaster reports for interactive map markers
     */
    public function mapReports()
    {
        $reports = LaporanBencana::with(['bencana', 'penanganan'])
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->where('latitude', '!=', 0)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $reports->map(fn($item) => $this->transformReport($item))
        ]);
    }

    /**
     * Get detail of single disaster report
     */
    public function show($id)
    {
        $laporan = LaporanBencana::with(['bencana', 'penanganan'])->find($id);

        if (!$laporan) {
            return response()->json([
                'success' => false,
                'message' => 'Laporan tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->transformReport($laporan)
        ]);
    }

    /**
     * Transform Eloquent model to Flutter ReportModel JSON
     */
    private function transformReport(LaporanBencana $laporan): array
    {
        $statusHistory = $laporan->penanganan->map(function ($item) {
            return [
                'status' => $item->status_baru,
                'note' => $item->catatan,
                'date' => $item->created_at ? $item->created_at->toIso8601String() : now()->toIso8601String(),
            ];
        })->toArray();

        // Fallback default initial status history if empty
        if (empty($statusHistory)) {
            $statusHistory = [[
                'status' => $laporan->status ?? 'Pending',
                'note' => 'Laporan diterima oleh sistem SIGAB.',
                'date' => $laporan->created_at ? $laporan->created_at->toIso8601String() : now()->toIso8601String(),
            ]];
        }

        return [
            'id' => (string) $laporan->id_laporan,
            'title' => $laporan->judul,
            'type' => $laporan->bencana ? $laporan->bencana->nama_bencana : 'Bencana Alam',
            'description' => $laporan->deskripsi,
            'location_name' => $laporan->alamat_detail ?? '',
            'latitude' => (float) $laporan->latitude,
            'longitude' => (float) $laporan->longitude,
            'status' => $laporan->status ?? 'Pending',
            'image_url' => $laporan->foto_laporan,
            'report_date' => $laporan->created_at ? $laporan->created_at->toIso8601String() : now()->toIso8601String(),
            'status_history' => $statusHistory,
        ];
    }
}
