<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Berita;
use Illuminate\Http\Request;

class BeritaController extends Controller
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
            'author' => $berita->author ?? '',
            'publisher' => $berita->publisher ?? ($berita->sumber ?? 'Pusdalops BPBD'),
            'source_name' => $berita->sumber ?? 'Pusdalops BPBD',
            'url_tautan' => $berita->url_tautan ?? '',
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
            'gambar' => 'nullable', // Can be string URL or file
            'sumber' => 'nullable|string|max:255',
            'url_tautan' => 'nullable|url|max:500',
            'author' => 'nullable|string|max:255',
            'publisher' => 'nullable|string|max:255'
        ]);

        if ($request->hasFile('gambar')) {
            $path = $request->file('gambar')->store('berita', 'public');
            $validated['gambar'] = url('storage/' . $path);
        }

        $berita = Berita::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Berita berhasil ditambahkan.',
            'data' => $this->transformNews($berita)
        ]);
    }

    /**
     * Update an existing news/bulletin
     */
    public function update(Request $request, $id)
    {
        if ($request->user() && $request->user()->role !== 'superadmin') {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $berita = Berita::find($id);
        if (!$berita) {
            return response()->json(['success' => false, 'message' => 'Berita tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'isi' => 'required|string',
            'gambar' => 'nullable', // Can be string URL or file
            'sumber' => 'nullable|string|max:255',
            'url_tautan' => 'nullable|url|max:500',
            'author' => 'nullable|string|max:255',
            'publisher' => 'nullable|string|max:255'
        ]);

        if ($request->hasFile('gambar')) {
            $path = $request->file('gambar')->store('berita', 'public');
            $validated['gambar'] = url('storage/' . $path);
        }

        $berita->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Berita berhasil diperbarui.',
            'data' => $this->transformNews($berita)
        ]);
    }

    /**
     * Delete a news/bulletin
     */
    public function destroy(Request $request, $id)
    {
        if ($request->user() && $request->user()->role !== 'superadmin') {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $berita = Berita::find($id);
        if (!$berita) {
            return response()->json(['success' => false, 'message' => 'Berita tidak ditemukan.'], 404);
        }

        $berita->delete();

        return response()->json([
            'success' => true,
            'message' => 'Berita berhasil dihapus.'
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
            $targetUrl = $request->url;
            // Tribunnews pagination bypass
            if (str_contains($targetUrl, 'tribunnews.com') && !str_contains($targetUrl, 'page=all')) {
                $targetUrl .= (parse_url($targetUrl, PHP_URL_QUERY) ? '&' : '?') . 'page=all';
            }

            $response = \Illuminate\Support\Facades\Http::timeout(10)->withoutVerifying()->withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language' => 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            ])->get($targetUrl);
            
            $html = $response->body();
            
            // Use DOMDocument for robust parsing
            $dom = new \DOMDocument();
            @$dom->loadHTML($html, LIBXML_NOERROR | LIBXML_NOWARNING);
            $xpath = new \DOMXPath($dom);
            
            // Extract Title
            $ogTitle = $xpath->evaluate('string(//meta[@property="og:title"]/@content)');
            if (!$ogTitle) $ogTitle = $xpath->evaluate('string(//meta[@name="og:title"]/@content)');
            if (!$ogTitle) $ogTitle = $xpath->evaluate('string(//title)');
            
            // Extract Full Body (Best Effort)
            $paragraphs = [];
            
            // 1. Try to find the main article container
            $containerQueries = [
                '//div[contains(@class, "txt-article")]', // Tribun
                '//div[contains(@class, "read__content")]', // Kompas
                '//div[contains(@class, "detail__body-text")]', // Detik
                '//div[contains(@class, "article-content-body")]', 
                '//div[contains(@itemprop, "articleBody")]',
                '//article'
            ];
            
            $articleNode = null;
            foreach ($containerQueries as $query) {
                $nodes = $xpath->query($query);
                if ($nodes->length > 0) {
                    $articleNode = $nodes->item(0);
                    break;
                }
            }

            if ($articleNode) {
                // Extract text directly from the container if found
                // We'll replace <br> with newlines, but since we are using DOM, it's easier to just get text nodes or paragraphs
                $pNodes = $xpath->query('.//p', $articleNode);
                if ($pNodes->length > 0) {
                    foreach ($pNodes as $pNode) {
                        $text = trim($pNode->textContent);
                        if (strlen($text) > 20) $paragraphs[] = $text;
                    }
                } else {
                    // Fallback to plain text content if no <p> tags exist inside the container
                    $paragraphs[] = trim(preg_replace('/\s+/', ' ', $articleNode->textContent));
                }
            } else {
                // 2. Fallback to global <p> tag search if no container found
                $pNodes = $xpath->query('//p');
                foreach ($pNodes as $pNode) {
                    $text = trim($pNode->textContent);
                    if (strlen($text) > 60) {
                        $paragraphs[] = $text;
                    }
                }
            }
            
            $fullBody = implode("\n\n", $paragraphs);
            
            // Extract Description (Fallback)
            $ogDesc = $xpath->evaluate('string(//meta[@property="og:description"]/@content)');
            if (!$ogDesc) $ogDesc = $xpath->evaluate('string(//meta[@name="description"]/@content)');
            
            $finalDesc = !empty($fullBody) ? $fullBody : ($ogDesc ?: '');
            
            // Extract Image
            $ogImage = $xpath->evaluate('string(//meta[@property="og:image"]/@content)');
            
            // Extract Site Name / Source
            $ogSite = $xpath->evaluate('string(//meta[@property="og:site_name"]/@content)');
            
            // Extract Author
            $ogAuthor = $xpath->evaluate('string(//meta[@name="author"]/@content)');
            if (!$ogAuthor) $ogAuthor = $xpath->evaluate('string(//meta[@property="article:author"]/@content)');
            
            $finalTitle = $ogTitle ?: '';
            $finalDesc = $ogDesc ?: '';
            $finalImage = $ogImage ?: '';
            $source = $ogSite ?: (parse_url($request->url, PHP_URL_HOST) ?? 'Internet');
            $author = $ogAuthor ?: '';

            // Clean up entities
            $finalTitle = html_entity_decode($finalTitle, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $finalDesc = html_entity_decode($finalDesc, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $author = html_entity_decode($author, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            
            return response()->json([
                'success' => true,
                'data' => [
                    'title' => trim($finalTitle),
                    'description' => trim($finalDesc),
                    'image_url' => trim($finalImage),
                    'source' => trim($source),
                    'author' => trim($author),
                    'url_tautan' => $targetUrl
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
