import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../Components/Layout';
import { reportService } from '../../api/services/reports';
import { masterDataService } from '../../api/services/masterData';
import { homeService } from '../../api/services/home';
import { Filter, Layers, MapPin, AlertTriangle, RefreshCw, X, ArrowRight, CloudLightning, Activity, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function DisasterMap() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const isKabupaten = location.pathname.includes('/kabupaten');
    const isKecamatan = location.pathname.includes('/kecamatan');
    const basePath = isKabupaten ? '/dashboard/kabupaten' : (isKecamatan ? '/dashboard/kecamatan' : '/dashboard/kelurahan');
    
    const [reports, setReports] = useState([]);
    const [boundaries, setBoundaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [weather, setWeather] = useState(null);

    // Filters
    const [selectedType, setSelectedType] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedReport, setSelectedReport] = useState(null);

    const mapRef = useRef(null);
    const markersGroupRef = useRef(null);
    const boundariesGroupRef = useRef(null);

    // Load data
    const fetchMapData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [reportsRes, boundariesRes, weatherRes] = await Promise.all([
                reportService.getMapReports(),
                masterDataService.getBoundaries().catch(() => ({ data: { data: [] } })),
                homeService.getWeather().catch(() => null)
            ]);
            setWeather(weatherRes);

            setReports(reportsRes.data?.data || []);
            setBoundaries(boundariesRes.data?.data || []);
        } catch (err) {
            console.error("Gagal memuat data GIS:", err);
            setError("Gagal memuat data peta.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMapData();
    }, []);

    // Derived filters
    const uniqueTypes = useMemo(() => [...new Set(reports.map(r => r.type))], [reports]);
    const filteredReports = useMemo(() => {
        return reports.filter(r => {
            const matchType = !selectedType || r.type === selectedType;
            const matchStatus = !selectedStatus || r.status.toLowerCase() === selectedStatus.toLowerCase();
            return matchType && matchStatus;
        });
    }, [reports, selectedType, selectedStatus]);

    // Init Map
    useEffect(() => {
        if (!mapRef.current) {
            const map = L.map('disaster-map-container', {
                zoomControl: false,
                attributionControl: false
            }).setView([-6.582, 106.871], 11); // Center on Kabupaten Bogor

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
            }).addTo(map);

            L.control.zoom({ position: 'bottomright' }).addTo(map);

            mapRef.current = map;
            boundariesGroupRef.current = L.layerGroup().addTo(map);
            markersGroupRef.current = L.layerGroup().addTo(map);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Draw Boundaries
    useEffect(() => {
        if (!boundariesGroupRef.current || !mapRef.current) return;
        boundariesGroupRef.current.clearLayers();

        boundaries.forEach(b => {
            if (b.points && Array.isArray(b.points) && b.points.length > 2) {
                const latLngs = b.points.map(p => [p.lat, p.lng]);
                
                let color = '#3b82f6'; // blue
                if (b.risk_level === 'Tinggi') color = '#ef4444';
                else if (b.risk_level === 'Sedang') color = '#f59e0b';

                const polygon = L.polygon(latLngs, {
                    color: color,
                    weight: 2,
                    fillColor: color,
                    fillOpacity: 0.2
                });

                polygon.bindPopup(`
                    <div class="p-1">
                        <strong class="block mb-1">${b.name}</strong>
                        <span class="text-xs px-2 py-0.5 rounded bg-gray-100">Risiko: ${b.risk_level}</span>
                    </div>
                `);

                boundariesGroupRef.current.addLayer(polygon);
            }
        });
    }, [boundaries]);

    // Draw Markers
    useEffect(() => {
        if (!markersGroupRef.current || !mapRef.current) return;
        markersGroupRef.current.clearLayers();

        filteredReports.forEach(r => {
            if (r.latitude && r.longitude) {
                const markerColor = r.status.toLowerCase() === 'pending' ? 'orange' :
                                    r.status.toLowerCase() === 'handling' ? 'blue' : 'green';

                const customIcon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color: ${markerColor}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
                    iconSize: [14, 14],
                    iconAnchor: [7, 7]
                });

                const marker = L.marker([r.latitude, r.longitude], { icon: customIcon });
                marker.on('click', () => {
                    setSelectedReport(r);
                });
                markersGroupRef.current.addLayer(marker);
            }
        });

        // Optional: auto-fit bounds if we have markers
        // if (filteredReports.length > 0) {
        //     const bounds = L.latLngBounds(filteredReports.map(r => [r.latitude, r.longitude]));
        //     mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        // }
    }, [filteredReports, basePath]);


    return (
        <Layout activePage="map" title="Peta Sebaran Bencana" fullScreen={true}>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full h-full flex flex-col"
            >
                {/* Filters */}
                <div className="absolute top-4 left-4 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold border-r border-slate-200 dark:border-slate-800 pr-4">
                            <Filter size={18} className="text-orange-500" />
                            Filter Peta
                        </div>
                        
                        <select 
                            className="bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-4 text-sm focus:ring-2 focus:ring-orange-500 outline-none text-slate-700 dark:text-slate-200 transition-all hover:border-orange-500/50"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                        >
                            <option value="">Semua Bencana</option>
                            {uniqueTypes.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>

                        <select 
                            className="bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-4 text-sm focus:ring-2 focus:ring-orange-500 outline-none text-slate-700 dark:text-slate-200 transition-all hover:border-orange-500/50"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <option value="">Semua Status</option>
                            <option value="pending">Pending</option>
                            <option value="handling">Dalam Penanganan</option>
                            <option value="resolved">Selesai</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                            Menampilkan <strong className="text-slate-900 dark:text-white">{filteredReports.length}</strong> titik
                        </div>
                        <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={fetchMapData}
                            disabled={loading}
                            className="p-2 text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-xl transition-colors border border-transparent hover:border-orange-500/20 shadow-sm"
                            title="Refresh Data"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </motion.button>
                    </div>
                </div>

                {/* Map Container */}
                <div className="absolute inset-0 z-0 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                    {loading && reports.length === 0 && (
                        <div className="absolute inset-0 z-[1000] bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex items-center justify-center">
                            <div className="flex flex-col items-center text-orange-500 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
                                <RefreshCw size={32} className="animate-spin mb-3" />
                                <span className="font-bold">Memuat Data GIS...</span>
                            </div>
                        </div>
                    )}
                    
                    {error && (
                        <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] bg-red-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-red-400 font-bold">
                            <AlertTriangle size={18} />
                            {error}
                        </motion.div>
                    )}

                    <div id="disaster-map-container" className="w-full h-full z-0 transition-opacity duration-1000"></div>

                    {/* Active Incident Floating Panel */}
                    <AnimatePresence>
                        {selectedReport && (
                            <motion.div 
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                className="absolute top-24 right-4 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5 w-80 max-h-[calc(100vh-2rem)] flex flex-col overflow-y-auto"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">Detail Kejadian</h3>
                                    <button 
                                        onClick={() => setSelectedReport(null)}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300">{selectedReport.type}</span>
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize ${
                                        selectedReport.status.toLowerCase() === 'pending' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                        selectedReport.status.toLowerCase() === 'handling' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    }`}>
                                        {selectedReport.status}
                                    </span>
                                </div>
                                
                                <h4 className="font-extrabold text-lg mb-2 text-slate-900 dark:text-white leading-tight">{selectedReport.title}</h4>
                                
                                <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400 text-sm mb-4">
                                    <MapPin size={16} className="shrink-0 mt-0.5 text-red-500" />
                                    <span>{selectedReport.location_name || 'Lokasi tidak diketahui'}</span>
                                </div>
                                
                                {selectedReport.description && (
                                    <div className="mb-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                        {selectedReport.description}
                                    </div>
                                )}
                                
                                <a 
                                    href={`${basePath}/aduan/${selectedReport.id}`} 
                                    className="mt-auto w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-center transition-colors shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
                                >
                                    Lihat Penanganan Khusus <ArrowRight size={16} />
                                </a>
                            </motion.div>
                        )}
                    </AnimatePresence>


                    {/* Legend Overlay */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="absolute bottom-6 left-6 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700/50 p-5 w-56 group-hover:border-orange-500/30 transition-colors"
                    >
                        <h4 className="font-extrabold text-sm mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                            <Layers size={16} className="text-orange-500" /> Legenda
                        </h4>
                        <div className="space-y-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-3">
                                <div className="w-3.5 h-3.5 rounded-full bg-orange-500 border-2 border-white dark:border-slate-900 shadow-md"></div>
                                <span>Pending / Baru</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 shadow-md"></div>
                                <span>Dalam Penanganan</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white dark:border-slate-900 shadow-md"></div>
                                <span>Selesai Resolusi</span>
                            </div>
                            <div className="my-3 border-t border-slate-200 dark:border-slate-800"></div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-red-500/20 border-2 border-red-500 rounded-sm"></div>
                                <span>Zona Risiko Tinggi</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-orange-500/20 border-2 border-orange-500 rounded-sm"></div>
                                <span>Zona Risiko Sedang</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </Layout>
    );
}
