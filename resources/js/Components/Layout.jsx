import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import Sidebar from './Sidebar';
import { notificationService } from '../api/services/notifications';
import { Sun, Moon, Bell, CheckCircle2, AlertTriangle, X, Activity, MessageSquare, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children, activePage, title, fullScreen = false }) {
    const { user } = useAuth();
    // Flash message functionality is removed/handled globally since Inertia is gone,
    // but we'll keep local state in case it's used elsewhere via context or props.
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'dark';
    });
    const [showFlash, setShowFlash] = useState(false);
    const [flashMsg, setFlashMsg] = useState({ type: '', text: '' });
    
    // Mobile Sidebar State
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loadingNotif, setLoadingNotif] = useState(false);
    const [notifError, setNotifError] = useState(null);

    // Handle theme class on mount and change
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'light') {
            root.setAttribute('data-theme', 'light');
        } else {
            root.removeAttribute('data-theme');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Flash messages will be handled by a global toast system in the future.
    // Cleaned up Inertia flash watcher.

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    // Fetch Notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoadingNotif(true);
                const res = await notificationService.getAll();
                setNotifications(res.data?.data || []);
            } catch (err) {
                console.error("Failed to load notifications", err);
                setNotifError("Gagal memuat notifikasi.");
            } finally {
                setLoadingNotif(false);
            }
        };

        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Handle clicking outside of notification panel
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showNotifications && !e.target.closest('.notification-container')) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showNotifications]);

    return (
        <div className="layout-wrapper">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}
            
            <Sidebar activePage={activePage} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <main className={`main-content ${fullScreen ? 'fullscreen' : ''}`}>
                {/* Top Notification Banner */}
                {showFlash && (
                    <div className={`alert-banner ${flashMsg.type} animate-fade-in`}>
                        {flashMsg.type === 'success' ? (
                            <CheckCircle2 size={20} className="color-resolved" />
                        ) : (
                            <AlertTriangle size={20} className="color-critical" />
                        )}
                        <span style={{ flexGrow: 1, fontWeight: 500 }}>{flashMsg.text}</span>
                        <button 
                            onClick={() => setShowFlash(false)} 
                            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}
                            aria-label="Tutup pesan ini"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Sub-Header Area */}
                {!fullScreen && (
                    <div className="content-header">
                    <div className="content-header-title flex items-center gap-4">
                        <button 
                            className="lg:hidden p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Buka menu navigasi"
                            aria-expanded={sidebarOpen}
                        >
                            <Menu size={22} />
                        </button>
                        <div>
                            <h1 className="text-xl sm:text-[1.85rem]">{title}</h1>
                            <p className="hidden sm:block">Sistem Informasi Kebencanaan Kabupaten Bogor</p>
                        </div>
                    </div>

                    <div className="content-header-actions">
                        {/* Theme Toggle Button */}
                        <button 
                            onClick={toggleTheme} 
                            className="btn-secondary" 
                            style={{ padding: '0.5rem 0.75rem', borderRadius: '8px' }}
                            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
                            aria-label={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        
                        {/* Notifications Icon & Panel */}
                        <div className="notification-container" style={{ position: 'relative' }}>
                            <button 
                                className="btn-secondary" 
                                onClick={() => setShowNotifications(!showNotifications)}
                                style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', position: 'relative' }}
                                title="Notifikasi"
                                aria-label="Notifikasi"
                                aria-expanded={showNotifications}
                                aria-controls="notification-dropdown"
                            >
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '-4px',
                                        right: '-4px',
                                        background: '#ef4444',
                                        color: 'white',
                                        fontSize: '0.65rem',
                                        fontWeight: 'bold',
                                        padding: '0.1rem 0.3rem',
                                        borderRadius: '99px',
                                        lineHeight: 1
                                    }}>
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown Panel */}
                            {showNotifications && (
                                <div id="notification-dropdown" className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1C1C1A] rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden" role="menu">
                                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                        <h3 className="font-bold text-gray-800 dark:text-gray-200">Notifikasi</h3>
                                        {unreadCount > 0 && (
                                            <span className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                                                Tandai semua dibaca
                                            </span>
                                        )}
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {loadingNotif ? (
                                            <div className="p-8 flex flex-col items-center justify-center text-gray-500">
                                                <Activity size={24} className="animate-spin mb-2 text-blue-500" />
                                                <span className="text-sm">Memuat notifikasi...</span>
                                            </div>
                                        ) : notifError ? (
                                            <div className="p-6 text-center text-red-500 text-sm">
                                                <AlertTriangle size={24} className="mx-auto mb-2" />
                                                {notifError}
                                            </div>
                                        ) : notifications.length === 0 ? (
                                            <div className="p-8 text-center text-gray-500">
                                                <Bell size={32} className="mx-auto mb-3 text-gray-300 dark:text-gray-700" />
                                                <p className="text-sm">Belum ada notifikasi baru.</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                                {notifications.map(notif => (
                                                    <div 
                                                        key={notif.id_notifikasi} 
                                                        className={`p-4 hover:bg-gray-50 dark:hover:bg-[#252523] transition-colors cursor-pointer ${!notif.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className="mt-1">
                                                                {notif.tipe === 'laporan' ? (
                                                                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center shrink-0">
                                                                        <MessageSquare size={14} />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                                                                        <Bell size={14} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-0.5">{notif.judul}</h4>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-1.5">{notif.pesan}</p>
                                                                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                                                    {new Date(notif.created_at).toLocaleString('id-ID')}
                                                                </span>
                                                            </div>
                                                            {!notif.is_read && (
                                                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 border-t border-gray-100 dark:border-gray-800 text-center">
                                        <a href="#" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                            Lihat Semua Notifikasi
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                )}

                {/* Page Content */}
                <motion.div 
                    key={activePage} // Animate on page change
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex-grow flex flex-col ${fullScreen ? 'relative h-screen' : ''}`}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
