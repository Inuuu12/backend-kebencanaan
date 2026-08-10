import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../Components/Layout';
import { reportService } from '../../api/services/reports';
import { 
    ArrowLeft, 
    MapPin, 
    Calendar, 
    AlertTriangle, 
    Activity,
    Info,
    Image as ImageIcon,
    Clock
} from 'lucide-react';

export default function ReportDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Determine active page and base path from current URL
    const isKabupaten = location.pathname.includes('/kabupaten');
    const isKecamatan = location.pathname.includes('/kecamatan');
    const activePage = 'complaints';
    const basePath = isKabupaten ? '/dashboard/kabupaten/aduan' : (isKecamatan ? '/dashboard/kecamatan/aduan' : '/dashboard/kelurahan/aduan');

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const response = await reportService.getDetail(id);
                setReport(response.data?.data);
            } catch (err) {
                console.error("Failed to fetch report detail:", err);
                setError(err.response?.status === 404 ? "Laporan tidak ditemukan (404)." : "Gagal memuat detail laporan.");
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    const getStatusBadgeClass = (status) => {
        const s = status?.toLowerCase() || '';
        if (s === 'pending') return 'bg-yellow-100 text-yellow-800';
        if (s === 'verified' || s === 'handling') return 'bg-blue-100 text-blue-800';
        if (s === 'resolved' || s === 'selesai') return 'bg-green-100 text-green-800';
        if (s === 'rejected' || s === 'ditolak') return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <Layout activePage={activePage} title="Detail Laporan">
                <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
                    <Activity className="animate-spin text-blue-500 mb-4" size={32} />
                    <p>Memuat detail laporan...</p>
                </div>
            </Layout>
        );
    }

    if (error || !report) {
        return (
            <Layout activePage={activePage} title="Detail Laporan">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                    <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Terjadi Kesalahan</h2>
                    <p className="text-gray-600 mb-6">{error || "Data laporan tidak ditemukan."}</p>
                    <button 
                        onClick={() => navigate(basePath)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
                    >
                        <ArrowLeft size={16} /> Kembali ke Daftar
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout activePage={activePage} title="Detail Laporan Bencana">
            {/* Header / Actions */}
            <div className="mb-6 flex justify-between items-center">
                <button 
                    onClick={() => navigate(basePath)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={16} /> Kembali
                </button>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(report.status)}`}>
                    Status: {report.status}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">{report.title}</h1>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <AlertTriangle size={14} className="text-orange-500" />
                                    <span>{report.type}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    <span>{new Date(report.report_date).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Deskripsi Kejadian</h3>
                            <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                                {report.description}
                            </p>
                        </div>
                        {report.image_url && (
                            <div className="p-6 border-t border-gray-100 bg-gray-50">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <ImageIcon size={16} /> Foto Lampiran
                                </h3>
                                <div className="rounded-lg overflow-hidden border border-gray-200 bg-white inline-block max-w-full">
                                    <img 
                                        src={report.image_url} 
                                        alt="Lampiran Laporan" 
                                        className="max-h-96 object-contain"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Location Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <MapPin size={16} /> Informasi Lokasi
                        </h3>
                        <div className="mb-4">
                            <p className="text-sm text-gray-800 font-medium">{report.location_name || 'Tidak ada deskripsi lokasi'}</p>
                        </div>
                        
                        {(report.latitude && report.longitude) && (
                            <div className="bg-gray-50 p-3 rounded-md text-xs font-mono text-gray-600 break-all">
                                Lat: {report.latitude}<br/>
                                Lng: {report.longitude}
                            </div>
                        )}
                    </div>

                    {/* Status History */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Clock size={16} /> Riwayat Penanganan
                        </h3>
                        
                        <div className="relative border-l-2 border-gray-200 ml-3 pl-4 space-y-6">
                            {report.status_history?.length > 0 ? (
                                report.status_history.map((history, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-blue-500 border-2 border-white"></div>
                                        <p className="text-sm font-semibold text-gray-800">{history.status}</p>
                                        <p className="text-xs text-gray-500 mb-1">{new Date(history.date).toLocaleString('id-ID')}</p>
                                        <p className="text-sm text-gray-600">{history.note}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 italic">Belum ada riwayat penanganan.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
