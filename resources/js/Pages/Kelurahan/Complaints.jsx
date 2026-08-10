import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import Layout from '../../Components/Layout';
import { 
    Search, 
    Filter, 
    ChevronRight, 
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
    Users
} from 'lucide-react';

export default function Complaints({ village, complaints }) {
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [familyModalResident, setFamilyModalResident] = useState(null);
    const [activeTab, setActiveTab] = useState('details'); // details, victims, damages, logistics, handlings
    
    // Filters state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    // Victim Form
    const victimForm = useForm({
        name: '',
        age: '',
        condition: 'safe',
        notes: '',
    });

    // Damage Form
    const damageForm = useForm({
        damage_type: 'rumah',
        severity: 'ringan',
        description: '',
    });

    // Logistic Form
    const logisticForm = useForm({
        item_name: '',
        quantity: 1,
        unit: 'pcs',
    });

    // Filter complaints
    const filteredComplaints = complaints.filter(c => {
        const matchesSearch = c.citizen_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             c.address.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter ? c.status === statusFilter : true;
        const matchesPriority = priorityFilter ? c.priority === priorityFilter : true;
        const matchesType = typeFilter ? c.disaster_type === typeFilter : true;
        return matchesSearch && matchesStatus && matchesPriority && matchesType;
    });

    // Action handlers
    const handleVerify = (id) => {
        if (confirm('Verifikasi aduan ini dan teruskan ke Kecamatan?')) {
            router.post(`/dashboard/kelurahan/aduan/${id}/verify`, {}, {
                onSuccess: (page) => {
                    // Update selected complaint in modal to reflect new state
                    const updated = page.props.complaints.find(c => c.id === id);
                    setSelectedComplaint(updated);
                }
            });
        }
    };

    const handleReject = (id) => {
        if (confirm('Tolak aduan ini karena laporan tidak valid?')) {
            router.post(`/dashboard/kelurahan/aduan/${id}/reject`, {}, {
                onSuccess: (page) => {
                    const updated = page.props.complaints.find(c => c.id === id);
                    setSelectedComplaint(updated);
                }
            });
        }
    };

    const handlePriorityChange = (id, priority) => {
        router.post(`/dashboard/kelurahan/aduan/${id}/priority`, { priority }, {
            onSuccess: (page) => {
                const updated = page.props.complaints.find(c => c.id === id);
                setSelectedComplaint(updated);
            }
        });
    };

    const handleAddVictim = (e, complaintId) => {
        e.preventDefault();
        victimForm.post(`/dashboard/kelurahan/aduan/${complaintId}/victim`, {
            preserveScroll: true,
            onSuccess: (page) => {
                victimForm.reset();
                const updated = page.props.complaints.find(c => c.id === complaintId);
                setSelectedComplaint(updated);
            }
        });
    };

    const handleAddDamage = (e, complaintId) => {
        e.preventDefault();
        damageForm.post(`/dashboard/kelurahan/aduan/${complaintId}/damage`, {
            preserveScroll: true,
            onSuccess: (page) => {
                damageForm.reset();
                const updated = page.props.complaints.find(c => c.id === complaintId);
                setSelectedComplaint(updated);
            }
        });
    };

    const handleRequestLogistic = (e, complaintId) => {
        e.preventDefault();
        logisticForm.post(`/dashboard/kelurahan/aduan/${complaintId}/logistic`, {
            preserveScroll: true,
            onSuccess: (page) => {
                logisticForm.reset();
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
        <Layout activePage="complaints" title="Manajemen Aduan Warga">
            
            {/* Filters Dashboard Card */}
            <div className="panel-card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flexGrow: 1, minWidth: '240px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
                        <input
                            type="text"
                            className="form-control"
                            style={{ paddingLeft: '36px' }}
                            placeholder="Cari berdasarkan nama pelapor, deskripsi, atau alamat..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <select 
                            className="form-select" 
                            style={{ width: '150px' }}
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
                            style={{ width: '150px' }}
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                        >
                            <option value="">Semua Prioritas</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>

                        <select 
                            className="form-select" 
                            style={{ width: '160px' }}
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="">Semua Jenis Bencana</option>
                            <option value="banjir">Banjir</option>
                            <option value="kebakaran">Kebakaran</option>
                            <option value="longsor">Longsor</option>
                            <option value="puting_beliung">Puting Beliung</option>
                            <option value="gempa">Gempa</option>
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
                                <th>Jenis Bencana</th>
                                <th>Pelapor / Telepon</th>
                                <th>Alamat Kejadian</th>
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
                                        <div>Tidak ada data aduan warga yang cocok dengan filter.</div>
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
                                        <td>
                                            <div style={{ 
                                                maxWidth: '220px', 
                                                overflow: 'hidden', 
                                                textOverflow: 'ellipsis', 
                                                whiteSpace: 'nowrap' 
                                            }} title={c.address}>
                                                {c.address}
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
                                                <span>Detail</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Detail Aduan */}
            {selectedComplaint && (
                <div className="modal-overlay">
                    <div className="modal-content animate-scale-up">
                        <div className="modal-header">
                            <h3>Aduan #{selectedComplaint.id}: Bencana <span style={{ textTransform: 'capitalize', color: 'var(--color-primary)' }}>{selectedComplaint.disaster_type}</span></h3>
                            <button onClick={() => setSelectedComplaint(null)} className="modal-btn-close">&times;</button>
                        </div>

                        {/* Tabs Navigation inside Modal */}
                        <div className="tabs-navigation" style={{ padding: '0 1.5rem', margin: '0' }}>
                            <button onClick={() => setActiveTab('details')} className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}>Detail</button>
                            <button onClick={() => setActiveTab('victims')} className={`tab-btn ${activeTab === 'victims' ? 'active' : ''}`}>Korban ({selectedComplaint.victims?.length || 0})</button>
                            <button onClick={() => setActiveTab('damages')} className={`tab-btn ${activeTab === 'damages' ? 'active' : ''}`}>Kerusakan ({selectedComplaint.damages?.length || 0})</button>
                            <button onClick={() => setActiveTab('logistics')} className={`tab-btn ${activeTab === 'logistics' ? 'active' : ''}`}>Logistik ({selectedComplaint.logistics?.length || 0})</button>
                            <button onClick={() => setActiveTab('handlings')} className={`tab-btn ${activeTab === 'handlings' ? 'active' : ''}`}>Penanganan ({selectedComplaint.handlings?.length || 0})</button>
                        </div>

                        <div className="modal-body">
                            {/* Tab 1: Detail */}
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
                                             <span className="detail-label"><Phone size={12} style={{ display: 'inline', marginRight: '4px' }} /> Kontak Handphone</span>
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
                                            <span className="detail-label"><MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} /> Alamat Kejadian</span>
                                            <span className="detail-value">{selectedComplaint.address}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Status Aduan</span>
                                            <span className="detail-value">{getStatusBadge(selectedComplaint.status)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Tingkat Prioritas</span>
                                            <span className="detail-value">{getPriorityBadge(selectedComplaint.priority)}</span>
                                        </div>
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                        <label>Deskripsi Kejadian</label>
                                        <p style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', lineHeight: '1.5', border: '1px solid var(--border-color)' }}>
                                            {selectedComplaint.description}
                                        </p>
                                    </div>

                                    {/* Action Buttons for Pending Reports */}
                                    {selectedComplaint.status === 'pending' && (
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                                            <div style={{ flexGrow: 1 }}>
                                                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>Tindakan Verifikasi Operator</h4>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Verifikasi laporan warga untuk diteruskan ke Kecamatan agar ditindaklanjuti.</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <button onClick={() => handleReject(selectedComplaint.id)} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                                                    <X size={14} /> Tolak
                                                </button>
                                                <button onClick={() => handleVerify(selectedComplaint.id)} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                                                    <Check size={14} /> Verifikasi & Kirim
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Priority Quick Update Option */}
                                    {selectedComplaint.status !== 'rejected' && selectedComplaint.status !== 'resolved' && (
                                        <div className="form-group" style={{ marginTop: '1rem', maxWidth: '200px' }}>
                                            <label htmlFor="modal-priority">Ubah Prioritas</label>
                                            <select
                                                id="modal-priority"
                                                className="form-select"
                                                value={selectedComplaint.priority}
                                                onChange={(e) => handlePriorityChange(selectedComplaint.id, e.target.value)}
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                                <option value="critical">Critical</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab 2: Victims */}
                            {activeTab === 'victims' && (
                                <div>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Users size={16} className="color-primary" /> Daftar Korban Terdampak
                                    </h4>

                                    <table className="custom-table" style={{ marginBottom: '2rem' }}>
                                        <thead>
                                            <tr>
                                                <th>Nama Korban</th>
                                                <th>Umur</th>
                                                <th>Kondisi</th>
                                                <th>Catatan</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {!selectedComplaint.victims || selectedComplaint.victims.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem 0' }}>Belum ada data korban tercatat.</td>
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

                                    {/* Add Victim Form */}
                                    {selectedComplaint.status !== 'resolved' && selectedComplaint.status !== 'rejected' && (
                                        <form onSubmit={(e) => handleAddVictim(e, selectedComplaint.id)} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                                            <h5 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Tambah Data Korban Baru</h5>
                                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                                <div className="form-group">
                                                    <label htmlFor="v-name">Nama Lengkap</label>
                                                    <input id="v-name" type="text" className="form-control" placeholder="Nama korban..." value={victimForm.data.name} onChange={(e) => victimForm.setData('name', e.target.value)} required />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="v-age">Umur</label>
                                                    <input id="v-age" type="number" className="form-control" placeholder="Umur..." value={victimForm.data.age} onChange={(e) => victimForm.setData('age', e.target.value)} required />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="v-cond">Kondisi</label>
                                                    <select id="v-cond" className="form-select" value={victimForm.data.condition} onChange={(e) => victimForm.setData('condition', e.target.value)}>
                                                        <option value="safe">Selamat</option>
                                                        <option value="injured">Luka-Luka</option>
                                                        <option value="missing">Hilang</option>
                                                        <option value="deceased">Meninggal Dunia</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                                <label htmlFor="v-notes">Catatan Tambahan (Lokasi evakuasi/keterangan luka)</label>
                                                <input id="v-notes" type="text" className="form-control" placeholder="Mengungsi di posko X..." value={victimForm.data.notes} onChange={(e) => victimForm.setData('notes', e.target.value)} />
                                            </div>
                                            <button type="submit" className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} disabled={victimForm.processing}>
                                                <PlusCircle size={14} /> Tambah Korban
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}

                            {/* Tab 3: Damages */}
                            {activeTab === 'damages' && (
                                <div>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Hammer size={16} className="color-primary" /> Daftar Kerusakan Infrastruktur
                                    </h4>

                                    <table className="custom-table" style={{ marginBottom: '2rem' }}>
                                        <thead>
                                            <tr>
                                                <th>Tipe Kerusakan</th>
                                                <th>Tingkat Keparahan</th>
                                                <th>Keterangan</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {!selectedComplaint.damages || selectedComplaint.damages.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem 0' }}>Belum ada data kerusakan tercatat.</td>
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

                                    {/* Add Damage Form */}
                                    {selectedComplaint.status !== 'resolved' && selectedComplaint.status !== 'rejected' && (
                                        <form onSubmit={(e) => handleAddDamage(e, selectedComplaint.id)} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                                            <h5 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Tambah Data Kerusakan Baru</h5>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                                <div className="form-group">
                                                    <label htmlFor="d-type">Jenis Kerusakan</label>
                                                    <select id="d-type" className="form-select" value={damageForm.data.damage_type} onChange={(e) => damageForm.setData('damage_type', e.target.value)}>
                                                        <option value="rumah">Rumah Tinggal</option>
                                                        <option value="fasilitas_umum">Fasilitas Umum (Masjid/Sekolah)</option>
                                                        <option value="jembatan">Jembatan</option>
                                                        <option value="jalan">Akses Jalan Raya</option>
                                                        <option value="lahan_pertanian">Lahan Pertanian/Kebun</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="d-sev">Tingkat Keparahan</label>
                                                    <select id="d-sev" className="form-select" value={damageForm.data.severity} onChange={(e) => damageForm.setData('severity', e.target.value)}>
                                                        <option value="ringan">Ringan</option>
                                                        <option value="sedang">Sedang</option>
                                                        <option value="berat">Berat</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                                <label htmlFor="d-desc">Deskripsi Kerusakan</label>
                                                <input id="d-desc" type="text" className="form-control" placeholder="Atap roboh, jalan retak..." value={damageForm.data.description} onChange={(e) => damageForm.setData('description', e.target.value)} required />
                                            </div>
                                            <button type="submit" className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} disabled={damageForm.processing}>
                                                <PlusCircle size={14} /> Tambah Kerusakan
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}

                            {/* Tab 4: Logistics */}
                            {activeTab === 'logistics' && (
                                <div>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <PackageOpen size={16} className="color-primary" /> Permintaan Logistik & Bantuan
                                    </h4>

                                    <table className="custom-table" style={{ marginBottom: '2rem' }}>
                                        <thead>
                                            <tr>
                                                <th>Nama Barang Bantuan</th>
                                                <th>Jumlah</th>
                                                <th>Status Pengajuan</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {!selectedComplaint.logistics || selectedComplaint.logistics.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem 0' }}>Belum ada permintaan logistik diajukan.</td>
                                                </tr>
                                            ) : (
                                                selectedComplaint.logistics.map((l) => (
                                                    <tr key={l.id}>
                                                        <td style={{ fontWeight: 600 }}>{l.item_name}</td>
                                                        <td>{l.quantity} {l.unit}</td>
                                                        <td>
                                                            <span className={`badge badge-status-${l.status === 'distributed' ? 'resolved' : l.status === 'approved' ? 'verified' : 'pending'}`}>
                                                                {l.status === 'requested' ? 'Diajukan' : l.status === 'approved' ? 'Disetujui Kecamatan' : 'Telah Disalurkan'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>

                                    {/* Request Logistics Form */}
                                    {selectedComplaint.status !== 'resolved' && selectedComplaint.status !== 'rejected' && (
                                        <form onSubmit={(e) => handleRequestLogistic(e, selectedComplaint.id)} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                                            <h5 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Ajukan Permintaan Bantuan Baru</h5>
                                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                                <div className="form-group">
                                                    <label htmlFor="l-item">Nama Barang</label>
                                                    <input id="l-item" type="text" className="form-control" placeholder="Sembako, terpal, selimut..." value={logisticForm.data.item_name} onChange={(e) => logisticForm.setData('item_name', e.target.value)} required />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="l-qty">Jumlah</label>
                                                    <input id="l-qty" type="number" className="form-control" placeholder="10..." value={logisticForm.data.quantity} onChange={(e) => logisticForm.setData('quantity', parseInt(e.target.value))} required />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="l-unit">Satuan</label>
                                                    <input id="l-unit" type="text" className="form-control" placeholder="box, pcs, kg..." value={logisticForm.data.unit} onChange={(e) => logisticForm.setData('unit', e.target.value)} required />
                                                </div>
                                            </div>
                                            <button type="submit" className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} disabled={logisticForm.processing}>
                                                <PlusCircle size={14} /> Ajukan Logistik
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}

                            {/* Tab 5: Handlings / Timeline */}
                            {activeTab === 'handlings' && (
                                <div>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Sparkles size={16} className="color-primary" /> Log Progres Penanganan Lapangan
                                    </h4>

                                    {!selectedComplaint.handlings || selectedComplaint.handlings.length === 0 ? (
                                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>Belum ada catatan penanganan terdaftar untuk aduan ini.</div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', borderLeft: '2px solid rgba(255,255,255,0.05)', marginLeft: '12px', paddingLeft: '20px' }}>
                                            {selectedComplaint.handlings.map((h, i) => (
                                                <div key={h.id} style={{ position: 'relative' }}>
                                                    {/* Timeline node */}
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
                                                    <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                                                        {h.officer_name} &bull; <span style={{ color: 'var(--color-primary)' }}>{h.progress_percentage}% Selesai</span>
                                                    </div>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: '1.4' }}>
                                                        {h.description}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
