import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import Layout from '../../Components/Layout';
import { 
    Search, 
    Filter, 
    Check, 
    X, 
    Plus, 
    AlertTriangle, 
    User, 
    Phone, 
    MapPin, 
    Sparkles, 
    PlusCircle,
    PackageOpen,
    Eye,
    Hammer,
    Users,
    Activity
} from 'lucide-react';

export default function Complaints({ district, villages, complaints }) {
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [familyModalResident, setFamilyModalResident] = useState(null);
    const [activeTab, setActiveTab] = useState('details'); // details, handlings, victims, damages, logistics
    
    // Filters state
    const [searchTerm, setSearchTerm] = useState('');
    const [villageFilter, setVillageFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    // Handling Update Form
    const handlingForm = useForm({
        officer_name: '',
        description: '',
        status: 'ongoing',
    });

    // Filter complaints
    const filteredComplaints = complaints.filter(c => {
        const matchesSearch = c.citizen_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             c.address.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesVillage = villageFilter ? String(c.village_id) === villageFilter : true;
        const matchesStatus = statusFilter ? c.status === statusFilter : true;
        const matchesPriority = priorityFilter ? c.priority === priorityFilter : true;
        const matchesType = typeFilter ? c.disaster_type === typeFilter : true;
        return matchesSearch && matchesVillage && matchesStatus && matchesPriority && matchesType;
    });

    // Action handlers
    const handleStatusUpdate = (id, status) => {
        router.post(`/dashboard/kecamatan/aduan/${id}/status`, { status }, {
            onSuccess: (page) => {
                const updated = page.props.complaints.find(c => c.id === id);
                setSelectedComplaint(updated);
            }
        });
    };

    const handleAddHandling = (e, complaintId) => {
        e.preventDefault();
        handlingForm.post(`/dashboard/kecamatan/aduan/${complaintId}/handling`, {
            preserveScroll: true,
            onSuccess: (page) => {
                handlingForm.reset();
                const updated = page.props.complaints.find(c => c.id === complaintId);
                setSelectedComplaint(updated);
            }
        });
    };

    const handleApproveLogistic = (logisticId, complaintId) => {
        router.post(`/dashboard/kecamatan/logistic/${logisticId}/approve`, {}, {
            preserveScroll: true,
            onSuccess: (page) => {
                const updated = page.props.complaints.find(c => c.id === complaintId);
                setSelectedComplaint(updated);
            }
        });
    };

    const handleDistributeLogistic = (logisticId, complaintId) => {
        router.post(`/dashboard/kecamatan/logistic/${logisticId}/distribute`, {}, {
            preserveScroll: true,
            onSuccess: (page) => {
                const updated = page.props.complaints.find(c => c.id === complaintId);
                setSelectedComplaint(updated);
            }
        });
    };

    const getPriorityBadge = (prio) => {
        return <span className={`badge badge-priority-${prio}`}><span className="badge-dot"></span>{prio}</span>;
    };

    const getStatusBadge = (status) => {
        return <span className={`badge badge-status-${status}`}><span className="badge-dot"></span>{status}</span>;
    };

    return (
        <Layout activePage="complaints" title="Pusat Monitoring Laporan Bencana">
            
            {/* Filters Dashboard Card */}
            <div className="panel-card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flexGrow: 1, minWidth: '240px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
                        <input
                            type="text"
                            className="form-control"
                            style={{ paddingLeft: '36px' }}
                            placeholder="Cari pelapor, deskripsi, alamat..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <select 
                            className="form-select" 
                            style={{ width: '150px' }}
                            value={villageFilter}
                            onChange={(e) => setVillageFilter(e.target.value)}
                        >
                            <option value="">Semua Desa</option>
                            {villages.map(v => (
                                <option key={v.id} value={v.id}>Desa {v.name}</option>
                            ))}
                        </select>

                        <select 
                            className="form-select" 
                            style={{ width: '130px' }}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">Semua Status</option>
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="handling">Handling</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        <select 
                            className="form-select" 
                            style={{ width: '130px' }}
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                        >
                            <option value="">Semua Prioritas</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Complaints List Panel */}
            <div className="panel-card" style={{ padding: '0' }}>
                <div className="table-wrapper">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: '1.5rem' }}>Tanggal</th>
                                <th>Desa</th>
                                <th>Jenis Bencana</th>
                                <th>Pelapor / Telepon</th>
                                <th>Prioritas</th>
                                <th>Status</th>
                                <th style={{ paddingRight: '1.5rem', textAlign: 'right' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredComplaints.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                                        <AlertTriangle size={24} style={{ marginBottom: '0.5rem', display: 'inline-block' }} />
                                        <div>Tidak ada aduan warga ditemukan.</div>
                                    </td>
                                </tr>
                            ) : (
                                filteredComplaints.map((c) => (
                                    <tr key={c.id}>
                                        <td style={{ paddingLeft: '1.5rem', whiteSpace: 'nowrap' }}>
                                            {new Date(c.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td style={{ fontWeight: 600 }}>Desa {c.village?.name}</td>
                                        <td style={{ textTransform: 'capitalize', fontWeight: 600 }}>{c.disaster_type}</td>
                                         <td>
                                             <div style={{ fontWeight: 600 }}>
                                                 {c.resident ? (
                                                     <button
                                                         onClick={() => setFamilyModalResident(c.resident)}
                                                         style={{ background: 'none', border: 'none', color: 'var(--color-primary)', padding: '0', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600, textAlign: 'left' }}
                                                         title="Klik untuk lihat anggota Kartu Keluarga (KK)"
                                                     >
                                                         {c.citizen_name}
                                                     </button>
                                                 ) : (
                                                     c.citizen_name
                                                 )}
                                             </div>
                                             <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace', marginTop: '2px' }}>
                                                 NIK: {c.citizen_nik || '-'}
                                             </div>
                                         </td>
                                        <td>{getPriorityBadge(c.priority)}</td>
                                        <td>{getStatusBadge(c.status)}</td>
                                        <td style={{ paddingRight: '1.5rem', textAlign: 'right' }}>
                                            <button 
                                                onClick={() => {
                                                    setSelectedComplaint(c);
                                                    setActiveTab('details');
                                                }}
                                                className="btn-secondary"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '6px' }}
                                            >
                                                <Eye size={14} />
                                                <span>Kelola</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Detail & Management */}
            {selectedComplaint && (
                <div className="modal-overlay">
                    <div className="modal-content animate-scale-up">
                        <div className="modal-header">
                            <h3>Kelola Aduan #{selectedComplaint.id}: <span style={{ textTransform: 'capitalize', color: 'var(--color-primary)' }}>{selectedComplaint.disaster_type}</span> ({selectedComplaint.village?.name})</h3>
                            <button onClick={() => setSelectedComplaint(null)} className="modal-btn-close">&times;</button>
                        </div>

                        {/* Modal Navigation Tabs */}
                        <div className="tabs-navigation" style={{ padding: '0 1.5rem', margin: '0' }}>
                            <button onClick={() => setActiveTab('details')} className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}>Detail</button>
                            <button onClick={() => setActiveTab('handlings')} className={`tab-btn ${activeTab === 'handlings' ? 'active' : ''}`}>Penanganan Lapangan ({selectedComplaint.handlings?.length || 0})</button>
                            <button onClick={() => setActiveTab('victims')} className={`tab-btn ${activeTab === 'victims' ? 'active' : ''}`}>Daftar Korban ({selectedComplaint.victims?.length || 0})</button>
                            <button onClick={() => setActiveTab('damages')} className={`tab-btn ${activeTab === 'damages' ? 'active' : ''}`}>Kerusakan ({selectedComplaint.damages?.length || 0})</button>
                            <button onClick={() => setActiveTab('logistics')} className={`tab-btn ${activeTab === 'logistics' ? 'active' : ''}`}>Logistik Bantuan ({selectedComplaint.logistics?.length || 0})</button>
                        </div>

                        <div className="modal-body">
                            {/* Tab 1: Details */}
                            {activeTab === 'details' && (
                                <div>
                                    <div className="detail-grid">
                                         <div className="detail-item">
                                             <span className="detail-label"><User size={12} style={{ display: 'inline', marginRight: '4px' }} /> Pelapor</span>
                                             <span className="detail-value">
                                                 {selectedComplaint.resident ? (
                                                     <button 
                                                         onClick={() => setFamilyModalResident(selectedComplaint.resident)}
                                                         style={{ 
                                                             background: 'none', 
                                                             border: 'none', 
                                                             color: 'var(--color-primary)', 
                                                             padding: '0', 
                                                             textDecoration: 'underline', 
                                                             cursor: 'pointer',
                                                             fontWeight: 600,
                                                             textAlign: 'left'
                                                         }}
                                                     >
                                                         {selectedComplaint.citizen_name}
                                                     </button>
                                                 ) : (
                                                     selectedComplaint.citizen_name
                                                 )}
                                             </span>
                                         </div>
                                         <div className="detail-item">
                                             <span className="detail-label"><Phone size={12} style={{ display: 'inline', marginRight: '4px' }} /> Telepon</span>
                                             <span className="detail-value">{selectedComplaint.citizen_phone}</span>
                                         </div>
                                         <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                                             <span className="detail-label">NIK Pelapor</span>
                                             <span className="detail-value">
                                                 {selectedComplaint.citizen_nik ? (
                                                     <button 
                                                         onClick={() => setFamilyModalResident(selectedComplaint.resident)}
                                                         style={{ 
                                                             background: 'none', 
                                                             border: 'none', 
                                                             color: 'var(--color-primary)', 
                                                             padding: '0', 
                                                             textDecoration: 'underline', 
                                                             cursor: 'pointer',
                                                             fontFamily: 'monospace',
                                                             textAlign: 'left'
                                                         }}
                                                     >
                                                         {selectedComplaint.citizen_nik}
                                                     </button>
                                                 ) : (
                                                     <span style={{ color: 'var(--text-muted)' }}>-</span>
                                                 )}
                                             </span>
                                         </div>
                                        <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                                            <span className="detail-label"><MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} /> Lokasi Kejadian</span>
                                            <span className="detail-value">{selectedComplaint.address}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Status Penanganan</span>
                                            <span className="detail-value">{getStatusBadge(selectedComplaint.status)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Prioritas Penanganan</span>
                                            <span className="detail-value">{getPriorityBadge(selectedComplaint.priority)}</span>
                                        </div>
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                        <label>Deskripsi Laporan Kejadian</label>
                                        <p style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', lineHeight: '1.5', border: '1px solid var(--border-color)' }}>
                                            {selectedComplaint.description}
                                        </p>
                                    </div>

                                    {/* Action dropdown for status updates */}
                                    {selectedComplaint.status !== 'rejected' && (
                                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <div className="form-group" style={{ width: '240px', marginBottom: '0' }}>
                                                <label htmlFor="modal-status">Ubah Status Aduan</label>
                                                <select
                                                    id="modal-status"
                                                    className="form-select"
                                                    value={selectedComplaint.status}
                                                    onChange={(e) => handleStatusUpdate(selectedComplaint.id, e.target.value)}
                                                >
                                                    <option value="verified">Verified (Terdokumentasi)</option>
                                                    <option value="handling">Handling (Proses Lapangan)</option>
                                                    <option value="resolved">Resolved (Selesai Penanganan)</option>
                                                </select>
                                            </div>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'flex-end', marginBottom: '4px' }}>
                                                Mengubah status penanganan akan mengupdate sistem Pusdalops.
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab 2: Handlings */}
                            {activeTab === 'handlings' && (
                                <div>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Activity size={16} className="color-primary" /> Log Progres & Input Petugas Lapangan
                                    </h4>

                                    <div style={{ marginBottom: '2rem' }}>
                                        {!selectedComplaint.handlings || selectedComplaint.handlings.length === 0 ? (
                                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem 0' }}>Belum ada log penanganan lapangan.</div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderLeft: '2px solid rgba(255,255,255,0.05)', marginLeft: '12px', paddingLeft: '20px' }}>
                                                {selectedComplaint.handlings.map((h) => (
                                                    <div key={h.id} style={{ position: 'relative' }}>
                                                        <span style={{
                                                            position: 'absolute',
                                                            left: '-26px',
                                                            top: '4px',
                                                            width: '10px',
                                                            height: '10px',
                                                            borderRadius: '50%',
                                                            background: h.status === 'completed' ? 'var(--color-resolved)' : 'var(--color-primary)',
                                                            boxShadow: `0 0 8px ${h.status === 'completed' ? 'var(--color-resolved)' : 'var(--color-primary)'}`
                                                        }}></span>
                                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                                            {new Date(h.created_at).toLocaleString('id-ID')}
                                                        </div>
                                                        <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                                                            {h.officer_name}
                                                        </div>
                                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                                            {h.description}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Add Handling Form */}
                                    {selectedComplaint.status !== 'resolved' && selectedComplaint.status !== 'rejected' && (
                                        <form onSubmit={(e) => handleAddHandling(e, selectedComplaint.id)} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                                            <h5 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Input Update Lapangan Baru</h5>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                                <div className="form-group">
                                                    <label htmlFor="h-officer">Nama Petugas / Instansi</label>
                                                    <input id="h-officer" type="text" className="form-control" placeholder="BPBD / Tagana / Damkar..." value={handlingForm.data.officer_name} onChange={(e) => handlingForm.setData('officer_name', e.target.value)} required />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="h-status">Status Lapangan</label>
                                                    <select id="h-status" className="form-select" value={handlingForm.data.status} onChange={(e) => handlingForm.setData('status', e.target.value)}>
                                                        <option value="ongoing">Sedang Dikerjakan (Ongoing)</option>
                                                        <option value="completed">Penanganan Selesai (Completed)</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                                <label htmlFor="h-desc">Deskripsi Pekerjaan</label>
                                                <input id="h-desc" type="text" className="form-control" placeholder="Evakuasi selesai, penyaluran logistik..." value={handlingForm.data.description} onChange={(e) => handlingForm.setData('description', e.target.value)} required />
                                            </div>
                                            <button type="submit" className="btn-primary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }} disabled={handlingForm.processing}>
                                                <PlusCircle size={14} /> Kirim Update
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}

                            {/* Tab 3: Victims */}
                            {activeTab === 'victims' && (
                                <div>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Users size={16} className="color-primary" /> Daftar Korban Terdampak (Laporan Kelurahan)
                                    </h4>

                                    <table className="custom-table">
                                        <thead>
                                            <tr>
                                                <th>Nama Korban</th>
                                                <th>Umur</th>
                                                <th>Kondisi</th>
                                                <th>Keterangan / Lokasi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {!selectedComplaint.victims || selectedComplaint.victims.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>Belum ada data korban tercatat.</td>
                                                </tr>
                                            ) : (
                                                selectedComplaint.victims.map((v) => (
                                                    <tr key={v.id}>
                                                        <td style={{ fontWeight: 600 }}>{v.name}</td>
                                                        <td>{v.age} Tahun</td>
                                                        <td>
                                                            <span className={`badge badge-priority-${v.condition === 'deceased' || v.condition === 'missing' ? 'critical' : v.condition === 'injured' ? 'high' : 'low'}`}>
                                                                {v.condition === 'safe' ? 'Selamat' : v.condition === 'injured' ? 'Luka-luka' : v.condition === 'missing' ? 'Hilang' : 'Meninggal'}
                                                            </span>
                                                        </td>
                                                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{v.notes || '-'}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Tab 4: Damages */}
                            {activeTab === 'damages' && (
                                <div>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Hammer size={16} className="color-primary" /> Infrastruktur Terdampak (Laporan Kelurahan)
                                    </h4>

                                    <table className="custom-table">
                                        <thead>
                                            <tr>
                                                <th>Jenis Infrastruktur</th>
                                                <th>Tingkat Kerusakan</th>
                                                <th>Deskripsi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {!selectedComplaint.damages || selectedComplaint.damages.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>Belum ada data kerusakan terdaftar.</td>
                                                </tr>
                                            ) : (
                                                selectedComplaint.damages.map((d) => (
                                                    <tr key={d.id}>
                                                        <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{d.damage_type.replace('_', ' ')}</td>
                                                        <td>
                                                            <span className={`badge badge-priority-${d.severity === 'berat' ? 'critical' : d.severity === 'sedang' ? 'high' : 'low'}`}>
                                                                {d.severity}
                                                            </span>
                                                        </td>
                                                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{d.description || '-'}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Tab 5: Logistics approval */}
                            {activeTab === 'logistics' && (
                                <div>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <PackageOpen size={16} className="color-primary" /> Permintaan & Persetujuan Logistik Bantuan
                                    </h4>

                                    <table className="custom-table">
                                        <thead>
                                            <tr>
                                                <th>Item Logistik</th>
                                                <th>Jumlah Pengajuan</th>
                                                <th>Status Pengajuan</th>
                                                <th style={{ textAlign: 'right' }}>Persetujuan Kecamatan</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {!selectedComplaint.logistics || selectedComplaint.logistics.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>Tidak ada pengajuan logistik untuk aduan ini.</td>
                                                </tr>
                                            ) : (
                                                selectedComplaint.logistics.map((l) => (
                                                    <tr key={l.id}>
                                                        <td style={{ fontWeight: 600 }}>{l.item_name}</td>
                                                        <td>{l.quantity} {l.unit}</td>
                                                        <td>
                                                            <span className={`badge badge-status-${l.status === 'distributed' ? 'resolved' : l.status === 'approved' ? 'verified' : 'pending'}`}>
                                                                {l.status === 'requested' ? 'Diajukan' : l.status === 'approved' ? 'Disetujui' : 'Telah Disalurkan'}
                                                            </span>
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            {l.status === 'requested' && (
                                                                <button 
                                                                    onClick={() => handleApproveLogistic(l.id, selectedComplaint.id)}
                                                                    className="btn-primary"
                                                                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                                                                >
                                                                    Setujui
                                                                </button>
                                                            )}
                                                            {l.status === 'approved' && (
                                                                <button 
                                                                    onClick={() => handleDistributeLogistic(l.id, selectedComplaint.id)}
                                                                    className="btn-secondary"
                                                                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: 'var(--color-resolved)', borderColor: 'rgba(16, 185, 129, 0.2)' }}
                                                                >
                                                                    Tandai Disalurkan
                                                                </button>
                                                            )}
                                                            {l.status === 'distributed' && (
                                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 550 }}>Bantuan Terkirim</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button onClick={() => setSelectedComplaint(null)} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>Tutup</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Anggota Kartu Keluarga */}
            {familyModalResident && (() => {
                const members = familyModalResident.family_members || familyModalResident.family_members || [];
                const headOfFamily = members.find(m => m.relationship === 'Kepala Keluarga')?.name || (familyModalResident.relationship === 'Kepala Keluarga' ? familyModalResident.name : 'Tidak Diketahui');
                return (
                    <div className="modal-overlay" style={{ zIndex: 1100 }}>
                        <div className="modal-content animate-scale-up" style={{ maxWidth: '700px' }}>
                            <div className="modal-header">
                                <h3>Rincian Kartu Keluarga (KK: <span style={{ color: 'var(--color-primary)', fontFamily: 'monospace' }}>{familyModalResident.kk_number}</span>)</h3>
                                <button onClick={() => setFamilyModalResident(null)} className="modal-btn-close">&times;</button>
                            </div>
                            <div className="modal-body" style={{ padding: '1.5rem' }}>
                                <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Kepala Keluarga / Alamat:</div>
                                    <div style={{ fontWeight: 600, fontSize: '1rem', marginTop: '0.25rem' }}>
                                        {headOfFamily}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                        {familyModalResident.address || 'Alamat tidak tercatat'}
                                    </div>
                                </div>

                                <div className="table-wrapper" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                                <th style={{ textAlign: 'left', padding: '0.75rem' }}>NIK</th>
                                                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Nama Lengkap</th>
                                                <th style={{ textAlign: 'center', padding: '0.75rem' }}>Hubungan</th>
                                                <th style={{ textAlign: 'center', padding: '0.75rem' }}>Umur</th>
                                                <th style={{ textAlign: 'center', padding: '0.75rem' }}>JK</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {members.map((m) => (
                                                <tr key={m.nik} style={{ borderBottom: '1px solid var(--border-color)', background: m.nik === familyModalResident.nik ? 'rgba(59, 130, 246, 0.08)' : 'transparent' }}>
                                                    <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>
                                                        {m.nik} {m.nik === familyModalResident.nik && <span style={{ fontSize: '0.7rem', background: 'var(--color-primary)', color: '#fff', padding: '1px 6px', borderRadius: '4px', marginLeft: '4px' }}>Pelapor</span>}
                                                    </td>
                                                    <td style={{ padding: '0.75rem', fontWeight: m.nik === familyModalResident.nik ? 600 : 500 }}>{m.name}</td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                        <span style={{ 
                                                            fontSize: '0.8rem', 
                                                            background: m.relationship === 'Kepala Keluarga' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)', 
                                                            color: m.relationship === 'Kepala Keluarga' ? '#10b981' : 'var(--text-secondary)',
                                                            padding: '2px 8px',
                                                            borderRadius: '6px'
                                                        }}>
                                                            {m.relationship}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{m.age} Thn</td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{m.gender}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={() => setFamilyModalResident(null)} className="btn-secondary" style={{ padding: '0.5rem 1.25rem' }}>Tutup</button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </Layout>
    );
}
