import React, { useEffect, useState, useRef, useMemo } from 'react';
import Layout from '../../Components/Layout';
import { Layers, MapPin, RefreshCw, Filter } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map({ districts, villages, complaints }) {
    const [selectedDistrict, setSelectedDistrict] = useState('all');
    const [selectedVillage, setSelectedVillage] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    
    const mapRef = useRef(null);
    const layerGroupRef = useRef(null);
    const polygonGroupRef = useRef(null);

    // Filter villages for dropdown selection based on selected district
    const filteredVillagesDropdown = useMemo(() => {
        if (selectedDistrict === 'all') return villages;
        return villages.filter(v => v.district_id === parseInt(selectedDistrict));
    }, [selectedDistrict, villages]);

    // Handle district selection change
    const handleDistrictChange = (e) => {
        setSelectedDistrict(e.target.value);
        setSelectedVillage('all'); // Reset village filter
    };

    // Filter complaints
    const filteredComplaints = useMemo(() => {
        return complaints.filter(c => {
            const matchesDistrict = selectedDistrict === 'all' || (c.village?.district_id === parseInt(selectedDistrict));
            const matchesVillage = selectedVillage === 'all' || String(c.village_id) === selectedVillage;
            const matchesType = selectedType === 'all' || c.disaster_type === selectedType;
            const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
            return matchesDistrict && matchesVillage && matchesType && matchesStatus;
        });
    }, [selectedDistrict, selectedVillage, selectedType, selectedStatus, complaints]);

    // Initialize Map
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Centroid of Kabupaten Bogor
        const map = L.map('kabupaten-map-full', {
            zoomControl: false
        }).setView([-6.582, 106.871], 12);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }).addTo(map);

        L.control.zoom({
            position: 'bottomright'
        }).addTo(map);

        mapRef.current = map;

        // Group for village polygons
        const polygonGroup = L.layerGroup().addTo(map);
        polygonGroupRef.current = polygonGroup;

        // Layer Group for markers
        const layerGroup = L.layerGroup().addTo(map);
        layerGroupRef.current = layerGroup;

        return () => {
            map.remove();
        };
    }, []);

    // Redraw polygons when district filter changes
    useEffect(() => {
        if (!mapRef.current || !polygonGroupRef.current) return;

        polygonGroupRef.current.clearLayers();

        // Draw polygons only for relevant villages
        villages.forEach(v => {
            const matchesDistrict = selectedDistrict === 'all' || v.district_id === parseInt(selectedDistrict);
            if (!matchesDistrict) return;

            if (v.geojson) {
                try {
                    const geoJsonData = JSON.parse(v.geojson);
                    const emStatus = v.emergency_status;

                    let color = '#10b981'; // normal
                    if (emStatus && emStatus.is_emergency) {
                        if (emStatus.emergency_level === 'siaga') color = '#f97316';
                        else if (emStatus.emergency_level === 'waspada') color = '#eab308';
                        else if (emStatus.emergency_level === 'awas') color = '#ef4444';
                    }

                    const polygon = L.geoJSON(geoJsonData, {
                        style: {
                            color: color,
                            weight: 2,
                            fillColor: color,
                            fillOpacity: 0.08
                        }
                    });

                    polygon.bindPopup(`
                        <div style="color: #0f172a; padding: 0.25rem;">
                            <strong style="font-size: 0.95rem;">Desa ${v.name}</strong>
                            <div style="font-size: 0.75rem; color: #64748b; margin: 0.15rem 0;">Kecamatan: ${v.district?.name}</div>
                            <div style="font-size: 0.75rem; margin: 0.25rem 0;">Status: <span style="font-weight:700; color: ${color}; text-transform: uppercase;">${emStatus && emStatus.is_emergency ? emStatus.emergency_level : 'Normal'}</span></div>
                            <div style="font-size: 0.75rem; color: #64748b;">${emStatus ? emStatus.description : 'Aman kondusif.'}</div>
                        </div>
                    `);

                    polygonGroupRef.current.addLayer(polygon);
                } catch (e) {
                    console.error("Error parsing GeoJSON for village " + v.name, e);
                }
            }
        });
    }, [selectedDistrict, villages]);

    // Redraw markers when filtered complaints change
    useEffect(() => {
        if (!mapRef.current || !layerGroupRef.current) return;

        layerGroupRef.current.clearLayers();

        filteredComplaints.forEach((c) => {
            let color = '#3b82f6';
            if (c.disaster_type === 'banjir') color = '#06b6d4';
            else if (c.disaster_type === 'kebakaran') color = '#ef4444';
            else if (c.disaster_type === 'longsor') color = '#f97316';
            else if (c.disaster_type === 'puting_beliung') color = '#a855f7';
            else if (c.disaster_type === 'gempa') color = '#10b981';

            const customIcon = L.divIcon({
                className: 'custom-leaflet-marker',
                html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px ${color};"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            });

            const marker = L.marker([c.latitude, c.longitude], { icon: customIcon });

            const vilName = c.village?.name ?? 'Desa';
            const distName = c.village?.district?.name ?? 'Kecamatan';

            marker.bindPopup(`
                <div style="color: #0f172a; padding: 0.25rem; min-width: 150px;">
                    <strong style="text-transform: capitalize; font-size: 0.9rem;">${c.disaster_type}</strong>
                    <div style="font-size: 0.75rem; color: #475569; margin: 0.25rem 0;">Wilayah: Kel. ${vilName}, Kec. ${distName}</div>
                    <div style="font-size: 0.75rem; color: #475569; margin: 0.25rem 0;">Pelapor: ${c.citizen_name}</div>
                    <div style="font-size: 0.75rem; color: #475569; margin: 0.25rem 0;">Prioritas: <span style="font-weight:600">${c.priority.toUpperCase()}</span></div>
                    <div style="font-size: 0.75rem; font-weight: 500;">Status: <span style="text-transform: capitalize;">${c.status}</span></div>
                    <a href="/dashboard/kabupaten/aduan" style="display: block; font-size: 0.75rem; color: #3b82f6; font-weight: 600; margin-top: 0.5rem; text-decoration: none;">Lihat Laporan &rarr;</a>
                </div>
            `);

            layerGroupRef.current.addLayer(marker);
        });
    }, [filteredComplaints]);

    const resetFilters = () => {
        setSelectedDistrict('all');
        setSelectedVillage('all');
        setSelectedType('all');
        setSelectedStatus('all');
    };

    return (
        <Layout activePage="map" title="Peta Geografis Kebencanaan Kabupaten Bogor">
            
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem', height: 'calc(100vh - 160px)' }}>
                {/* Map Panel */}
                <div className="panel-card" style={{ padding: '0', position: 'relative', overflow: 'hidden' }}>
                    <div id="kabupaten-map-full" style={{ width: '100%', height: '100%' }}></div>
                    
                    {/* Floating HUD info */}
                    <div style={{
                        position: 'absolute',
                        top: '1.5rem',
                        left: '1.5rem',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '0.75rem 1rem',
                        zIndex: 500,
                        backdropFilter: 'blur(12px)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <MapPin size={16} className="color-primary" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                            Menampilkan {filteredComplaints.length} dari {complaints.length} Aduan Wilayah
                        </span>
                    </div>
                </div>

                {/* Layer Control sidebar */}
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                            <Layers size={16} className="color-primary" />
                            Filter Lapisan Peta
                        </h3>
                        <button onClick={resetFilters} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }} title="Reset Filter">
                            <RefreshCw size={12} />
                        </button>
                    </div>

                    <div className="form-group">
                        <label htmlFor="map-d"><Filter size={10} style={{ marginRight: '4px' }} /> Kecamatan</label>
                        <select 
                            id="map-d" 
                            className="form-select"
                            value={selectedDistrict}
                            onChange={handleDistrictChange}
                        >
                            <option value="all">Semua Kecamatan</option>
                            {districts.map(d => (
                                <option key={d.id} value={d.id}>Kec. {d.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="map-v"><Filter size={10} style={{ marginRight: '4px' }} /> Kelurahan</label>
                        <select 
                            id="map-v" 
                            className="form-select"
                            value={selectedVillage}
                            onChange={(e) => setSelectedVillage(e.target.value)}
                            disabled={selectedDistrict === 'all'}
                        >
                            <option value="all">Semua Kelurahan</option>
                            {filteredVillagesDropdown.map(v => (
                                <option key={v.id} value={v.id}>Kel. {v.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="map-type"><Filter size={10} style={{ marginRight: '4px' }} /> Jenis Bencana</label>
                        <select 
                            id="map-type" 
                            className="form-select"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                        >
                            <option value="all">Semua Bencana</option>
                            <option value="banjir">Banjir</option>
                            <option value="kebakaran">Kebakaran</option>
                            <option value="longsor">Longsor</option>
                            <option value="puting_beliung">Puting Beliung</option>
                            <option value="gempa">Gempa</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="map-status"><Filter size={10} style={{ marginRight: '4px' }} /> Status Laporan</label>
                        <select 
                            id="map-status" 
                            className="form-select"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <option value="all">Semua Status</option>
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="handling">Handling</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', flexGrow: 1 }}>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status Wilayah Kelurahan</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(16, 185, 129, 0.2)', border: '1.5px solid #10b981' }}></span>
                                <span>Normal / Kondusif (Hijau)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(234, 179, 8, 0.2)', border: '1.5px solid #eab308' }}></span>
                                <span>Status Waspada (Kuning)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(249, 115, 22, 0.2)', border: '1.5px solid #f97316' }}></span>
                                <span>Status Siaga (Oranye)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(239, 68, 68, 0.2)', border: '1.5px solid #ef4444' }}></span>
                                <span>Status Awas (Merah)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
