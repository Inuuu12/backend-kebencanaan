import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../Components/Layout';
import { useAuth } from '../../AuthContext';
import { reportService } from '../../api/services/reports';
import { masterDataService } from '../../api/services/masterData';
import { drawAdminBoundaries, getResponseDataArray } from '../../lib/mapBoundaries';
import { getAdminScopeFilters, getAdminScopeLabel } from '../../lib/adminScope';
import { homeService } from '../../api/services/home';
import { Filter, Layers, MapPin, AlertTriangle, RefreshCw, X, ArrowRight, Download, Table2 } from 'lucide-react';
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
    const [isRecapOpen, setIsRecapOpen] = useState(true);

    const mapRef = useRef(null);
    const markersGroupRef = useRef(null);
    const boundariesGroupRef = useRef(null);

    // Load data
    const fetchMapData = async () => {
        try {
            setError(null);
            const scopeFilters = getAdminScopeFilters(user);
            const kelurahanScopeId = isKabupaten ? null : (scopeFilters.kecamatan_id || user?.id_kecamatan || null);
            
            const [reportsRes, boundariesRes, weatherRes, kecamatanRes, kelurahanRes] = await Promise.all([
                reportService.getMapReports(scopeFilters),
                masterDataService.getBoundaries(isKabupaten ? {} : { level: 'kelurahan' }).catch(() => ({ data: { data: [] } })),
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
            return matchType && matchStatus;
        });
    }, [reports, selectedType, selectedStatus]);

    const recapRows = useMemo(() => {
        const kecamatanById = new Map(
            kecamatanList.map((item) => [String(item.id_kecamatan || item.id), item])
        );
        const scopedKelurahan = kelurahanList.filter((item) => {
            const kecamatanId = String(item.id_kecamatan || '');
            const kelurahanId = String(item.id_kelurahan || item.id || '');

            if (!isKabupaten && user?.id_kecamatan && kecamatanId !== String(user.id_kecamatan)) {
                return false;
            }

            if (!isKabupaten && !isKecamatan && user?.id_kelurahan && kelurahanId !== String(user.id_kelurahan)) {
                return false;
            }

            return true;
        });
        const rowsByKelurahan = new Map();

        scopedKelurahan.forEach((kelurahan) => {
            const kecamatan = kecamatanById.get(String(kelurahan.id_kecamatan || ''));
            const key = String(kelurahan.id_kelurahan || kelurahan.id);

            rowsByKelurahan.set(key, {
                idKecamatan: kelurahan.id_kecamatan,
                idKelurahan: kelurahan.id_kelurahan || kelurahan.id,
                kecamatan: kecamatan?.nama_kecamatan || kelurahan.nama_kecamatan || user?.nama_kecamatan || '-',
                kelurahan: kelurahan.nama_kelurahan || kelurahan.nama_desa || user?.nama_kelurahan || '-',
                total: 0,
                korban: 0,
                meninggal: 0,
                lukaBerat: 0,
                lukaRingan: 0,
                hilang: 0,
                mengungsi: 0,
                jenisKerusakan: new Set(),
                rusakRingan: 0,
                rusakSedang: 0,
                rusakBerat: 0,
            });
        });

        if (rowsByKelurahan.size === 0 && user?.id_kelurahan) {
            rowsByKelurahan.set(String(user.id_kelurahan), {
                idKecamatan: user.id_kecamatan,
                idKelurahan: user.id_kelurahan,
                kecamatan: user.nama_kecamatan || '-',
                kelurahan: user.nama_kelurahan || '-',
                total: 0,
                korban: 0,
                meninggal: 0,
                lukaBerat: 0,
                lukaRingan: 0,
                hilang: 0,
                mengungsi: 0,
                jenisKerusakan: new Set(),
                rusakRingan: 0,
                rusakSedang: 0,
                rusakBerat: 0,
            });
        }

        filteredReports.forEach((report) => {
            const key = String(report.id_kelurahan || '');
            const current = rowsByKelurahan.get(key);
            if (!current) return;

            const korban = report.korban_breakdown || {};
            const kerusakan = report.kerusakan_breakdown || {};
            const meninggal = Number(korban.meninggal || 0);
            const lukaBerat = Number(korban.luka_berat || 0);
            const lukaRingan = Number(korban.luka_ringan || 0);
            const hilang = Number(korban.hilang || 0);
            const korbanDetail = meninggal + lukaBerat + lukaRingan + hilang;

            current.total += 1;
            current.korban += korbanDetail || Number(report.jumlah_korban || 0);
            current.meninggal += meninggal;
            current.lukaBerat += lukaBerat;
            current.lukaRingan += lukaRingan;
            current.hilang += hilang;
            current.mengungsi += Number(korban.mengungsi || 0);
            (report.kerusakan_jenis || []).forEach((jenis) => {
                if (jenis) current.jenisKerusakan.add(jenis);
            });
            current.rusakRingan += Number(kerusakan.ringan || 0);
            current.rusakSedang += Number(kerusakan.sedang || 0);
            current.rusakBerat += Number(kerusakan.berat || 0);
        });

        return Array.from(rowsByKelurahan.values()).map((row) => ({
            ...row,
            jenisKerusakanText: Array.from(row.jenisKerusakan).join(', ') || '-',
        })).sort((a, b) => {
            return `${a.kecamatan} ${a.kelurahan}`.localeCompare(`${b.kecamatan} ${b.kelurahan}`);
        });
    }, [filteredReports, kecamatanList, kelurahanList, isKabupaten, isKecamatan, user]);

    const recapTotals = useMemo(() => {
        return recapRows.reduce((acc, row) => {
            acc.total += row.total;
            acc.korban += row.korban;
            acc.meninggal += row.meninggal;
            acc.lukaBerat += row.lukaBerat;
            acc.lukaRingan += row.lukaRingan;
            acc.hilang += row.hilang;
            acc.mengungsi += row.mengungsi;
            acc.rusakRingan += row.rusakRingan;
            acc.rusakSedang += row.rusakSedang;
            acc.rusakBerat += row.rusakBerat;
            return acc;
        }, {
            total: 0,
            korban: 0,
            meninggal: 0,
            lukaBerat: 0,
            lukaRingan: 0,
            hilang: 0,
            mengungsi: 0,
            rusakRingan: 0,
            rusakSedang: 0,
            rusakBerat: 0,
        });
    }, [recapRows]);

    const downloadRecapCsv = () => {
        const headers = ['Kecamatan', 'Desa/Kelurahan', 'Total Aduan', 'Total Korban', 'Meninggal', 'Luka Berat', 'Luka Ringan', 'Hilang', 'Mengungsi', 'Jenis Kerusakan', 'Rusak Ringan', 'Rusak Sedang', 'Rusak Berat'];
        const rows = recapRows.map((row) => [
            row.kecamatan,
            row.kelurahan,
            row.total,
            row.korban,
            row.meninggal,
            row.lukaBerat,
            row.lukaRingan,
            row.hilang,
            row.mengungsi,
            row.jenisKerusakanText,
            row.rusakRingan,
            row.rusakSedang,
            row.rusakBerat,
        ]);

        const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
        const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
        const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rekap-peta-wilayah-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

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
        if (!boundariesGroupRef.current || !mapRef.current) return;
        boundariesGroupRef.current.clearLayers();

        drawAdminBoundaries(L, boundariesGroupRef.current, boundaries, {
            levels: isKabupaten ? ['kabupaten', 'kecamatan'] : ['kelurahan'],
        });
    }, [boundaries, isKabupaten]);

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
        <Layout activePage="map" title="Peta Wilayah dan Sebaran Aduan" fullScreen={true}>
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
                            {getAdminScopeLabel(user)} | <strong className="text-slate-900 dark:text-white">{filteredReports.length}</strong> titik
                        </div>
                        <button
                            onClick={() => setIsRecapOpen((value) => !value)}
                            className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors"
                            title="Tampilkan rekap tabel"
                        >
                            <Table2 size={18} />
                        </button>
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
                </div>

                <AnimatePresence>
                    {isRecapOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 16 }}
                            className="absolute bottom-6 right-6 z-[410] w-[min(1080px,calc(100vw-2rem))] max-h-[62vh] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                        >
                            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                        <Table2 size={18} className="text-blue-500" />
                                        Rekap Data Wilayah
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        {getAdminScopeLabel(user)} | {recapRows.length} desa/kelurahan | {recapTotals.total} aduan | {recapTotals.korban} korban terdampak
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={downloadRecapCsv}
                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                                    >
                                        <Download size={14} />
                                        Excel
                                    </button>
                                    <button
                                        onClick={() => setIsRecapOpen(false)}
                                        className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-auto max-h-[calc(62vh-88px)]">
                                <table className="w-full text-left text-sm">
                                    <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                        <tr>
                                            <th className="px-4 py-3 font-bold min-w-36">Kecamatan</th>
                                            <th className="px-4 py-3 font-bold min-w-40">Desa/Kelurahan</th>
                                            <th className="px-4 py-3 font-bold text-right">Aduan</th>
                                            <th className="px-4 py-3 font-bold text-right">Korban</th>
                                            <th className="px-4 py-3 font-bold text-right">Meninggal</th>
                                            <th className="px-4 py-3 font-bold text-right">Luka Berat</th>
                                            <th className="px-4 py-3 font-bold text-right">Luka Ringan</th>
                                            <th className="px-4 py-3 font-bold text-right">Hilang</th>
                                            <th className="px-4 py-3 font-bold text-right">Mengungsi</th>
                                            <th className="px-4 py-3 font-bold min-w-48">Jenis Kerusakan</th>
                                            <th className="px-4 py-3 font-bold text-right">Rusak Ringan</th>
                                            <th className="px-4 py-3 font-bold text-right">Rusak Sedang</th>
                                            <th className="px-4 py-3 font-bold text-right">Rusak Berat</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                        {recapRows.length === 0 ? (
                                            <tr>
                                                <td colSpan="13" className="px-4 py-8 text-center text-slate-500">
                                                    Tidak ada data rekap untuk filter ini.
                                                </td>
                                            </tr>
                                        ) : (
                                            recapRows.map((row) => (
                                                <tr key={`${row.idKecamatan}-${row.idKelurahan}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/70">
                                                    <td className="px-4 py-3 font-semibold">{row.kecamatan}</td>
                                                    <td className="px-4 py-3">{row.kelurahan}</td>
                                                    <td className="px-4 py-3 text-right">{row.total}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-red-600 dark:text-red-400">{row.korban}</td>
                                                    <td className="px-4 py-3 text-right">{row.meninggal}</td>
                                                    <td className="px-4 py-3 text-right">{row.lukaBerat}</td>
                                                    <td className="px-4 py-3 text-right">{row.lukaRingan}</td>
                                                    <td className="px-4 py-3 text-right">{row.hilang}</td>
                                                    <td className="px-4 py-3 text-right">{row.mengungsi}</td>
                                                    <td className="px-4 py-3">{row.jenisKerusakanText}</td>
                                                    <td className="px-4 py-3 text-right">{row.rusakRingan}</td>
                                                    <td className="px-4 py-3 text-right">{row.rusakSedang}</td>
                                                    <td className="px-4 py-3 text-right">{row.rusakBerat}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                    {recapRows.length > 0 && (
                                        <tfoot className="sticky bottom-0 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold">
                                            <tr>
                                                <td className="px-4 py-3" colSpan="2">Total</td>
                                                <td className="px-4 py-3 text-right">{recapTotals.total}</td>
                                                <td className="px-4 py-3 text-right">{recapTotals.korban}</td>
                                                <td className="px-4 py-3 text-right">{recapTotals.meninggal}</td>
                                                <td className="px-4 py-3 text-right">{recapTotals.lukaBerat}</td>
                                                <td className="px-4 py-3 text-right">{recapTotals.lukaRingan}</td>
                                                <td className="px-4 py-3 text-right">{recapTotals.hilang}</td>
                                                <td className="px-4 py-3 text-right">{recapTotals.mengungsi}</td>
                                                <td className="px-4 py-3"></td>
                                                <td className="px-4 py-3 text-right">{recapTotals.rusakRingan}</td>
                                                <td className="px-4 py-3 text-right">{recapTotals.rusakSedang}</td>
                                                <td className="px-4 py-3 text-right">{recapTotals.rusakBerat}</td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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
