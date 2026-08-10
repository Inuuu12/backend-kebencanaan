import React, { useEffect, useState } from 'react';
import PublicLayout from '../../Components/PublicLayout';
import { newsService } from '../../api/services/news';
import { Newspaper, ArrowRight, Activity, AlertTriangle, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function News() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await newsService.getAll();
                const data = Array.isArray(res) ? res : (res.data || []);
                setNews(data);
            } catch (err) {
                setError('Gagal memuat berita terkini.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    return (
        <PublicLayout>
            <div className="bg-orange-50 dark:bg-[#1D0002]/30 pt-10 pb-16">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Berita Kebencanaan</h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Pusat informasi, rilis pers, dan berita terbaru seputar peringatan dini, penanganan bencana, dan himbauan masyarakat.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12">
                {error && (
                    <div className="alert-banner error mb-8 animate-fade-in flex items-center gap-3">
                        <AlertTriangle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="panel-card p-0 h-80 animate-pulse bg-gray-100 dark:bg-gray-800"></div>
                        ))}
                    </div>
                ) : news.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {news.map((item, idx) => (
                            <Link to={`/news/${item.id}`} key={item.id || idx} className="panel-card flex flex-col overflow-hidden group cursor-pointer hover:shadow-xl hover:shadow-orange-500/10 transition-all border border-[#19140015] dark:border-[#3E3E3A]">
                                <div className="h-48 bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
                                    {item.image_url ? (
                                        <img 
                                            src={item.image_url} 
                                            alt={item.title} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    {/* Fallback Image */}
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400" style={{ display: item.image_url ? 'none' : 'flex' }}>
                                        <Newspaper size={40} className="mb-2 opacity-50" />
                                        <span className="text-xs font-medium uppercase tracking-widest opacity-50">SIKAB NEWS</span>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-3">
                                        <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded">
                                            {item.category || 'Berita'}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            <span>{new Date(item.published_at).toLocaleDateString('id-ID')}</span>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-xl mb-3 line-clamp-2 group-hover:text-[#FF750F] transition-colors leading-snug">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-6 leading-relaxed">
                                        {item.description}
                                    </p>
                                    <div className="mt-auto text-sm font-semibold text-[#FF750F] flex items-center gap-2 group-hover:gap-3 transition-all">
                                        Mulai Membaca <ArrowRight size={16} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="panel-card p-16 flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
                        <Newspaper size={64} className="text-gray-300 dark:text-gray-700 mb-6" />
                        <h3 className="text-2xl font-bold mb-2">Belum ada publikasi berita</h3>
                        <p className="text-gray-500">Berita, pengumuman peringatan dini, dan rilis pers terkait kebencanaan akan diterbitkan di halaman ini.</p>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
