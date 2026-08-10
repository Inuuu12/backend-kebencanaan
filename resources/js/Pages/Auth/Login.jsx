import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, FlameKindling } from 'lucide-react';
import { useAuth } from '../../AuthContext';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    
    const [data, setData] = useState({
        email: '',
        password: '',
        remember: false,
    });
    const [processing, setProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrorMsg('');

        try {
            const success = await login(data);
            if (!success) {
                setErrorMsg('Login gagal, pastikan kredensial Anda benar.');
            }
        } catch (error) {
            setErrorMsg(error.message || 'Terjadi kesalahan sistem.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="login-wrapper relative overflow-hidden bg-slate-50 dark:bg-slate-900">
            {/* Background Decorations to match Beranda Orange Theme */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#FF750F] rounded-full mix-blend-multiply filter blur-[150px] opacity-40 animate-blob"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-400 rounded-full mix-blend-multiply filter blur-[150px] opacity-40 animate-blob animation-delay-2000"></div>
            </div>
            
            <div className="login-card relative z-10 border-orange-500/20 shadow-[0_0_50px_-12px_rgba(255,117,15,0.25)]">
                <title>Masuk ke Sistem - SIKAB</title>
            
                <div className="login-header">
                    <div className="login-logo">
                        <FlameKindling size={24} />
                    </div>
                    <h2 className="login-title">SIKAB BOGOR</h2>
                    <p className="login-subtitle">Sistem Informasi Kebencanaan Kabupaten Bogor</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {errorMsg && (
                        <div className="alert-banner error animate-fade-in" style={{ padding: '0.75rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                            {errorMsg}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Alamat Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
                            <input
                                id="email"
                                type="email"
                                className="form-control"
                                style={{ paddingLeft: '36px' }}
                                placeholder="nama@sikab.go.id"
                                value={data.email}
                                onChange={(e) => setData({ ...data, email: e.target.value })}
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="password">Kata Sandi</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
                            <input
                                id="password"
                                type="password"
                                className="form-control"
                                style={{ paddingLeft: '36px' }}
                                placeholder="••••••••"
                                value={data.password}
                                onChange={(e) => setData({ ...data, password: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <label className="switch" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData({ ...data, remember: e.target.checked })}
                            />
                            <span className="slider"></span>
                            <span style={{ fontSize: '0.85rem', color: '#94a3b8', userSelect: 'none', marginLeft: '50px', whiteSpace: 'nowrap' }}>
                                Ingat Saya
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', padding: '0.85rem' }}
                        disabled={processing}
                    >
                        <Shield size={18} />
                        <span>{processing ? 'Memproses...' : 'Masuk Dashboard'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
}
