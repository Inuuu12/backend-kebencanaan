<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Berita;
use Illuminate\Http\Request;

class NewsController extends Controller
{
    /**
     * Get list of disaster news & bulletins
     */
    public function index()
    {
        $news = Berita::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $news->map(fn($item) => $this->transformNews($item))
        ]);
    }

    /**
     * Get detail of a specific news bulletin
     */
    public function show($id)
    {
        $item = Berita::find($id);

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Berita tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->transformNews($item)
        ]);
    }

    /**
     * Transform Berita Eloquent model to Flutter NewsModel JSON format
     */
    private function transformNews(Berita $berita): array
    {
        return [
            'id' => (string) $berita->id_berita,
            'title' => $berita->judul,
            'category' => 'Bencana',
            'description' => $berita->isi,
            'image_url' => $berita->gambar ?? '',
            'author' => $berita->sumber ?? 'Pusdalops BPBD',
            'published_at' => $berita->created_at ? $berita->created_at->toIso8601String() : now()->toIso8601String(),
        ];
    }

    /**
     * Create a new news/bulletin
     */
    public function store(Request $request)
    {
        if ($request->user() && $request->user()->role !== 'superadmin') {
            return response()->json(['success' => false, 'message' => 'Akses ditolak. Hanya Superadmin yang dapat membuat berita.'], 403);
        }

        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'isi' => 'required|string',
            'gambar' => 'nullable|string',
            'sumber' => 'nullable|string|max:255'
        ]);

        $berita = Berita::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Berita berhasil ditambahkan.',
            'data' => $this->transformNews($berita)
        ]);
    }

    /**
     * Scrape news from a URL using Open Graph meta tags
     */
    public function scrape(Request $request)
    {
        if ($request->user() && $request->user()->role !== 'superadmin') {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $request->validate(['url' => 'required|url']);
        
        try {
            $response = \Illuminate\Support\Facades\Http::timeout(10)->withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            ])->get($request->url);
            
            $html = $response->body();
            
            // Extract using regex for robustness against broken HTML
            preg_match('/<meta\s+(?:name|property)="og:title"\s+content="([^"]+)"/i', $html, $ogTitle);
            preg_match('/<title>([^<]+)<\/title>/i', $html, $title);
            
            preg_match('/<meta\s+(?:name|property)="og:description"\s+content="([^"]+)"/i', $html, $ogDesc);
            preg_match('/<meta\s+name="description"\s+content="([^"]+)"/i', $html, $desc);
            
            preg_match('/<meta\s+(?:name|property)="og:image"\s+content="([^"]+)"/i', $html, $ogImage);
            
            $finalTitle = $ogTitle[1] ?? $title[1] ?? '';
            $finalDesc = $ogDesc[1] ?? $desc[1] ?? '';
            $finalImage = $ogImage[1] ?? '';

            // Clean up entities
            $finalTitle = html_entity_decode($finalTitle, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $finalDesc = html_entity_decode($finalDesc, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            
            return response()->json([
                'success' => true,
                'data' => [
                    'title' => trim($finalTitle),
                    'description' => trim($finalDesc),
                    'image_url' => trim($finalImage),
                    'source' => parse_url($request->url, PHP_URL_HOST) ?? 'Internet'
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menarik data dari URL tersebut. Pastikan URL valid dan dapat diakses.'
            ], 500);
        }
    }
}
