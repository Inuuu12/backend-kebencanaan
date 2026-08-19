import React from 'react';
// removed inertia
import Layout from '../../Components/Layout';
import { 
    Users, 
    Home, 
    Truck, 
    Activity, 
    CheckCircle2, 
    Clock, 
    User,
    ListFilter,
    ShieldCheck,
    Send
} from 'lucide-react';

export default function Penanganan({ 
    district = { name: 'Kecamatan Setempat' }, 
    villages = [], 
    victimsCount = { safe: 0, injured: 0, missing: 0, deceased: 0 }, 
    damagesSummary = { ringan: 0, sedang: 0, berat: 0 }, 
    logistics = [], 
    handlings = [] 
}) {

    const handleApprove = (id) => {
        // router.post(`/dashboard/kecamatan/logistic/${id}/approve`, {}, {
        //     preserveScroll: true
        // });
    };

    const handleDistribute = (id) => {
        router.post(`/dashboard/kecamatan/logistic/${id}/distribute`, {}, {
            preserveScroll: true
        });
    };

    return (
        <Layout activePage="penanganan" title={`Konsolidasi Penanganan Bencana Kec. ${district.name}`}>
            
            {/* Metrics Overview Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                
                {/* Victims Card */}
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <Users size={18} className="color-primary" />
                        Total Dampak Jiwa se-Kecamatan
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.25rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(16,185,129,0.06)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.1)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Selamat</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981', marginTop: '0.2rem' }}>{victimsCount.safe} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>Jiwa</span></div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(234,179,8,0.06)', borderRadius: '8px', border: '1px solid rgba(234,179,8,0.1)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Luka-luka</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#eab308', marginTop: '0.2rem' }}>{victimsCount.injured} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>Jiwa</span></div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(249,115,22,0.06)', borderRadius: '8px', border: '1px solid rgba(249,115,22,0.1)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Hilang</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#f97316', marginTop: '0.2rem' }}>{victimsCount.missing} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>Jiwa</span></div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.06)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.1)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Meninggal</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#ef4444', marginTop: '0.2rem' }}>{victimsCount.deceased} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>Jiwa</span></div>
                        </div>
                    </div>
                </div>

                {/* Infrastructure Damage Card */}
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <Home size={18} className="color-primary" />
                        Total Kerusakan se-Kecamatan
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center', height: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', borderLeft: '3px solid #10b981' }}>
                            <span style={{ fontSize: '0.85rem' }}>Kerusakan Ringan</span>
                            <span style={{ fontWeight: 'bold', color: '#10b981' }}>{damagesSummary.ringan} Unit</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', borderLeft: '3px solid #eab308' }}>
                            <span style={{ fontSize: '0.85rem' }}>Kerusakan Sedang</span>
                            <span style={{ fontWeight: 'bold', color: '#eab308' }}>{damagesSummary.sedang} Unit</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', borderLeft: '3px solid #ef4444' }}>
                            <span style={{ fontSize: '0.85rem' }}>Kerusakan Berat</span>
                            <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{damagesSummary.berat} Unit</span>
                        </div>
                    </div>
                </div>

                {/* Logistics Summary */}
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <Truck size={18} className="color-primary" />
                        Status Logistik Kecamatan
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center', height: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                            <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Clock size={14} className="color-primary" /> Menunggu Persetujuan
                            </span>
                            <span style={{ fontWeight: 'bold', color: '#eab308' }}>
                                {logistics.filter(l => l.status === 'requested').length} Pengajuan
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                            <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <ShieldCheck size={14} className="color-primary" /> Disetujui Kecamatan
                            </span>
                            <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>
                                {logistics.filter(l => l.status === 'approved').length} Pengajuan
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                            <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <CheckCircle2 size={14} className="color-primary" /> Telah Disalurkan
                            </span>
                            <span style={{ fontWeight: 'bold', color: '#10b981' }}>
                                {logistics.filter(l => l.status === 'distributed').length} Pengajuan
                            </span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom Row Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
                
                {/* Logistics Management Table */}
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <Truck size={18} className="color-primary" />
                        Kelola Permintaan Logistik Desa
                    </h3>

                    {logistics.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                            Belum ada pengajuan bantuan logistik dari desa.
                        </div>
                    ) : (
                        <div className="table-responsive" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Desa</th>
                                        <th>Nama Barang</th>
                                        <th style={{ textAlign: 'center' }}>Jumlah</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'center' }}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logistics.map((log) => (
                                        <tr key={log.id}>
                                            <td style={{ fontWeight: 600 }}>Kel. {log.complaint?.village?.name}</td>
                                            <td>{log.item_name}</td>
                                            <td style={{ textAlign: 'center' }}>{log.quantity} {log.unit}</td>
                                            <td>
                                                {log.status === 'requested' && (
                                                    <span className="badge warning" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Diajukan</span>
                                                )}
                                                {log.status === 'approved' && (
                                                    <span className="badge info" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Disetujui</span>
                                                )}
                                                {log.status === 'distributed' && (
                                                    <span className="badge success" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Disalurkan</span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {log.status === 'requested' && (
                                                    <button 
                                                        onClick={() => handleApprove(log.id)}
                                                        className="btn-primary" 
                                                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.6rem', fontSize: '0.75rem', margin: '0 auto' }}
                                                    >
                                                        <ShieldCheck size={12} />
                                                        Setujui
                                                    </button>
                                                )}
                                                {log.status === 'approved' && (
                                                    <button 
                                                        onClick={() => handleDistribute(log.id)}
                                                        className="btn-secondary" 
                                                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.6rem', fontSize: '0.75rem', margin: '0 auto', borderColor: '#10b981', color: '#10b981' }}
                                                    >
                                                        <Send size={12} />
                                                        Salurkan
                                                    </button>
                                                )}
                                                {log.status === 'distributed' && (
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Selesai</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* District Officer Progress Log */}
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <Activity size={18} className="color-primary" />
                        Log Penanganan se-Kecamatan
                    </h3>

                    {handlings.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                            Belum ada update penanganan tercatat.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                            {handlings.map((hand) => (
                                <div 
                                    key={hand.id} 
                                    style={{ 
                                        padding: '1rem', 
                                        background: 'rgba(255,255,255,0.02)', 
                                        border: '1px solid var(--border-color)', 
                                        borderRadius: '8px' 
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}>
                                            <User size={14} className="color-primary" />
                                            {hand.officer_name}
                                        </div>
                                    </div>
                                    
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                                        {hand.description}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        <span>Kel. {hand.complaint?.village?.name}</span>
                                        <span>{new Date(hand.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </Layout>
    );
}
