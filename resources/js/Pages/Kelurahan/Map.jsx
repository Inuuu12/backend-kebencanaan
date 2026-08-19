import React, { useEffect, useState, useRef } from 'react';
import Layout from '../../Components/Layout';
import { masterDataService } from '../../api/services/masterData';
import { drawAdminBoundaries, getResponseDataArray, normalizeName } from '../../lib/mapBoundaries';
import { Layers, MapPin, Eye, Filter, RefreshCw } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map({ village, complaints }) {
    const [selectedType, setSelectedType] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState('all');
    const mapRef = useRef(null);
    const layerGroupRef = useRef(null);
    const polygonGroupRef = useRef(null);
    const [adminBoundaries, setAdminBoundaries] = useState([]);

    useEffect(() => {
        masterDataService.getBoundaries({ level: 'kelurahan' })
            .then((res) => setAdminBoundaries(getResponseDataArray(res)))
            .catch((err) => console.error('Gagal memuat batas wilayah:', err));
    }, []);

    // Filter complaints based on state
    const filteredComplaints = complaints.filter(c => {
        const matchesType = selectedType === 'all' || c.disaster_type === selectedType;
        const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
        const matchesPriority = selectedPriority === 'all' || c.priority === selectedPriority;
        return matchesType && matchesStatus && matchesPriority;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Initialize Map
        const centerLat = complaints.length > 0 ? complaints[0].latitude : -6.582;
        const centerLng = complaints.length > 0 ? complaints[0].longitude : 106.871;

        const map = L.map('village-map-full', {
            zoomControl: false
        }).setView([centerLat, centerLng], 14);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }).addTo(map);

        L.control.zoom({
            position: 'bottomright'
        }).addTo(map);

        mapRef.current = map;

        polygonGroupRef.current = L.layerGroup().addTo(map);

        // Layer Group for markers so we can clear and update them dynamically
        const layerGroup = L.layerGroup().addTo(map);
        layerGroupRef.current = layerGroup;

        return () => {
            map.remove();
        };
    }, [village]);

    useEffect(() => {
        if (!mapRef.current || !polygonGroupRef.current) return;

        drawAdminBoundaries(L, polygonGroupRef.current, adminBoundaries, {
            levels: ['kelurahan'],
            filter: (boundary) => normalizeName(boundary.name) === normalizeName(village.name),
            fitMap: mapRef.current,
            fitOptions: { padding: [24, 24], maxZoom: 14 },
        });
    }, [adminBoundaries, village]);

    // Redraw markers when filters change
    useEffect(() => {
        if (!mapRef.current || !layerGroupRef.current) return;

        // Clear existing markers
        layerGroupRef.current.clearLayers();

        // Add new markers
        filteredComplaints.forEach((c) => {
            let color = '#3b82f6';
            if (c.disaster_type === 'banjir') color = '#06b6d4';
            else if (c.disaster_type === 'kebakaran') color = '#ef4444';
            else if (c.disaster_type === 'longsor') color = '#f97316';
            else if (c.disaster_type === 'puting_beliung') color = '#a855f7';
            else if (c.disaster_type === 'gempa') color = '#10b981';

            const customIcon = L.divIcon({
                className: 'custom-leaflet-marker',
                html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 10px ${color};"></div>`,
                iconSize: [14, 14],
                iconAnchor: [7, 7]
            });

            const marker = L.marker([c.latitude, c.longitude], { icon: customIcon });

            marker.bindPopup(`
                <div style="color: #0f172a; padding: 0.25rem; min-width: 150px;">
                    <strong style="text-transform: capitalize; font-size: 0.9rem;">${c.disaster_type}</strong>
                    <div style="font-size: 0.75rem; color: #475569; margin: 0.25rem 0;">Pelapor: ${c.citizen_name}</div>
                    <div style="font-size: 0.75rem; color: #475569; margin: 0.25rem 0;">Prioritas: <span style="font-weight:600">${c.priority.toUpperCase()}</span></div>
                    <div style="font-size: 0.75rem; font-weight: 500;">Status: <span style="text-transform: capitalize;">${c.status}</span></div>
                    <p style="font-size: 0.75rem; color: #64748b; margin: 0.5rem 0 0.25rem; font-style:italic;">"${c.description.substring(0, 40)}..."</p>
                </div>
            `);

            layerGroupRef.current.addLayer(marker);
        });
    }, [filteredComplaints]);

    const resetFilters = () => {
        setSelectedType('all');
        setSelectedStatus('all');
        setSelectedPriority('all');
    };

    return (
        <Layout activePage="map" title={`Peta Geografis Desa ${village.name}`}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem', height: 'calc(100vh - 160px)' }}>
                {/* Map Area */}
                <div className="panel-card" style={{ padding: '0', position: 'relative', overflow: 'hidden' }}>
                    <div id="village-map-full" style={{ width: '100%', height: '100%' }}></div>
                    
                    {/* Floating HUD summary info */}
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
                            Menampilkan {filteredComplaints.length} dari {complaints.length} Aduan
                        </span>
                    </div>
                </div>

                {/* Map Controls / Layers Selector Sidebar */}
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Layers size={16} className="color-primary" />
                            Filter Lapisan
                        </h3>
                        <button onClick={resetFilters} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }} title="Reset Filter">
                            <RefreshCw size={12} />
                        </button>
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

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="map-priority"><Filter size={10} style={{ marginRight: '4px' }} /> Skala Prioritas</label>
                        <select 
                            id="map-priority" 
                            className="form-select"
                            value={selectedPriority}
                            onChange={(e) => setSelectedPriority(e.target.value)}
                        >
                            <option value="all">Semua Prioritas</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', flexGrow: 1 }}>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legenda Peta</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-banjir)' }}></span>
                                <span>Banjir (Biru)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-kebakaran)' }}></span>
                                <span>Kebakaran (Merah)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-longsor)' }}></span>
                                <span>Longsor (Oranye)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-puting-beliung)' }}></span>
                                <span>Puting Beliung (Ungu)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-gempa)' }}></span>
                                <span>Gempa (Hijau)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
