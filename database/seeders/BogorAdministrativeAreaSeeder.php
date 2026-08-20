<?php

namespace Database\Seeders;

use App\Models\Kabupaten;
use App\Models\Kecamatan;
use App\Models\Kelurahan;
use Illuminate\Database\Seeder;

class BogorAdministrativeAreaSeeder extends Seeder
{
    public function run(): void
    {
        $zipPath = base_path('database/data/json admin wil.zip');

        if (!file_exists($zipPath)) {
            $this->command?->error("File sumber wilayah tidak ditemukan: {$zipPath}");
            return;
        }

        $zip = new \ZipArchive();
        if ($zip->open($zipPath) !== true) {
            $this->command?->error("Gagal membuka file sumber wilayah: {$zipPath}");
            return;
        }

        $kabupaten = Kabupaten::updateOrCreate(
            ['nama_kabupaten' => 'Bogor'],
            ['nama_kabupaten' => 'Bogor']
        );

        $kecamatanMap = $this->seedKecamatan($zip, $kabupaten);
        $this->seedKelurahan($zip, $kecamatanMap);

        $zip->close();

        $this->command?->info('Master wilayah Kabupaten Bogor berhasil disinkronkan.');
        $this->command?->info('Kecamatan: ' . Kecamatan::where('id_kabupaten', $kabupaten->id_kabupaten)->count());
        $this->command?->info('Desa/Kelurahan: ' . Kelurahan::whereIn('id_kecamatan', $kecamatanMap->values())->count());
    }

    private function seedKecamatan(\ZipArchive $zip, Kabupaten $kabupaten)
    {
        $collection = $this->readFeatureCollection($zip, 'admin_kec.json');
        $kecamatanMap = collect();

        foreach ($collection['features'] ?? [] as $feature) {
            $name = $this->formatName($feature['properties']['NKEC'] ?? null);
            if (!$name) {
                continue;
            }

            $kecamatan = Kecamatan::updateOrCreate(
                [
                    'id_kabupaten' => $kabupaten->id_kabupaten,
                    'nama_kecamatan' => $name,
                ],
                [
                    'id_kabupaten' => $kabupaten->id_kabupaten,
                    'nama_kecamatan' => $name,
                ]
            );

            $kecamatanMap->put($this->normalizeName($name), $kecamatan->id_kecamatan);
        }

        return $kecamatanMap;
    }

    private function seedKelurahan(\ZipArchive $zip, $kecamatanMap): void
    {
        $collection = $this->readFeatureCollection($zip, 'admin_kel.json');

        foreach ($collection['features'] ?? [] as $feature) {
            $kecamatanName = $this->formatName($feature['properties']['NKEC'] ?? null);
            $kelurahanName = $this->formatName($feature['properties']['NKEL'] ?? null);
            $kecamatanId = $kecamatanMap->get($this->normalizeName($kecamatanName));

            if (!$kecamatanId || !$kelurahanName) {
                continue;
            }

            Kelurahan::updateOrCreate(
                [
                    'id_kecamatan' => $kecamatanId,
                    'nama_kelurahan' => $kelurahanName,
                ],
                [
                    'id_kecamatan' => $kecamatanId,
                    'nama_kelurahan' => $kelurahanName,
                ]
            );
        }
    }

    private function readFeatureCollection(\ZipArchive $zip, string $file): array
    {
        $contents = $zip->getFromName($file);
        if ($contents === false) {
            return [];
        }

        $decoded = json_decode($contents, true);
        return is_array($decoded) ? $decoded : [];
    }

    private function formatName(?string $name): ?string
    {
        $name = trim((string) $name);
        if ($name === '') {
            return null;
        }

        return mb_convert_case(mb_strtolower($name), MB_CASE_TITLE, 'UTF-8');
    }

    private function normalizeName(?string $name): string
    {
        return preg_replace('/[^a-z0-9]+/', '', mb_strtolower((string) $name));
    }
}
