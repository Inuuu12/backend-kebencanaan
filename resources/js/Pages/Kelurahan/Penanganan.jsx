import React from 'react';
import Layout from '../../Components/Layout';
import { 
    Users, 
    ShieldAlert, 
    AlertOctagon, 
    Activity, 
    Truck, 
    Home, 
    AlertTriangle, 
    CheckCircle2, 
    Clock, 
    User,
    ListTodo
} from 'lucide-react';

export default function Penanganan() {
    const village = { name: 'Kelurahan Setempat' };
    const victimsCount = { safe: 0, injured: 0, missing: 0, deceased: 0 };
    const damagesSummary = { ringan: 0, sedang: 0, berat: 0 };
    const logistics = [];
    const handlings = [];

    return (
        <Layout activePage="penanganan" title={`Penanganan Bencana Kelurahan ${village.name}`}>
            
            {/* Metrics Overview Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                
                {/* Victims Card */}
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <Users size={18} className="color-primary" />
                        Dampak Korban Jiwa
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.25rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(16,185,129,0.06)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.1)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Selamat</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981', marginTop: '0.2rem' }}>{victimsCount.safe} <span style={{ fontSize: '0.85rem', fontWeight: 'normal' }}>Jiwa</span></div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(234,179,8,0.06)', borderRadius: '8px', border: '1px solid rgba(234,179,8,0.1)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Luka-luka</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#eab308', marginTop: '0.2rem' }}>{victimsCount.injured} <span style={{ fontSize: '0.85rem', fontWeight: 'normal' }}>Jiwa</span></div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(249,115,22,0.06)', borderRadius: '8px', border: '1px solid rgba(249,115,22,0.1)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Hilang</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f97316', marginTop: '0.2rem' }}>{victimsCount.missing} <span style={{ fontSize: '0.85rem', fontWeight: 'normal' }}>Jiwa</span></div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.06)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.1)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Meninggal</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444', marginTop: '0.2rem' }}>{victimsCount.deceased} <span style={{ fontSize: '0.85rem', fontWeight: 'normal' }}>Jiwa</span></div>
                        </div>
                    </div>
                </div>

                {/* Infrastructure Damage Card */}
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <Home size={18} className="color-primary" />
                        Kerusakan Infrastruktur
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

                {/* Logistics Overview Card */}
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <Truck size={18} className="color-primary" />
                        Ringkasan Bantuan Logistik
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', justifyContent: 'center', height: '100%' }}>
                        <div style={{ display: 'flex', justifyItems: 'center', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(234,179,8,0.1)', borderRadius: '8px', color: '#eab308' }}>
                                <Clock size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Menunggu Persetujuan</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                    {logistics.filter(l => l.status === 'requested').length} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>Permintaan</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyItems: 'center', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', color: '#10b981' }}>
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Disetujui & Disalurkan</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                    {logistics.filter(l => l.status === 'approved' || l.status === 'distributed').length} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>Disetujui</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom Row Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
                
                {/* Logistics Requests Status */}
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <ListTodo size={18} className="color-primary" />
                        Logistik & Bantuan Sosial
                    </h3>
                    
                    {logistics.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                            Belum ada pengajuan bantuan logistik dari warga.
                        </div>
                    ) : (
                        <div className="table-responsive" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Lokasi Bencana</th>
                                        <th>Nama Barang</th>
                                        <th style={{ textAlign: 'center' }}>Jumlah</th>
                                        <th style={{ textAlign: 'center' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logistics.map((log) => (
                                        <tr key={log.id}>
                                            <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {log.complaint?.address}
                                            </td>
                                            <td style={{ fontWeight: '500' }}>{log.item_name}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                {log.quantity} {log.unit}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
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
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Progress / Field Handlings Log */}
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <Activity size={18} className="color-primary" />
                        Perkembangan Penanganan Lapangan
                    </h3>

                    {handlings.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                            Belum ada rekam jejak progres penanganan di lapangan.
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
                                        <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: hand.progress_percentage === 100 ? '#10b981' : '#f97316' }}>
                                            {hand.progress_percentage}% Progres
                                        </div>
                                    </div>
                                    
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                                        {hand.description}
                                    </div>

                                    {/* Progress Bar UI */}
                                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.4rem' }}>
                                        <div 
                                            style={{ 
                                                width: `${hand.progress_percentage}%`, 
                                                height: '100%', 
                                                background: hand.progress_percentage === 100 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #f97316, #d97706)',
                                                borderRadius: '3px',
                                                transition: 'width 0.4s ease'
                                            }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        <span>Lokasi: {hand.complaint?.address}</span>
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
