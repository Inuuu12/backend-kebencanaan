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
            'title'             => 'required|string|max:255',
            'type'              => 'required|string',
            'description'       => 'required|string',
            'location_name'     => 'nullable|string',
            'latitude'          => 'nullable|numeric',
            'longitude'         => 'nullable|numeric',
            // Flutter mengirim foto sebagai array field 'images[]' (maks 3 file)
            'images'            => 'nullable|array|max:3',
            'images.*'          => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
            'korban_meninggal'  => 'nullable|integer',
            'korban_luka_berat' => 'nullable|integer',
            'korban_luka_ringan'=> 'nullable|integer',
            'korban_hilang'     => 'nullable|integer',
            'jumlah_pengungsi'  => 'nullable|integer',
            'kerusakan_fisik'   => 'nullable|string',
            'tingkat_kerusakan' => 'nullable|string',
            'kebutuhan_logistik'=> 'nullable|string',
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
        // Route sudah diproteksi auth:sanctum, $request->user() dijamin tidak null
        $userId = $request->user()->id_user;

        // Handle image upload dari Flutter (field 'images[]', maks 3 file)
        // CATATAN: Kolom foto_laporan di DB (VARCHAR cast JSON) menyimpan array URL
        // sehingga semua foto fisik tersimpan, namun Flutter ReportModel hanya
        // membaca 1 URL via image_url (elemen pertama) karena field imageUrl tunggal.
        $imageUrls = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('reports', 'public');
                $imageUrls[] = url('storage/' . $path);
            }
        }

        $totalKorban = (int)($request->korban_meninggal ?? 0) + (int)($request->korban_luka_berat ?? 0) + (int)($request->korban_luka_ringan ?? 0) + (int)($request->korban_hilang ?? 0);

        $laporan = LaporanBencana::create([
            'id_user' => $userId,
            'id_bencana' => $bencana->id_bencana,
            'id_kecamatan' => $idKecamatan,
            'id_kelurahan' => $idKelurahan,
            'judul' => $request->title,
            'deskripsi' => $request->description,
            'jumlah_korban' => $totalKorban,
            'latitude' => $request->latitude ?? 0.0,
            'longitude' => $request->longitude ?? 0.0,
            'alamat_detail' => $request->location_name ?? 'Lokasi Warga',
            'foto_laporan' => empty($imageUrls) ? null : $imageUrls,
            'kebutuhan_logistik' => $request->kebutuhan_logistik,
            'status' => 'Pending',
        ]);

        // Save structured victim records to app_korban
        if ($totalKorban > 0 || $request->has('victim_deaths')) {
            \App\Models\Korban::create([
                'id_laporan' => $laporan->id_laporan,
                'id_kelurahan' => $idKelurahan,
                'jumlah_meninggal' => $victimDeaths,
                'jumlah_luka_berat' => $victimInjured,
                'jumlah_luka_ringan' => 0,
                'jumlah_mengungsi' => 0,
                'jumlah_hilang' => $victimMissing,
                'keterangan' => 'Laporan awal warga dari SIGAB Mobile',
            ]);
        }

        // Save structured damage records to app_dampak_kerusakan
        $damageFields = [
            'Rumah' => $request->input('house_damage'),
            'Jalan' => $request->input('road_damage'),
            'Jembatan' => $request->input('bridge_damage'),
            'Fasilitas Umum' => $request->input('public_facility_damage'),
        ];

        foreach ($damageFields as $jenis => $tingkat) {
            if (!empty($tingkat) && $tingkat !== 'Tidak Ada') {
                \App\Models\DampakKerusakan::create([
                    'id_laporan' => $laporan->id_laporan,
                    'id_kelurahan' => $idKelurahan,
                    'dicatat_oleh' => $userId,
                    'jenis_kerusakan' => $jenis,
                    'tingkat_kerusakan' => $tingkat,
                    'jumlah_unit' => 1,
                    'estimasi_kerugian' => 0,
                    'deskripsi' => "Dampak kerusakan $jenis kategori $tingkat",
                    'foto_url' => $imageUrl,
                ]);
            }
        }

        // Add initial handling history
        Penanganan::create([
            'id_laporan' => $laporan->id_laporan,
            'catatan' => 'Laporan berhasil diterima oleh sistem SIGAB.',
            'status_baru' => 'Pending',
            'updated_by' => $userId,
        ]);

        // Insert to app_korban if there is data
        if ($totalKorban > 0 || (int)($request->jumlah_pengungsi ?? 0) > 0) {
            \App\Models\Korban::create([
                'id_laporan' => $laporan->id_laporan,
                'id_kelurahan' => $idKelurahan,
                'jumlah_meninggal' => $request->korban_meninggal ?? 0,
                'jumlah_luka_berat' => $request->korban_luka_berat ?? 0,
                'jumlah_luka_ringan' => $request->korban_luka_ringan ?? 0,
                'jumlah_hilang' => $request->korban_hilang ?? 0,
                'jumlah_mengungsi' => $request->jumlah_pengungsi ?? 0,
            ]);
        }

        // Insert to app_dampak_kerusakan if there is physical damage
        if ($request->kerusakan_fisik) {
            \App\Models\DampakKerusakan::create([
                'id_laporan' => $laporan->id_laporan,
                'id_kelurahan' => $idKelurahan,
                'dicatat_oleh' => $userId,
                'jenis_kerusakan' => 'Infrastruktur / Bangunan',
                'tingkat_kerusakan' => $request->tingkat_kerusakan ?? 'Tidak Diketahui',
                'deskripsi' => $request->kerusakan_fisik,
            ]);
        }

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
        // Route diproteksi auth:sanctum — filter id_user selalu diterapkan
        // sehingga user A tidak pernah bisa melihat laporan milik user B
        $userId = $request->user()->id_user;

        $reports = LaporanBencana::with(['bencana', 'penanganan'])
            ->where('id_user', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $reports->map(fn($item) => $this->transformReport($item))
        ]);
    }

    /**
     * Get all active disaster reports for interactive map markers
     */
    public function mapReports(Request $request)
    {
        $kecamatanId = $request->query('kecamatan_id');
        $kelurahanId = $request->query('kelurahan_id');
        $year = $request->query('year');
        $month = $request->query('month');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $idBencana = $request->query('id_bencana');

        $query = LaporanBencana::with(['user', 'bencana', 'kecamatan', 'kelurahan', 'penanganan', 'korban', 'dampakKerusakan'])
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->where('latitude', '!=', 0);

        if ($kecamatanId) {
            $query->where('id_kecamatan', $kecamatanId);
        }

        if ($kelurahanId) {
            $query->where('id_kelurahan', $kelurahanId);
        }

        if ($idBencana) {
            $query->where('id_bencana', $idBencana);
        }

        if ($startDate && $endDate) {
            $query->whereDate('created_at', '>=', $startDate)
                  ->whereDate('created_at', '<=', $endDate);
        } else {
            if ($year) {
                $query->whereYear('created_at', $year);
            }
            if ($month) {
                $query->whereMonth('created_at', $month);
            }
        }

        $reports = $query->orderBy('created_at', 'desc')->get();

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
            'kecamatan_name' => $laporan->kecamatan->nama_kecamatan ?? '',
            'kelurahan_name' => $laporan->kelurahan->nama_kelurahan ?? '',
            'latitude' => (float) $laporan->latitude,
            'longitude' => (float) $laporan->longitude,
            'status' => $laporan->status ?? 'Pending',
            'image_url' => is_array($laporan->foto_laporan) && count($laporan->foto_laporan) > 0 ? $laporan->foto_laporan[0] : (is_string($laporan->foto_laporan) ? $laporan->foto_laporan : null),
            'image_urls' => is_array($laporan->foto_laporan) ? $laporan->foto_laporan : (is_string($laporan->foto_laporan) && !empty($laporan->foto_laporan) ? [$laporan->foto_laporan] : []),
            'kebutuhan_logistik' => $laporan->kebutuhan_logistik,
            'report_date' => $laporan->created_at ? $laporan->created_at->toIso8601String() : now()->toIso8601String(),
            'status_history' => $statusHistory,
        ];
    }
}
