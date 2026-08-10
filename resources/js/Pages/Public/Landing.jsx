import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../Components/PublicLayout';
import { homeService } from '../../api/services/home';
import { newsService } from '../../api/services/news';
import { reportService } from '../../api/services/reports';
import { masterDataService } from '../../api/services/masterData';
import { Cloud, Phone, ArrowRight, ShieldAlert, Newspaper, CloudLightning, Activity, AlertTriangle, Layers, MapPin, X, Filter, Heart, Flame, Droplets, Wind, Zap, Siren, Info } from 'lucide-react';
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

export default function Landing() {
    const [contacts, setContacts] = useState([]);
    const [news, setNews] = useState([]);
    const [reports, setReports] = useState([]);
    const [boundaries, setBoundaries] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    
    // UI States
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isBasemapOpen, setIsBasemapOpen] = useState(false);
    const [isInfoBencanaOpen, setIsInfoBencanaOpen] = useState(false);
    const [mapType, setMapType] = useState('light');
    const [kecamatanList, setKecamatanList] = useState([]);
    
    // Responsive state
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // Active filters applied to map (default 1 month)
    const [mapFilters, setMapFilters] = useState({
        kecamatan_id: '',
        year: '',
        start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
    });

    // Local filter state for the panel
    const [formFilters, setFormFilters] = useState(mapFilters);

    // Tooltip State
    const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

    const mapRef = useRef(null);
    const markersGroupRef = useRef(null);
    const boundariesGroupRef = useRef(null);
    const tileLayerRef = useRef(null);

    // Load initial data (except reports)
    useEffect(() => {
        const fetchPublicData = async () => {
            try {
                const [contactsRes, newsRes, boundariesRes, kecamatanRes] = await Promise.all([
                    homeService.getEmergencyContacts().catch(() => ({ data: [] })),
                    newsService.getAll().catch(() => ({ data: [] })),
                    masterDataService.getBoundaries().catch(() => ({ data: { data: [] } })),
                    masterDataService.getKecamatan().catch(() => ({ data: { data: [] } }))
                ]);
                
                if (contactsRes && contactsRes.success) setContacts(contactsRes.data);
                
                const newsData = Array.isArray(newsRes) ? newsRes : (newsRes.data || []);
                setNews(newsData.slice(0, 3));
                
                setBoundaries(boundariesRes.data?.data || []);
                setKecamatanList(kecamatanRes.data?.data || []);
                
            } catch (err) {
                setError('Gagal memuat sebagian data peta.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPublicData();
    }, []);

    // Load and react to Map Reports filtering
    useEffect(() => {
        const fetchReports = async () => {
            try {
                const reportsRes = await reportService.getMapReports(mapFilters);
                setReports(reportsRes.data?.data || []);
            } catch (err) {
                console.error("Gagal load laporan peta", err);
            }
        };
        fetchReports();
    }, [mapFilters]);

    // Init Map
    useEffect(() => {
        if (!mapRef.current) {
            const map = L.map('public-map-container', {
                zoomControl: false,
                attributionControl: false
            }).setView([-6.582, 106.871], 11);

            tileLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png').addTo(map);

            L.control.zoom({ position: 'bottomright' }).addTo(map);

            markersGroupRef.current = L.featureGroup().addTo(map);
            boundariesGroupRef.current = L.featureGroup().addTo(map);
            mapRef.current = map;
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Switch Map Type
    useEffect(() => {
        if (!tileLayerRef.current) return;
        
        let url = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'; // default light
        
        if (mapType === 'dark') url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
        if (mapType === 'satellite') url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        if (mapType === 'standard') url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        tileLayerRef.current.setUrl(url);
    }, [mapType]);

    // Load Boundaries
    useEffect(() => {
        if (!boundariesGroupRef.current || !mapRef.current || !boundaries.length) return;
        
        boundariesGroupRef.current.clearLayers();
        boundaries.forEach(b => {
            if (b.geojson) {
                try {
                    const geoData = typeof b.geojson === 'string' ? JSON.parse(b.geojson) : b.geojson;
                    L.geoJSON(geoData, {
                        style: {
                            color: b.color || '#3b82f6',
                            weight: 2,
                            opacity: 0.8,
                            fillOpacity: 0.1
                        }
                    }).addTo(boundariesGroupRef.current);
                } catch (e) {
                    console.error("Error parsing GeoJSON for boundary", b.name, e);
                }
            }
        });
    }, [boundaries]);

    // Load Markers
    useEffect(() => {
        if (!markersGroupRef.current || !mapRef.current) return;
        markersGroupRef.current.clearLayers();

        reports.forEach(r => {
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
                marker.on('click', () => setSelectedReport(r));
                markersGroupRef.current.addLayer(marker);
            }
        });
    }, [reports]);

    return (
        <PublicLayout mapMode={true}>
            <style>{`
                .leaflet-bottom.leaflet-right {
                    bottom: 120px !important;
                }
            `}</style>
            
            <div className="absolute inset-0 z-0 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                <div id="public-map-container" className="w-full h-full z-0 transition-opacity duration-1000" />
            </div>

            {/* Fixed Tooltip Rendered at Root */}
            <AnimatePresence>
                {tooltip.show && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className="fixed z-[9999] px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold rounded-lg pointer-events-none shadow-xl whitespace-nowrap"
                        style={{ top: tooltip.y + 15, left: tooltip.x + 15 }}
                    >
                        {tooltip.text}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Top Header Overlay */}
            <div className="absolute top-20 [.weather-open_&]:top-32 sm:[.weather-open_&]:top-40 left-4 right-4 z-[400] pointer-events-none transition-all duration-300 ease-in-out">
                <div className="flex justify-between items-start w-full">
                    {/* Left Side: Public Info (Scrollable Transparent Card) */}
                    <div className="pointer-events-auto max-w-full sm:max-w-max">
                        <div className="flex flex-row sm:flex-col gap-3 p-2 rounded-[24px] sm:rounded-full bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-md border border-white/50 dark:border-slate-700/50 shadow-sm overflow-x-auto overflow-y-hidden sm:overflow-y-auto sm:overflow-x-hidden w-[314px] max-w-full sm:w-auto sm:h-[314px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            <Link 
                                to="/news" 
                                onMouseMove={(e) => setTooltip({ show: true, text: 'Berita Terkini', x: e.clientX, y: e.clientY })}
                                onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                className="shrink-0 group bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-3 sm:p-3.5 rounded-full shadow-md border border-white/50 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 transition-all duration-300"
                            >
                                <Newspaper size={22} className="text-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 transition-colors" />
                            </Link>
                            <button 
                                onClick={() => { setIsContactOpen(!isContactOpen); setIsFilterOpen(false); setIsBasemapOpen(false); setIsInfoBencanaOpen(false); }} 
                                onMouseMove={(e) => setTooltip({ show: true, text: 'Kontak Darurat', x: e.clientX, y: e.clientY })}
                                onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                className="shrink-0 group bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-3 sm:p-3.5 rounded-full shadow-md border border-white/50 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 transition-all duration-300"
                            >
                                <Phone size={22} className={`shrink-0 transition-colors ${isContactOpen ? 'text-red-600 scale-110' : 'text-red-500 group-hover:text-red-600 group-hover:scale-110'}`} />
                            </button>
                            <button 
                                onClick={() => { setIsFilterOpen(!isFilterOpen); setIsContactOpen(false); setIsBasemapOpen(false); setIsInfoBencanaOpen(false); }} 
                                onMouseMove={(e) => setTooltip({ show: true, text: 'Filter Waktu', x: e.clientX, y: e.clientY })}
                                onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                className="shrink-0 group bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-3 sm:p-3.5 rounded-full shadow-md border border-white/50 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 transition-all duration-300"
                            >
                                <Filter size={22} className={`shrink-0 transition-colors ${isFilterOpen ? 'text-teal-600 scale-110' : 'text-teal-500 group-hover:text-teal-600 group-hover:scale-110'}`} />
                            </button>
                            <button 
                                onClick={() => { setIsBasemapOpen(!isBasemapOpen); setIsFilterOpen(false); setIsContactOpen(false); setIsInfoBencanaOpen(false); }} 
                                onMouseMove={(e) => setTooltip({ show: true, text: 'Pilihan Peta', x: e.clientX, y: e.clientY })}
                                onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                className="shrink-0 group bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-3 sm:p-3.5 rounded-full shadow-md border border-white/50 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 transition-all duration-300"
                            >
                                <Layers size={22} className={`shrink-0 transition-colors ${isBasemapOpen ? 'text-emerald-600 scale-110' : 'text-emerald-500 group-hover:text-emerald-600 group-hover:scale-110'}`} />
                            </button>
                            <button 
                                onClick={() => { setIsInfoBencanaOpen(!isInfoBencanaOpen); setIsFilterOpen(false); setIsContactOpen(false); setIsBasemapOpen(false); }} 
                                onMouseMove={(e) => setTooltip({ show: true, text: 'Informasi Bencana', x: e.clientX, y: e.clientY })}
                                onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                className="shrink-0 group bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-3 sm:p-3.5 rounded-full shadow-md border border-white/50 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 transition-all duration-300"
                            >
                                <Siren size={22} className={`shrink-0 transition-colors ${isInfoBencanaOpen ? 'text-orange-600 scale-110' : 'text-orange-500 group-hover:text-orange-600 group-hover:scale-110'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Draggable Info Bencana Panel */}
                <AnimatePresence>
                    {isInfoBencanaOpen && (
                        <motion.div
                            drag={isMobile ? "y" : true}
                            dragConstraints={isMobile ? { top: 0, bottom: 0 } : false}
                            dragElastic={isMobile ? 0.2 : 0.5}
                            onDragEnd={(e, info) => {
                                if (isMobile && info.offset.y > 100) setIsInfoBencanaOpen(false);
                            }}
                            dragMomentum={false}
                            initial={{ opacity: 0, scale: isMobile ? 1 : 0.9, y: isMobile ? "100%" : 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: isMobile ? 1 : 0.9, y: isMobile ? "100%" : 50 }}
                            transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                            className="fixed sm:absolute z-[600] bottom-0 sm:bottom-auto sm:top-0 left-0 sm:left-20 bg-slate-50/95 dark:bg-[#111]/95 backdrop-blur-xl rounded-t-3xl sm:rounded-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] sm:shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 p-5 w-full sm:w-[380px] max-h-[85vh] pointer-events-auto cursor-move flex flex-col"
                        >
                            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden shrink-0" />
                            <div className="flex items-center justify-center sm:justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800 relative shrink-0">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm sm:text-[15px]">
                                    Early Warning Alerts
                                </h3>
                                <button onPointerDownCapture={(e) => e.stopPropagation()} onClick={() => setIsInfoBencanaOpen(false)} className="absolute right-0 sm:relative text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 transition-colors cursor-pointer"><X size={18} /></button>
                            </div>
                            
                            {/* Tabs Removed (Only Peringatan) */}

                            <div className="space-y-5 cursor-auto max-h-[60vh] overflow-y-auto px-1 pb-4" onPointerDownCapture={(e) => e.stopPropagation()}>
                                {/* Section 1 */}
                                <div>
                                    <h4 className="text-orange-500 dark:text-orange-400 font-bold text-[10px] uppercase flex items-center gap-1.5 mb-2.5 tracking-wide">
                                        <Wind size={12} strokeWidth={3} /> Info Angin Puting Beliung
                                    </h4>
                                    
                                    <div className="bg-orange-50/50 dark:bg-orange-950/20 rounded-xl border border-orange-200/60 dark:border-orange-900/50 p-2.5 flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-orange-100 flex items-center justify-center">
                                                <Wind size={24} className="text-orange-500" />
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-slate-800 dark:text-slate-200 text-xs line-clamp-1">Waspada Angin Kencang</h5>
                                                <div className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold mt-1 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                                                    Siaga 2
                                                </div>
                                                <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">Kawasan Puncak & Sekitarnya</p>
                                            </div>
                                        </div>
                                        <button className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors shrink-0 shadow-sm">
                                            View
                                        </button>
                                    </div>
                                </div>

                                {/* Section 2: Active Reports grouped */}
                                <div>
                                    <h4 className="text-red-500 dark:text-red-400 font-bold text-[10px] uppercase flex items-center gap-1.5 mb-2.5 tracking-wide">
                                        <AlertTriangle size={12} strokeWidth={3} /> Bencana Aktif Lainnya
                                    </h4>
                                    
                                    <div className="space-y-3">
                                        {reports.length > 0 ? reports.slice(0, 1).map(report => (
                                            <div key={report.id} className="bg-orange-50/50 dark:bg-orange-950/20 rounded-xl border border-orange-200/60 dark:border-orange-900/50 p-2.5 flex items-center justify-between shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-800">
                                                        <img src={report.image_url || 'https://placehold.co/100x100?text=Foto'} alt={report.title} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-slate-800 dark:text-slate-200 text-xs line-clamp-1">{report.title}</h5>
                                                        <div className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold mt-1 bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                                                            {report.type}
                                                        </div>
                                                        <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{report.location_name}</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => setSelectedReport(report)}
                                                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors shrink-0 shadow-sm"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        )) : (
                                            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-center shadow-sm">
                                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Tidak ada laporan bencana aktif saat ini.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Mobile Overscroll Background */}
                            <div className="absolute top-[99%] left-0 right-0 h-[50vh] bg-slate-50/95 dark:bg-[#111]/95 backdrop-blur-xl sm:hidden border-none" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Draggable Basemap Panel */}
                <AnimatePresence>
                    {isBasemapOpen && (
                        <motion.div
                            drag={isMobile ? "y" : true}
                            dragConstraints={isMobile ? { top: 0, bottom: 0 } : false}
                            dragElastic={isMobile ? 0.2 : 0.5}
                            onDragEnd={(e, info) => {
                                if (isMobile && info.offset.y > 100) setIsBasemapOpen(false);
                            }}
                            dragMomentum={false}
                            initial={{ opacity: 0, scale: isMobile ? 1 : 0.9, y: isMobile ? "100%" : 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: isMobile ? 1 : 0.9, y: isMobile ? "100%" : 50 }}
                            transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                            className="fixed sm:absolute z-[600] bottom-0 sm:bottom-auto sm:top-0 left-0 sm:left-20 bg-slate-50/95 dark:bg-[#111]/95 backdrop-blur-xl rounded-t-3xl sm:rounded-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] sm:shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 p-5 w-full sm:w-[340px] max-h-[85vh] pointer-events-auto cursor-move flex flex-col"
                        >
                            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden shrink-0" />
                            <div className="flex items-center justify-center sm:justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800 relative shrink-0">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm sm:text-base">
                                    <Layers size={16} className="text-indigo-500 hidden sm:block"/> Basemaps
                                </h3>
                                <button onPointerDownCapture={(e) => e.stopPropagation()} onClick={() => setIsBasemapOpen(false)} className="absolute right-0 sm:relative text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 transition-colors cursor-pointer"><X size={18} /></button>
                            </div>
                            
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Choose a basemap style</p>

                            <div className="grid grid-cols-2 gap-3 cursor-auto max-h-[50vh] overflow-y-auto pb-2" onPointerDownCapture={(e) => e.stopPropagation()}>
                                {[
                                    { id: 'satellite', name: 'Satellite', desc: 'Citra satelit asli', color: 'bg-emerald-800' },
                                    { id: 'osm', name: 'Standard (OSM)', desc: 'Peta jalan detail', color: 'bg-blue-100' },
                                    { id: 'light', name: 'Light Gray', desc: 'Bersih & minimalis', color: 'bg-slate-200' },
                                    { id: 'dark', name: 'Dark Gray', desc: 'Tema gelap elegan', color: 'bg-slate-800' },
                                ].map(basemap => (
                                    <button 
                                        key={basemap.id}
                                        onClick={() => setMapType(basemap.id)} 
                                        className={`flex flex-col text-left rounded-xl border-2 overflow-hidden hover:shadow-md transition-all ${mapType === basemap.id ? 'border-indigo-500 shadow-sm' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`}
                                    >
                                        <div className={`h-24 w-full relative ${basemap.color} flex items-center justify-center opacity-80`}>
                                            <MapPin size={24} className="text-black/10 dark:text-white/10" />
                                            {mapType === basemap.id && (
                                                <div className="absolute top-2 right-2 bg-indigo-500 text-white rounded-full p-0.5 shadow-sm">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 bg-white dark:bg-slate-900 w-full h-full">
                                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{basemap.name}</h4>
                                            <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">{basemap.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            {/* Mobile Overscroll Background */}
                            <div className="absolute top-[99%] left-0 right-0 h-[50vh] bg-slate-50/95 dark:bg-[#111]/95 backdrop-blur-xl sm:hidden border-none" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Draggable Contact Panel */}
                <AnimatePresence>
                    {isContactOpen && (
                        <motion.div
                            drag={isMobile ? "y" : true}
                            dragConstraints={isMobile ? { top: 0, bottom: 0 } : false}
                            dragElastic={isMobile ? 0.2 : 0.5}
                            onDragEnd={(e, info) => {
                                if (isMobile && info.offset.y > 100) setIsContactOpen(false);
                            }}
                            dragMomentum={false}
                            initial={{ opacity: 0, scale: isMobile ? 1 : 0.9, y: isMobile ? "100%" : 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: isMobile ? 1 : 0.9, y: isMobile ? "100%" : 50 }}
                            transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                            className="fixed sm:absolute z-[600] bottom-0 sm:bottom-auto sm:top-0 left-0 sm:left-20 bg-slate-50/95 dark:bg-[#111]/95 backdrop-blur-xl rounded-t-3xl sm:rounded-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] sm:shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 p-5 w-full sm:w-[340px] max-h-[85vh] pointer-events-auto cursor-move flex flex-col"
                        >
                            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden shrink-0" />
                            <div className="flex items-center justify-center sm:justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800 relative shrink-0">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm sm:text-base">
                                    <div className="bg-rose-500 text-white p-0.5 rounded-sm"><Activity size={14} /></div> Emergency SOS
                                </h3>
                                <button onPointerDownCapture={(e) => e.stopPropagation()} onClick={() => setIsContactOpen(false)} className="absolute right-0 sm:relative text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 transition-colors cursor-pointer"><X size={18} /></button>
                            </div>
                            <div className="bg-orange-50/80 dark:bg-orange-900/20 border-l-4 border-orange-500 p-3 rounded-r-lg mb-5" onPointerDownCapture={(e) => e.stopPropagation()}>
                                <div className="flex items-start gap-2">
                                    <AlertTriangle size={16} className="text-orange-600 mt-0.5 shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-orange-800 dark:text-orange-400 text-xs">Butuh Bantuan Darurat?</h4>
                                        <p className="text-[10px] text-orange-700/80 dark:text-orange-200/70 mt-1 leading-relaxed">
                                            Gunakan panel ini untuk menghubungi pihak berwenang atau fasilitas kesehatan terdekat dalam keadaan darurat.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs mb-3">Apa keadaan darurat Anda?</h4>

                            <div className="grid grid-cols-2 gap-3 cursor-auto pb-2" onPointerDownCapture={(e) => e.stopPropagation()}>
                                {[
                                    { name: 'Darurat Umum', number: '112', icon: <Siren size={20} />, color: 'bg-rose-500' },
                                    { name: 'Polisi', number: '110', icon: <ShieldAlert size={20} />, color: 'bg-blue-600' },
                                    { name: 'Kebakaran', number: '113', icon: <Flame size={20} />, color: 'bg-orange-500' },
                                    { name: 'Medis', number: '119', icon: <Heart size={20} />, color: 'bg-emerald-500' },
                                    { name: 'Banjir / SAR', number: '115', icon: <Droplets size={20} />, color: 'bg-cyan-500' },
                                    { name: 'Kelistrikan', number: '123', icon: <Zap size={20} />, color: 'bg-yellow-500' },
                                ].map(contact => (
                                    <a key={contact.number} href={`tel:${contact.number}`} className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-800 hover:shadow-md transition-all group">
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white shadow-sm mb-2 group-hover:scale-110 transition-transform ${contact.color}`}>
                                            {contact.icon}
                                        </div>
                                        <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 text-center">{contact.name}</span>
                                    </a>
                                ))}
                            </div>

                            <div className="flex items-center gap-2 mt-2 pt-4 border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                                <MapPin size={14} />
                                <span className="text-[10px] font-medium">Kabupaten Bogor, Jawa Barat</span>
                            </div>
                            {/* Mobile Overscroll Background */}
                            <div className="absolute top-[99%] left-0 right-0 h-[50vh] bg-slate-50/95 dark:bg-[#111]/95 backdrop-blur-xl sm:hidden border-none" />
                        </motion.div>
                    )}
                </AnimatePresence>


                {/* Draggable Filter Panel */}
                <AnimatePresence>
                    {isFilterOpen && (
                        <motion.div
                            drag={isMobile ? "y" : true}
                            dragConstraints={isMobile ? { top: 0, bottom: 0 } : false}
                            dragElastic={isMobile ? 0.2 : 0.5}
                            onDragEnd={(e, info) => {
                                if (isMobile && info.offset.y > 100) setIsFilterOpen(false);
                            }}
                            dragMomentum={false}
                            initial={{ opacity: 0, scale: isMobile ? 1 : 0.9, y: isMobile ? "100%" : 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: isMobile ? 1 : 0.9, y: isMobile ? "100%" : 50 }}
                            transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                            className="fixed sm:absolute z-[600] bottom-0 sm:bottom-auto sm:top-0 left-0 sm:left-20 bg-slate-50/95 dark:bg-[#111]/95 backdrop-blur-xl rounded-t-3xl sm:rounded-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] sm:shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 p-5 w-full sm:w-72 max-h-[85vh] pointer-events-auto cursor-move flex flex-col"
                        >
                            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden shrink-0" />
                            <div className="flex items-center justify-center sm:justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800 relative shrink-0">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm sm:text-base">
                                    <Filter size={16} className="text-teal-500 hidden sm:block"/> Filter Waktu
                                </h3>
                                <button onPointerDownCapture={(e) => e.stopPropagation()} onClick={() => setIsFilterOpen(false)} className="absolute right-0 sm:relative text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 transition-colors cursor-pointer"><X size={18} /></button>
                            </div>
                            
                            <div className="space-y-4 cursor-auto max-h-[60vh] overflow-y-auto px-1" onPointerDownCapture={(e) => e.stopPropagation()}>
                                
                                {/* Filter Kecamatan */}
                                <div>
                                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Kecamatan</label>
                                    <select 
                                        value={formFilters.kecamatan_id} 
                                        onChange={(e) => setFormFilters({...formFilters, kecamatan_id: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Semua Kecamatan</option>
                                        {kecamatanList.map(kec => (
                                            <option key={kec.id_kecamatan} value={kec.id_kecamatan}>{kec.nama_kecamatan}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filter Tahun */}
                                <div>
                                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Pemetaan Tahunan</label>
                                    <select 
                                        value={formFilters.year} 
                                        onChange={(e) => setFormFilters({...formFilters, year: e.target.value, start_date: '', end_date: ''})}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Semua Tahun</option>
                                        <option value="2026">2026</option>
                                        <option value="2025">2025</option>
                                        <option value="2024">2024</option>
                                        <option value="2023">2023</option>
                                    </select>
                                </div>

                                {/* Filter Tanggal Spesifik */}
                                <div>
                                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Rentang Tanggal Spesifik</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="date" 
                                            value={formFilters.start_date}
                                            onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                            onChange={(e) => setFormFilters({...formFilters, start_date: e.target.value, year: ''})}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        />
                                        <span className="text-slate-400">-</span>
                                        <input 
                                            type="date" 
                                            value={formFilters.end_date}
                                            onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                            onChange={(e) => setFormFilters({...formFilters, end_date: e.target.value, year: ''})}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">*Memilih tanggal akan menonaktifkan filter tahunan</p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <button 
                                        onClick={() => {
                                            const reset = { kecamatan_id: '', year: '', start_date: '', end_date: '' };
                                            setFormFilters(reset);
                                            setMapFilters(reset);
                                        }}
                                        className="flex-1 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Reset
                                    </button>
                                    <button 
                                        onClick={() => setMapFilters(formFilters)}
                                        className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-md"
                                    >
                                        Terapkan
                                    </button>
                                </div>
                            </div>
                            
                            {/* Mobile Overscroll Background */}
                            <div className="absolute top-[99%] left-0 right-0 h-[50vh] bg-slate-50/95 dark:bg-[#111]/95 backdrop-blur-xl sm:hidden border-none" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>


            <AnimatePresence>
                {selectedReport && (
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
                        className="absolute bottom-24 left-4 right-4 sm:bottom-auto sm:left-auto sm:top-40 sm:right-4 z-[500] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 w-auto sm:w-80 max-h-[50vh] sm:max-h-[calc(100vh-12rem)] flex flex-col overflow-y-auto pointer-events-auto"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-800 dark:text-slate-200">Detail Kejadian</h3>
                            <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full bg-slate-100 transition-colors"><X size={16} /></button>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-700">{selectedReport.type}</span>
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold capitalize ${
                                selectedReport.status.toLowerCase() === 'pending' ? 'bg-orange-100 text-orange-700' :
                                selectedReport.status.toLowerCase() === 'handling' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            }`}>
                                {selectedReport.status}
                            </span>
                        </div>
                        
                        <h4 className="font-extrabold text-sm mb-2 text-slate-900 leading-tight">{selectedReport.title}</h4>
                        
                        <div className="flex items-start gap-2 text-slate-500 text-xs mb-4">
                            <MapPin size={14} className="shrink-0 mt-0.5 text-red-500" />
                            <span>{selectedReport.location_name || 'Lokasi tidak diketahui'}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </PublicLayout>
    );
}
