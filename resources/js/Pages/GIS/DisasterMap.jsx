import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../Components/Layout';
import { useAuth } from '../../AuthContext';
import { reportService } from '../../api/services/reports';
import { masterDataService } from '../../api/services/masterData';
import { drawAdminBoundaries, getResponseDataArray } from '../../lib/mapBoundaries';
import { getAdminScopeFilters, getAdminScopeLabel } from '../../lib/adminScope';
import { homeService } from '../../api/services/home';
import { Filter, Layers, MapPin, AlertTriangle, RefreshCw, X, ArrowRight, Download, Table2, Info, Search } from 'lucide-react';
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
    const { user } = useAuth();
    
    const isKabupaten = location.pathname.includes('/kabupaten');
    const isKecamatan = location.pathname.includes('/kecamatan');
    const basePath = isKabupaten ? '/dashboard/kabupaten' : (isKecamatan ? '/dashboard/kecamatan' : '/dashboard/kelurahan');
    
    const [reports, setReports] = useState([]);
    const [boundaries, setBoundaries] = useState([]);
    const [kecamatanList, setKecamatanList] = useState([]);
    const [kelurahanList, setKelurahanList] = useState([]);
    const [error, setError] = useState(null);
    const [weather, setWeather] = useState(null);

    // Filters
    const [selectedType, setSelectedType] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedReport, setSelectedReport] = useState(null);
    const [selectedKecamatan, setSelectedKecamatan] = useState('');
    const [selectedKelurahan, setSelectedKelurahan] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isLegendOpen, setIsLegendOpen] = useState(false);

    const mapRef = useRef(null);
    const markersGroupRef = useRef(null);
    const boundariesGroupRef = useRef(null);
    const fittedAreaKeyRef = useRef('');

    const normalizeName = (name) => name?.toLowerCase().replace(/^(kecamatan|kelurahan|desa)\s+/i, '').trim();

    // Load data
    const fetchMapData = async () => {
        try {
            setError(null);
            const scopeFilters = getAdminScopeFilters(user);
            const kelurahanScopeId = isKabupaten ? null : (scopeFilters.kecamatan_id || user?.id_kecamatan || null);
            
            const [reportsRes, boundariesRes, weatherRes, kecamatanRes, kelurahanRes] = await Promise.all([
                reportService.getMapReports(scopeFilters),
                masterDataService.getBoundaries({ level: 'kabupaten,kecamatan,kelurahan' }).catch(() => ({ data: { data: [] } })),
                homeService.getWeather().catch(() => null),
                masterDataService.getKecamatan().catch(() => []),
                masterDataService.getKelurahan(kelurahanScopeId).catch(() => [])
            ]);
            setWeather(weatherRes);

            setReports(getResponseDataArray(reportsRes));
            setBoundaries(getResponseDataArray(boundariesRes));
            setKecamatanList(getResponseDataArray(kecamatanRes));
            setKelurahanList(getResponseDataArray(kelurahanRes));
        } catch (err) {
            console.error("Gagal memuat data GIS:", err);
            setError("Gagal memuat data peta.");
        }
    };

    useEffect(() => {
        if (user) fetchMapData();
    }, [user]);

    // Derived filters
    const uniqueTypes = useMemo(() => [...new Set(reports.map(r => r.type))], [reports]);
    const filteredReports = useMemo(() => {
        return reports.filter(r => {
            const matchType = !selectedType || r.type === selectedType;
            const matchStatus = !selectedStatus || r.status.toLowerCase() === selectedStatus.toLowerCase();
            const loc = normalizeName(r.location_name) || '';
            const matchKecamatan = !selectedKecamatan || 
                normalizeName(r.kecamatan_name) === normalizeName(selectedKecamatan) || 
                loc.includes(normalizeName(selectedKecamatan));
            const matchKelurahan = !selectedKelurahan || 
                normalizeName(r.kelurahan_name) === normalizeName(selectedKelurahan) || 
                loc.includes(normalizeName(selectedKelurahan));
            
            return matchType && matchStatus && matchKecamatan && matchKelurahan;
        });
    }, [reports, selectedType, selectedStatus, selectedKecamatan, selectedKelurahan]);

    const availableKelurahan = useMemo(() => {
        if (!selectedKecamatan) return kelurahanList;
        return kelurahanList.filter(k => {
            const kec = kecamatanList.find(x => String(x.id_kecamatan) === String(k.id_kecamatan));
            return normalizeName(kec?.nama_kecamatan) === normalizeName(selectedKecamatan) || 
                   normalizeName(k.nama_kecamatan) === normalizeName(selectedKecamatan);
        });
    }, [selectedKecamatan, kelurahanList, kecamatanList]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const q = searchQuery.toLowerCase();
        const results = [];
        
        if (isKabupaten) {
            kecamatanList.forEach(kec => {
                if (kec.nama_kecamatan.toLowerCase().includes(q)) {
                    results.push({ type: 'Kecamatan', id_kecamatan: kec.id_kecamatan, nama_kecamatan: kec.nama_kecamatan });
                }
            });
        }

        kelurahanList.forEach(kel => {
            const match = kel.nama_kelurahan?.toLowerCase().includes(q) || kel.nama_desa?.toLowerCase().includes(q);
            if (match) {
                const kec = kecamatanList.find(x => String(x.id_kecamatan) === String(kel.id_kecamatan));
                if (!isKabupaten && !isKecamatan && user?.id_kelurahan && String(kel.id_kelurahan || kel.id) !== String(user.id_kelurahan)) return;
                results.push({ 
                    type: 'Desa', 
                    id_kecamatan: kel.id_kecamatan, 
                    id_kelurahan: kel.id_kelurahan || kel.id,
                    nama_kelurahan: kel.nama_kelurahan || kel.nama_desa,
                    parentName: kec?.nama_kecamatan || ''
                });
            }
        });

        setSearchResults(results.slice(0, 10));
    }, [searchQuery, kecamatanList, kelurahanList, isKabupaten, isKecamatan, user]);

    // Init Map
    useEffect(() => {
        if (!mapRef.current) {
            const map = L.map('disaster-map-container', {
                zoomControl: false,
                attributionControl: false,
                preferCanvas: true
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
        if (!boundariesGroupRef.current || !mapRef.current || !boundaries.length) return;
        boundariesGroupRef.current.clearLayers();

        const showKelurahanLabels = Boolean(selectedKecamatan) || mapRef.current.getZoom() >= 13;
        
        // Cari nama wilayah user
        const userKecName = !isKabupaten && user?.id_kecamatan 
            ? kecamatanList.find(k => k.id_kecamatan == user.id_kecamatan)?.nama_kecamatan 
            : null;
        const userKelName = !isKabupaten && !isKecamatan && user?.id_kelurahan 
            ? kelurahanList.find(k => (k.id_kelurahan || k.id) == user.id_kelurahan)?.nama_kelurahan || 
              kelurahanList.find(k => (k.id_kelurahan || k.id) == user.id_kelurahan)?.nama_desa
            : null;

        const shouldFitSelectedArea = Boolean(selectedKecamatan || selectedKelurahan);
        const selectedAreaKey = selectedKelurahan
            ? `kelurahan:${normalizeName(selectedKecamatan)}:${normalizeName(selectedKelurahan)}`
            : selectedKecamatan
                ? `kecamatan:${normalizeName(selectedKecamatan)}`
                : '';
                
        const initialAreaKey = isKabupaten 
            ? 'kabupaten' 
            : isKecamatan 
                ? `kecamatan:${normalizeName(userKecName)}`
                : `kelurahan:${normalizeName(userKecName)}:${normalizeName(userKelName)}`;
                
        const effectiveAreaKey = selectedAreaKey || initialAreaKey;
        const shouldFitNow = Boolean(effectiveAreaKey && fittedAreaKeyRef.current !== effectiveAreaKey);

        drawAdminBoundaries(L, boundariesGroupRef.current, boundaries, {
            levels: showKelurahanLabels || selectedKelurahan || (!isKabupaten && !isKecamatan) ? ['kabupaten', 'kecamatan', 'kelurahan'] : ['kabupaten', 'kecamatan'],
            filter: (boundary) => {
                // Filter spesifik per role admin
                if (!isKabupaten) {
                    if (isKecamatan) {
                        if (boundary.level === 'kabupaten') return false; 
                        if (boundary.level === 'kecamatan') return normalizeName(boundary.name) === normalizeName(userKecName);
                        if (boundary.level === 'kelurahan') return normalizeName(boundary.parent_name) === normalizeName(userKecName);
                    } else {
                        // Kelurahan admin
                        if (boundary.level === 'kabupaten') return false;
                        if (boundary.level === 'kecamatan') return false;
                        if (boundary.level === 'kelurahan') return normalizeName(boundary.name) === normalizeName(userKelName) && normalizeName(boundary.parent_name) === normalizeName(userKecName);
                    }
                }

                // Untuk Kabupaten Admin, tampilkan semua (tapi kelurahan hanya jika dipilih/zoom dekat)
                if (boundary.level !== 'kelurahan') return true;
                return normalizeName(boundary.parent_name) === normalizeName(selectedKecamatan);
            },
            styleForBoundary: (boundary, baseStyle) => {
                const isSelectedKecamatan = selectedKecamatan &&
                    boundary.level === 'kecamatan' &&
                    normalizeName(boundary.name) === normalizeName(selectedKecamatan);
                const isSelectedKelurahan = selectedKelurahan &&
                    boundary.level === 'kelurahan' &&
                    normalizeName(boundary.name) === normalizeName(selectedKelurahan) &&
                    normalizeName(boundary.parent_name) === normalizeName(selectedKecamatan);

                if (isSelectedKelurahan) {
                    return { ...baseStyle, color: '#ec4899', fillColor: '#ec4899', weight: 4, fillOpacity: 0.24, opacity: 1 };
                }
                if (isSelectedKecamatan) {
                    return { ...baseStyle, color: '#f97316', fillColor: '#f97316', weight: 4, fillOpacity: 0.18, opacity: 1 };
                }
                return baseStyle;
            },
            boundsFilter: (boundary) => {
                if (selectedKelurahan) {
                    return boundary.level === 'kelurahan' &&
                        normalizeName(boundary.name) === normalizeName(selectedKelurahan) &&
                        normalizeName(boundary.parent_name) === normalizeName(selectedKecamatan);
                }
                if (selectedKecamatan) {
                    return boundary.level === 'kecamatan' &&
                        normalizeName(boundary.name) === normalizeName(selectedKecamatan);
                }
                
                // Jika tidak ada filter yang dipilih, zoom sesuai role
                if (!isKabupaten) {
                    if (isKecamatan) {
                        return boundary.level === 'kecamatan' && normalizeName(boundary.name) === normalizeName(userKecName);
                    } else {
                        return boundary.level === 'kelurahan' && normalizeName(boundary.name) === normalizeName(userKelName) && normalizeName(boundary.parent_name) === normalizeName(userKecName);
                    }
                }
                
                return boundary.level === 'kabupaten';
            },
            fitMap: shouldFitNow ? mapRef.current : null,
            fitOptions: { padding: [52, 52], maxZoom: (selectedKelurahan || (!isKabupaten && !isKecamatan)) ? 14 : 12 },
        });

        if (effectiveAreaKey) fittedAreaKeyRef.current = effectiveAreaKey;
        else fittedAreaKeyRef.current = '';
    }, [boundaries, selectedKecamatan, selectedKelurahan, isKabupaten, isKecamatan, user, kecamatanList, kelurahanList]);

    // Draw Markers
    useEffect(() => {
        if (!markersGroupRef.current || !mapRef.current) return;
        markersGroupRef.current.clearLayers();

        filteredReports.forEach(r => {
            if (r.latitude && r.longitude) {
                const n = r.type.toLowerCase();
                let emoji = '⚠️';
                if (n === 'banjir') emoji = '🌊';
                else if (n === 'tsunami') emoji = '🌊';
                else if (n === 'kebakaran') emoji = '🔥';
                else if (n === 'angin puting beliung') emoji = '🌪️';
                else if (n === 'gempa bumi') emoji = '🫨';
                else if (n === 'tanah longsor') emoji = '⛰️';
                else if (n === 'gunung meletus') emoji = '🌋';
                else if (n === 'kekeringan') emoji = '☀️';

                const markerColor = r.status.toLowerCase() === 'pending' ? '#f97316' : // orange-500
                                    r.status.toLowerCase() === 'handling' ? '#3b82f6' : // blue-500
                                    '#10b981'; // emerald-500

                const customIcon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color: ${markerColor}; width: 26px; height: 26px; border-radius: 50%; border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; font-size: 13px;">${emoji}</div>`,
                    iconSize: [26, 26],
                    iconAnchor: [13, 13]
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
        <Layout activePage="map" title="Peta Wilayah dan Sebaran Aduan" fullScreen={true}>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full h-full flex flex-col overflow-hidden"
            >
                {/* Draggable/Sidebar Filter Panel */}
                <AnimatePresence>
                    {isFilterOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="absolute z-[600] top-4 left-4 bg-slate-50/95 dark:bg-[#111]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 w-[320px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] flex flex-col pointer-events-auto"
                        >
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm">
                                    <Filter size={16} className="text-teal-500"/> Filter Peta
                                </h3>
                                <button onClick={() => setIsFilterOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 transition-colors"><X size={18} /></button>
                            </div>
                            
                            <div className="space-y-4 overflow-y-auto px-1 max-h-[60vh] pb-4">
                                {/* Pencarian Cepat */}
                                <div className="relative">
                                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Cari Wilayah</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="Ketik nama kecamatan / desa..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 p-2 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-orange-500"
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                            <Search size={14} className="text-slate-400" />
                                        </div>
                                    </div>
                                    {searchResults.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                            {searchResults.map((item, idx) => (
                                                <button
                                                    key={idx}
                                                    className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 last:border-0 flex flex-col"
                                                    onClick={() => {
                                                        if (item.type === 'Kecamatan') {
                                                            setSelectedKecamatan(item.nama_kecamatan);
                                                            setSelectedKelurahan('');
                                                        } else {
                                                            setSelectedKecamatan(item.parentName);
                                                            setSelectedKelurahan(item.nama_kelurahan);
                                                        }
                                                        setSearchQuery('');
                                                        setSearchResults([]);
                                                    }}
                                                >
                                                    <span className="font-semibold">{item.type === 'Kecamatan' ? item.nama_kecamatan : item.nama_kelurahan}</span>
                                                    <span className="text-[10px] text-slate-400">{item.type === 'Desa' ? `Desa di Kec. ${item.parentName}` : 'Kecamatan'}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Filter Bencana */}
                                <div>
                                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Jenis Bencana</label>
                                    <select 
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                    >
                                        <option value="">Semua Bencana</option>
                                        {uniqueTypes.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filter Status */}
                                <div>
                                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Status Penanganan</label>
                                    <select 
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                    >
                                        <option value="">Semua Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="handling">Dalam Penanganan</option>
                                        <option value="resolved">Selesai</option>
                                    </select>
                                </div>

                                {/* Filter Kecamatan */}
                                <div>
                                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Kecamatan</label>
                                    <select
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all disabled:opacity-50"
                                        value={selectedKecamatan}
                                        onChange={(e) => {
                                            setSelectedKecamatan(e.target.value);
                                            setSelectedKelurahan('');
                                        }}
                                        disabled={!isKabupaten}
                                    >
                                        <option value="">Semua Kecamatan</option>
                                        {kecamatanList.map(k => (
                                            <option key={k.id_kecamatan} value={k.nama_kecamatan}>{k.nama_kecamatan}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filter Kelurahan */}
                                <div>
                                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Desa / Kelurahan</label>
                                    <select
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all disabled:opacity-50"
                                        value={selectedKelurahan}
                                        onChange={(e) => setSelectedKelurahan(e.target.value)}
                                        disabled={(!isKabupaten && !isKecamatan) || !selectedKecamatan}
                                    >
                                        <option value="">{selectedKecamatan ? 'Semua Desa / Kelurahan' : 'Pilih Kecamatan Dulu'}</option>
                                        {availableKelurahan.map(k => (
                                            <option key={k.id_kelurahan || k.id} value={k.nama_kelurahan || k.nama_desa}>
                                                {k.nama_kelurahan || k.nama_desa}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Draggable/Sidebar Legend Panel */}
                <AnimatePresence>
                    {isLegendOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            className="absolute z-[600] top-20 right-4 bg-slate-50/95 dark:bg-[#111]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 w-[280px] max-w-[calc(100vw-2rem)] flex flex-col pointer-events-auto transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm">
                                    <Info size={16} className="text-blue-500"/> Legenda
                                </h3>
                                <button onClick={() => setIsLegendOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 transition-colors"><X size={18} /></button>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Simbol Bencana</h4>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                                        <div className="flex items-center gap-2"><span className="text-sm">🌊</span> Banjir/Tsunami</div>
                                        <div className="flex items-center gap-2"><span className="text-sm">🔥</span> Kebakaran</div>
                                        <div className="flex items-center gap-2"><span className="text-sm">🌪️</span> Puting Beliung</div>
                                        <div className="flex items-center gap-2"><span className="text-sm">🫨</span> Gempa Bumi</div>
                                        <div className="flex items-center gap-2"><span className="text-sm">⛰️</span> Longsor</div>
                                        <div className="flex items-center gap-2"><span className="text-sm">🌋</span> Gn. Meletus</div>
                                        <div className="flex items-center gap-2"><span className="text-sm">☀️</span> Kekeringan</div>
                                        <div className="flex items-center gap-2"><span className="text-sm">⚠️</span> Lainnya</div>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                                    <h4 className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Warna Status</h4>
                                    <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-[#f97316] border border-white"></div> Pending
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-[#3b82f6] border border-white"></div> Dalam Penanganan
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-[#10b981] border border-white"></div> Selesai
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Floating Buttons if closed */}
                <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 pointer-events-none">
                    {!isFilterOpen && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => setIsFilterOpen(true)}
                            className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-4 py-3 rounded-full shadow-lg border border-slate-200 dark:border-slate-800 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-200 font-bold text-sm pointer-events-auto"
                        >
                            <Filter size={18} className="text-teal-500" /> Filter Peta
                        </motion.button>
                    )}

                    {!isLegendOpen && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => setIsLegendOpen(true)}
                            className={`bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-4 py-3 rounded-full shadow-lg border border-slate-200 dark:border-slate-800 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-200 font-bold text-sm pointer-events-auto ${isFilterOpen ? 'ml-[340px]' : ''}`}
                        >
                            <Info size={18} className="text-blue-500" /> Legenda
                        </motion.button>
                    )}
                </div>

                {/* Info Bar at top right */}
                <div className="absolute top-4 right-4 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-2 pl-4 flex items-center gap-4 pointer-events-auto">
                    <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                        {getAdminScopeLabel(user)} | <strong className="text-slate-900 dark:text-white">{filteredReports.length}</strong> titik
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={fetchMapData}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-xl transition-colors border border-transparent hover:border-orange-500/20 shadow-sm"
                        title="Refresh Data"
                    >
                        <RefreshCw size={18} />
                    </motion.button>
                </div>

                {/* Map Container */}
                <div className="absolute inset-0 z-0 bg-slate-100 dark:bg-slate-900 overflow-hidden">
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

                </div>
            </motion.div>
        </Layout>
    );
}
