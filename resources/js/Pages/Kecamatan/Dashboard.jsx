import React, { useEffect, useState } from 'react';
import Layout from '../../Components/Layout';
import { 
    AlertTriangle, 
    CheckCircle2, 
    Clock, 
    AlertOctagon, 
    Activity, 
    MapPin, 
    Building2,
    Loader2
} from 'lucide-react';
import AnalyticsCharts from '../../Components/AnalyticsCharts';
import { useAuth } from '../../AuthContext';
import RegionRecapTable from '../../Components/RegionRecapTable';

export default function Dashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState({
        summary: { total: 0, pending: 0, handling: 0, resolved: 0 },
        stats: { banjir: 0, longsor: 0, kebakaran: 0, puting_beliung: 0, gempa: 0, lainnya: 0 },
        complaints: [],
        boundaries: []
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [summaryRes, reportsRes] = await Promise.all([
                    dashboardService.getSummary(),
                    reportService.getMapReports()
                ]);

                setData({
                    summary: summaryRes.data?.summary || { total: 0, pending: 0, handling: 0, resolved: 0 },
                    stats: summaryRes.data?.stats || { banjir: 0, longsor: 0, kebakaran: 0, puting_beliung: 0, gempa: 0, lainnya: 0 },
                    complaints: getResponseDataArray(reportsRes)
                });
            } catch (err) {
                console.error("Dashboard fetch error:", err);
                setError("Gagal memuat data dashboard.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Map rendering has been moved to RegionRecapTable

    return (
        <Layout activePage="dashboard" title={`Pusdalops Kecamatan`}>
            {error && (
                <div className="alert-banner error mb-6">
                    <AlertTriangle size={20} />
                    <span>{error}</span>
                </div>
            )}

            <div className="stats-grid">
                <div className="panel-card stat-card relative overflow-hidden">
                    {loading && <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-800/50 animate-pulse"></div>}
                    <div className="stat-card-icon" style={{ color: 'var(--text-primary)' }}>
                        <AlertOctagon size={20} />
                    </div>
                    <div className="stat-card-info">
                        <span className="stat-card-value">{loading ? '-' : data.summary.total}</span>
                        <span className="stat-card-label">Total Laporan</span>
                    </div>
                </div>

                <div className="panel-card stat-card relative overflow-hidden">
                    {loading && <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-800/50 animate-pulse"></div>}
                    <div className="stat-card-icon" style={{ color: 'var(--color-pending)' }}>
                        <Clock size={20} />
                    </div>
                    <div className="stat-card-info">
                        <span className="stat-card-value">{loading ? '-' : data.summary.pending}</span>
                        <span className="stat-card-label">Menunggu Verifikasi</span>
                    </div>
                </div>

                <div className="panel-card stat-card relative overflow-hidden">
                    {loading && <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-800/50 animate-pulse"></div>}
                    <div className="stat-card-icon" style={{ color: 'var(--color-handling)' }}>
                        <Activity size={20} />
                    </div>
                    <div className="stat-card-info">
                        <span className="stat-card-value">{loading ? '-' : data.summary.handling}</span>
                        <span className="stat-card-label">Progres Penanganan</span>
                    </div>
                </div>

                <div className="panel-card stat-card relative overflow-hidden">
                    {loading && <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-800/50 animate-pulse"></div>}
                    <div className="stat-card-icon" style={{ color: 'var(--color-resolved)' }}>
                        <CheckCircle2 size={20} />
                    </div>
                    <div className="stat-card-info">
                        <span className="stat-card-value">{loading ? '-' : data.summary.resolved}</span>
                        <span className="stat-card-label">Laporan Selesai</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '520px' }}>
                    <RegionRecapTable user={user} isKabupaten={false} isKecamatan={true} />
                </div>

                {/* Right Panel: Analytics Charts */}
                <AnalyticsCharts stats={data.stats} complaints={data.complaints} />
            </div>
        </Layout>
    );
}
