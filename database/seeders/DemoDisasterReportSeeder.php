<?php

namespace Database\Seeders;

use App\Models\Bencana;
use App\Models\Kecamatan;
use App\Models\Kelurahan;
use App\Models\LaporanBencana;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DemoDisasterReportSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $user = User::firstOrCreate(
                ['email' => 'demo.laporan@example.com'],
                [
                    'nama' => 'Demo Pelapor SIGAB',
                    'password' => Hash::make('password'),
                    'no_telp' => '081200000000',
                    'role' => 'USER',
                    'is_active' => true,
                ]
            );

            $reports = [
                ['title' => 'Aduan Banjir Desa Bojonggede', 'type' => 'Banjir', 'district' => 'Bojonggede', 'village' => 'Bojonggede', 'lat' => -6.49390000, 'lng' => 106.79690000, 'status' => 'Pending', 'victims' => 2, 'days_ago' => 1, 'address' => 'RW 04 Desa Bojonggede, Kecamatan Bojonggede', 'description' => 'Warga melaporkan genangan air masuk ke halaman rumah setelah hujan deras.', 'logistics' => 'Pompa air portable, karung pasir, makanan siap saji'],
                ['title' => 'Aduan Angin Kencang Desa Rawa Panjang', 'type' => 'Angin Puting Beliung', 'district' => 'Bojonggede', 'village' => 'Rawa Panjang', 'lat' => -6.47280000, 'lng' => 106.80910000, 'status' => 'Handling', 'victims' => 0, 'days_ago' => 2, 'address' => 'Jalan utama Desa Rawa Panjang, Kecamatan Bojonggede', 'description' => 'Pohon tumbang menutup sebagian jalan dan dilaporkan oleh warga sekitar.', 'logistics' => 'Gergaji mesin, armada angkut, rompi petugas'],
                ['title' => 'Aduan Longsor Desa Bojong Baru', 'type' => 'Tanah Longsor', 'district' => 'Bojonggede', 'village' => 'Bojong Baru', 'lat' => -6.48960000, 'lng' => 106.81240000, 'status' => 'Handling', 'victims' => 1, 'days_ago' => 3, 'address' => 'Lingkungan RT 02 Desa Bojong Baru, Kecamatan Bojonggede', 'description' => 'Tebing kecil di belakang rumah warga longsor dan butuh pengamanan sementara.', 'logistics' => 'Terpal, bronjong sementara, alat evakuasi ringan'],
                ['title' => 'Aduan Kebakaran Desa Cimanggis', 'type' => 'Kebakaran', 'district' => 'Bojonggede', 'village' => 'Cimanggis', 'lat' => -6.50070000, 'lng' => 106.77980000, 'status' => 'Selesai', 'victims' => 0, 'days_ago' => 4, 'address' => 'Kios warga Desa Cimanggis, Kecamatan Bojonggede', 'description' => 'Api dari instalasi listrik kios berhasil dipadamkan, pendataan kerusakan masih dilakukan.', 'logistics' => 'APAR, selimut, bantuan kebersihan'],
                ['title' => 'Aduan Banjir Desa Kedung Waringin', 'type' => 'Banjir', 'district' => 'Bojonggede', 'village' => 'Kedung Waringin', 'lat' => -6.48240000, 'lng' => 106.78870000, 'status' => 'Pending', 'victims' => 0, 'days_ago' => 5, 'address' => 'Gang permukiman Desa Kedung Waringin, Kecamatan Bojonggede', 'description' => 'Drainase meluap dan menggenangi akses warga.', 'logistics' => 'Pembersihan drainase, pompa air'],
                ['title' => 'Aduan Retakan Tanah Desa Pabuaran', 'type' => 'Tanah Longsor', 'district' => 'Bojonggede', 'village' => 'Pabuaran', 'lat' => -6.46690000, 'lng' => 106.82130000, 'status' => 'Handling', 'victims' => 0, 'days_ago' => 6, 'address' => 'Lereng permukiman Desa Pabuaran, Kecamatan Bojonggede', 'description' => 'Warga menemukan retakan tanah di dekat saluran air dan meminta asesmen lapangan.', 'logistics' => 'Rambu darurat, karung pasir, alat ukur lapangan'],
                ['title' => 'Aduan Atap Rusak Desa Raga Jaya', 'type' => 'Angin Puting Beliung', 'district' => 'Bojonggede', 'village' => 'Raga Jaya', 'lat' => -6.45580000, 'lng' => 106.79720000, 'status' => 'Pending', 'victims' => 1, 'days_ago' => 7, 'address' => 'Perumahan warga Desa Raga Jaya, Kecamatan Bojonggede', 'description' => 'Angin kencang merusak beberapa atap rumah warga.', 'logistics' => 'Terpal, paku, reng kayu, paket keluarga'],
                ['title' => 'Aduan Kebakaran Lahan Desa Susukan', 'type' => 'Kebakaran', 'district' => 'Bojonggede', 'village' => 'Susukan', 'lat' => -6.50870000, 'lng' => 106.80390000, 'status' => 'Selesai', 'victims' => 0, 'days_ago' => 8, 'address' => 'Lahan kosong Desa Susukan, Kecamatan Bojonggede', 'description' => 'Kebakaran lahan kering berhasil dipadamkan dan area dipantau ulang.', 'logistics' => 'Tangki air, masker, alat pemadam ringan'],
                ['title' => 'Aduan Limpasan Air Desa Waringin Jaya', 'type' => 'Banjir', 'district' => 'Bojonggede', 'village' => 'Waringin Jaya', 'lat' => -6.47620000, 'lng' => 106.78610000, 'status' => 'Handling', 'victims' => 3, 'days_ago' => 9, 'address' => 'Bantaran saluran Desa Waringin Jaya, Kecamatan Bojonggede', 'description' => 'Limpasan air masuk ke halaman rumah warga dan membutuhkan pemantauan tinggi muka air.', 'logistics' => 'Makanan siap saji, selimut, perahu karet'],
                ['title' => 'Aduan Banjir Kelurahan Pakansari', 'type' => 'Banjir', 'district' => 'Cibinong', 'village' => 'Pakansari', 'lat' => -6.49710000, 'lng' => 106.83750000, 'status' => 'Pending', 'victims' => 1, 'days_ago' => 10, 'address' => 'Sekitar Pakansari, Kecamatan Cibinong', 'description' => 'Data pembanding untuk level kabupaten: banjir akibat limpasan drainase di Pakansari.', 'logistics' => 'Pembersihan drainase, pompa air'],
            ];

            $demoTitles = collect($reports)->pluck('title')->all();
            $existingDemoIds = LaporanBencana::where('id_user', $user->id_user)
                ->whereIn('judul', $demoTitles)
                ->pluck('id_laporan');

            DB::table('app_penanganan')
                ->whereIn('id_laporan', $existingDemoIds)
                ->where('catatan', 'Data dummy untuk demo integrasi admin dan landing page.')
                ->delete();

            DB::table('app_korban')
                ->whereIn('id_laporan', $existingDemoIds)
                ->delete();

            DB::table('app_dampak_kerusakan')
                ->whereIn('id_laporan', $existingDemoIds)
                ->delete();

            LaporanBencana::where('id_user', $user->id_user)
                ->whereNotIn('judul', $demoTitles)
                ->delete();

            foreach ($reports as $item) {
                $bencana = Bencana::firstOrCreate(
                    ['nama_bencana' => $item['type']],
                    ['deskripsi' => 'Data master ' . $item['type']]
                );

                $kecamatan = Kecamatan::where('nama_kecamatan', $item['district'])->first()
                    ?? Kecamatan::firstOrFail();

                $kelurahan = Kelurahan::where('id_kecamatan', $kecamatan->id_kecamatan)
                    ->where('nama_kelurahan', $item['village'])
                    ->first()
                    ?? Kelurahan::where('id_kecamatan', $kecamatan->id_kecamatan)->first()
                    ?? Kelurahan::firstOrFail();

                $timestamp = Carbon::now()->subDays($item['days_ago']);

                $laporan = LaporanBencana::updateOrCreate(
                    ['judul' => $item['title']],
                    [
                        'id_user' => $user->id_user,
                        'id_bencana' => $bencana->id_bencana,
                        'id_kecamatan' => $kecamatan->id_kecamatan,
                        'id_kelurahan' => $kelurahan->id_kelurahan,
                        'deskripsi' => $item['description'],
                        'jumlah_korban' => $item['victims'],
                        'latitude' => $item['lat'],
                        'longitude' => $item['lng'],
                        'alamat_detail' => $item['address'],
                        'foto_laporan' => null,
                        'kebutuhan_logistik' => $item['logistics'],
                        'status' => $item['status'],
                        'created_at' => $timestamp,
                        'updated_at' => $timestamp,
                    ]
                );

                $lukaBerat = $item['victims'] > 2 ? 1 : 0;
                $lukaRingan = max(0, $item['victims'] - $lukaBerat);
                DB::table('app_korban')->insert([
                    'id_laporan' => $laporan->id_laporan,
                    'id_kelurahan' => $kelurahan->id_kelurahan,
                    'jumlah_meninggal' => 0,
                    'jumlah_luka_berat' => $lukaBerat,
                    'jumlah_luka_ringan' => $lukaRingan,
                    'jumlah_mengungsi' => $item['type'] === 'Banjir' ? max(0, $item['victims'] * 2) : 0,
                    'jumlah_hilang' => 0,
                    'keterangan' => 'Data korban dummy untuk rekap wilayah.',
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ]);

                $damage = match ($item['type']) {
                    'Banjir' => ['jenis' => 'Rumah / akses lingkungan', 'tingkat' => 'Sedang', 'unit' => max(1, $item['victims'] + 1)],
                    'Tanah Longsor' => ['jenis' => 'Tebing / akses lingkungan', 'tingkat' => 'Sedang', 'unit' => 1],
                    'Kebakaran' => ['jenis' => str_contains($item['title'], 'Lahan') ? 'Lahan terdampak' : 'Bangunan warga', 'tingkat' => 'Berat', 'unit' => 1],
                    'Angin Puting Beliung' => ['jenis' => 'Atap rumah / fasilitas lingkungan', 'tingkat' => 'Ringan', 'unit' => 2],
                    default => ['jenis' => 'Infrastruktur / Bangunan', 'tingkat' => 'Ringan', 'unit' => 1],
                };

                DB::table('app_dampak_kerusakan')->insert([
                    'id_laporan' => $laporan->id_laporan,
                    'id_kelurahan' => $kelurahan->id_kelurahan,
                    'dicatat_oleh' => $user->id_user,
                    'jenis_kerusakan' => $damage['jenis'],
                    'tingkat_kerusakan' => $damage['tingkat'],
                    'jumlah_unit' => $damage['unit'],
                    'estimasi_kerugian' => 0,
                    'deskripsi' => $item['description'],
                    'foto_url' => null,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ]);
            }
        });

        $this->command?->info('10 data dummy aduan warga berhasil disinkronkan.');
    }
}
