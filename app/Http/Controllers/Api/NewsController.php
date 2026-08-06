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
}
