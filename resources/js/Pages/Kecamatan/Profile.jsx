import React, { useState } from 'react';
import { useAuth } from '../../AuthContext';
import Layout from '../../Components/Layout';
import { User, ShieldAlert, Key, ClipboardList, CheckCircle2 } from 'lucide-react';

export default function Profile() {
    const { user } = useAuth();
    const logs = [];
    const [data, setData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        password_confirmation: '',
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            setRecentlySuccessful(true);
            setTimeout(() => setRecentlySuccessful(false), 2000);
        }, 1000);
    };

    return (
        <Layout activePage="profile" title="Profil Operator & Keamanan">
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.3fr', gap: '1.5rem' }}>
                {/* Profile Edit Form */}
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={18} className="color-primary" />
                        Informasi Akun Operator
                    </h3>

                    <form onSubmit={handleSubmit}>
                        {recentlySuccessful && (
                            <div className="alert-banner success animate-fade-in" style={{ padding: '0.75rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                                <CheckCircle2 size={16} /> Profil berhasil diperbarui.
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label htmlFor="p-name">Nama Lengkap</label>
                                <input 
                                    id="p-name" 
                                    type="text" 
                                    className="form-control" 
                                    value={data.name} 
                                    onChange={(e) => setData('name', e.target.value)} 
                                    required 
                                />
                                {errors.name && <span style={{ color: 'var(--color-critical)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.name}</span>}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="p-email">Alamat Email</label>
                                <input 
                                    id="p-email" 
                                    type="email" 
                                    className="form-control" 
                                    value={data.email} 
                                    onChange={(e) => setData('email', e.target.value)} 
                                    required 
                                />
                                {errors.email && <span style={{ color: 'var(--color-critical)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.email}</span>}
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-color)', margin: '1.5rem 0', paddingTop: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Key size={16} className="color-primary" /> Ganti Kata Sandi (Opsional)
                            </h4>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label htmlFor="p-pass">Kata Sandi Baru</label>
                                    <input 
                                        id="p-pass" 
                                        type="password" 
                                        className="form-control" 
                                        placeholder="Kosongkan jika tidak diganti" 
                                        value={data.password} 
                                        onChange={(e) => setData('password', e.target.value)} 
                                    />
                                    {errors.password && <span style={{ color: 'var(--color-critical)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.password}</span>}
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="p-confirm">Konfirmasi Kata Sandi</label>
                                    <input 
                                        id="p-confirm" 
                                        type="password" 
                                        className="form-control" 
                                        placeholder="Ketik ulang kata sandi baru" 
                                        value={data.password_confirmation} 
                                        onChange={(e) => setData('password_confirmation', e.target.value)} 
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="btn-primary" 
                            style={{ padding: '0.65rem 1.5rem', fontSize: '0.9rem' }}
                            disabled={processing}
                        >
                            <span>Simpan Perubahan</span>
                        </button>
                    </form>
                </div>

                {/* Operator Activity Logs */}
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ClipboardList size={18} className="color-primary" />
                        Log Aktivitas Operator
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {logs.map((log, index) => (
                            <div 
                                key={index} 
                                style={{ 
                                    padding: '0.75rem', 
                                    background: 'rgba(255,255,255,0.02)', 
                                    borderRadius: '8px', 
                                    border: '1px solid var(--border-color)',
                                    fontSize: '0.85rem'
                                }}
                            >
                                <div style={{ color: 'var(--text-secondary)', marginBottom: '0.2rem', lineHeight: '1.4' }}>{log.action}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.time}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
