import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '../../Components/PublicLayout';
import { newsService } from '../../api/services/news';
import { Calendar, ArrowLeft, AlertTriangle, ExternalLink, User, Globe } from 'lucide-react';

export default function NewsDetail() {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const escapeHTML = (str) => str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag]));

    const renderFormattedText = (text) => {
        if (!text) return <p className="text-gray-500 italic">Konten berita tidak tersedia.</p>;
        
        let processed = text.replace(/\[enter\]/gi, '\n');
        const paragraphs = processed.split('\n').filter(p => p.trim() !== '');

        return paragraphs.map((paragraph, idx) => {
            let htmlText = escapeHTML(paragraph);
            
            htmlText = htmlText.replace(/\[tab\]/gi, '<span class="ml-6 sm:ml-8 inline-block"></span>');
            htmlText = htmlText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            htmlText = htmlText.replace(/\*(.*?)\*/g, '<em>$1</em>');
            
            return (
                <p 
                    key={idx} 
                    className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed text-justify" 
                    dangerouslySetInnerHTML={{ __html: htmlText }} 
                />
            );
        });
    };

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

                        {article.url_tautan && (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 mb-8 gap-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-wrap items-center gap-4 text-sm">
                                    {article.author && (
                                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                                            <User size={14} className="text-blue-500" />
                                            <span>{article.author}</span>
                                        </div>
                                    )}
                                    {article.publisher && (
                                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                            <Globe size={14} />
                                            <span>{article.publisher}</span>
                                        </div>
                                    )}
                                </div>
                                <a 
                                    href={article.url_tautan} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shrink-0 text-sm shadow-sm"
                                >
                                    Baca di Sumber Asli <ExternalLink size={16} />
                                </a>
                            </div>
                        )}

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
                            {renderFormattedText(article.description)}
                        </div>
                    </article>
                ) : null}
            </div>
        </PublicLayout>
    );
}
