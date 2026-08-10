import React, { useState, useMemo } from 'react';
import Layout from '../../Components/Layout';
import { 
    Users, 
    Home, 
    Truck, 
    FileText, 
    Activity, 
    Filter, 
    RefreshCw,
    Building2,
    Calendar,
    ArrowRight
} from 'lucide-react';

export default function Penanganan({ 
    districts = [], 
    villages = [], 
    kabupatenStats = {
        victims: { safe: 0, injured: 0, missing: 0, deceased: 0 },
        damages: { ringan: 0, sedang: 0, berat: 0 },
        logistics: { requested: 0, approved: 0, distributed: 0 }
    }, 
    kecamatanStats = {}, 
    kelurahanStats = {}, 
    logistics = [
        { id: 1, item_name: 'Beras & Sembako', quantity: 50, unit: 'Paket', status: 'distributed', complaint: { village_id: 1, citizen_name: 'Budi Santoso', village: { name: 'Cibinong', district_id: 1, district: { name: 'Cibinong' } } } },
        { id: 2, item_name: 'Tenda Darurat', quantity: 2, unit: 'Unit', status: 'approved', complaint: { village_id: 2, citizen_name: 'Ahmad', village: { name: 'Bojong Gede', district_id: 2, district: { name: 'Bojong Gede' } } } },
        { id: 3, item_name: 'Selimut & Pakaian', quantity: 100, unit: 'Pcs', status: 'diajukan', complaint: { village_id: 3, citizen_name: 'Siti Aminah', village: { name: 'Cileungsi', district_id: 3, district: { name: 'Cileungsi' } } } },
        { id: 4, item_name: 'Obat-obatan', quantity: 5, unit: 'Dus', status: 'distributed', complaint: { village_id: 4, citizen_name: 'Puskesmas', village: { name: 'Cisarua', district_id: 4, district: { name: 'Cisarua' } } } },
        { id: 5, item_name: 'Air Mineral', quantity: 20, unit: 'Galon', status: 'approved', complaint: { village_id: 5, citizen_name: 'Warga RT 03', village: { name: 'Babakan Madang', district_id: 5, district: { name: 'Babakan Madang' } } } },
    ], 
    handlings = [
        { id: 1, officer_name: 'Tim BPBD Alpha', progress_percentage: 100, action_taken: 'Evakuasi warga terdampak banjir selesai dilakukan.', logistics_notes: 'Tersalurkan 50 paket sembako', created_at: '2026-08-10', complaint: { village_id: 1, village: { name: 'Cibinong', district_id: 1, district: { name: 'Cibinong' } } } },
        { id: 2, officer_name: 'Tim SAR Gabungan', progress_percentage: 60, action_taken: 'Pembersihan material longsor menggunakan alat berat.', logistics_notes: 'Butuh tambahan terpal', created_at: '2026-08-09', complaint: { village_id: 4, village: { name: 'Cisarua', district_id: 4, district: { name: 'Cisarua' } } } },
        { id: 3, officer_name: 'Relawan PMI', progress_percentage: 80, action_taken: 'Pendirian tenda pengungsian darurat.', logistics_notes: 'Kondisi obat-obatan menipis', created_at: '2026-08-08', complaint: { village_id: 2, village: { name: 'Bojong Gede', district_id: 2, district: { name: 'Bojong Gede' } } } },
        { id: 4, officer_name: 'Dinas Pemadam Kebakaran', progress_percentage: 100, action_taken: 'Pemadaman api dan pendinginan area selesai.', logistics_notes: 'Aman', created_at: '2026-08-07', complaint: { village_id: 3, village: { name: 'Cileungsi', district_id: 3, district: { name: 'Cileungsi' } } } },
        { id: 5, officer_name: 'Tim BPBD Bravo', progress_percentage: 40, action_taken: 'Assesment awal dampak angin puting beliung.', logistics_notes: 'Dalam pendataan', created_at: '2026-08-10', complaint: { village_id: 5, village: { name: 'Babakan Madang', district_id: 5, district: { name: 'Babakan Madang' } } } },
    ] 
}) {
    // Filter states
    const [selectedDistrictId, setSelectedDistrictId] = useState('');
    const [selectedVillageId, setSelectedVillageId] = useState('');

    // Filter villages based on selected district
    const filteredVillages = useMemo(() => {
        if (!selectedDistrictId) return [];
        return villages.filter(v => v.district_id === parseInt(selectedDistrictId));
    }, [selectedDistrictId, villages]);

    // Handle District change
    const handleDistrictChange = (e) => {
        setSelectedDistrictId(e.target.value);
        setSelectedVillageId(''); // Reset village
    };

    // Current active statistics based on filter level
    const currentStats = useMemo(() => {
        if (selectedVillageId) {
            return kelurahanStats[selectedVillageId] || {
                victims: { safe: 0, injured: 0, missing: 0, deceased: 0 },
                damages: { ringan: 0, sedang: 0, berat: 0 },
                logistics: { requested: 0, approved: 0, distributed: 0 }
            };
        }
        if (selectedDistrictId) {
            return kecamatanStats[selectedDistrictId] || {
                victims: { safe: 0, injured: 0, missing: 0, deceased: 0 },
                damages: { ringan: 0, sedang: 0, berat: 0 },
                logistics: { requested: 0, approved: 0, distributed: 0 }
            };
        }
        return kabupatenStats;
    }, [selectedDistrictId, selectedVillageId, kabupatenStats, kecamatanStats, kelurahanStats]);

    // Current level indicator text
    const activeLevelLabel = useMemo(() => {
        if (selectedVillageId) {
            const v = villages.find(vil => vil.id === parseInt(selectedVillageId));
            return `Kelurahan/Desa: ${v ? v.name : ''}`;
        }
        if (selectedDistrictId) {
            const d = districts.find(dist => dist.id === parseInt(selectedDistrictId));
            return `Kecamatan: ${d ? d.name : ''}`;
        }
        return 'Tingkat Kabupaten (Seluruh Bogor)';
    }, [selectedDistrictId, selectedVillageId, districts, villages]);

    // Filter logistics data dynamically
    const filteredLogistics = useMemo(() => {
        return logistics.filter(l => {
            if (!l.complaint || !l.complaint.village_id) return false;
            
            if (selectedVillageId) {
                return l.complaint.village_id === parseInt(selectedVillageId);
            }
            if (selectedDistrictId) {
                return l.complaint.village?.district_id === parseInt(selectedDistrictId);
            }
            return true;
        });
    }, [selectedDistrictId, selectedVillageId, logistics]);

    // Filter handlings data dynamically
    const filteredHandlings = useMemo(() => {
        return handlings.filter(h => {
            if (!h.complaint || !h.complaint.village_id) return false;
            
            if (selectedVillageId) {
                return h.complaint.village_id === parseInt(selectedVillageId);
            }
            if (selectedDistrictId) {
                return h.complaint.village?.district_id === parseInt(selectedDistrictId);
            }
            return true;
        });
    }, [selectedDistrictId, selectedVillageId, handlings]);

    const resetFilters = () => {
        setSelectedDistrictId('');
        setSelectedVillageId('');
    };

    return (
        <Layout activePage="penanganan" title="Hirarki Penanganan Dampak Bencana & Logistik">

            {/* Filter Panel */}
            <div className="panel-card" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={18} className="color-primary" />
                        <span style={{ fontWeight: 600, fontSize: '1rem' }}>Filter Hirarki Wilayah</span>
                    </div>
                    {(selectedDistrictId || selectedVillageId) && (
                        <button 
                            onClick={resetFilters} 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.25rem', 
                                background: 'rgba(239,68,68,0.1)', 
                                border: '1px solid rgba(239,68,68,0.2)', 
                                color: '#ef4444', 
                                padding: '0.35rem 0.75rem', 
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <RefreshCw size={14} />
                            Reset ke Kabupaten
                        </button>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {/* District Dropdown */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Pilih Kecamatan</label>
                        <select 
                            value={selectedDistrictId} 
                            onChange={handleDistrictChange}
                            style={{ 
                                background: 'var(--bg-card)', 
                                color: 'var(--text-primary)', 
                                border: '1px solid var(--border-color)', 
                                padding: '0.6rem', 
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                        >
                            <option value="">-- Semua Kecamatan --</option>
                            {districts.map(d => (
                                <option key={d.id} value={d.id}>Kecamatan {d.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Village Dropdown */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Pilih Kelurahan / Desa</label>
                        <select 
                            value={selectedVillageId} 
                            onChange={(e) => setSelectedVillageId(e.target.value)}
                            disabled={!selectedDistrictId}
                            style={{ 
                                background: selectedDistrictId ? 'var(--bg-card)' : 'rgba(255,255,255,0.02)', 
                                color: selectedDistrictId ? 'var(--text-primary)' : 'var(--text-muted)', 
                                border: '1px solid var(--border-color)', 
                                padding: '0.6rem', 
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                outline: 'none',
                                cursor: selectedDistrictId ? 'pointer' : 'not-allowed'
                            }}
                        >
                            <option value="">-- Semua Kelurahan --</option>
                            {filteredVillages.map(v => (
                                <option key={v.id} value={v.id}>Desa {v.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Active Level Header */}
            <div style={{ 
                background: 'linear-gradient(90deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.02) 100%)', 
                borderLeft: '4px solid var(--color-primary)', 
                padding: '0.75rem 1.25rem', 
                borderRadius: '0 8px 8px 0', 
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building2 size={16} className="color-primary" />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Menampilkan data untuk:</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{activeLevelLabel}</span>
                </div>
                <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    color: 'var(--color-primary)', 
                    background: 'rgba(59,130,246,0.1)', 
                    padding: '0.2rem 0.5rem', 
                    borderRadius: '4px' 
                }}>
                    {!selectedDistrictId ? 'KABUPATEN' : (!selectedVillageId ? 'KECAMATAN' : 'KELURAHAN')}
                </span>
            </div>

            {/* Metrics Dashboard Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Victims Card */}
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
                        <Users size={18} style={{ color: '#ef4444' }} />
                        Penanganan Dampak Jiwa
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                        <div style={{ background: 'rgba(16,185,129,0.06)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.1)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Selamat</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#10b981', marginTop: '0.15rem' }}>{currentStats.victims.safe}</div>
                        </div>
                        <div style={{ background: 'rgba(234,179,8,0.06)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(234,179,8,0.1)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Luka-Luka</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#eab308', marginTop: '0.15rem' }}>{currentStats.victims.injured}</div>
                        </div>
                        <div style={{ background: 'rgba(249,115,22,0.06)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(249,115,22,0.1)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Hilang</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#f97316', marginTop: '0.15rem' }}>{currentStats.victims.missing}</div>
                        </div>
                        <div style={{ background: 'rgba(239,68,68,0.06)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.1)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Meninggal</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#ef4444', marginTop: '0.15rem' }}>{currentStats.victims.deceased}</div>
                        </div>
                    </div>
                </div>

                {/* Infrastructure Card */}
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
                        <Home size={18} style={{ color: '#f97316' }} />
                        Kerusakan Infrastruktur
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Kerusakan Ringan</span>
                            <span style={{ fontWeight: 'bold', color: '#eab308' }}>{currentStats.damages.ringan} <span style={{ fontSize: '0.7rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>Unit</span></span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Kerusakan Sedang</span>
                            <span style={{ fontWeight: 'bold', color: '#f97316' }}>{currentStats.damages.sedang} <span style={{ fontSize: '0.7rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>Unit</span></span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Kerusakan Berat</span>
                            <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{currentStats.damages.berat} <span style={{ fontSize: '0.7rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>Unit</span></span>
                        </div>
                    </div>
                </div>

                {/* Logistics Stats Card */}
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
                        <Truck size={18} style={{ color: '#3b82f6' }} />
                        Ringkasan Logistik & Bantuan
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Pengajuan Bantuan</span>
                            <span style={{ fontWeight: 'bold', color: '#eab308' }}>{currentStats.logistics.requested} <span style={{ fontSize: '0.7rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>Paket</span></span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Disetujui Pusdalops</span>
                            <span style={{ fontWeight: 'bold', color: '#10b981' }}>{currentStats.logistics.approved} <span style={{ fontSize: '0.7rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>Paket</span></span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Berhasil Didistribusikan</span>
                            <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{currentStats.logistics.distributed} <span style={{ fontSize: '0.7rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>Paket</span></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Content Grid: Logistics Table & Progres Updates */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem' }}>
                {/* Logistics List */}
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', margin: 0 }}>
                        <Truck size={18} className="color-primary" />
                        Logistik Bantuan Keluar Wilayah
                    </h3>

                    {filteredLogistics.length === 0 ? (
                        <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Tidak ada data pengiriman logistik untuk wilayah terpilih.
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr>
                                        <th className="pb-4 pr-4 text-sm font-semibold text-slate-400 border-b border-slate-800">Penerima / Wilayah</th>
                                        <th className="pb-4 px-4 text-sm font-semibold text-slate-400 border-b border-slate-800">Jenis Bantuan</th>
                                        <th className="pb-4 px-4 text-sm font-semibold text-slate-400 border-b border-slate-800">Jumlah</th>
                                        <th className="pb-4 pl-4 text-sm font-semibold text-slate-400 border-b border-slate-800">Status Distribusi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogistics.map((log) => {
                                        const vilName = log.complaint?.village?.name ?? 'Desa';
                                        const distName = log.complaint?.village?.district?.name ?? 'Kecamatan';
                                        return (
                                            <tr key={log.id} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                                                <td className="py-4 pr-4">
                                                    <div style={{ fontWeight: 600 }}>{log.complaint?.citizen_name || 'Warga'}</div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                        Kel. {vilName}, Kec. {distName}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{log.item_name}</span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span style={{ fontSize: '0.85rem' }}>{log.quantity} {log.unit}</span>
                                                </td>
                                                <td className="py-4 pl-4">
                                                    <span style={{ 
                                                        fontSize: '0.75rem', 
                                                        fontWeight: 600, 
                                                        padding: '0.2rem 0.5rem', 
                                                        borderRadius: '4px',
                                                        textTransform: 'capitalize',
                                                        background: log.status === 'distributed' ? 'rgba(16,185,129,0.1)' : (log.status === 'approved' ? 'rgba(59,130,246,0.1)' : 'rgba(234,179,8,0.1)'),
                                                        color: log.status === 'distributed' ? '#10b981' : (log.status === 'approved' ? '#3b82f6' : '#eab308'),
                                                        border: `1px solid ${log.status === 'distributed' ? '#10b98130' : (log.status === 'approved' ? '#3b82f630' : '#eab30830')}`
                                                    }}>
                                                        {log.status === 'distributed' ? 'Terkirim' : (log.status === 'approved' ? 'Disetujui' : 'Diajukan')}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Handlings List */}
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', margin: 0 }}>
                        <Activity size={18} className="color-primary" />
                        Progres Update Penanganan Lapangan
                    </h3>

                    {filteredHandlings.length === 0 ? (
                        <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Belum ada progres penanganan terdokumentasi untuk wilayah terpilih.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            {filteredHandlings.map((hand) => {
                                const vilName = hand.complaint?.village?.name ?? 'Desa';
                                const distName = hand.complaint?.village?.district?.name ?? 'Kecamatan';
                                return (
                                    <div 
                                        key={hand.id} 
                                        style={{ 
                                            padding: '0.75rem 1rem', 
                                            background: 'rgba(255,255,255,0.01)', 
                                            border: '1px solid var(--border-color)', 
                                            borderRadius: '8px' 
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.4rem' }}>
                                            <div>
                                                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Update oleh {hand.officer_name}</span>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                    Kel. {vilName}, Kec. {distName}
                                                </div>
                                            </div>
                                            <span style={{ 
                                                fontSize: '0.75rem', 
                                                fontWeight: 700, 
                                                color: hand.progress_percentage === 100 ? '#10b981' : '#3b82f6',
                                                background: hand.progress_percentage === 100 ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)',
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '4px'
                                            }}>
                                                {hand.progress_percentage}% Progres
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.4rem 0' }}>
                                            {hand.action_taken}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem', justifyContent: 'space-between' }}>
                                            <span>Posko Logistik: {hand.logistics_notes || 'Aman'}</span>
                                            <span>{new Date(hand.created_at).toLocaleDateString('id-ID')}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
