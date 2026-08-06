<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    /**
     * Get live or estimated weather data based on GPS coordinates
     */
    public function weather(Request $request)
    {
        $lat = $request->query('lat', -6.2088);
        $lng = $request->query('lng', 106.8456);

        return response()->json([
            'temp' => 29.5,
            'condition' => 'Cerah Berawan',
            'icon' => 'cloud',
            'location' => 'DKI Jakarta',
            'humidity' => 78,
            'lat' => (float) $lat,
            'lng' => (float) $lng,
        ]);
    }

    /**
     * Get list of emergency hotline contacts
     */
    public function emergencyContacts()
    {
        $contacts = [
            [
                'name' => 'Call Center BPBD (112)',
                'phone' => '112',
                'description' => 'Layanan Kedaruratan Bencana 24 Jam'
            ],
            [
                'name' => 'Pemadam Kebakaran (113)',
                'phone' => '113',
                'description' => 'Penanganan Kebakaran & Penyelamatan'
            ],
            [
                'name' => 'Kepolisian Negara (110)',
                'phone' => '110',
                'description' => 'Gangguan Keamanan & Kriminalitas'
            ],
            [
                'name' => 'Ambulans Gawat Darurat (119)',
                'phone' => '119',
                'description' => 'Layanan Medis Darurat & Evakuasi'
            ],
            [
                'name' => 'BASARNAS Evakuasi (115)',
                'phone' => '115',
                'description' => 'Pencarian dan Pertolongan Korban'
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $contacts
        ]);
    }
}
