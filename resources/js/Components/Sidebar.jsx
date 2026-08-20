import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { 
    LayoutDashboard, 
    FileText, 
    Map as MapIcon, 
    BarChart3, 
    FileSpreadsheet, 
    User, 
    Users,
    LogOut,
    FlameKindling,
    Activity,
    Newspaper,
    X
} from 'lucide-react';

export default function Sidebar({ activePage, isOpen, setIsOpen }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    const handleLogout = async (e) => {
        e.preventDefault();
        await logout();
        navigate('/login');
    };

    // Define links based on roles
    const getNavLinks = () => {
        if (user.role === 'superadmin') {
            return [
                { id: 'dashboard', name: 'Beranda', url: '/dashboard/kabupaten', icon: LayoutDashboard },
                { id: 'rekap-wilayah', name: 'Rekap Data Wilayah', url: '/dashboard/kabupaten/rekap-wilayah', icon: FileSpreadsheet },
                { id: 'complaints', name: 'Data Terverifikasi', url: '/dashboard/kabupaten/aduan', icon: FileText },
                { id: 'berita', name: 'Kelola Berita', url: '/dashboard/kabupaten/berita', icon: Newspaper },
                { id: 'pengguna', name: 'Kelola Pengguna', url: '/dashboard/kabupaten/pengguna', icon: Users },
                { id: 'map', name: 'Peta Wilayah', url: '/dashboard/kabupaten/peta', icon: MapIcon },
                // { id: 'penanganan', name: 'Penanganan Bencana', url: '/dashboard/kabupaten/penanganan', icon: Activity },
                // { id: 'profile', name: 'Profil Operator', url: '/dashboard/kabupaten/profil', icon: User },
            ];
        } else if (user.role === 'admin_kecamatan') {
            return [
                { id: 'dashboard', name: 'Beranda', url: '/dashboard/kecamatan', icon: LayoutDashboard },
                { id: 'complaints', name: 'Aduan Warga', url: '/dashboard/kecamatan/aduan', icon: FileText },
                { id: 'map', name: 'Peta Wilayah', url: '/dashboard/kecamatan/peta', icon: MapIcon },
                // { id: 'penanganan', name: 'Penanganan Bencana', url: '/dashboard/kecamatan/penanganan', icon: Activity },
                { id: 'recap', name: 'Rekap Kelurahan', url: '/dashboard/kecamatan/rekap', icon: FileSpreadsheet },
                { id: 'statistics', name: 'Statistik Bencana', url: '/dashboard/kecamatan/statistik', icon: BarChart3 },
                // { id: 'profile', name: 'Profil Operator', url: '/dashboard/kecamatan/profil', icon: User },
            ];
        } else {
            return [
                { id: 'dashboard', name: 'Beranda', url: '/dashboard/kelurahan', icon: LayoutDashboard },
                { id: 'complaints', name: 'Aduan Warga', url: '/dashboard/kelurahan/aduan', icon: FileText },
                { id: 'map', name: 'Peta Desa', url: '/dashboard/kelurahan/peta', icon: MapIcon },
                // { id: 'penanganan', name: 'Penanganan Bencana', url: '/dashboard/kelurahan/penanganan', icon: Activity },
                { id: 'recap', name: 'Laporan & Statistik', url: '/dashboard/kelurahan/laporan', icon: BarChart3 },
                // { id: 'profile', name: 'Profil Operator', url: '/dashboard/kelurahan/profil', icon: User },
            ];
        }
    };

    const navLinks = getNavLinks();

    return (
        <aside 
            className={cn(
                "group w-[260px] bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 fixed h-screen left-0 top-0 z-50 flex flex-col py-6 px-3 shadow-2xl transition-all duration-300 ease-in-out lg:translate-x-0 overflow-hidden hover:shadow-orange-500/10",
                isOpen ? "translate-x-0 w-[260px]" : "-translate-x-full"
            )}
            aria-label="Sidebar Navigasi"
        >
            <div className="flex items-center justify-between px-4 mb-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                        <FlameKindling size={22} />
                    </div>
                    <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 opacity-100 transition-opacity duration-300 whitespace-nowrap">
                        SIKAB BOGOR
                    </span>
                </div>
                {/* Mobile Close Button */}
                <button 
                    className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800"
                    onClick={() => setIsOpen && setIsOpen(false)}
                    aria-label="Tutup navigasi"
                >
                    <X size={22} />
                </button>
            </div>

            <nav className="flex flex-col gap-2 flex-grow" aria-label="Menu Utama">
                {navLinks.map((link) => {
                    const IconComponent = link.icon;
                    const isActive = activePage === link.id;
                    return (
                        <Link
                            key={link.id}
                            to={link.url}
                            className="relative group outline-none"
                            onClick={() => setIsOpen && setIsOpen(false)}
                        >
                            {isActive && (
                                <motion.div 
                                    layoutId="sidebar-active" 
                                    className="absolute inset-0 bg-orange-500/10 border-l-4 border-orange-500 rounded-r-xl"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                            <div className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm z-10 relative",
                                isActive ? "text-orange-400" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                            )}>
                                <IconComponent size={18} className={cn(isActive ? "text-orange-500" : "text-slate-500 hover:text-slate-300")} />
                                <span className="opacity-100 whitespace-nowrap transition-opacity duration-300">{link.name}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-slate-800 pt-6 mt-4 flex flex-col gap-4">
                <div className="flex items-center gap-3 px-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-orange-400 border border-slate-700 shrink-0">
                        {user.nama ? user.nama.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex flex-col min-w-0 opacity-100 transition-opacity duration-300 whitespace-nowrap">
                        <span className="text-sm font-bold text-slate-200 truncate">{user.nama || 'User'}</span>
                        <span className="text-xs text-slate-500 truncate capitalize">
                            {user.role === 'superadmin' 
                                ? 'BPBD Kab. Bogor' 
                                : (user.role === 'admin_kelurahan' && user.village ? `Kel. ${user.village}` : `Kec. Operator`)}
                        </span>
                    </div>
                </div>
                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout} 
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors text-sm font-bold"
                    aria-label="Keluar dari sesi"
                >
                    <LogOut size={16} />
                    <span className="opacity-100 whitespace-nowrap transition-opacity duration-300">Keluar Sesi</span>
                </motion.button>
            </div>
        </aside>
    );
}
