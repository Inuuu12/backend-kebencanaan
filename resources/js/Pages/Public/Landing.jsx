import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../Components/PublicLayout';
import { homeService } from '../../api/services/home';
import { newsService } from '../../api/services/news';
import { reportService } from '../../api/services/reports';
import { masterDataService } from '../../api/services/masterData';
import { drawAdminBoundaries, findBoundaryContainingPoint, getResponseDataArray, normalizeName } from '../../lib/mapBoundaries';
import { Cloud, Phone, ArrowRight, ShieldAlert, Newspaper, CloudLightning, Activity, AlertTriangle, Layers, MapPin, X, Filter, Heart, Flame, Droplets, Wind, Zap, Siren, Info, Mountain, Sun, TrendingDown, Waves, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
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
    const [countReports, setCountReports] = useState([]);
    const [boundaries, setBoundaries] = useState([]);
    const [kelurahanBoundaries, setKelurahanBoundaries] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const dragControls = useDragControls();
    const detailDragControls = useDragControls();
    
    // UI States
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isBasemapOpen, setIsBasemapOpen] = useState(false);
    const [isInfoBencanaOpen, setIsInfoBencanaOpen] = useState(false);
    const [isCategoryRailOpen, setIsCategoryRailOpen] = useState(true);
    const [mapType, setMapType] = useState('light');
    const [kecamatanList, setKecamatanList] = useState([]);
    const [kelurahanList, setKelurahanList] = useState([]);
    const [allKelurahanList, setAllKelurahanList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [mapViewport, setMapViewport] = useState({
        zoom: 11,
        center: { lat: -6.582, lng: 106.871 },
    });
    
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
        kelurahan_id: '',
        year: '',
        month: '',
        start_date: '',
        end_date: ''
    });

    // Local filter state for the panel
    const [formFilters, setFormFilters] = useState(mapFilters);

    // Tooltip State
    const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
    const categoryRailDuration = 36;
    const categoryRailDelay = useMemo(() => {
        return -((Date.now() / 1000) % categoryRailDuration);
    }, []);
    const filterSheetMobileOffsetClass = isCategoryRailOpen
        ? 'bottom-[70px] max-h-[calc(85vh-70px)]'
        : 'bottom-0 max-h-[85vh]';

    // Disaster category rail data
    const [bencanaList, setBencanaList] = useState([]);
    useEffect(() => {
        masterDataService.getBencana()
            .then(res => {
                const rawBencana = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);

                if (rawBencana.length > 0) {
                    const unique = [];
                    const map = new Map();
                    for (const item of rawBencana) {
                        if (!map.has(item.nama_bencana)) {
                            map.set(item.nama_bencana, true);
                            unique.push(item);
                        }
                    }
                    setBencanaList(unique);
                }
            })
            .catch(err => console.error("Error fetching bencana:", err));
    }, []);

    const mapRef = useRef(null);
    const markersGroupRef = useRef(null);
    const boundariesGroupRef = useRef(null);
    const tileLayerRef = useRef(null);
    const userLocationMarkerRef = useRef(null);
    const userAccuracyCircleRef = useRef(null);
    const fittedAreaKeyRef = useRef('');

    // Load initial data (except reports)
    useEffect(() => {
        const fetchPublicData = async () => {
            try {
                const [contactsRes, newsRes, boundariesRes, kecamatanRes, allKelurahanRes] = await Promise.all([
                    homeService.getEmergencyContacts().catch(() => ({ data: [] })),
                    newsService.getAll().catch(() => ({ data: [] })),
                    masterDataService.getBoundaries().catch(() => ({ data: { data: [] } })),
                    masterDataService.getKecamatan().catch(() => ({ data: { data: [] } })),
                    masterDataService.getKelurahan().catch(() => ({ data: { data: [] } }))
                ]);
                
                if (contactsRes && contactsRes.success) setContacts(contactsRes.data);
                
                const newsData = Array.isArray(newsRes) ? newsRes : (newsRes.data || []);
                setNews(newsData.slice(0, 3));
                
                setBoundaries(getResponseDataArray(boundariesRes));
                setKecamatanList(getResponseDataArray(kecamatanRes));
                setAllKelurahanList(getResponseDataArray(allKelurahanRes));
                
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
                const { id_bencana, ...countFilters } = mapFilters;
                const [reportsRes, countReportsRes] = await Promise.all([
                    reportService.getMapReports(mapFilters),
                    reportService.getMapReports(countFilters)
                ]);

                setReports(getResponseDataArray(reportsRes));
                setCountReports(getResponseDataArray(countReportsRes));
            } catch (err) {
                console.error("Gagal load laporan peta", err);
            }
        };
        fetchReports();
    }, [mapFilters]);

    useEffect(() => {
        if (!formFilters.kecamatan_id) {
            setKelurahanList([]);
            if (formFilters.kelurahan_id) {
                setFormFilters((prev) => ({ ...prev, kelurahan_id: '' }));
            }
            return;
        }

        masterDataService.getKelurahan(formFilters.kecamatan_id)
            .then((res) => setKelurahanList(getResponseDataArray(res)))
            .catch((err) => {
                console.error('Gagal memuat desa/kelurahan:', err);
                setKelurahanList([]);
            });
    }, [formFilters.kecamatan_id]);

    const reportCountsByType = useMemo(() => {
        const counts = new Map();

        countReports.forEach((report) => {
            const key = normalizeName(report.type);
            if (!key) return;
            counts.set(key, (counts.get(key) || 0) + 1);
        });

        return counts;
    }, [countReports]);

    const selectedKecamatan = useMemo(() => {
        if (!mapFilters.kecamatan_id) return null;
        return kecamatanList.find((kecamatan) => String(kecamatan.id_kecamatan) === String(mapFilters.kecamatan_id)) || null;
    }, [kecamatanList, mapFilters.kecamatan_id]);

    const selectedKelurahan = useMemo(() => {
        if (!mapFilters.kelurahan_id) return null;
        return kelurahanList.find((kelurahan) => String(kelurahan.id_kelurahan) === String(mapFilters.kelurahan_id)) || null;
    }, [kelurahanList, mapFilters.kelurahan_id]);

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        
        const kecResults = kecamatanList
            .filter(k => k.nama_kecamatan.toLowerCase().includes(q))
            .map(k => ({ ...k, type: 'Kecamatan', label: k.nama_kecamatan }));
            
        const kelResults = allKelurahanList
            .filter(k => k.nama_kelurahan.toLowerCase().includes(q))
            .map(k => {
                const kec = kecamatanList.find(x => String(x.id_kecamatan) === String(k.id_kecamatan));
                return { 
                    ...k, 
                    type: 'Desa', 
                    parentName: kec ? kec.nama_kecamatan : 'Kab. Bogor'
                };
            });
            
        return [...kecResults, ...kelResults].slice(0, 10);
    }, [searchQuery, kecamatanList, allKelurahanList]);

    const userLocationKecamatan = useMemo(() => {
        if (!userLocation?.latitude || !userLocation?.longitude || !boundaries.length) return null;
        return findBoundaryContainingPoint(boundaries, userLocation.latitude, userLocation.longitude, 'kecamatan');
    }, [boundaries, userLocation]);

    const viewportKecamatan = useMemo(() => {
        if (!boundaries.length || mapViewport.zoom < 13) return null;
        return findBoundaryContainingPoint(boundaries, mapViewport.center.lat, mapViewport.center.lng, 'kecamatan');
    }, [boundaries, mapViewport]);

    useEffect(() => {
        const hasFocusedKecamatan = Boolean(
            selectedKecamatan?.nama_kecamatan ||
            userLocationKecamatan?.name ||
            viewportKecamatan?.name
        );
        const needsKelurahanBoundaries = mapFilters.kelurahan_id || (mapViewport.zoom >= 13 && hasFocusedKecamatan);

        if (!needsKelurahanBoundaries || kelurahanBoundaries.length > 0) return;

        masterDataService.getBoundaries({ level: 'kelurahan' })
            .then((res) => setKelurahanBoundaries(getResponseDataArray(res)))
            .catch((err) => {
                console.error('Gagal memuat polygon desa/kelurahan:', err);
                setKelurahanBoundaries([]);
            });
    }, [mapFilters.kelurahan_id, kelurahanBoundaries.length, mapViewport.zoom, selectedKecamatan, userLocationKecamatan, viewportKecamatan]);

    // Init Map
    useEffect(() => {
        if (!mapRef.current) {
            const map = L.map('public-map-container', {
                zoomControl: false,
                attributionControl: false,
                preferCanvas: true // Optimasi performa render di mobile (menggunakan Canvas alih-alih SVG)
            }).setView([-6.582, 106.871], 11);

            tileLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png').addTo(map);

            L.control.zoom({ position: 'bottomright' }).addTo(map);

            markersGroupRef.current = L.featureGroup().addTo(map);
            boundariesGroupRef.current = L.featureGroup().addTo(map);
            mapRef.current = map;

            const syncViewport = () => {
                const center = map.getCenter();
                setMapViewport({
                    zoom: map.getZoom(),
                    center: { lat: center.lat, lng: center.lng },
                });
            };

            map.on('zoomend moveend', syncViewport);
            syncViewport();
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

        const selectedKecamatanName = selectedKecamatan?.nama_kecamatan;
        const selectedKelurahanName = selectedKelurahan?.nama_kelurahan;
        const shouldFitSelectedArea = Boolean(selectedKecamatanName || selectedKelurahanName);
        const userLocationKecamatanName = userLocationKecamatan?.name;
        const viewportKecamatanName = viewportKecamatan?.name;
        const focusedKecamatanName = selectedKecamatanName || viewportKecamatanName || userLocationKecamatanName;
        const showKabupatenOnly = mapViewport.zoom < 11;
        const showKelurahanLabels = mapViewport.zoom >= 13 && Boolean(focusedKecamatanName);
        const selectedAreaKey = selectedKelurahanName
            ? `kelurahan:${normalizeName(selectedKecamatanName)}:${normalizeName(selectedKelurahanName)}`
            : selectedKecamatanName
                ? `kecamatan:${normalizeName(selectedKecamatanName)}`
                : '';
        const shouldFitNow = Boolean(selectedAreaKey && fittedAreaKeyRef.current !== selectedAreaKey);
        const selectedKecamatanColor = selectedKecamatan
            ? ['#f97316', '#14b8a6', '#8b5cf6', '#e11d48', '#0ea5e9', '#84cc16'][Number(selectedKecamatan.id_kecamatan) % 6]
            : '#f97316';
        const drawableBoundaries = showKelurahanLabels || selectedKelurahanName
            ? [...boundaries, ...kelurahanBoundaries]
            : boundaries;

        drawAdminBoundaries(L, boundariesGroupRef.current, drawableBoundaries, {
            levels: showKelurahanLabels || selectedKelurahanName ? ['kabupaten', 'kecamatan', 'kelurahan'] : ['kabupaten', 'kecamatan'],
            filter: (boundary) => {
                if (showKelurahanLabels && !selectedKelurahanName) {
                    return boundary.level !== 'kelurahan' ||
                        normalizeName(boundary.parent_name) === normalizeName(focusedKecamatanName);
                }

                if (!shouldFitSelectedArea) return true;
                if (selectedKelurahanName) {
                    return (
                        boundary.level === 'kelurahan' &&
                        normalizeName(boundary.name) === normalizeName(selectedKelurahanName) &&
                        normalizeName(boundary.parent_name) === normalizeName(selectedKecamatanName)
                    ) || (
                        boundary.level === 'kecamatan' &&
                        normalizeName(boundary.name) === normalizeName(selectedKecamatanName)
                    );
                }

                return boundary.level !== 'kelurahan';
            },
            styleForBoundary: (boundary, baseStyle) => {
                const isSelectedKecamatan = selectedKecamatanName &&
                    boundary.level === 'kecamatan' &&
                    normalizeName(boundary.name) === normalizeName(selectedKecamatanName);
                const isSelectedKelurahan = selectedKelurahanName &&
                    boundary.level === 'kelurahan' &&
                    normalizeName(boundary.name) === normalizeName(selectedKelurahanName) &&
                    normalizeName(boundary.parent_name) === normalizeName(selectedKecamatanName);
                const isUserLocationKecamatan = userLocationKecamatanName &&
                    boundary.level === 'kecamatan' &&
                    normalizeName(boundary.name) === normalizeName(userLocationKecamatanName);
                const isFocusedKelurahan = showKelurahanLabels &&
                    boundary.level === 'kelurahan' &&
                    normalizeName(boundary.parent_name) === normalizeName(focusedKecamatanName);

                if (isSelectedKelurahan) {
                    return {
                        ...baseStyle,
                        color: '#ec4899',
                        fillColor: '#ec4899',
                        weight: 4,
                        fillOpacity: 0.24,
                        opacity: 1,
                    };
                }

                if (isSelectedKecamatan) {
                    return {
                        ...baseStyle,
                        color: selectedKecamatanColor,
                        fillColor: selectedKecamatanColor,
                        weight: 4,
                        fillOpacity: 0.18,
                        opacity: 1,
                    };
                }

                if (isFocusedKelurahan) {
                    return {
                        ...baseStyle,
                        color: '#16a34a',
                        fillColor: '#22c55e',
                        weight: 1.8,
                        fillOpacity: 0.13,
                        opacity: 0.86,
                    };
                }

                if (isUserLocationKecamatan) {
                    return {
                        ...baseStyle,
                        color: '#facc15',
                        fillColor: '#fde047',
                        weight: 5,
                        fillOpacity: 0.28,
                        opacity: 1,
                    };
                }

                if (userLocationKecamatanName && !shouldFitSelectedArea && boundary.level === 'kecamatan') {
                    return {
                        ...baseStyle,
                        weight: 1.5,
                        fillOpacity: 0.025,
                        opacity: 0.32,
                    };
                }

                return baseStyle;
            },
            labelFilter: (boundary) => {
                if (showKabupatenOnly) return boundary.level === 'kabupaten';

                if (showKelurahanLabels) {
                    return (
                        boundary.level === 'kelurahan' &&
                        normalizeName(boundary.parent_name) === normalizeName(focusedKecamatanName)
                    ) || (
                        boundary.level === 'kecamatan' &&
                        normalizeName(boundary.name) === normalizeName(focusedKecamatanName)
                    );
                }

                if (!shouldFitSelectedArea) return boundary.level === 'kecamatan';
                if (selectedKelurahanName) {
                    return (
                        boundary.level === 'kelurahan' &&
                        normalizeName(boundary.name) === normalizeName(selectedKelurahanName)
                    ) || (
                        boundary.level === 'kecamatan' &&
                        normalizeName(boundary.name) === normalizeName(selectedKecamatanName)
                    );
                }

                return boundary.level === 'kecamatan' &&
                    normalizeName(boundary.name) === normalizeName(selectedKecamatanName);
            },
            labelFormatter: (boundary) => {
                if (boundary.level === 'kabupaten') return `Kabupaten ${boundary.name}`;
                if (boundary.level === 'kecamatan') return `Kecamatan ${boundary.name}`;
                if (boundary.level === 'kelurahan') return boundary.name;
                return boundary.name || 'Wilayah';
            },
            labelClassName: (boundary) => {
                if (boundary.level === 'kabupaten') return 'sigab-boundary-label sigab-boundary-label-kabupaten';
                if (boundary.level === 'kelurahan') return 'sigab-boundary-label sigab-boundary-label-desa';
                return 'sigab-boundary-label';
            },
            boundsFilter: (boundary) => {
                if (selectedKelurahanName) {
                    return boundary.level === 'kelurahan' &&
                        normalizeName(boundary.name) === normalizeName(selectedKelurahanName) &&
                        normalizeName(boundary.parent_name) === normalizeName(selectedKecamatanName);
                }

                return boundary.level === 'kecamatan' &&
                    normalizeName(boundary.name) === normalizeName(selectedKecamatanName);
            },
            fitMap: shouldFitNow ? mapRef.current : null,
            fitOptions: { padding: [52, 52], maxZoom: selectedKelurahanName ? 14 : 12 },
        });

        if (selectedAreaKey) {
            fittedAreaKeyRef.current = selectedAreaKey;
        } else {
            fittedAreaKeyRef.current = '';
        }
    }, [boundaries, kelurahanBoundaries, selectedKecamatan, selectedKelurahan, userLocationKecamatan, viewportKecamatan, mapViewport.zoom]);

    // Load Markers
    useEffect(() => {
        if (!markersGroupRef.current || !mapRef.current) return;
        markersGroupRef.current.clearLayers();

        reports.forEach(r => {
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
                // marker.on('click', () => setSelectedReport(r)); // Nonaktifkan klik marker sesuai permintaan
                // Tooltip dinonaktifkan agar info hanya bisa diakses via panel Informasi Bencana
                markersGroupRef.current.addLayer(marker);
            }
        });
    }, [reports]);

    // Show current user's browser location on the landing map.
    useEffect(() => {
        if (!mapRef.current || !userLocation?.latitude || !userLocation?.longitude) return;

        const map = mapRef.current;
        const latLng = [userLocation.latitude, userLocation.longitude];

        if (userLocationMarkerRef.current) {
            map.removeLayer(userLocationMarkerRef.current);
            userLocationMarkerRef.current = null;
        }

        if (userAccuracyCircleRef.current) {
            map.removeLayer(userAccuracyCircleRef.current);
            userAccuracyCircleRef.current = null;
        }

        const userIcon = L.divIcon({
            className: 'sigab-user-location-icon',
            html: '<span class="sigab-user-location-pulse"></span><span class="sigab-user-location-dot"></span>',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
        });

        const popupText = userLocationKecamatan?.name
            ? `Lokasi Anda<br/><strong>Kecamatan ${userLocationKecamatan.name}</strong>`
            : 'Lokasi Anda';

        userLocationMarkerRef.current = L.marker(latLng, {
            icon: userIcon,
            zIndexOffset: 1000,
        }).bindPopup(popupText).addTo(map);

        if (userLocation.accuracy) {
            userAccuracyCircleRef.current = L.circle(latLng, {
                radius: Math.min(userLocation.accuracy, 1200),
                color: '#14b8a6',
                fillColor: '#14b8a6',
                fillOpacity: 0.08,
                opacity: 0.24,
                weight: 1,
            }).addTo(map);
        }

        map.flyTo(latLng, Math.max(map.getZoom(), 15), {
            animate: true,
            duration: 0.8,
        });
    }, [userLocation, userLocationKecamatan]);

    return (
        <PublicLayout
            mapMode={true}
            onLocationFound={(location) => setUserLocation(location)}
            headerActions={
                <button
                    onClick={() => setIsCategoryRailOpen(!isCategoryRailOpen)}
                    className="flex items-center gap-2 hover:text-indigo-500 transition-colors focus:outline-none"
                >
                    <Activity size={18} className={isCategoryRailOpen ? 'text-indigo-500' : ''} />
                    <span className={isCategoryRailOpen ? 'text-indigo-500 font-bold' : ''}>Kejadian</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isCategoryRailOpen ? 'rotate-180 text-indigo-500' : ''}`} />
                </button>
            }
        >
            <style>{`
                .leaflet-bottom.leaflet-right {
                    bottom: ${isCategoryRailOpen ? '82px' : '24px'} !important;
                }

                @media (min-width: 640px) {
                    .leaflet-bottom.leaflet-right {
                        bottom: ${isCategoryRailOpen ? '112px' : '24px'} !important;
                    }
                }

                @keyframes category-rail-marquee {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(-100%);
                    }
                }

                .category-rail-track {
                    animation: category-rail-marquee ${categoryRailDuration}s linear infinite;
                    animation-delay: var(--category-rail-delay);
                    will-change: transform;
                }

                .category-rail-viewport:hover .category-rail-track {
                    animation-play-state: paused;
                }

                @media (prefers-reduced-motion: reduce) {
                    .category-rail-track {
                        animation: none;
                    }
                }

                .sigab-boundary-label {
                    background: rgba(15, 23, 42, 0.78);
                    border: 1px solid rgba(255, 255, 255, 0.28);
                    border-radius: 999px;
                    color: #fff;
                    font-size: 10px;
                    font-weight: 800;
                    padding: 3px 8px;
                    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.2);
                    text-transform: capitalize;
                }

                .sigab-boundary-label::before {
                    display: none;
                }

                .sigab-boundary-label-kabupaten {
                    background: rgba(124, 45, 18, 0.88);
                    border-color: rgba(253, 186, 116, 0.72);
                    font-size: 11px;
                    padding: 4px 10px;
                }

                .sigab-boundary-label-desa {
                    background: rgba(20, 83, 45, 0.78);
                    border-color: rgba(187, 247, 208, 0.45);
                    font-size: 9px;
                    padding: 2px 6px;
                    white-space: nowrap;
                    text-align: center;
                    line-height: 1.15;
                }

                .sigab-user-location-icon {
                    position: relative;
                    width: 28px !important;
                    height: 28px !important;
                    border: 0;
                    background: transparent;
                }

                .sigab-user-location-pulse,
                .sigab-user-location-dot {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    border-radius: 999px;
                }

                .sigab-user-location-pulse {
                    width: 28px;
                    height: 28px;
                    background: rgba(20, 184, 166, 0.24);
                    animation: sigab-user-location-pulse 1.6s ease-out infinite;
                }

                .sigab-user-location-dot {
                    width: 14px;
                    height: 14px;
                    background: #14b8a6;
                    border: 3px solid #ffffff;
                    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.35);
                }

                @keyframes sigab-user-location-pulse {
                    0% {
                        transform: translate(-50%, -50%) scale(0.72);
                        opacity: 0.9;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(1.65);
                        opacity: 0;
                    }
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
                                onMouseMove={(e) => setTooltip({ show: true, text: 'Berita', x: e.clientX, y: e.clientY })}
                                onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                className="shrink-0 group bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-4 py-2 sm:p-3.5 rounded-full shadow-md border border-white/50 dark:border-slate-800 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all duration-300"
                            >
                                <Newspaper size={18} className="sm:w-[22px] sm:h-[22px] text-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 transition-colors" />
                                <span className="block sm:hidden text-[10px] font-bold text-slate-700 dark:text-slate-200">Berita</span>
                            </Link>
                            <button 
                                onClick={() => { setIsContactOpen(!isContactOpen); setIsFilterOpen(false); setIsBasemapOpen(false); setIsInfoBencanaOpen(false); }} 
                                onMouseMove={(e) => setTooltip({ show: true, text: 'Kontak Darurat', x: e.clientX, y: e.clientY })}
                                onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                className="shrink-0 group bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-4 py-2 sm:p-3.5 rounded-full shadow-md border border-white/50 dark:border-slate-800 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all duration-300"
                            >
                                <Phone size={18} className={`sm:w-[22px] sm:h-[22px] shrink-0 transition-colors ${isContactOpen ? 'text-red-600 scale-110' : 'text-red-500 group-hover:text-red-600 group-hover:scale-110'}`} />
                                <span className={`block sm:hidden text-[10px] font-bold ${isContactOpen ? 'text-red-600' : 'text-slate-700 dark:text-slate-200'}`}>Kontak</span>
                            </button>
                            <button 
                                onClick={() => { setIsFilterOpen(!isFilterOpen); setIsContactOpen(false); setIsBasemapOpen(false); setIsInfoBencanaOpen(false); }} 
                                onMouseMove={(e) => setTooltip({ show: true, text: 'Filter', x: e.clientX, y: e.clientY })}
                                onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                className="shrink-0 group bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-4 py-2 sm:p-3.5 rounded-full shadow-md border border-white/50 dark:border-slate-800 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all duration-300"
                            >
                                <Filter size={18} className={`sm:w-[22px] sm:h-[22px] shrink-0 transition-colors ${isFilterOpen ? 'text-teal-600 scale-110' : 'text-teal-500 group-hover:text-teal-600 group-hover:scale-110'}`} />
                                <span className={`block sm:hidden text-[10px] font-bold ${isFilterOpen ? 'text-teal-600' : 'text-slate-700 dark:text-slate-200'}`}>Filter</span>
                            </button>
                            <button 
                                onClick={() => { setIsBasemapOpen(!isBasemapOpen); setIsFilterOpen(false); setIsContactOpen(false); setIsInfoBencanaOpen(false); }} 
                                onMouseMove={(e) => setTooltip({ show: true, text: 'Pilihan Peta', x: e.clientX, y: e.clientY })}
                                onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                className="shrink-0 group bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-4 py-2 sm:p-3.5 rounded-full shadow-md border border-white/50 dark:border-slate-800 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all duration-300"
                            >
                                <Layers size={18} className={`sm:w-[22px] sm:h-[22px] shrink-0 transition-colors ${isBasemapOpen ? 'text-emerald-600 scale-110' : 'text-emerald-500 group-hover:text-emerald-600 group-hover:scale-110'}`} />
                                <span className={`block sm:hidden text-[10px] font-bold ${isBasemapOpen ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-200'}`}>Layer Peta</span>
                            </button>
                            <button 
                                onClick={() => { setIsInfoBencanaOpen(!isInfoBencanaOpen); setIsFilterOpen(false); setIsContactOpen(false); setIsBasemapOpen(false); }} 
                                onMouseMove={(e) => setTooltip({ show: true, text: 'Informasi Bencana', x: e.clientX, y: e.clientY })}
                                onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                className="shrink-0 group bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-4 py-2 sm:p-3.5 rounded-full shadow-md border border-white/50 dark:border-slate-800 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all duration-300"
                            >
                                <Siren size={18} className={`sm:w-[22px] sm:h-[22px] shrink-0 transition-colors ${isInfoBencanaOpen ? 'text-orange-600 scale-110' : 'text-orange-500 group-hover:text-orange-600 group-hover:scale-110'}`} />
                                <span className={`block sm:hidden text-[10px] font-bold ${isInfoBencanaOpen ? 'text-orange-600' : 'text-slate-700 dark:text-slate-200'}`}>Info Bencana</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Draggable Info Bencana Panel */}
                <AnimatePresence>
                    {isInfoBencanaOpen && (
                        <motion.div
                            drag={isMobile ? "y" : true}
                            dragControls={isMobile ? undefined : dragControls}
                            dragListener={isMobile ? true : false}
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
                            className="fixed sm:absolute z-[600] bottom-0 sm:bottom-auto sm:top-0 left-0 sm:left-20 bg-slate-50/95 dark:bg-[#111]/95 backdrop-blur-xl rounded-t-3xl sm:rounded-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] sm:shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 p-5 w-full sm:w-[360px] sm:resize sm:min-w-[320px] sm:max-w-[500px] sm:min-h-[400px] sm:overflow-hidden max-h-[85vh] pointer-events-auto flex flex-col"
                        >
                            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden shrink-0" />
                            <div 
                                className="flex items-center justify-center sm:justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800 relative shrink-0 sm:cursor-move"
                                onPointerDown={(e) => { if (!isMobile) dragControls.start(e); }}
                            >
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm sm:text-[15px] pointer-events-none">
                                    Informasi Bencana
                                </h3>
                                <button onPointerDownCapture={(e) => e.stopPropagation()} onClick={() => setIsInfoBencanaOpen(false)} className="absolute right-0 sm:relative text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 transition-colors cursor-pointer"><X size={18} /></button>
                            </div>
                            
                            {/* Tabs Removed (Only Peringatan) */}

                            <div className="space-y-5 cursor-auto max-h-[60vh] overflow-y-auto px-1 pb-4" onPointerDownCapture={(e) => e.stopPropagation()}>
                                {(() => {
                                    const activeReports = reports.filter(r => r.status.toLowerCase() !== 'selesai');
                                    const pastReports = reports.filter(r => r.status.toLowerCase() === 'selesai');

                                    const renderReportCard = (report, isPast = false) => (
                                        <div key={report.id || report.id_laporan || report.title} className={`${isPast ? 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-200/60 dark:border-slate-700/50 hover:border-slate-300' : 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-200/60 dark:border-orange-900/50 hover:border-orange-300'} rounded-xl border p-2.5 flex items-center justify-between shadow-sm transition-colors`}>
                                            <div className="flex items-center gap-3 w-full pr-2">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-800">
                                                    <img src={report.image_url || 'https://placehold.co/100x100?text=Foto'} alt={report.title} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="font-bold text-slate-800 dark:text-slate-200 text-xs line-clamp-1">{report.title}</h5>
                                                    <div className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold mt-1 ${isPast ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'}`}>
                                                        {report.type}
                                                    </div>
                                                    <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                                                        {report.kelurahan_name && report.kecamatan_name 
                                                            ? `Kel. ${report.kelurahan_name}, Kec. ${report.kecamatan_name}` 
                                                            : report.location_name}
                                                    </p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    setSelectedReport(report);
                                                    if (mapRef.current && report.latitude && report.longitude) {
                                                        mapRef.current.flyTo([report.latitude, report.longitude], 15, { animate: true, duration: 1 });
                                                    }
                                                }}
                                                className={`${isPast ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'} text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors shrink-0 shadow-sm`}
                                            >
                                                View
                                            </button>
                                        </div>
                                    );

                                    return (
                                        <>
                                            {/* Bencana Aktif */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2.5">
                                                    <h4 className="text-red-500 dark:text-red-400 font-bold text-[10px] uppercase flex items-center gap-1.5 tracking-wide">
                                                        <AlertTriangle size={12} strokeWidth={3} /> {mapFilters.id_bencana ? 'Bencana Terpilih (Aktif)' : 'Sedang Dalam Penanganan'}
                                                    </h4>
                                                    <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300">
                                                        Total: {activeReports.length}
                                                    </span>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    {activeReports.length > 0 ? activeReports.map(r => renderReportCard(r, false)) : (
                                                        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center shadow-sm flex flex-col items-center justify-center">
                                                            <ShieldAlert size={24} className="text-emerald-500 mb-2 opacity-50" />
                                                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Tidak ada bencana aktif saat ini.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Riwayat Bencana */}
                                            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
                                                <div className="flex items-center justify-between mb-2.5">
                                                    <h4 className="text-emerald-600 dark:text-emerald-500 font-bold text-[10px] uppercase flex items-center gap-1.5 tracking-wide">
                                                        <ShieldAlert size={12} strokeWidth={3} /> {mapFilters.id_bencana ? 'Riwayat Terpilih (Selesai)' : 'Riwayat Penanganan Selesai'}
                                                    </h4>
                                                    <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300">
                                                        Total: {pastReports.length}
                                                    </span>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    {pastReports.length > 0 ? pastReports.map(r => renderReportCard(r, true)) : (
                                                        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center shadow-sm flex flex-col items-center justify-center">
                                                            <Info size={24} className="text-slate-400 mb-2 opacity-50" />
                                                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Belum ada riwayat penanganan selesai.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                            {/* Mobile Overscroll Background */}
                            <div className={`${isCategoryRailOpen ? 'hidden' : 'block'} absolute top-[99%] left-0 right-0 h-[50vh] bg-slate-50/95 dark:bg-[#111]/95 backdrop-blur-xl sm:hidden border-none`} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Draggable Basemap Panel */}
                <AnimatePresence>
                    {isBasemapOpen && (
                        <motion.div
                            drag={isMobile ? "y" : true}
                            dragControls={isMobile ? undefined : dragControls}
                            dragListener={isMobile ? true : false}
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
                            className="fixed sm:absolute z-[600] bottom-0 sm:bottom-auto sm:top-0 left-0 sm:left-20 bg-slate-50/95 dark:bg-[#111]/95 backdrop-blur-xl rounded-t-3xl sm:rounded-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] sm:shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 p-5 w-full sm:w-[360px] sm:resize sm:min-w-[320px] sm:max-w-[500px] sm:min-h-[300px] sm:overflow-hidden max-h-[85vh] pointer-events-auto flex flex-col"
                        >
                            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden shrink-0" />
                            <div 
                                className="flex items-center justify-center sm:justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800 relative shrink-0 sm:cursor-move"
                                onPointerDown={(e) => { if (!isMobile) dragControls.start(e); }}
                            >
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm sm:text-base pointer-events-none">
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
                            dragControls={isMobile ? undefined : dragControls}
                            dragListener={isMobile ? true : false}
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
                            className="fixed sm:absolute z-[600] bottom-0 sm:bottom-auto sm:top-0 left-0 sm:left-20 bg-slate-50/95 dark:bg-[#111]/95 backdrop-blur-xl rounded-t-3xl sm:rounded-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] sm:shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 p-5 w-full sm:w-[360px] sm:resize sm:min-w-[320px] sm:max-w-[500px] sm:min-h-[400px] sm:overflow-hidden max-h-[85vh] pointer-events-auto flex flex-col"
                        >
                            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden shrink-0" />
                            <div 
                                className="flex items-center justify-center sm:justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800 relative shrink-0 sm:cursor-move"
                                onPointerDown={(e) => { if (!isMobile) dragControls.start(e); }}
                            >
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm sm:text-base pointer-events-none">
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
                            dragControls={isMobile ? undefined : dragControls}
                            dragListener={isMobile ? true : false}
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
                            className={`fixed sm:absolute z-[600] ${filterSheetMobileOffsetClass} sm:bottom-auto sm:top-0 left-0 sm:left-20 bg-slate-50/95 dark:bg-[#111]/95 backdrop-blur-xl rounded-t-3xl sm:rounded-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] sm:shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 p-5 w-full sm:w-[360px] sm:resize sm:min-w-[320px] sm:max-w-[500px] sm:min-h-[400px] sm:overflow-hidden max-h-[85vh] pointer-events-auto flex flex-col`}
                        >
                            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden shrink-0" />
                            <div 
                                className="flex items-center justify-center sm:justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800 relative shrink-0 sm:cursor-move"
                                onPointerDown={(e) => { if (!isMobile) dragControls.start(e); }}
                            >
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm sm:text-base pointer-events-none">
                                    <Filter size={16} className="text-teal-500 hidden sm:block"/> Filter
                                </h3>
                                <button onPointerDownCapture={(e) => e.stopPropagation()} onClick={() => setIsFilterOpen(false)} className="absolute right-0 sm:relative text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 transition-colors cursor-pointer"><X size={18} /></button>
                            </div>
                            
                            <div className="space-y-4 cursor-auto max-h-[60vh] overflow-y-auto px-1" onPointerDownCapture={(e) => e.stopPropagation()}>
                                
                                {/* Filter Pencarian Cepat */}
                                <div className="relative">
                                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Cari Wilayah (Kab. Bogor)</label>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-2 leading-tight">Ketik nama wilayah untuk mempercepat pencarian tanpa harus memilih dari daftar dropdown di bawah.</p>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="Ketik nama kecamatan / desa..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 p-2.5 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                            <Info size={14} className="text-slate-400" />
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
                                                            setFormFilters({...formFilters, kecamatan_id: item.id_kecamatan, kelurahan_id: ''});
                                                        } else {
                                                            setFormFilters({...formFilters, kecamatan_id: item.id_kecamatan, kelurahan_id: item.id_kelurahan});
                                                        }
                                                        setSearchQuery('');
                                                    }}
                                                >
                                                    <span className="font-semibold">{item.type === 'Kecamatan' ? item.nama_kecamatan : item.nama_kelurahan}</span>
                                                    <span className="text-[10px] text-slate-400">{item.type === 'Desa' ? `Desa di Kec. ${item.parentName}` : 'Kecamatan'}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Filter Kecamatan */}
                                <div>
                                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Kecamatan</label>
                                    <select 
                                        value={formFilters.kecamatan_id} 
                                        onChange={(e) => setFormFilters({...formFilters, kecamatan_id: e.target.value, kelurahan_id: ''})}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Semua Kecamatan</option>
                                        {kecamatanList.map(kec => (
                                            <option key={kec.id_kecamatan} value={kec.id_kecamatan}>{kec.nama_kecamatan}</option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-tight">Pilih untuk menampilkan bencana khusus di kecamatan ini.</p>
                                </div>

                                {/* Filter Desa/Kelurahan */}
                                <div>
                                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Desa / Kelurahan</label>
                                    <select 
                                        value={formFilters.kelurahan_id} 
                                        onChange={(e) => setFormFilters({...formFilters, kelurahan_id: e.target.value})}
                                        disabled={!formFilters.kecamatan_id}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <option value="">
                                            {formFilters.kecamatan_id ? 'Semua Desa / Kelurahan' : 'Pilih Kecamatan Dulu'}
                                        </option>
                                        {kelurahanList.map(kel => (
                                            <option key={kel.id_kelurahan} value={kel.id_kelurahan}>{kel.nama_kelurahan}</option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-slate-400 mt-1">Daftar desa otomatis mengikuti kecamatan yang dipilih.</p>
                                </div>

                                {/* Filter Tahun & Bulan */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Tahun</label>
                                        <select 
                                            value={formFilters.year} 
                                            onChange={(e) => setFormFilters({...formFilters, year: e.target.value, start_date: '', end_date: ''})}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Semua</option>
                                            <option value="2026">2026</option>
                                            <option value="2025">2025</option>
                                            <option value="2024">2024</option>
                                            <option value="2023">2023</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Bulan</label>
                                        <select 
                                            value={formFilters.month} 
                                            onChange={(e) => setFormFilters({...formFilters, month: e.target.value, start_date: '', end_date: ''})}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Semua</option>
                                            <option value="1">Januari</option>
                                            <option value="2">Februari</option>
                                            <option value="3">Maret</option>
                                            <option value="4">April</option>
                                            <option value="5">Mei</option>
                                            <option value="6">Juni</option>
                                            <option value="7">Juli</option>
                                            <option value="8">Agustus</option>
                                            <option value="9">September</option>
                                            <option value="10">Oktober</option>
                                            <option value="11">November</option>
                                            <option value="12">Desember</option>
                                        </select>
                                    </div>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 col-span-2 leading-tight">Gunakan filter ini untuk melihat arsip riwayat bencana pada periode waktu tertentu.</p>
                                </div>

                                {/* Filter Tanggal Spesifik */}
                                <div>
                                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Rentang Tanggal (Opsional)</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="date" 
                                            value={formFilters.start_date}
                                            onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                            onChange={(e) => setFormFilters({...formFilters, start_date: e.target.value, year: '', month: ''})}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        />
                                        <span className="text-slate-400">-</span>
                                        <input 
                                            type="date" 
                                            value={formFilters.end_date}
                                            onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                            onChange={(e) => setFormFilters({...formFilters, end_date: e.target.value, year: '', month: ''})}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <button 
                                        onClick={() => {
                                            const reset = { kecamatan_id: '', kelurahan_id: '', year: '', month: '', start_date: '', end_date: '' };
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
                        drag={isMobile ? "y" : true}
                        dragControls={isMobile ? undefined : detailDragControls}
                        dragListener={isMobile ? true : false}
                        dragConstraints={isMobile ? { top: 0, bottom: 0 } : false}
                        dragElastic={isMobile ? 0.2 : 0.5}
                        onDragEnd={(e, info) => {
                            if (isMobile && info.offset.y > 100) setSelectedReport(null);
                        }}
                        dragMomentum={false}
                        className={`absolute bottom-24 left-4 right-4 sm:bottom-auto sm:right-auto ${isInfoBencanaOpen ? 'sm:left-[460px]' : 'sm:left-24'} sm:top-20 sm:[.weather-open_&]:top-40 transition-[top] duration-300 ease-in-out z-[500] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 w-auto sm:w-80 max-h-[50vh] sm:max-h-[calc(100vh-12rem)] flex flex-col pointer-events-auto`}
                    >
                        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden shrink-0" />
                        <div 
                            className="flex items-center justify-center sm:justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800 relative shrink-0 sm:cursor-move"
                            onPointerDown={(e) => { if (!isMobile) detailDragControls.start(e); }}
                        >
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm sm:text-[15px] pointer-events-none">
                                Detail Kejadian
                            </h3>
                            <button onPointerDownCapture={(e) => e.stopPropagation()} onClick={() => setSelectedReport(null)} className="absolute right-0 sm:relative text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 transition-colors cursor-pointer"><X size={18} /></button>
                        </div>
                        
                        <div className="overflow-y-auto pr-1">
                        
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg text-[10px] font-bold text-indigo-700 dark:text-indigo-300">{selectedReport.type}</span>
                        </div>
                        
                        <h4 className="font-extrabold text-sm mb-2 text-slate-800 dark:text-slate-100 leading-tight">{selectedReport.title}</h4>
                        
                        <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400 text-xs mb-3">
                            <MapPin size={14} className="shrink-0 mt-0.5 text-red-500" />
                            <span>
                                {selectedReport.kelurahan_name && selectedReport.kecamatan_name 
                                    ? `Kel. ${selectedReport.kelurahan_name}, Kec. ${selectedReport.kecamatan_name}` 
                                    : (selectedReport.location_name || 'Lokasi tidak diketahui')}
                            </span>
                        </div>
                        
                        {selectedReport.image_url && (
                            <div className="w-full h-32 sm:h-40 rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                                <img src={selectedReport.image_url} alt={selectedReport.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                            </div>
                        )}
                        
                        {selectedReport.description && (
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 mb-2 shrink-0">
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                                    {selectedReport.description}
                                </p>
                                <div className="mt-2.5 flex justify-end">
                                    <Link to={`/news/${selectedReport.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-600 text-[10px] font-bold rounded-lg hover:bg-blue-50 dark:hover:bg-slate-600 transition-colors shadow-sm">
                                        Selengkapnya <ArrowRight size={12} />
                                    </Link>
                                </div>
                            </div>
                        )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={false}
                animate={{ y: isCategoryRailOpen ? 0 : '100%', opacity: isCategoryRailOpen ? 1 : 0 }}
                transition={{ duration: 0.28, ease: 'easeInOut' }}
                className="absolute bottom-0 left-0 right-0 z-[400] pointer-events-none"
            >
                        <div className={`${isCategoryRailOpen ? 'pointer-events-auto' : 'pointer-events-none'} w-full bg-white/75 dark:bg-[#0a0a0a]/75 backdrop-blur-md border-t border-[#19140035] dark:border-[#3E3E3A] shadow-[0_-8px_28px_-18px_rgba(15,23,42,0.45)] px-3 sm:px-6 py-1.5 sm:py-3 flex items-center gap-2 sm:gap-4 overflow-hidden`}>
                            <div className="shrink-0 border-r border-[#19140035] dark:border-slate-700 pr-2 sm:pr-4 flex items-center gap-1.5 sm:gap-2">
                                <Activity size={16} className="text-indigo-500 sm:w-[18px] sm:h-[18px]" />
                                <span className="text-[9px] sm:text-xs leading-tight font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide max-w-[54px] sm:max-w-none">
                                    Total Kejadian
                                </span>
                            </div>

                            <div className="w-full overflow-x-auto overflow-y-hidden flex items-center h-[76px] sm:h-[100px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] touch-pan-x">
                                <div className="inline-flex items-center gap-4 sm:gap-6 py-2 px-4 sm:px-6 h-full min-w-max">
                                        {bencanaList.map((bencana, index) => {
                                            const n = bencana.nama_bencana.toLowerCase();
                                            let Icon = AlertTriangle;
                                            let activeColor = 'text-slate-600';
                                            let activeBorder = 'border-slate-500';
                                            let activeBg = 'bg-slate-50';
                                            
                                            if (n === 'banjir') { 
                                                Icon = Droplets; activeColor = 'text-blue-600'; activeBorder = 'border-blue-500'; activeBg = 'bg-blue-50 dark:bg-blue-900/30';
                                            } else if (n === 'tsunami') { 
                                                Icon = Waves; activeColor = 'text-teal-600'; activeBorder = 'border-teal-500'; activeBg = 'bg-teal-50 dark:bg-teal-900/30';
                                            } else if (n === 'kebakaran') { 
                                                Icon = Flame; activeColor = 'text-orange-600'; activeBorder = 'border-orange-500'; activeBg = 'bg-orange-50 dark:bg-orange-900/30';
                                            } else if (n === 'angin puting beliung') { 
                                                Icon = Wind; activeColor = 'text-cyan-600'; activeBorder = 'border-cyan-500'; activeBg = 'bg-cyan-50 dark:bg-cyan-900/30';
                                            } else if (n === 'gempa bumi') { 
                                                Icon = Activity; activeColor = 'text-rose-600'; activeBorder = 'border-rose-500'; activeBg = 'bg-rose-50 dark:bg-rose-900/30';
                                            } else if (n === 'tanah longsor') { 
                                                Icon = TrendingDown; activeColor = 'text-amber-800'; activeBorder = 'border-amber-700'; activeBg = 'bg-amber-100 dark:bg-amber-900/40';
                                            } else if (n === 'gunung meletus') { 
                                                Icon = Mountain; activeColor = 'text-red-600'; activeBorder = 'border-red-500'; activeBg = 'bg-red-50 dark:bg-red-900/30';
                                            } else if (n === 'kekeringan') { 
                                                Icon = Sun; activeColor = 'text-yellow-600'; activeBorder = 'border-yellow-500'; activeBg = 'bg-yellow-50 dark:bg-yellow-900/30';
                                            }
                                            
                                            const isActive = mapFilters.id_bencana === bencana.id_bencana;
                                            const reportCount = reportCountsByType.get(normalizeName(bencana.nama_bencana)) || 0;

                                            return (
                                                <span key={`${bencana.id_bencana}-${index}`} className="inline-flex flex-col items-center gap-1 sm:gap-1.5 snap-center shrink-0">
                                                    <button
                                                        onClick={() => {
                                                            const newId = isActive ? '' : bencana.id_bencana;
                                                            const newFilters = { ...mapFilters, id_bencana: newId };
                                                            setMapFilters(newFilters);
                                                            setFormFilters(newFilters);
                                                            setIsInfoBencanaOpen(false);
                                                            setIsFilterOpen(false);
                                                            setIsContactOpen(false);
                                                            setIsBasemapOpen(false);
                                                        }}
                                                        onMouseMove={(e) => setTooltip({ show: true, text: bencana.nama_bencana, x: e.clientX, y: e.clientY })}
                                                        onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                                        className={`shrink-0 group backdrop-blur-xl p-2 sm:p-3.5 rounded-full shadow-md border flex items-center justify-center transition-all duration-300 ${isActive ? `${activeBorder} ${activeBg} ring-2 ring-offset-1 sm:ring-offset-2 ring-offset-transparent ${activeBorder.replace('border-', 'ring-')} scale-105 sm:scale-110` : 'bg-white/80 dark:bg-[#1a1a1a]/80 border-white/40 dark:border-slate-700/50 hover:bg-white dark:hover:bg-[#222]'}`}
                                                    >
                                                        <Icon size={20} className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform duration-300 ${activeColor} ${isActive ? '' : 'group-hover:scale-110'}`} />
                                                    </button>
                                                    <div className={`flex items-center gap-1.5 text-[9px] sm:text-[10px] leading-none font-bold px-2 py-0.5 sm:py-1 rounded-full ${isActive ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 backdrop-blur-sm shadow-sm border border-slate-200/50 dark:border-slate-700/50'}`}>
                                                        <span className="capitalize whitespace-nowrap">{bencana.nama_bencana}</span>
                                                        <span className={`px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                                            {reportCount}
                                                        </span>
                                                    </div>
                                                </span>
                                            );
                                        })}
                                </div>
                            </div>
                        </div>
            </motion.div>

        </PublicLayout>
    );
}
