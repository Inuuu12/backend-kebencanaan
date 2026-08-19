import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../Components/Layout';
import { reportService } from '../../api/services/reports';
import { masterDataService } from '../../api/services/masterData';
import { ArrowLeft, Save, AlertTriangle, Image as ImageIcon, Target, X } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { drawAdminBoundaries, getResponseDataArray } from '../../lib/mapBoundaries';

// Fix leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
export default function ReportCreate() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Determine active page and base path
    const isKabupaten = location.pathname.includes('/kabupaten');
    const isKecamatan = location.pathname.includes('/kecamatan');
    const basePath = isKabupaten ? '/dashboard/kabupaten/aduan' : (isKecamatan ? '/dashboard/kecamatan/aduan' : '/dashboard/kelurahan/aduan');

    const [formData, setFormData] = useState({
        title: '',
        type: '',
        description: '',
        location_name: '',
        latitude: '',
        longitude: '',
        images: [],
        korban_meninggal: '',
        korban_luka_berat: '',
        korban_luka_ringan: '',
        korban_hilang: '',
        jumlah_pengungsi: '',
        kerusakan_fisik: '',
        tingkat_kerusakan: '',
        kebutuhan_logistik: ''
    });

    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const mapContainerRef = useRef(null);
    const boundariesGroupRef = useRef(null);

    // Inisialisasi Peta
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        // Default to Kabupaten Bogor
        const defaultLat = -6.582;
        const defaultLng = 106.871;
        
        const map = L.map(mapContainerRef.current, {
            zoomControl: false,
            attributionControl: false
        }).setView([defaultLat, defaultLng], 12);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        boundariesGroupRef.current = L.layerGroup().addTo(map);

        masterDataService.getBoundaries({ level: 'kecamatan' })
            .then((res) => {
                if (!boundariesGroupRef.current || !mapRef.current) return;
                drawAdminBoundaries(L, boundariesGroupRef.current, getResponseDataArray(res), {
                    levels: ['kecamatan'],
                });
            })
            .catch((err) => console.error('Gagal memuat batas wilayah:', err));

        // Map Click Event
        map.on('click', async (e) => {
            const { lat, lng } = e.latlng;
            updateMarkerAndLocation(lat, lng);
        });

        mapRef.current = map;

        // Force resize map to fit container after mounting (to prevent gray patches)
        setTimeout(() => map.invalidateSize(), 500);

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    const updateMarkerAndLocation = async (lat, lng) => {
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
        
        if (mapRef.current) {
            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
            } else {
                markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
            }
            mapRef.current.setView([lat, lng], 15);
        }

        // Reverse Geocoding via Nominatim
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data && data.display_name) {
                setFormData(prev => ({ ...prev, location_name: data.display_name, latitude: lat, longitude: lng }));
            }
        } catch (err) {
            console.error("Gagal mendapatkan nama lokasi:", err);
        }
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolokasi tidak didukung oleh browser Anda.');
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                updateMarkerAndLocation(latitude, longitude);
            },
            (error) => {
                alert('Tidak dapat mendeteksi lokasi. Pastikan GPS aktif dan izin diberikan pada browser Anda.');
            }
        );
    };

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setFormData(prev => ({ ...prev, images: [...prev.images, ...filesArray] }));
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
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
            
            formData.images.forEach((img, index) => {
                data.append(`images[${index}]`, img);
            });

            if (formData.korban_meninggal) data.append('korban_meninggal', formData.korban_meninggal);
            if (formData.korban_luka_berat) data.append('korban_luka_berat', formData.korban_luka_berat);
            if (formData.korban_luka_ringan) data.append('korban_luka_ringan', formData.korban_luka_ringan);
            if (formData.korban_hilang) data.append('korban_hilang', formData.korban_hilang);
            if (formData.jumlah_pengungsi) data.append('jumlah_pengungsi', formData.jumlah_pengungsi);
            if (formData.kerusakan_fisik) data.append('kerusakan_fisik', formData.kerusakan_fisik);
            if (formData.tingkat_kerusakan) data.append('tingkat_kerusakan', formData.tingkat_kerusakan);
            if (formData.kebutuhan_logistik) data.append('kebutuhan_logistik', formData.kebutuhan_logistik);

            await reportService.submit(data);
            setSuccess(true);
            setTimeout(() => {
                navigate(basePath);
            }, 1500);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Terjadi kesalahan saat mengirim laporan.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout activePage="complaints" title="Buat Laporan Bencana">
            <div className="mb-6">
                <button 
                    onClick={() => navigate(basePath)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={16} /> Kembali ke Daftar
                </button>
            </div>

            <div className="panel-card p-0 overflow-hidden max-w-2xl mx-auto">
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white">Form Laporan Bencana Manual</h2>
                    <p className="text-slate-400 text-sm mt-1">Gunakan form ini untuk merekap laporan bencana yang masuk melalui telepon atau saluran lain.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded flex items-center gap-2 text-sm">
                            <AlertTriangle size={16} /> {error}
                        </div>
                    )}
                    
                    {success && (
                        <div className="bg-green-50 text-green-700 p-3 rounded text-sm font-medium">
                            Laporan berhasil dikirim! Mengalihkan...
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Judul Laporan *</label>
                        <input 
                            type="text" 
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full border border-slate-700 bg-slate-800/50 text-white rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-slate-500" 
                            placeholder="Contoh: Banjir Bandang di Desa Mekarsari" 
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Jenis Bencana *</label>
                        <select 
                            name="type"
                            required
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full border border-slate-700 bg-slate-800/50 text-white rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                            <option value="">-- Pilih Jenis Bencana --</option>
                            <option value="Banjir">Banjir</option>
                            <option value="Longsor">Longsor</option>
                            <option value="Gempa Bumi">Gempa Bumi</option>
                            <option value="Angin Puting Beliung">Angin Puting Beliung</option>
                            <option value="Kebakaran Hutan">Kebakaran Hutan</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Deskripsi Kejadian *</label>
                        <textarea 
                            name="description"
                            required
                            rows="4"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full border border-slate-700 bg-slate-800/50 text-white rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-slate-500" 
                            placeholder="Jelaskan detail kejadian, perkiraan dampak, dll."
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Nama Lokasi/Alamat</label>
                        <input 
                            type="text" 
                            name="location_name"
                            value={formData.location_name}
                            onChange={handleChange}
                            className="w-full border border-slate-700 bg-slate-800/50 text-white rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-slate-500" 
                            placeholder="Contoh: Jl. Raya Mekarsari RT 01/02" 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-slate-300">Titik Lokasi Kejadian *</label>
                                <button type="button" onClick={detectLocation} className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-md hover:bg-blue-500/20 flex items-center gap-1.5 transition-colors font-medium">
                                    <Target size={14} /> Deteksi Lokasi Saya
                                </button>
                            </div>
                            <div className="border border-slate-700 rounded-md overflow-hidden bg-slate-800/50 p-1 mb-2">
                                <div ref={mapContainerRef} style={{ height: '350px', width: '100%', borderRadius: '4px' }} className="z-10" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <input type="text" readOnly value={formData.latitude} placeholder="Latitude (Terisi dari peta)" className="w-full bg-slate-800/30 border border-slate-700/50 text-slate-400 rounded py-1.5 px-3 text-sm outline-none cursor-not-allowed" />
                                <input type="text" readOnly value={formData.longitude} placeholder="Longitude (Terisi dari peta)" className="w-full bg-slate-800/30 border border-slate-700/50 text-slate-400 rounded py-1.5 px-3 text-sm outline-none cursor-not-allowed" />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Klik pada area peta untuk menandai titik lokasi, atau gunakan tombol Deteksi Lokasi Saya.</p>
                        </div>
                    </div>

                    <div className="border-t border-slate-700 pt-5 mt-5">
                        <h3 className="text-lg font-medium text-white mb-4">Dampak Korban & Pengungsi</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Meninggal Dunia</label>
                                <input type="number" min="0" name="korban_meninggal" value={formData.korban_meninggal} onChange={handleChange} className="w-full border border-slate-700 bg-slate-800/50 text-white rounded-md py-1.5 px-3 focus:ring-red-500 focus:border-red-500 outline-none" placeholder="0" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Luka Berat</label>
                                <input type="number" min="0" name="korban_luka_berat" value={formData.korban_luka_berat} onChange={handleChange} className="w-full border border-slate-700 bg-slate-800/50 text-white rounded-md py-1.5 px-3 focus:ring-orange-500 focus:border-orange-500 outline-none" placeholder="0" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Luka Ringan</label>
                                <input type="number" min="0" name="korban_luka_ringan" value={formData.korban_luka_ringan} onChange={handleChange} className="w-full border border-slate-700 bg-slate-800/50 text-white rounded-md py-1.5 px-3 focus:ring-yellow-500 focus:border-yellow-500 outline-none" placeholder="0" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Hilang</label>
                                <input type="number" min="0" name="korban_hilang" value={formData.korban_hilang} onChange={handleChange} className="w-full border border-slate-700 bg-slate-800/50 text-white rounded-md py-1.5 px-3 focus:ring-slate-500 focus:border-slate-500 outline-none" placeholder="0" />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs text-slate-400 mb-1">Pengungsi</label>
                                <input type="number" min="0" name="jumlah_pengungsi" value={formData.jumlah_pengungsi} onChange={handleChange} className="w-full border border-slate-700 bg-slate-800/50 text-white rounded-md py-1.5 px-3 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-700 pt-5">
                        <h3 className="text-lg font-medium text-white mb-4">Kerusakan Fisik Infrastruktur</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-slate-300 mb-1">Tingkat Kerusakan</label>
                                <select name="tingkat_kerusakan" value={formData.tingkat_kerusakan} onChange={handleChange} className="w-full border border-slate-700 bg-slate-800/50 text-white rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 outline-none">
                                    <option value="">-- Pilih Tingkat --</option>
                                    <option value="Ringan">Ringan</option>
                                    <option value="Sedang">Sedang</option>
                                    <option value="Berat">Berat</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-300 mb-1">Deskripsi Kerusakan</label>
                                <input type="text" name="kerusakan_fisik" value={formData.kerusakan_fisik} onChange={handleChange} className="w-full border border-slate-700 bg-slate-800/50 text-white rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-slate-500" placeholder="Contoh: 3 Rumah Roboh, 1 Jembatan Terputus" />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-700 pt-5">
                        <h3 className="text-lg font-medium text-white mb-4">Kebutuhan Logistik & Fasilitas</h3>
                        <textarea name="kebutuhan_logistik" rows="3" value={formData.kebutuhan_logistik} onChange={handleChange} className="w-full border border-slate-700 bg-slate-800/50 text-white rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-slate-500" placeholder="Contoh: Butuh 100 Tenda, 200 Selimut, Makanan Siap Saji"></textarea>
                    </div>

                    <div className="border-t border-slate-700 pt-5">
                        <label className="block text-sm font-medium text-slate-300 mb-1">Foto Dokumentasi (Bisa lebih dari 1)</label>
                        <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-800/30 hover:bg-slate-800/50 transition-colors relative">
                            <ImageIcon size={32} className="text-slate-400 mb-2" />
                            <input 
                                type="file" 
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <p className="text-sm text-slate-400 font-medium">Klik atau Seret foto ke sini</p>
                            <p className="text-xs text-slate-500 mt-1">Format: JPG, PNG, WEBP (Max 10MB/file)</p>
                        </div>
                        {formData.images.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                                {formData.images.map((img, index) => (
                                    <div key={index} className="relative group rounded-md overflow-hidden bg-slate-800 border border-slate-700 aspect-video flex items-center justify-center">
                                        <img src={URL.createObjectURL(img)} alt={`Preview ${index}`} className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                                        <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-slate-700">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-medium py-2.5 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <>Meyimpan...</>
                            ) : (
                                <><Save size={18} /> Simpan Laporan</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
