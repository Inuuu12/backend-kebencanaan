import React, { useEffect, useState } from 'react';
import Layout from '../../Components/Layout';
import { 
    AlertOctagon, 
    CheckCircle2, 
    Clock, 
    AlertTriangle, 
    ShieldAlert,
    CloudRain,
    Wind,
    Droplets,
    Activity,
    MapPin,
    Loader2,
    Users
} from 'lucide-react';
import AnalyticsCharts from '../../Components/AnalyticsCharts';
import { useAuth } from '../../AuthContext';
import RegionRecapTable from '../../Components/RegionRecapTable';

export default function Dashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [weather, setWeather] = useState(null);
    const [data, setData] = useState({
        summary: { total: 0, pending: 0, handling: 0, resolved: 0 },
        complaints: [],
        boundaries: []
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [summaryRes, reportsRes, weatherRes] = await Promise.all([
                    dashboardService.getSummary(),
                    reportService.getMapReports(),
                    homeService.getWeather().catch(() => null)
                ]);

                setData({
                    summary: summaryRes.data?.summary || { total: 0, pending: 0, handling: 0, resolved: 0 },
                    complaints: getResponseDataArray(reportsRes)
                });
                if (weatherRes) setWeather(weatherRes);
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

    const totalKorban = data.complaints.reduce((acc, curr) => acc + (Number(curr.jumlah_korban) || 0), 0);

    return (
        <Layout activePage="dashboard" title={`Dashboard Kelurahan`}>
            {error && (
                <div className="alert-banner error mb-6">
                    <AlertTriangle size={20} />
                    <span>{error}</span>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="weather-card relative overflow-hidden">
                    {loading && <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-800/50 animate-pulse"></div>}
                    <div className="weather-info">
                        <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                            <CloudRain size={36} className="color-primary" />
                        </div>
                        <div className="weather-status">
                            <span className="weather-condition">{weather ? weather.condition : 'Memuat cuaca...'}</span>
                            <span className="weather-location">{weather ? weather.location : 'Kab. Bogor'}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Kelembapan</span>
                            <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                                <Droplets size={14} className="color-primary" /> {weather ? `${weather.humidity}%` : '-'}
                            </span>
                        </div>
                        <span className="weather-temp">{weather ? `${weather.temp}°C` : '-'}</span>
                    </div>
                </div>

                <div className="panel-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: '#10b981' }}>
                        <ShieldAlert size={20} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Posko Utama Kelurahan</span>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '0.1rem' }}>Kantor Kelurahan</span>
                    </div>
                </div>
            </div>

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
                        <span className="stat-card-label">Sedang Ditangani</span>
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

                <div className="panel-card stat-card relative overflow-hidden">
                    {loading && <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-800/50 animate-pulse"></div>}
                    <div className="stat-card-icon" style={{ color: 'var(--color-critical)' }}>
                        <Users size={20} />
                    </div>
                    <div className="stat-card-info">
                        <span className="stat-card-value text-red-400">{loading ? '-' : totalKorban}</span>
                        <span className="stat-card-label">Total Korban</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '520px' }}>
                    <RegionRecapTable user={user} isKabupaten={false} isKecamatan={false} />
                </div>

                {/* Right Panel: Analytics Charts */}
                <AnalyticsCharts stats={data.stats} complaints={data.complaints} />
            </div>
        </Layout>
    );
}
