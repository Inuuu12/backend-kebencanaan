import React, { useState, useEffect } from 'react';
// Removed Head from inertia
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../Components/Layout';
import { reportService } from '../../api/services/reports';
import { 
    Search, 
    AlertTriangle, 
    Eye,
    MapPin,
    Calendar,
    Activity,
    Info
} from 'lucide-react';
import { PageLoader, EmptyState, ErrorState } from '../../Components/ui/Feedback';

export default function ReportList() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Determine active page and base path from current URL
    const isKabupaten = location.pathname.includes('/kabupaten');
    const isKecamatan = location.pathname.includes('/kecamatan');
    const activePage = 'complaints';
    const basePath = isKabupaten ? '/dashboard/kabupaten/aduan' : (isKecamatan ? '/dashboard/kecamatan/aduan' : '/dashboard/kelurahan/aduan');

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                // We use mapReports to get the active global list as there is no specific paginated list
                const response = await reportService.getMapReports();
                setReports(response.data?.data || []);
            } catch (err) {
                console.error("Failed to fetch reports:", err);
                setError("Gagal memuat data laporan.");
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    // Extract unique disaster types for filter
    const uniqueTypes = [...new Set(reports.map(r => r.type))];

    // Filter reports
    const filteredReports = reports.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              c.location_name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter ? c.status.toLowerCase() === statusFilter.toLowerCase() : true;
        const matchesType = typeFilter ? c.type === typeFilter : true;

        return matchesSearch && matchesStatus && matchesType;
    });

    const getStatusBadgeClass = (status) => {
        const s = status.toLowerCase();
        if (s === 'pending') return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
        if (s === 'verified' || s === 'handling') return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
        if (s === 'resolved' || s === 'selesai') return 'bg-green-500/10 text-green-500 border border-green-500/20';
        if (s === 'rejected' || s === 'ditolak') return 'bg-red-500/10 text-red-500 border border-red-500/20';
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    };

    return (
        <Layout activePage={activePage} title="Daftar Aduan Bencana">
            <div className="panel-card mb-6 p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-col md:flex-row gap-4 items-center w-full">
                        <div className="relative flex-grow w-full md:w-auto md:max-w-md">
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2 border border-slate-700 bg-slate-800/50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white placeholder-slate-400"
                                placeholder="Cari judul, deskripsi, alamat..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex gap-4 w-full md:w-auto">
                            <select 
                                className="border border-slate-700 bg-slate-800/50 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 outline-none text-white"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <option value="">Semua Bencana</option>
                                {uniqueTypes.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>

                            <select 
                                className="border border-slate-700 bg-slate-800/50 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 outline-none text-white"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">Semua Status</option>
                                <option value="pending">Pending</option>
                                <option value="handling">Dalam Penanganan</option>
                                <option value="resolved">Selesai</option>
                            </select>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => navigate(`${basePath}/buat`)}
                        className="w-full md:w-auto flex-shrink-0 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
                    >
                        <span className="text-xl leading-none">+</span> Buat Laporan
                    </button>
                </div>
            </div>

            <div className="panel-card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-700 text-slate-400 text-sm">
                                <th className="py-3 px-4 font-medium">Tanggal</th>
                                <th className="py-3 px-4 font-medium">Bencana</th>
                                <th className="py-3 px-4 font-medium">Judul & Lokasi</th>
                                <th className="py-3 px-4 font-medium">Status</th>
                                <th className="py-3 px-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-0">
                                        <PageLoader message="Memuat data laporan..." />
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="5" className="p-0">
                                        <ErrorState 
                                            message={error} 
                                            onRetry={() => window.location.reload()} 
                                        />
                                    </td>
                                </tr>
                            ) : filteredReports.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-4">
                                        <EmptyState 
                                            icon={Info} 
                                            title="Tidak ada laporan" 
                                            message="Tidak ada laporan aduan yang ditemukan sesuai filter pencarian Anda." 
                                        />
                                    </td>
                                </tr>
                            ) : (
                                filteredReports.map((report) => (
                                    <tr key={report.id} className="border-b border-slate-700/50 hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-4 whitespace-nowrap text-sm text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-400" />
                                                {new Date(report.report_date).toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="font-medium text-slate-200">{report.type}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-slate-200">{report.title}</div>
                                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                                <MapPin size={12} />
                                                {report.location_name || 'Lokasi tidak diketahui'}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(report.status)}`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button 
                                                onClick={() => navigate(`${basePath}/${report.id}`)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded hover:bg-blue-500/20 transition-colors text-sm font-medium"
                                            >
                                                <Eye size={14} /> Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
}
