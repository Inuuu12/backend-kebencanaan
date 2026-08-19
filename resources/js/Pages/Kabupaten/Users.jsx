import React, { useState, useEffect } from 'react';
import Layout from '../../Components/Layout';
import { 
    Users as UsersIcon, 
    Search, 
    Edit, 
    Trash2, 
    Loader2, 
    AlertTriangle, 
    CheckCircle2,
    X,
    Shield
} from 'lucide-react';
import apiClient from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal states
    const [editModal, setEditModal] = useState({ isOpen: false, user: null });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/admin/users');
            if (res.data?.success) {
                setUsers(res.data.data);
            }
        } catch (err) {
            console.error("Gagal memuat pengguna:", err);
            setError("Gagal memuat daftar pengguna.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            setProcessing(true);
            const res = await apiClient.put(`/admin/users/${editModal.user.id_user}`, {
                role: editModal.user.role,
                is_active: editModal.user.is_active
            });
            
            if (res.data?.success) {
                setUsers(users.map(u => u.id_user === editModal.user.id_user ? res.data.data : u));
                setEditModal({ isOpen: false, user: null });
            }
        } catch (err) {
            console.error("Gagal memperbarui pengguna:", err);
            alert("Gagal memperbarui pengguna: " + (err.response?.data?.message || err.message));
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteUser = async () => {
        try {
            setProcessing(true);
            const res = await apiClient.delete(`/admin/users/${deleteModal.user.id_user}`);
            
            if (res.data?.success) {
                setUsers(users.filter(u => u.id_user !== deleteModal.user.id_user));
                setDeleteModal({ isOpen: false, user: null });
            }
        } catch (err) {
            console.error("Gagal menghapus pengguna:", err);
            alert("Gagal menghapus pengguna: " + (err.response?.data?.message || err.message));
        } finally {
            setProcessing(false);
        }
    };

    const filteredUsers = users.filter(u => {
        const query = searchQuery.toLowerCase();
        return (u.nama || '').toLowerCase().includes(query) || 
               (u.email || '').toLowerCase().includes(query) ||
               (u.role || '').toLowerCase().includes(query);
    });

    const getRoleBadge = (role) => {
        switch (role) {
            case 'superadmin': return <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md text-xs font-bold uppercase">Super Admin</span>;
            case 'admin_kecamatan': return <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md text-xs font-bold uppercase">Admin Kecamatan</span>;
            case 'admin_kelurahan': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md text-xs font-bold uppercase">Admin Desa</span>;
            default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-md text-xs font-bold uppercase">Masyarakat</span>;
        }
    };

    return (
        <Layout activePage="pengguna" title="Kelola Pengguna">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col min-h-[calc(100vh-120px)]">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <UsersIcon className="text-orange-500" size={24} />
                            Manajemen Pengguna
                        </h2>
                    </div>

                    <div className="w-full md:w-72 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari nama, email, atau role..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-slate-200"
                        />
                    </div>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3">
                        <AlertTriangle size={20} />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Table Section */}
                <div className="flex-grow overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <Loader2 className="animate-spin mb-2" size={32} />
                            <span>Memuat data pengguna...</span>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300">
                                <tr>
                                    <th className="px-5 py-4 font-bold border-b border-slate-200 dark:border-slate-700">Nama Pengguna</th>
                                    <th className="px-5 py-4 font-bold border-b border-slate-200 dark:border-slate-700">Kontak</th>
                                    <th className="px-5 py-4 font-bold border-b border-slate-200 dark:border-slate-700">Role Akses</th>
                                    <th className="px-5 py-4 font-bold border-b border-slate-200 dark:border-slate-700 text-center">Status</th>
                                    <th className="px-5 py-4 font-bold border-b border-slate-200 dark:border-slate-700 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                                    <tr key={u.id_user} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold shrink-0">
                                                    {u.nama ? u.nama.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 dark:text-slate-200">{u.nama}</span>
                                                    <span className="text-xs text-slate-500">Terdaftar: {new Date(u.created_at).toLocaleDateString('id-ID')}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-slate-700 dark:text-slate-300">{u.email}</span>
                                                <span className="text-xs text-slate-500">{u.no_telp || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            {getRoleBadge(u.role)}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            {u.is_active ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
                                                    <CheckCircle2 size={14} /> Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-full">
                                                    <X size={14} /> Nonaktif
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => setEditModal({ isOpen: true, user: {...u} })}
                                                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Ubah Role/Status"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => setDeleteModal({ isOpen: true, user: u })}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Hapus Pengguna"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                                            Tidak ada data pengguna yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editModal.isOpen && editModal.user && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <Shield size={20} className="text-blue-500" />
                                    Ubah Akses Pengguna
                                </h3>
                                <button onClick={() => setEditModal({ isOpen: false, user: null })} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleUpdateUser} className="p-5 flex flex-col gap-5">
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                                    <p className="font-bold text-slate-800 dark:text-slate-200">{editModal.user.nama}</p>
                                    <p className="text-sm text-slate-500">{editModal.user.email}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Role Akses</label>
                                    <select 
                                        value={editModal.user.role}
                                        onChange={(e) => setEditModal({ ...editModal, user: { ...editModal.user, role: e.target.value } })}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    >
                                        <option value="USER">Masyarakat (User Biasa)</option>
                                        <option value="admin_kelurahan">Admin Desa / Kelurahan</option>
                                        <option value="admin_kecamatan">Admin Kecamatan</option>
                                        <option value="superadmin">Super Admin (Kabupaten)</option>
                                    </select>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Perhatian: Mengubah role akan memberikan akses menu yang berbeda bagi pengguna ini.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Status Akun</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="is_active" 
                                                checked={editModal.user.is_active === true || editModal.user.is_active === 1}
                                                onChange={() => setEditModal({ ...editModal, user: { ...editModal.user, is_active: true } })}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <span className="text-sm font-medium dark:text-slate-300">Aktif</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="is_active" 
                                                checked={editModal.user.is_active === false || editModal.user.is_active === 0}
                                                onChange={() => setEditModal({ ...editModal, user: { ...editModal.user, is_active: false } })}
                                                className="w-4 h-4 text-red-600"
                                            />
                                            <span className="text-sm font-medium dark:text-slate-300">Nonaktifkan</span>
                                        </label>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Akun nonaktif tidak akan bisa melakukan login ke dalam sistem.
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3 mt-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setEditModal({ isOpen: false, user: null })}
                                        className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={processing}
                                        className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {processing && <Loader2 size={16} className="animate-spin" />}
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Modal */}
            <AnimatePresence>
                {deleteModal.isOpen && deleteModal.user && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800"
                        >
                            <div className="p-6 flex flex-col items-center text-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center dark:bg-red-900/30">
                                    <AlertTriangle size={32} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1">
                                        Hapus Pengguna?
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        Anda yakin ingin menghapus akun <strong>{deleteModal.user.nama}</strong> secara permanen? Data yang sudah dihapus tidak dapat dikembalikan.
                                    </p>
                                </div>
                                <div className="flex w-full gap-3 mt-4">
                                    <button 
                                        onClick={() => setDeleteModal({ isOpen: false, user: null })}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        onClick={handleDeleteUser}
                                        disabled={processing}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                                    >
                                        {processing && <Loader2 size={16} className="animate-spin" />}
                                        Ya, Hapus
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </Layout>
    );
}
