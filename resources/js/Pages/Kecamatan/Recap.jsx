import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../Components/Layout';
import { FileSpreadsheet, Eye, ArrowUpRight, ShieldAlert } from 'lucide-react';

export default function Recap() {
    const district = { name: 'Kecamatan Setempat' };
    const villages = [];
    const getEmergencyBadge = (emStatus) => {
        if (!emStatus || !emStatus.is_emergency) {
            return <span className="badge badge-status-resolved"><span className="badge-dot"></span>Normal</span>;
        }

        const level = emStatus.emergency_level;
        if (level === 'awas') return <span className="badge badge-priority-critical"><span className="badge-dot"></span>Awas</span>;
        if (level === 'siaga') return <span className="badge badge-priority-high"><span className="badge-dot"></span>Siaga</span>;
        if (level === 'waspada') return <span className="badge badge-priority-medium"><span className="badge-dot"></span>Waspada</span>;
        return <span className="badge badge-status-resolved"><span className="badge-dot"></span>Normal</span>;
    };

    return (
        <Layout activePage="recap" title={`Rekapitulasi Wilayah Kecamatan ${district.name}`}>
            
            <div className="panel-card" style={{ padding: '0' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                        <FileSpreadsheet size={18} className="color-primary" />
                        Data Rekapitulasi per Kelurahan / Desa
                    </h3>
                </div>

                <div className="table-wrapper">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: '1.5rem' }}>Nama Kelurahan / Desa</th>
                                <th>Status Kedaruratan</th>
                                <th>Total Laporan Masuk</th>
                                <th>Laporan Pending</th>
                                <th>Penanganan Aktif</th>
                                <th>Logistik Diajukan</th>
                                <th>Logistik Terkirim</th>
                                <th style={{ paddingRight: '1.5rem', textAlign: 'right' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {villages.map((v) => (
                                <tr key={v.id}>
                                    <td style={{ paddingLeft: '1.5rem', fontWeight: 600 }}>Desa {v.name}</td>
                                    <td>{getEmergencyBadge(v.emergency_status)}</td>
                                    <td style={{ fontWeight: 650 }}>{v.complaints_count} Laporan</td>
                                    <td style={{ color: v.pending_complaints_count > 0 ? 'var(--color-pending)' : 'inherit', fontWeight: v.pending_complaints_count > 0 ? 600 : 'normal' }}>
                                        {v.pending_complaints_count} Aduan
                                    </td>
                                    <td>{v.active_complaints_count} Kasus</td>
                                    <td>{v.logistics_requested_count} Item</td>
                                    <td style={{ color: 'var(--color-resolved)', fontWeight: 550 }}>{v.logistics_approved_count} Item</td>
                                    <td style={{ paddingRight: '1.5rem', textAlign: 'right' }}>
                                        <Link 
                                            href={`/dashboard/kecamatan/aduan?village=${v.id}`}
                                            className="btn-secondary"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '6px' }}
                                        >
                                            <span>Buka Laporan</span>
                                            <ArrowUpRight size={12} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
                <div className="panel-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                        <ShieldAlert size={20} />
                    </div>
                    <div>
                        <h4 style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>Pos Tanggap Darurat Utama</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Kecamatan Babakan Madang berpusat di Kantor Kecamatan, Jl. Babakan Madang No.1</p>
                    </div>
                </div>
                
                <div className="panel-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                        <FileSpreadsheet size={20} />
                    </div>
                    <div>
                        <h4 style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>Hubungi Pusdalops Bogor</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Untuk eskalasi bantuan tingkat Kabupaten, hubungi Pusdalops BPBD Kabupaten Bogor.</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
