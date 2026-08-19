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
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { dashboardService } from '../../api/services/dashboard';
import { reportService } from '../../api/services/reports';
import { masterDataService } from '../../api/services/masterData';
import AnalyticsCharts from '../../Components/AnalyticsCharts';
import { useAuth } from '../../AuthContext';
import { drawAdminBoundaries, getResponseDataArray } from '../../lib/mapBoundaries';

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
                const [summaryRes, reportsRes, boundariesRes] = await Promise.all([
                    dashboardService.getSummary(),
                    reportService.getMapReports(),
                    masterDataService.getBoundaries({ level: 'kecamatan' }).catch(() => ({ data: [] }))
                ]);

                setData({
                    summary: summaryRes.data?.summary || { total: 0, pending: 0, handling: 0, resolved: 0 },
                    stats: summaryRes.data?.stats || { banjir: 0, longsor: 0, kebakaran: 0, puting_beliung: 0, gempa: 0, lainnya: 0 },
                    complaints: getResponseDataArray(reportsRes),
                    boundaries: getResponseDataArray(boundariesRes)
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

    useEffect(() => {
        if (loading || error || typeof window === 'undefined') return;
        const mapContainer = document.getElementById('kecamatan-map');
        if (!mapContainer) return;

        const map = L.map('kecamatan-map', {
            zoomControl: false
        }).setView([-6.582, 106.871], 12);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const boundaryGroup = L.layerGroup().addTo(map);
        drawAdminBoundaries(L, boundaryGroup, data.boundaries, {
            levels: ['kecamatan'],
            fitMap: map,
            fitOptions: { padding: [18, 18], maxZoom: 12 },
        });

        data.complaints.forEach((c) => {
            let color = '#3b82f6';
            const type = (c.type || '').toLowerCase();
            if (type.includes('banjir')) color = '#06b6d4';
            else if (type.includes('kebakaran')) color = '#ef4444';
            else if (type.includes('longsor')) color = '#f97316';
            else if (type.includes('angin') || type.includes('puting')) color = '#a855f7';
            else if (type.includes('gempa')) color = '#10b981';

            const customIcon = L.divIcon({
                className: 'custom-leaflet-marker',
                html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 10px ${color};"></div>`,
                iconSize: [14, 14],
                iconAnchor: [7, 7]
            });

            const marker = L.marker([c.latitude, c.longitude], { icon: customIcon }).addTo(map);
            marker.bindPopup(`
                <div style="color: #0f172a; padding: 0.25rem;">
                    <strong style="text-transform: capitalize; font-size: 0.9rem;">${c.type || 'Laporan'}</strong>
                    <div style="font-size: 0.75rem; color: #475569; margin: 0.25rem 0;">Status: <span style="text-transform: capitalize;">${c.status}</span></div>
                </div>
            `);
        });

        return () => {
            map.remove();
        };
    }, [data.complaints, data.boundaries, loading, error]);

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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
                            <MapPin size={18} className="color-primary" />
                            Peta Sebaran Bencana
                        </h3>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center flex-grow bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" style={{ minHeight: '380px' }}>
                            <Loader2 size={32} className="animate-spin text-gray-400 mb-2" />
                            <span className="text-gray-500 text-sm">Memuat Peta...</span>
                        </div>
                    ) : (
                        <div id="kecamatan-map" className="map-container" style={{ flexGrow: 1, minHeight: '380px', borderRadius: '8px', zIndex: 0 }}></div>
                    )}
                </div>

                {/* Right Panel: Analytics Charts */}
                <AnalyticsCharts stats={data.stats} complaints={data.complaints} />
            </div>
        </Layout>
    );
}
