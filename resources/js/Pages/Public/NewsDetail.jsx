import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '../../Components/PublicLayout';
import { newsService } from '../../api/services/news';
import { Calendar, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function NewsDetail() {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await newsService.getDetail(id);
                // Assume the response format is { success: true, data: {...} } or just the object
                setArticle(res.data || res);
            } catch (err) {
                setError('Gagal memuat detail berita. Berita mungkin tidak ditemukan.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    return (
        <PublicLayout>
            <div className="container mx-auto px-6 py-12 max-w-4xl">
                {/* Global Back Button rendered by PublicLayout */}
                
                {error && (
                    <div className="alert-banner error mb-8 animate-fade-in flex items-center gap-3">
                        <AlertTriangle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {loading ? (
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-4"></div>
                        <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-6"></div>
                        <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded w-full mb-8"></div>
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
                        </div>
                    </div>
                ) : article ? (
                    <article className="animate-fade-in">
                        <div className="flex items-center gap-3 text-sm font-medium text-gray-500 mb-4">
                            <span className="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
                                {article.category || 'Berita'}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <Calendar size={14} />
                                <span>{new Date(article.published_at).toLocaleDateString('id-ID')}</span>
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
                            {article.title}
                        </h1>

                        {article.image_url && (
                            <div className="rounded-xl overflow-hidden mb-10 shadow-lg border border-[#19140015] dark:border-[#3E3E3A]">
                                <img 
                                    src={article.image_url} 
                                    alt={article.title} 
                                    className="w-full h-auto object-cover max-h-[500px]" 
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}

                        <div className="prose prose-lg dark:prose-invert max-w-none prose-orange">
                            {/* Assuming the content is plain text for now, but usually it might be HTML */}
                            {article.description ? (
                                article.description.split('\n').map((paragraph, idx) => (
                                    <p key={idx} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {paragraph}
                                    </p>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">Konten berita tidak tersedia.</p>
                            )}
                        </div>
                    </article>
                ) : null}
            </div>
        </PublicLayout>
    );
}
