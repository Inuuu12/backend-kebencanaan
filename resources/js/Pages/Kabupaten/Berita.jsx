import React, { useState, useEffect } from 'react';
import Layout from '../../Components/Layout';
import { Plus, Newspaper, Link as LinkIcon, AlertTriangle, CheckCircle, Search, Calendar, FileText, Image, MapPin } from 'lucide-react';
import { newsService } from '../../api/services/news';
import { motion, AnimatePresence } from 'framer-motion';

export default function Berita() {
    const [newsList, setNewsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Modal state
    const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'link'
    const [scrapeUrl, setScrapeUrl] = useState('');
    const [isScraping, setIsScraping] = useState(false);
    const [scrapeError, setScrapeError] = useState(null);
    const [scrapeSuccess, setScrapeSuccess] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        judul: '',
        isi: '',
        gambar: '',
        sumber: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const res = await newsService.getAll();
            setNewsList(res.data || res);
        } catch (err) {
            console.error(err);
            setError('Gagal memuat daftar berita.');
        } finally {
            setLoading(false);
        }
    };

    const handleScrape = async () => {
        if (!scrapeUrl) return;
        setIsScraping(true);
        setScrapeError(null);
        setScrapeSuccess(false);

        try {
            const res = await newsService.scrapeUrl(scrapeUrl);
            const data = res.data;
            
            // Populate form data
            setFormData({
                judul: data.title || '',
                isi: data.description || '',
                gambar: data.image_url || '',
                sumber: data.source || ''
            });
            
            setScrapeSuccess(true);
            setTimeout(() => {
                setActiveTab('manual'); // Switch to manual tab for review
                setScrapeSuccess(false);
                setScrapeUrl('');
            }, 1000);
        } catch (err) {
            console.error(err);
            setScrapeError(err.response?.data?.message || 'Gagal menarik data dari tautan tersebut.');
        } finally {
            setIsScraping(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await newsService.create(formData);
            setIsModalOpen(false);
            setFormData({ judul: '', isi: '', gambar: '', sumber: '' });
            fetchNews(); // Refresh list
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan berita.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout activePage="berita" title="Manajemen Berita">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Newspaper size={28} className="text-blue-500" />
                        Kelola Berita & Informasi
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Buat atau tarik berita dari portal web untuk ditampilkan kepada publik.
                    </p>
                </div>
                
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/30"
                >
                    <Plus size={18} />
                    Tambah Berita
                </button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-center gap-3 mb-6">
                    <AlertTriangle size={20} />
                    <p>{error}</p>
                </div>
            )}

            {/* News List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 h-80 animate-pulse">
                            <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-t-xl" />
                            <div className="p-4 space-y-3">
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                            </div>
                        </div>
                    ))
                ) : newsList.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <Newspaper size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
                        <p className="text-lg font-medium">Belum ada berita</p>
                        <p className="text-sm">Klik 'Tambah Berita' untuk memulai.</p>
                    </div>
                ) : (
                    newsList.map((news) => (
                        <div key={news.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                            <div className="h-48 overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                                {news.image_url ? (
                                    <img src={news.image_url} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <Image size={32} />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">
                                    {news.author}
                                </div>
                            </div>
                            <div className="p-4 flex flex-col flex-grow">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 line-clamp-2 mb-2 leading-snug">{news.title}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 flex-grow">
                                    {news.description}
                                </p>
                                <div className="flex items-center text-[10px] text-slate-400 gap-1 border-t border-slate-100 dark:border-slate-800 pt-3">
                                    <Calendar size={12} />
                                    <span>{new Date(news.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[600] bg-black/40 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 z-[610] flex items-center justify-center p-4 pointer-events-none"
                        >
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col pointer-events-auto border border-slate-200 dark:border-slate-800 overflow-hidden">
                                
                                <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                        <Plus size={20} className="text-blue-500" />
                                        Tambah Berita Baru
                                    </h2>
                                    <button 
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
                                    >
                                        <Plus size={20} className="rotate-45" />
                                    </button>
                                </div>

                                <div className="flex border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6">
                                    <button
                                        onClick={() => setActiveTab('manual')}
                                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'manual' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        <FileText size={16} />
                                        Tulis Manual
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('link')}
                                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'link' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        <LinkIcon size={16} />
                                        Dari Tautan
                                    </button>
                                </div>

                                <div className="p-4 sm:p-6 overflow-y-auto">
                                    {activeTab === 'link' && (
                                        <div className="space-y-4 animate-fade-in">
                                            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 p-4 rounded-xl text-sm mb-4 border border-blue-100 dark:border-blue-900/50">
                                                Masukkan tautan (URL) dari portal berita seperti Kompas, Detik, atau Tribun. Sistem akan mencoba mengekstrak judul, gambar, dan cuplikan konten secara otomatis.
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tautan Berita (URL)</label>
                                                <div className="flex gap-2">
                                                    <input 
                                                        type="url" 
                                                        placeholder="https://..." 
                                                        className="flex-grow bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200 outline-none"
                                                        value={scrapeUrl}
                                                        onChange={(e) => setScrapeUrl(e.target.value)}
                                                    />
                                                    <button 
                                                        onClick={handleScrape}
                                                        disabled={isScraping || !scrapeUrl}
                                                        className="bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                                                    >
                                                        {isScraping ? (
                                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        ) : (
                                                            <Search size={16} />
                                                        )}
                                                        Tarik Data
                                                    </button>
                                                </div>
                                            </div>

                                            {scrapeError && (
                                                <div className="text-red-500 text-sm mt-2 flex items-center gap-1.5">
                                                    <AlertTriangle size={14} />
                                                    {scrapeError}
                                                </div>
                                            )}

                                            {scrapeSuccess && (
                                                <div className="text-emerald-500 text-sm mt-2 flex items-center gap-1.5">
                                                    <CheckCircle size={14} />
                                                    Berhasil ditarik! Mengalihkan ke form manual...
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'manual' && (
                                        <form id="news-form" onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Judul Berita</label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200 outline-none"
                                                    value={formData.judul}
                                                    onChange={(e) => setFormData({...formData, judul: e.target.value})}
                                                    placeholder="Contoh: Banjir Bandang di Kawasan Puncak"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cuplikan Isi / Deskripsi</label>
                                                <textarea 
                                                    required
                                                    rows={4}
                                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200 outline-none resize-none"
                                                    value={formData.isi}
                                                    onChange={(e) => setFormData({...formData, isi: e.target.value})}
                                                    placeholder="Tuliskan cuplikan isi berita..."
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">URL Gambar (Opsional)</label>
                                                    <input 
                                                        type="url" 
                                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200 outline-none"
                                                        value={formData.gambar}
                                                        onChange={(e) => setFormData({...formData, gambar: e.target.value})}
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sumber (Opsional)</label>
                                                    <input 
                                                        type="text" 
                                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200 outline-none"
                                                        value={formData.sumber}
                                                        onChange={(e) => setFormData({...formData, sumber: e.target.value})}
                                                        placeholder="Contoh: Pusdalops / Kompas.com"
                                                    />
                                                </div>
                                            </div>
                                        </form>
                                    )}
                                </div>

                                <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    {activeTab === 'manual' && (
                                        <button 
                                            type="submit"
                                            form="news-form"
                                            disabled={isSubmitting || !formData.judul || !formData.isi}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/20"
                                        >
                                            {isSubmitting ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <CheckCircle size={16} />
                                            )}
                                            Simpan Berita
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </Layout>
    );
}
