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
import { drawAdminBoundaries, getResponseDataArray } from '../../lib/mapBoundaries';
import AnalyticsCharts from '../../Components/AnalyticsCharts';
import { motion } from 'framer-motion';

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState({
        summary: { total: 0, pending: 0, handling: 0, resolved: 0 },
        stats: { banjir: 0, longsor: 0, kebakaran: 0, puting_beliung: 0, gempa: 0, lainnya: 0 },
        complaints: [],
        boundaries: []
    });

    // Fetch API Data
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

    // Initialize Map after data is loaded
    useEffect(() => {
        if (loading || error || typeof window === 'undefined') return;

        const mapContainer = document.getElementById('kabupaten-map');
        if (!mapContainer) return;

        const map = L.map('kabupaten-map', {
            zoomControl: false
        }).setView([-6.582, 106.871], 11);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const boundaryGroup = L.layerGroup().addTo(map);
        drawAdminBoundaries(L, boundaryGroup, data.boundaries, {
            levels: ['kecamatan'],
            fitMap: map,
            fitOptions: { padding: [18, 18], maxZoom: 11 },
        });

        // Add Complaint Markers
        data.complaints.forEach((c) => {
            let color = '#3b82f6'; // default/lainnya
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
                    <div style="font-size: 0.75rem; color: #475569; margin: 0.25rem 0;">Wilayah: ${c.location_name || 'Tidak diketahui'}</div>
                    <div style="font-size: 0.75rem; color: #475569; margin: 0.25rem 0;">Status: <span style="text-transform: capitalize; font-weight:600">${c.status || 'Pending'}</span></div>
                </div>
            `);
        });

        return () => {
            map.remove();
        };
    }, [data.complaints, data.boundaries, loading, error]);

    return (
        <Layout activePage="dashboard" title="Pusdalops Kabupaten Bogor">
            {error && (
                <div className="alert-banner error mb-6">
                    <AlertTriangle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* Statistics Row */}
            <motion.div 
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
                <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-5 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all relative overflow-hidden group">
                    {loading && <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-800/50 animate-pulse"></div>}
                    <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:bg-slate-800 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 transition-colors shrink-0">
                        <AlertOctagon size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">{loading ? '-' : data.summary.total}</span>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Total Laporan</span>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-5 shadow-sm hover:shadow-xl hover:border-orange-500/30 transition-all relative overflow-hidden group">
                    {loading && <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-800/50 animate-pulse"></div>}
                    <div className="w-14 h-14 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors shrink-0">
                        <Clock size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">{loading ? '-' : data.summary.pending}</span>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Menunggu Verifikasi</span>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-5 shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all relative overflow-hidden group">
                    {loading && <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-800/50 animate-pulse"></div>}
                    <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0">
                        <Activity size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">{loading ? '-' : data.summary.handling}</span>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Progres Penanganan</span>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-5 shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all relative overflow-hidden group">
                    {loading && <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-800/50 animate-pulse"></div>}
                    <div className="w-14 h-14 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0">
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">{loading ? '-' : data.summary.resolved}</span>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Laporan Selesai</span>
                    </div>
                </motion.div>
            </motion.div>

            {/* Dashboard Sections Grid */}
            <div className="dashboard-grid">
                {/* Left Panel: Map */}
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '520px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem', margin: 0 }}>
                            <MapPin size={18} className="color-primary" />
                            Peta Sebaran Bencana
                        </h3>
                        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-banjir)' }}></span> Banjir
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-kebakaran)' }}></span> Kebakaran
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-longsor)' }}></span> Longsor
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center flex-grow bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" style={{ minHeight: '380px' }}>
                            <Loader2 size={32} className="animate-spin text-gray-400 mb-2" />
                            <span className="text-gray-500 text-sm">Memuat Peta...</span>
                        </div>
                    ) : (
                        <div id="kabupaten-map" className="map-container" style={{ flexGrow: 1, minHeight: '380px', borderRadius: '8px', zIndex: 0 }}></div>
                    )}
                </div>

                {/* Right Panel: Analytics Charts */}
                <AnalyticsCharts stats={data.stats} complaints={data.complaints} />
            </div>
        </Layout>
    );
}
