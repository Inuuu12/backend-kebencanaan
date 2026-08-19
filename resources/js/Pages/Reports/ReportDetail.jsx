import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../Components/Layout';
import { reportService } from '../../api/services/reports';
import { 
    ArrowLeft, 
    MapPin, 
    Calendar, 
    AlertTriangle, 
    Image as ImageIcon,
    Clock,
    User,
    Phone,
    Mail,
    PackageOpen,
    Users,
    Navigation,
    FileText
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
                setReport(response?.data || response);
            } catch (err) {
                console.error("Failed to fetch report detail:", err);
                setError(err.status === 404 ? "Laporan tidak ditemukan (404)." : "Gagal memuat detail laporan.");
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
                <div className="min-h-[400px]" />
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
        <Layout activePage={activePage} title={isKabupaten ? 'Detail Data Terverifikasi' : 'Detail Aduan Warga'}>
            {/* Header / Actions */}
            <div className="mb-6 flex justify-between items-center">
                <button 
                    onClick={() => navigate(basePath)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-slate-100 transition-colors"
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
                    <div className="panel-card overflow-hidden p-0">
                        <div className="p-6 border-b border-slate-700/60">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wide text-orange-400 mb-2">Aduan #{report.id}</div>
                                    <h1 className="text-2xl font-bold text-slate-100 mb-2">{report.title}</h1>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(report.status)}`}>
                                    {report.status}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
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

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-6 border-b border-slate-700/60">
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                                <div className="text-[11px] uppercase tracking-wide text-slate-400 font-bold flex items-center gap-2">
                                    <Users size={14} /> Korban
                                </div>
                                <div className="text-3xl font-extrabold text-red-400 mt-2">{report.jumlah_korban || 0}</div>
                                <div className="text-xs text-slate-500">orang terdampak</div>
                            </div>
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                                <div className="text-[11px] uppercase tracking-wide text-slate-400 font-bold flex items-center gap-2">
                                    <MapPin size={14} /> Kecamatan
                                </div>
                                <div className="text-lg font-extrabold text-slate-100 mt-2">{report.kecamatan_name || '-'}</div>
                                <div className="text-xs text-slate-500">wilayah penanganan</div>
                            </div>
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                                <div className="text-[11px] uppercase tracking-wide text-slate-400 font-bold flex items-center gap-2">
                                    <Navigation size={14} /> Desa/Kelurahan
                                </div>
                                <div className="text-lg font-extrabold text-slate-100 mt-2">{report.kelurahan_name || '-'}</div>
                                <div className="text-xs text-slate-500">lokasi aduan warga</div>
                            </div>
                        </div>

                        <div className="p-6">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <FileText size={16} /> Deskripsi Kejadian
                            </h3>
                            <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                                {report.description}
                            </p>
                        </div>

                        <div className="p-6 border-t border-slate-700/60">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <PackageOpen size={16} /> Kebutuhan Bantuan / Logistik
                            </h3>
                            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-sm text-orange-100 leading-relaxed">
                                {report.kebutuhan_logistik || 'Belum ada kebutuhan bantuan yang dicatat.'}
                            </div>
                        </div>

                        {report.image_url && (
                            <div className="p-6 border-t border-slate-700/60 bg-slate-900/40">
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <ImageIcon size={16} /> Foto Lampiran
                                </h3>
                                <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-900 inline-block max-w-full">
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
                    {/* Reporter Info */}
                    <div className="panel-card p-6">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <User size={16} /> Data Pelapor
                        </h3>
                        <div className="space-y-3">
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3">
                                <div className="text-[11px] uppercase tracking-wide text-slate-500 font-bold">Nama</div>
                                <div className="text-sm font-semibold text-slate-100">{report.reporter_name || 'Warga'}</div>
                            </div>
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 flex items-center gap-3">
                                <Phone size={15} className="text-emerald-400" />
                                <span className="text-sm text-slate-200">{report.reporter_phone || 'Nomor tidak tersedia'}</span>
                            </div>
                            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 flex items-center gap-3">
                                <Mail size={15} className="text-blue-400" />
                                <span className="text-sm text-slate-200 break-all">{report.reporter_email || 'Email tidak tersedia'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Location Info */}
                    <div className="panel-card p-6">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <MapPin size={16} /> Informasi Lokasi
                        </h3>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-slate-800/60 border border-slate-700 p-3 rounded-md">
                                <div className="text-[11px] uppercase tracking-wide text-slate-500 font-bold">Kecamatan</div>
                                <div className="text-sm font-semibold text-slate-100">{report.kecamatan_name || '-'}</div>
                            </div>
                            <div className="bg-slate-800/60 border border-slate-700 p-3 rounded-md">
                                <div className="text-[11px] uppercase tracking-wide text-slate-500 font-bold">Desa/Kelurahan</div>
                                <div className="text-sm font-semibold text-slate-100">{report.kelurahan_name || '-'}</div>
                            </div>
                            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-md col-span-2">
                                <div className="text-[11px] uppercase tracking-wide text-red-300 font-bold">Korban Terdampak</div>
                                <div className="text-lg font-extrabold text-red-300">{report.jumlah_korban || 0} orang</div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-slate-200 font-medium">{report.location_name || 'Tidak ada deskripsi lokasi'}</p>
                        </div>
                        
                        {(report.latitude && report.longitude) && (
                            <div className="bg-slate-800/60 border border-slate-700 p-3 rounded-md text-xs font-mono text-slate-400 break-all">
                                Lat: {report.latitude}<br/>
                                Lng: {report.longitude}
                            </div>
                        )}
                    </div>

                    {/* Status History */}
                    <div className="panel-card p-6">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Clock size={16} /> Riwayat Penanganan
                        </h3>
                        
                        <div className="relative border-l-2 border-slate-700 ml-3 pl-4 space-y-6">
                            {report.status_history?.length > 0 ? (
                                report.status_history.map((history, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-blue-500 border-2 border-slate-900"></div>
                                        <p className="text-sm font-semibold text-slate-100">{history.status}</p>
                                        <p className="text-xs text-slate-500 mb-1">{new Date(history.date).toLocaleString('id-ID')}</p>
                                        <p className="text-sm text-slate-300">{history.note}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500 italic">Belum ada riwayat penanganan.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
