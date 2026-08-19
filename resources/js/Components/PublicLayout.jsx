import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FlameKindling, User, CloudLightning, ChevronDown, ArrowLeft, MapPin, LocateFixed, Loader2 } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { homeService } from '../api/services/home';
import { motion, AnimatePresence } from 'framer-motion';

export default function PublicLayout({ children, mapMode = false, headerActions = null, onLocationFound = null }) {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Default open only on homepage
    const [isWeatherOpen, setIsWeatherOpen] = useState(location.pathname === '/');
    const [weather, setWeather] = useState(null);
    const [loadingWeather, setLoadingWeather] = useState(false);
    
    // Location state
    const [locationName, setLocationName] = useState('Kabupaten Bogor, Jawa Barat');
    const [isLocating, setIsLocating] = useState(false);

    const handleGetLocation = () => {
        if ('geolocation' in navigator) {
            setIsLocating(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        onLocationFound?.({
                            latitude,
                            longitude,
                            accuracy: position.coords.accuracy,
                        });

                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await res.json();
                        if (data && data.address) {
                            const city = data.address.city || data.address.county || data.address.state_district || data.address.town || 'Lokasi tidak diketahui';
                            const state = data.address.state || '';
                            setLocationName(`${city}${state ? `, ${state}` : ''}`);
                        }
                    } catch (error) {
                        console.error("Gagal mendapatkan nama lokasi", error);
                    } finally {
                        setIsLocating(false);
                    }
                },
                (error) => {
                    console.error("Geolocation error", error);
                    alert("Akses lokasi ditolak atau gagal.");
                    setIsLocating(false);
                }
            );
        } else {
            alert("Geolokasi tidak didukung oleh browser Anda");
        }
    };

    useEffect(() => {
        // Automatically open/close weather panel based on route navigation
        setIsWeatherOpen(location.pathname === '/');
    }, [location.pathname]);

    useEffect(() => {
        // Fetch weather if opened and not yet fetched
        if (isWeatherOpen && !weather && !loadingWeather) {
            setLoadingWeather(true);
            homeService.getWeather()
                .then(res => setWeather(res?.data || res))
                .catch(() => setWeather(null))
                .finally(() => setLoadingWeather(false));
        }

        // Toggle body class for pushing down other absolute elements
        if (isWeatherOpen) {
            document.body.classList.add('weather-open');
        } else {
            document.body.classList.remove('weather-open');
        }
        
        // Cleanup on unmount
        return () => {
            document.body.classList.remove('weather-open');
        };
    }, [isWeatherOpen, weather]);

    return (
        <div className={`min-h-screen ${mapMode ? 'h-screen overflow-hidden' : 'flex flex-col'} bg-[#FDFDFC] dark:bg-[#0a0a0a] text-[#1b1b18] dark:text-[#EDEDEC] font-sans transition-colors duration-300 relative`}>
            {/* Header */}
            <header className={`${mapMode ? 'absolute top-0 left-0 right-0 bg-white/60 dark:bg-[#0a0a0a]/60 shadow-sm' : 'sticky top-0 bg-white/70 dark:bg-[#0a0a0a]/70'} z-[500] backdrop-blur-md border-b border-[#19140035] dark:border-[#3E3E3A] transition-colors`}>
                <div className="container mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                            <FlameKindling size={22} className="text-white" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="font-bold text-lg tracking-wide hidden sm:block">SIKAB BOGOR</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 -mt-1 hidden sm:block font-medium">Sistem Informasi Kebencanaan Kabupaten Bogor</span>
                        </div>
                    </div>
                    
                    <nav className="flex items-center gap-2 sm:gap-6 text-sm font-medium shrink-0">
                        {/* Current Location UI */}
                        <div className="flex items-center gap-1 sm:gap-2 text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 pr-3 sm:pr-6">
                            <MapPin size={16} className="text-teal-500 shrink-0" />
                            <span className="font-semibold text-[10px] sm:text-xs tracking-wide max-w-[80px] sm:max-w-none truncate" title={locationName}>{locationName}</span>
                            <button 
                                onClick={handleGetLocation} 
                                disabled={isLocating}
                                className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-white sm:ml-2 flex items-center gap-1 group bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 p-1 sm:px-2 sm:py-1 rounded-full transition-colors disabled:opacity-50"
                                title="Perbarui Lokasi"
                            >
                                {isLocating ? (
                                    <Loader2 size={12} className="animate-spin text-teal-500" />
                                ) : (
                                    <LocateFixed size={12} className="group-hover:text-teal-500 transition-colors" />
                                )}
                                <span className="hidden sm:inline">{isLocating ? 'Mencari...' : 'Lokasi Saya'}</span>
                            </button>
                        </div>

                        {headerActions && (
                            <div className="shrink-0">
                                {headerActions}
                            </div>
                        )}

                        <button 
                            onClick={() => setIsWeatherOpen(!isWeatherOpen)}
                            className="flex items-center gap-1 sm:gap-2 hover:text-blue-500 transition-colors focus:outline-none"
                        >
                            <CloudLightning size={18} className={isWeatherOpen ? 'text-blue-500' : ''} />
                            <span className={`hidden sm:inline ${isWeatherOpen ? 'text-blue-500 font-bold' : ''}`}>Cuaca</span>
                            <ChevronDown size={14} className={`transition-transform duration-300 ${isWeatherOpen ? 'rotate-180 text-blue-500' : ''}`} />
                        </button>
                        {user ? (
                            <Link to={(user.role === 'superadmin') ? '/dashboard/kabupaten' : user.role === 'admin_kecamatan' ? '/dashboard/kecamatan' : '/dashboard/kelurahan'} className="btn-primary rounded-full px-3 py-1.5 sm:px-5 sm:py-2 text-[10px] sm:text-sm font-bold">
                                <span className="hidden sm:inline">Masuk Dashboard</span>
                                <span className="sm:hidden">Dashboard</span>
                            </Link>
                        ) : (
                            <Link to="/login" className="relative group p-1.5 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300 flex items-center justify-center">
                                <User size={20} className="sm:w-[22px] sm:h-[22px]" />
                                {/* Tooltip */}
                                <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-max px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold rounded-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none shadow-xl">
                                    Sign In
                                </div>
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            {/* Collapsible Weather Envelope (Always mounted so marquee doesn't reset) */}
            <motion.div
                initial={false}
                animate={{ height: isWeatherOpen ? 'auto' : 0, opacity: isWeatherOpen ? 1 : 0 }}
                className={`absolute w-full z-[490] ${mapMode ? 'bg-white/60 dark:bg-[#0a0a0a]/60' : 'bg-white/70 dark:bg-[#0a0a0a]/70'} backdrop-blur-md border-b border-[#19140035] dark:border-[#3E3E3A] shadow-sm overflow-hidden`}
                style={{ top: mapMode ? '64px' : '0', marginTop: mapMode ? '0' : '64px' }}
            >
                <div className="container mx-auto px-4 sm:px-6 py-2 sm:py-3 flex items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0 border-r border-[#19140035] dark:border-slate-700 pr-3 sm:pr-4">
                        <CloudLightning size={20} className="text-blue-500 hidden sm:block" />
                        <CloudLightning size={16} className="text-blue-500 sm:hidden" />
                        <div className="flex flex-col">
                            <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Info Cuaca</span>
                        </div>
                    </div>
                    
                    <div className="flex-grow overflow-hidden flex items-center w-full">
                        {loadingWeather ? (
                            <div className="text-[10px] sm:text-sm text-slate-500 font-medium italic animate-pulse">Mengambil data cuaca...</div>
                        ) : weather && Array.isArray(weather) && weather.length > 0 ? (
                            <marquee className="text-[10px] sm:text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wide" scrollamount="4">
                                {weather.map((w, index) => (
                                    <span key={index} className="mr-8 sm:mr-12">
                                        <span className="text-blue-600 dark:text-blue-400 font-bold">{w.location}</span>: {w.temp}°C, {w.condition}
                                    </span>
                                ))}
                            </marquee>
                        ) : (
                            <div className="text-[10px] sm:text-sm text-slate-500 font-medium">Gagal memuat atau data cuaca kosong.</div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <main className={mapMode ? 'h-full pt-16 relative' : 'flex-grow'}>
                {!mapMode && location.pathname === '/news' && (
                    <div className="container mx-auto px-6 pt-6 pb-2">
                        <button onClick={() => navigate('/')} className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-[#FF750F] dark:hover:text-[#FF750F] transition-colors group w-max">
                            <div className="bg-slate-100 dark:bg-slate-800 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 p-2 rounded-full transition-colors">
                                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            </div>
                            <span className="font-bold text-sm tracking-wide">Kembali ke Beranda</span>
                        </button>
                    </div>
                )}
                {!mapMode && location.pathname.startsWith('/news/') && location.pathname !== '/news' && (
                    <div className="container mx-auto px-6 pt-6 pb-2">
                        <button onClick={() => navigate('/news')} className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-[#FF750F] dark:hover:text-[#FF750F] transition-colors group w-max">
                            <div className="bg-slate-100 dark:bg-slate-800 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 p-2 rounded-full transition-colors">
                                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            </div>
                            <span className="font-bold text-sm tracking-wide">Kembali ke Daftar Berita</span>
                        </button>
                    </div>
                )}
                {!mapMode && !location.pathname.startsWith('/news') && location.pathname !== '/' && (
                    <div className="container mx-auto px-6 pt-6 pb-2">
                        <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-[#FF750F] dark:hover:text-[#FF750F] transition-colors group w-max">
                            <div className="bg-slate-100 dark:bg-slate-800 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 p-2 rounded-full transition-colors">
                                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            </div>
                            <span className="font-bold text-sm tracking-wide">Kembali</span>
                        </button>
                    </div>
                )}
                {children}
            </main>

            {/* Footer */}
            {!mapMode && (
                <footer className="border-t border-[#19140035] dark:border-[#3E3E3A] mt-20 py-10 bg-white/50 dark:bg-[#161615]/50">
                    <div className="container mx-auto px-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        <p>&copy; {new Date().getFullYear()} Sistem Informasi Kebencanaan Kabupaten Bogor (SIKAB).</p>
                        <p className="mt-2 text-xs">Pusat Pengendalian Operasi Penanggulangan Bencana (Pusdalops PB)</p>
                    </div>
                </footer>
            )}
        </div>
    );
}
