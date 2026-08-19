<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Kabupaten;
use App\Models\Kecamatan;
use App\Models\Kelurahan;
use App\Models\Berita;
use App\Models\DaerahRawan;
use App\Models\Bencana;

class RegionalAndSupportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Seed Kabupaten
        $jakpus = Kabupaten::create(['nama_kabupaten' => 'Jakarta Pusat']);
        $jaksel = Kabupaten::create(['nama_kabupaten' => 'Jakarta Selatan']);
        $jaktim = Kabupaten::create(['nama_kabupaten' => 'Jakarta Timur']);

        // 2. Seed Kecamatan
        $menteng = Kecamatan::create([
            'id_kabupaten' => $jakpus->id_kabupaten,
            'nama_kecamatan' => 'Menteng'
        ]);
        $tanahAbang = Kecamatan::create([
            'id_kabupaten' => $jakpus->id_kabupaten,
            'nama_kecamatan' => 'Tanah Abang'
        ]);
        $tebet = Kecamatan::create([
            'id_kabupaten' => $jaksel->id_kabupaten,
            'nama_kecamatan' => 'Tebet'
        ]);
        $cilandak = Kecamatan::create([
            'id_kabupaten' => $jaksel->id_kabupaten,
            'nama_kecamatan' => 'Cilandak'
        ]);
        $jatinegara = Kecamatan::create([
            'id_kabupaten' => $jaktim->id_kabupaten,
            'nama_kecamatan' => 'Jatinegara'
        ]);

        // 3. Seed Kelurahan
        $kelMenteng = Kelurahan::create([
            'id_kecamatan' => $menteng->id_kecamatan,
            'nama_kelurahan' => 'Menteng'
        ]);
        $kelPegangsaan = Kelurahan::create([
            'id_kecamatan' => $menteng->id_kecamatan,
            'nama_kelurahan' => 'Pegangsaan'
        ]);
        $kelKampungBali = Kelurahan::create([
            'id_kecamatan' => $tanahAbang->id_kecamatan,
            'nama_kelurahan' => 'Kampung Bali'
        ]);
        $kelTebetBarat = Kelurahan::create([
            'id_kecamatan' => $tebet->id_kecamatan,
            'nama_kelurahan' => 'Tebet Barat'
        ]);
        $kelTebetTimur = Kelurahan::create([
            'id_kecamatan' => $tebet->id_kecamatan,
            'nama_kelurahan' => 'Tebet Timur'
        ]);
        $kelCilandakBarat = Kelurahan::create([
            'id_kecamatan' => $cilandak->id_kecamatan,
            'nama_kelurahan' => 'Cilandak Barat'
        ]);
        $kelKampungMelayu = Kelurahan::create([
            'id_kecamatan' => $jatinegara->id_kecamatan,
            'nama_kelurahan' => 'Kampung Melayu'
        ]);

        // 4. Seed Berita / News Bulletins
        Berita::create([
            'judul' => 'Waspada Banjir Kiriman di Bantaran Sungai Ciliwung Malam Ini',
            'isi' => 'Badan Penanggulangan Bencana Daerah (BPBD) DKI Jakarta mengimbau warga di sepanjang bantaran Sungai Ciliwung untuk waspada terhadap potensi banjir kiriman. Hal ini menyusul kenaikan status Bendung Katulampa Bogor menjadi Siaga 2 sore tadi akibat hujan deras yang mengguyur wilayah hulu.',
            'gambar' => 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
            'sumber' => 'Pusdalops BPBD DKI'
        ]);

        Berita::create([
            'judul' => 'Sosialisasi Simulasi Evakuasi Gempa Bumi di Kecamatan Tebet',
            'isi' => 'Pemerintah Kota Jakarta Selatan bersama tim pemadam kebakaran dan relawan SIGAB menyelenggarakan simulasi evakuasi mandiri gempa bumi bagi warga Kecamatan Tebet. Kegiatan ini bertujuan meningkatkan kesiapsiagaan masyarakat menghadapi bencana megathrust.',
            'gambar' => 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
            'sumber' => 'Sudin Damkar Jaksel'
        ]);

        Berita::create([
            'judul' => 'Kebakaran Lahan Kosong di Jatinegara Berhasil Dipadamkan',
            'isi' => 'Petugas pemadam kebakaran berhasil menjinakkan kobaran api yang melahap lahan kosong di kawasan Jatinegara Timur siang tadi. Tidak ada korban jiwa dalam peristiwa ini, diduga kebakaran dipicu oleh pembakaran sampah ilegal di tengah cuaca panas ekstrem.',
            'gambar' => 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
            'sumber' => 'Damkar Jaktim'
        ]);

        // 5. Seed Daerah Rawan (Prone Areas)
        // Get Bencana ID for Banjir (normally 1)
        $banjir = Bencana::where('nama_bencana', 'Banjir')->first();
        $idBanjir = $banjir ? $banjir->id_bencana : 1;

        $kebakaran = Bencana::where('nama_bencana', 'Kebakaran')->first();
        $idKebakaran = $kebakaran ? $kebakaran->id_bencana : 4;

        DaerahRawan::create([
            'id_kelurahan' => $kelKampungMelayu->id_kelurahan,
            'id_bencana' => $idBanjir,
            'zona' => 'MERAH',
            'keterangan' => 'Daerah langganan banjir luapan Sungai Ciliwung, waspada luapan tinggi saat musim hujan.',
            'latitude' => -6.2244,
            'longitude' => 106.8622,
            'radius_meter' => 300,
            'is_active' => true
        ]);

        DaerahRawan::create([
            'id_kelurahan' => $kelMenteng->id_kelurahan,
            'id_bencana' => $idBanjir,
            'zona' => 'KUNING',
            'keterangan' => 'Potensi genangan air 30-50 cm saat curah hujan ekstrem lokal tinggi.',
            'latitude' => -6.1950,
            'longitude' => 106.8250,
            'radius_meter' => 500,
            'is_active' => true
        ]);

        DaerahRawan::create([
            'id_kelurahan' => $kelKampungBali->id_kelurahan,
            'id_bencana' => $idKebakaran,
            'zona' => 'MERAH',
            'keterangan' => 'Kawasan padat penduduk dengan kerawanan tinggi kebakaran korsleting listrik.',
            'latitude' => -6.1895,
            'longitude' => 106.8185,
            'radius_meter' => 250,
            'is_active' => true
        ]);
    }
}
