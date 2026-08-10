import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../../Components/PublicLayout';
import { reportService } from '../../api/services/reports';
import { AlertTriangle, MapPin, Camera, CheckCircle2, ArrowRight, ShieldAlert, Loader2 } from 'lucide-react';

export default function Aduan() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        type: '',
        description: '',
        location_name: '',
        latitude: '',
        longitude: '',
        image: null
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Geolocation state
    const [geoLoading, setGeoLoading] = useState(false);
    const [geoError, setGeoError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, image: e.target.files[0] }));
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setGeoError('Geolocation tidak didukung oleh browser Anda.');
            return;
        }

        setGeoLoading(true);
        setGeoError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude.toString(),
                    longitude: position.coords.longitude.toString()
                }));
                setGeoLoading(false);
            },
            (error) => {
                setGeoLoading(false);
                setGeoError('Gagal mendapatkan lokasi. Pastikan izin lokasi diberikan.');
                console.error("Error getting location:", error);
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('type', formData.type);
            data.append('description', formData.description);
            if (formData.location_name) data.append('location_name', formData.location_name);
            if (formData.latitude) data.append('latitude', formData.latitude);
            if (formData.longitude) data.append('longitude', formData.longitude);
            if (formData.image) data.append('image', formData.image);

            await reportService.submit(data);
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Terjadi kesalahan saat mengirim laporan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <PublicLayout>
                <div className="container mx-auto px-6 py-20 min-h-[70vh] flex items-center justify-center">
                    <div className="max-w-md w-full bg-white dark:bg-[#161615] p-8 rounded-2xl shadow-xl text-center border border-[#19140015] dark:border-[#3E3E3A]/50">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Laporan Berhasil Dikirim!</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            Terima kasih atas laporan Anda. Tim tanggap darurat kami akan segera menindaklanjuti informasi yang telah Anda berikan.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button onClick={() => navigate('/')} className="btn-primary w-full py-3 rounded-full">
                                Kembali ke Beranda
                            </button>
                            <button onClick={() => { setSuccess(false); setFormData({...formData, title: '', description: '', image: null}); }} className="btn-secondary w-full py-3 rounded-full">
                                Buat Laporan Baru
                            </button>
                        </div>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <div className="bg-orange-50 dark:bg-orange-950/20 py-12 md:py-16 border-b border-orange-100 dark:border-orange-900/30">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="flex items-center gap-3 text-[#FF750F] font-semibold tracking-wider uppercase text-sm mb-4">
                        <ShieldAlert size={18} />
                        Layanan Tanggap Darurat
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">Lapor Kejadian Bencana</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-2xl">
                        Laporkan segera kejadian bencana atau kondisi darurat di sekitar Anda agar tim dapat merespons dengan cepat.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12 pb-24 max-w-4xl">
                <form onSubmit={handleSubmit} className="bg-white dark:bg-[#161615] rounded-2xl shadow-lg border border-[#19140015] dark:border-[#3E3E3A]/50 p-6 md:p-10">
                    
                    {error && (
                        <div className="mb-8 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex gap-3 border border-red-100 dark:border-red-900/50">
                            <AlertTriangle size={24} className="shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6 md:col-span-2">
                            <h3 className="text-xl font-bold border-b border-gray-100 dark:border-gray-800 pb-3">Informasi Kejadian</h3>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Judul Laporan <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full form-control bg-gray-50 dark:bg-[#1C1C1A] text-lg py-3 px-4"
                                    placeholder="Contoh: Pohon Tumbang Menutupi Jalan Raya" 
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Jenis Bencana <span className="text-red-500">*</span>
                                    </label>
                                    <select 
                                        name="type"
                                        required
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full form-control bg-gray-50 dark:bg-[#1C1C1A] py-3 px-4"
                                    >
                                        <option value="">-- Pilih Jenis --</option>
                                        <option value="Banjir">Banjir</option>
                                        <option value="Longsor">Longsor / Tanah Bergerak</option>
                                        <option value="Gempa Bumi">Gempa Bumi</option>
                                        <option value="Angin Kencang">Angin Kencang / Puting Beliung</option>
                                        <option value="Kebakaran">Kebakaran</option>
                                        <option value="Kekeringan">Kekeringan</option>
                                        <option value="Lainnya">Kondisi Darurat Lainnya</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Deskripsi Kejadian <span className="text-red-500">*</span>
                                </label>
                                <textarea 
                                    name="description"
                                    required
                                    rows="5"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full form-control bg-gray-50 dark:bg-[#1C1C1A] py-3 px-4"
                                    placeholder="Jelaskan secara singkat kronologi kejadian, perkiraan jumlah korban (jika ada), atau dampak kerusakan yang terlihat."
                                ></textarea>
                            </div>
                        </div>

                        <div className="space-y-6 md:col-span-2 mt-4">
                            <h3 className="text-xl font-bold border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center justify-between">
                                Lokasi Kejadian
                                <button 
                                    type="button" 
                                    onClick={handleGetLocation}
                                    disabled={geoLoading}
                                    className="text-sm font-medium flex items-center gap-2 text-[#FF750F] bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors"
                                >
                                    {geoLoading ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                                    Gunakan GPS Saat Ini
                                </button>
                            </h3>
                            
                            {geoError && <p className="text-sm text-red-500">{geoError}</p>}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Alamat Detail / Patokan
                                </label>
                                <input 
                                    type="text" 
                                    name="location_name"
                                    value={formData.location_name}
                                    onChange={handleChange}
                                    className="w-full form-control bg-gray-50 dark:bg-[#1C1C1A] py-3 px-4"
                                    placeholder="Contoh: Jl. Sudirman No 12, Dekat Pasar Baru" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Latitude (Opsional)</label>
                                    <input 
                                        type="number" step="any" name="latitude"
                                        value={formData.latitude} onChange={handleChange}
                                        className="w-full form-control text-sm bg-gray-50 dark:bg-[#1C1C1A]" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Longitude (Opsional)</label>
                                    <input 
                                        type="number" step="any" name="longitude"
                                        value={formData.longitude} onChange={handleChange}
                                        className="w-full form-control text-sm bg-gray-50 dark:bg-[#1C1C1A]" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 md:col-span-2 mt-4">
                            <h3 className="text-xl font-bold border-b border-gray-100 dark:border-gray-800 pb-3">Dokumentasi</h3>
                            
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#1C1C1A] hover:bg-gray-100 dark:hover:bg-[#252523] transition-colors relative overflow-hidden group">
                                {formData.image ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-500 mb-3">
                                            <CheckCircle2 size={32} />
                                        </div>
                                        <p className="font-medium text-gray-800 dark:text-gray-200">{formData.image.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">Klik untuk mengganti foto</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-[#FF750F] mb-4 group-hover:scale-110 transition-transform">
                                            <Camera size={32} />
                                        </div>
                                        <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Unggah Foto Kejadian</p>
                                        <p className="text-sm text-gray-500 text-center max-w-sm">Maksimal 10MB. Disarankan mengambil foto yang menunjukkan cakupan dampak bencana secara jelas.</p>
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <p className="text-sm text-gray-500 max-w-md hidden md:block">
                            Pastikan data yang Anda laporkan valid dan dapat dipertanggungjawabkan.
                        </p>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn-primary w-full md:w-auto py-4 px-8 rounded-full shadow-lg shadow-orange-500/20 text-lg flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><Loader2 size={20} className="animate-spin" /> Mengirim Laporan...</>
                            ) : (
                                <>Kirim Laporan Darurat <ArrowRight size={20} /></>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </PublicLayout>
    );
}
