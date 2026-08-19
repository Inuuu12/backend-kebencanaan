import React, { useState, useEffect } from 'react';
import Layout from '../../Components/Layout';
import { useAuth } from '../../AuthContext';
import { reportService } from '../../api/services/reports';
import { getResponseDataArray } from '../../lib/mapBoundaries';
import { getAdminScopeLabel } from '../../lib/adminScope';
import { 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend 
} from 'recharts';
import { 
    FileSpreadsheet, 
    Download, 
    AlertTriangle, 
    BarChart3, 
    PieChart as PieIcon, 
    CheckCircle2,
    Calendar,
    User,
    Tag
} from 'lucide-react';

export default function Laporan() {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [statsByType, setStatsByType] = useState({});
    const [statsByStatus, setStatsByStatus] = useState({});
    const [loading, setLoading] = useState(true);
    
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);

    const adminLabel = getAdminScopeLabel(user);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                const scopeFilters = {};
                if (user?.id_kecamatan) scopeFilters.kecamatan_id = user.id_kecamatan;
                if (user?.id_kelurahan) scopeFilters.kelurahan_id = user.id_kelurahan;
                
                const response = await reportService.getMapReports(scopeFilters);
                const data = getResponseDataArray(response);
                
                const typeCounts = {};
                const statusCounts = {};
                
                data.forEach(report => {
                    const type = report.type || 'Lainnya';
                    const status = report.status || 'Pending';
                    typeCounts[type] = (typeCounts[type] || 0) + 1;
                    statusCounts[status] = (statusCounts[status] || 0) + 1;
                });
                
                setComplaints(data);
                setStatsByType(typeCounts);
                setStatsByStatus(statusCounts);
            } catch (error) {
                console.error("Gagal memuat laporan:", error);
            } finally {
                setLoading(false);
            }
        };
        
        if (user) fetchReports();
    }, [user]);

    // Format data for Recharts
    const typeChartData = Object.keys(statsByType).map((key) => ({
        name: key.toUpperCase().replace('_', ' '),
        value: statsByType[key]
    })).filter(item => item.value > 0);

    const statusChartData = Object.keys(statsByStatus).map((key) => ({
        name: key.toUpperCase(),
        Jumlah: statsByStatus[key]
    }));

    const COLORS = ['#06b6d4', '#f97316', '#ef4444', '#a855f7', '#10b981'];

    // Simulated Export Action
    const handleExport = (type) => {
        setIsExporting(true);
        setExportProgress(0);
        setShowSuccess(false);

        const interval = setInterval(() => {
            setExportProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setIsExporting(false);
                        setShowSuccess(true);
                        // Trigger a mock file download
                        const element = document.createElement("a");
                        const file = new Blob(["Simulasi ekspor laporan bencana " + adminLabel], {type: 'text/plain'});
                        element.href = URL.createObjectURL(file);
                        element.download = `laporan_bencana_${adminLabel.replace(/[\s/]/g, '_').toLowerCase()}_${new Date().toISOString().slice(0,10)}.${type}`;
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                    }, 500);
                    return 100;
                }
                return prev + 20;
            });
        }, 150);
    };

    return (
        <Layout activePage="recap" title={`Laporan & Statistik ${adminLabel}`}>
            
            {/* Simulated Export Action Banners */}
            {isExporting && (
                <div className="panel-card" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                            <span className="animate-pulse" style={{ width: '8px', height: '8px', background: 'var(--color-primary)', borderRadius: '50%' }}></span>
                            Sedang menyiapkan berkas laporan...
                        </span>
                        <span>{exportProgress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${exportProgress}%`, height: '100%', background: 'var(--color-primary)', borderRadius: '4px', transition: 'width 0.15s ease' }}></div>
                    </div>
                </div>
            )}

            {showSuccess && (
                <div className="alert-banner success animate-fade-in" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <CheckCircle2 size={16} /> Berkas laporan berhasil diunduh secara otomatis.
                    </span>
                    <button 
                        onClick={() => setShowSuccess(false)} 
                        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                    >
                        Tutup
                    </button>
                </div>
            )}

            {/* Graphs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                
                {/* Pie Chart: Disaster Types */}
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '320px' }}>
                    <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <PieIcon size={18} className="color-primary" />
                        Persentase Jenis Bencana
                    </h3>
                    <div style={{ flexGrow: 1, width: '100%', height: '220px', display: 'flex', position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
                        {typeChartData.length === 0 ? (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Belum ada data aduan bencana.</div>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={typeChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {typeChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: 'var(--bg-secondary)', 
                                                borderColor: 'var(--border-color)', 
                                                borderRadius: '8px',
                                                fontSize: '11px'
                                            }} 
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{complaints.length}</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Total Aduan</span>
                                </div>
                            </>
                        )}
                    </div>
                    {/* Custom Legend */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', fontSize: '0.7rem' }}>
                        {typeChartData.map((item, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <span style={{ width: '8px', height: '8px', background: COLORS[index % COLORS.length], borderRadius: '50%' }}></span>
                                <span style={{ color: 'var(--text-secondary)' }}>{item.name}: {item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bar Chart: Status Breakdown */}
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '320px' }}>
                    <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <BarChart3 size={18} className="color-primary" />
                        Status Penyelesaian Aduan
                    </h3>
                    <div style={{ flexGrow: 1, width: '100%', height: '240px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} />
                                <YAxis stroke="var(--text-muted)" fontSize={10} allowDecimals={false} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'var(--bg-secondary)', 
                                        borderColor: 'var(--border-color)', 
                                        borderRadius: '8px',
                                        fontSize: '11px'
                                    }} 
                                />
                                <Bar dataKey="Jumlah" fill="rgba(0, 210, 211, 0.65)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Complaints Detailed Recap Table */}
            <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <FileSpreadsheet size={18} className="color-primary" />
                        Rekap Histori Aduan Bencana
                    </h3>
                    
                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button 
                            onClick={() => handleExport('csv')} 
                            className="btn-secondary" 
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem', fontSize: '0.8rem' }}
                            disabled={isExporting}
                        >
                            <Download size={14} />
                            <span>Ekspor CSV</span>
                        </button>
                        <button 
                            onClick={() => handleExport('xlsx')} 
                            className="btn-primary" 
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem', fontSize: '0.8rem' }}
                            disabled={isExporting}
                        >
                            <Download size={14} />
                            <span>Ekspor Excel</span>
                        </button>
                    </div>
                </div>

                {complaints.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                        Belum ada riwayat aduan bencana di desa ini.
                    </div>
                ) : (
                    <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Jenis Bencana</th>
                                    <th>Korban Terdampak</th>
                                    <th>Pelapor</th>
                                    <th>Alamat Kejadian</th>
                                    <th style={{ textAlign: 'center' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.map((c) => (
                                    <tr key={c.id}>
                                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {new Date(c.report_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                                            {c.type}
                                        </td>
                                        <td>
                                            <span className="badge warning">{c.jumlah_korban || 0} orang</span>
                                        </td>
                                        <td style={{ fontSize: '0.85rem' }}>{c.reporter_name || 'Warga'}</td>
                                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {c.location_name}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {c.status.toLowerCase() === 'pending' && <span className="badge warning">Menunggu</span>}
                                            {c.status.toLowerCase() === 'verified' && <span className="badge info">Terverifikasi</span>}
                                            {c.status.toLowerCase() === 'handling' && <span className="badge info" style={{ background: 'var(--color-primary-light)' }}>Penanganan</span>}
                                            {c.status.toLowerCase() === 'resolved' && <span className="badge success">Selesai</span>}
                                            {c.status.toLowerCase() === 'rejected' && <span className="badge critical">Ditolak</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout>
    );
}
