import React, { useEffect, useState } from 'react';
import PublicLayout from '../../Components/PublicLayout';
import { AlertTriangle, MapPin, Activity, Clock } from 'lucide-react';
import apiClient from '../../api/client';

export default function Info() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                // We use the public /reports/map endpoint to get active reports
                const res = await apiClient.get('/reports/map');
                setReports(res.data || []);
            } catch (err) {
                setError('Gagal memuat informasi kebencanaan publik.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    return (
        <PublicLayout>
            <div className="bg-red-50 dark:bg-[#1D0002]/40 pt-10 pb-16 border-b border-red-100 dark:border-red-900/30">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-red-700 dark:text-red-500">Informasi Bencana Terkini</h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Daftar laporan kejadian bencana alam aktif di wilayah Kabupaten Bogor. Tetap waspada dan ikuti arahan petugas di lapangan.
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
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="panel-card p-6 animate-pulse bg-gray-100 dark:bg-gray-800 flex gap-6">
                                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg shrink-0"></div>
                                <div className="flex-1 space-y-4">
                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : reports.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {reports.map((report, idx) => (
                            <div key={report.id || idx} className="panel-card p-6 flex flex-col sm:flex-row gap-6 hover:shadow-lg transition-all border border-[#19140015] dark:border-[#3E3E3A]">
                                <div className="w-full sm:w-40 h-40 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
                                    {report.image_url ? (
                                        <img src={report.image_url} alt={report.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                            <Activity size={32} className="mb-2" />
                                            <span className="text-xs">No Image</span>
                                        </div>
                                    )}
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded uppercase tracking-wider">
                                        {report.status}
                                    </div>
                                </div>
                                <div className="flex flex-col flex-1">
                                    <div className="flex items-center gap-2 mb-2 text-sm text-red-600 dark:text-red-400 font-semibold">
                                        <AlertTriangle size={16} />
                                        <span>{report.type}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 leading-tight">{report.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                        {report.description}
                                    </p>
                                    <div className="mt-auto space-y-2 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} className="shrink-0" />
                                            <span className="line-clamp-1">{report.location_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="shrink-0" />
                                            <span>Dilaporkan pada {new Date(report.report_date).toLocaleDateString('id-ID')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="panel-card p-16 flex flex-col items-center justify-center text-center max-w-2xl mx-auto border-dashed border-2 bg-gray-50/50 dark:bg-[#161615]/50">
                        <Activity size={64} className="text-green-500 mb-6" />
                        <h3 className="text-2xl font-bold mb-2">Situasi Aman Terkendali</h3>
                        <p className="text-gray-500">Saat ini tidak ada laporan kejadian bencana aktif di wilayah Kabupaten Bogor.</p>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
