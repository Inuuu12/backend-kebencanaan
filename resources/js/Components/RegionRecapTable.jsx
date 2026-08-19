import React, { useState, useEffect, useMemo } from 'react';
import { Table2, Download, AlertTriangle, Loader2 } from 'lucide-react';
import { reportService } from '../api/services/reports';
import { masterDataService } from '../api/services/masterData';
import { getResponseDataArray } from '../lib/mapBoundaries';
import { getAdminScopeFilters, getAdminScopeLabel } from '../lib/adminScope';

export default function RegionRecapTable({ user, isKabupaten, isKecamatan }) {
    const [reports, setReports] = useState([]);
    const [kecamatanList, setKecamatanList] = useState([]);
    const [kelurahanList, setKelurahanList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                setLoading(true);
                setError(null);
                const scopeFilters = getAdminScopeFilters(user);
                const kelurahanScopeId = isKabupaten ? null : (scopeFilters.kecamatan_id || user?.id_kecamatan || null);
                
                const [reportsRes, kecamatanRes, kelurahanRes] = await Promise.all([
                    reportService.getMapReports(scopeFilters),
                    masterDataService.getKecamatan().catch(() => []),
                    masterDataService.getKelurahan(kelurahanScopeId).catch(() => [])
                ]);

                setReports(getResponseDataArray(reportsRes));
                setKecamatanList(getResponseDataArray(kecamatanRes));
                setKelurahanList(getResponseDataArray(kelurahanRes));
            } catch (err) {
                console.error("Gagal memuat data rekap wilayah:", err);
                setError("Gagal memuat data wilayah.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, isKabupaten, isKecamatan]);

    const recapRows = useMemo(() => {
        const kecamatanById = new Map(
            kecamatanList.map((item) => [String(item.id_kecamatan || item.id), item])
        );
        const scopedKelurahan = kelurahanList.filter((item) => {
            const kecamatanId = String(item.id_kecamatan || '');
            const kelurahanId = String(item.id_kelurahan || item.id || '');

            if (!isKabupaten && user?.id_kecamatan && kecamatanId !== String(user.id_kecamatan)) {
                return false;
            }

            if (!isKabupaten && !isKecamatan && user?.id_kelurahan && kelurahanId !== String(user.id_kelurahan)) {
                return false;
            }

            return true;
        });
        const rowsByRegion = new Map();

        if (isKabupaten) {
            // Group by Kecamatan name to avoid duplicates
            kecamatanList.forEach((kec) => {
                const name = kec.nama_kecamatan || '-';
                const key = name.toLowerCase().trim();
                if (!rowsByRegion.has(key)) {
                    rowsByRegion.set(key, {
                        idKecamatan: kec.id_kecamatan,
                        idKelurahan: null,
                        kecamatan: name,
                        kelurahan: 'Semua Desa/Kelurahan', // Not applicable for kecamatan level
                        total: 0,
                        korban: 0,
                        meninggal: 0,
                        lukaBerat: 0,
                        lukaRingan: 0,
                        hilang: 0,
                        mengungsi: 0,
                        jenisKerusakan: new Set(),
                        rusakRingan: 0,
                        rusakSedang: 0,
                        rusakBerat: 0,
                    });
                }
            });
        } else {
            // Group by Kelurahan
            scopedKelurahan.forEach((kelurahan) => {
                const kecamatan = kecamatanById.get(String(kelurahan.id_kecamatan || ''));
                const key = String(kelurahan.id_kelurahan || kelurahan.id);

                rowsByRegion.set(key, {
                    idKecamatan: kelurahan.id_kecamatan,
                    idKelurahan: kelurahan.id_kelurahan || kelurahan.id,
                    kecamatan: kecamatan?.nama_kecamatan || kelurahan.nama_kecamatan || user?.nama_kecamatan || '-',
                    kelurahan: kelurahan.nama_kelurahan || kelurahan.nama_desa || user?.nama_kelurahan || '-',
                    total: 0,
                    korban: 0,
                    meninggal: 0,
                    lukaBerat: 0,
                    lukaRingan: 0,
                    hilang: 0,
                    mengungsi: 0,
                    jenisKerusakan: new Set(),
                    rusakRingan: 0,
                    rusakSedang: 0,
                    rusakBerat: 0,
                });
            });

            if (rowsByRegion.size === 0 && user?.id_kelurahan) {
                rowsByRegion.set(String(user.id_kelurahan), {
                    idKecamatan: user.id_kecamatan,
                    idKelurahan: user.id_kelurahan,
                    kecamatan: user.nama_kecamatan || '-',
                    kelurahan: user.nama_kelurahan || '-',
                    total: 0,
                    korban: 0,
                    meninggal: 0,
                    lukaBerat: 0,
                    lukaRingan: 0,
                    hilang: 0,
                    mengungsi: 0,
                    jenisKerusakan: new Set(),
                    rusakRingan: 0,
                    rusakSedang: 0,
                    rusakBerat: 0,
                });
            }
        }

        reports.forEach((report) => {
            let key;
            if (isKabupaten) {
                // Determine kecamatan name safely
                const kecName = report.kecamatan_name || report.nama_kecamatan || '-';
                key = kecName.toLowerCase().trim();
            } else {
                key = String(report.id_kelurahan || '');
            }

            const current = rowsByRegion.get(key);
            if (!current) return;

            current.total += 1;
            
            if (report.korban && Array.isArray(report.korban)) {
                report.korban.forEach(k => {
                    current.korban += (k.jumlah_meninggal + k.jumlah_luka_berat + k.jumlah_luka_ringan + k.jumlah_hilang + k.jumlah_mengungsi);
                    current.meninggal += k.jumlah_meninggal;
                    current.lukaBerat += k.jumlah_luka_berat;
                    current.lukaRingan += k.jumlah_luka_ringan;
                    current.hilang += k.jumlah_hilang;
                    current.mengungsi += k.jumlah_mengungsi;
                });
            }

            if (report.dampak_kerusakan && Array.isArray(report.dampak_kerusakan)) {
                report.dampak_kerusakan.forEach(d => {
                    if (d.jenis_kerusakan) current.jenisKerusakan.add(d.jenis_kerusakan);
                    
                    const tk = (d.tingkat_kerusakan || '').toLowerCase();
                    if (tk.includes('ringan')) current.rusakRingan += (d.jumlah_unit || 0);
                    else if (tk.includes('sedang')) current.rusakSedang += (d.jumlah_unit || 0);
                    else if (tk.includes('berat')) current.rusakBerat += (d.jumlah_unit || 0);
                });
            }
        });

        return Array.from(rowsByRegion.values()).map(row => ({
            ...row,
            jenisKerusakanText: Array.from(row.jenisKerusakan).join(', ') || '-'
        })).sort((a, b) => a.kecamatan.localeCompare(b.kecamatan) || a.kelurahan.localeCompare(b.kelurahan));
    }, [reports, kecamatanList, kelurahanList, isKabupaten, isKecamatan, user]);

    const recapTotals = useMemo(() => {
        return recapRows.reduce((acc, row) => {
            acc.total += row.total;
            acc.korban += row.korban;
            acc.meninggal += row.meninggal;
            acc.lukaBerat += row.lukaBerat;
            acc.lukaRingan += row.lukaRingan;
            acc.hilang += row.hilang;
            acc.mengungsi += row.mengungsi;
            acc.rusakRingan += row.rusakRingan;
            acc.rusakSedang += row.rusakSedang;
            acc.rusakBerat += row.rusakBerat;
            return acc;
        }, {
            total: 0,
            korban: 0,
            meninggal: 0,
            lukaBerat: 0,
            lukaRingan: 0,
            hilang: 0,
            mengungsi: 0,
            rusakRingan: 0,
            rusakSedang: 0,
            rusakBerat: 0,
        });
    }, [recapRows]);

    const downloadRecapCsv = () => {
        const headers = ['Kecamatan', 'Desa/Kelurahan', 'Total Aduan', 'Total Korban', 'Meninggal', 'Luka Berat', 'Luka Ringan', 'Hilang', 'Mengungsi', 'Jenis Kerusakan', 'Rusak Ringan', 'Rusak Sedang', 'Rusak Berat'];
        const rows = recapRows.map((row) => [
            row.kecamatan,
            row.kelurahan,
            row.total,
            row.korban,
            row.meninggal,
            row.lukaBerat,
            row.lukaRingan,
            row.hilang,
            row.mengungsi,
            row.jenisKerusakanText,
            row.rusakRingan,
            row.rusakSedang,
            row.rusakBerat,
        ]);

        const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
        const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
        const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rekap-data-wilayah-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl h-full min-h-[400px]">
                <Loader2 size={32} className="animate-spin text-slate-400 mb-2" />
                <span className="text-slate-500 text-sm font-medium">Memuat rekap data wilayah...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/10 rounded-xl h-full min-h-[400px] text-red-500">
                <AlertTriangle size={32} className="mb-2" />
                <span className="text-sm font-medium">{error}</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/50">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Table2 size={20} className="text-blue-500" />
                        Rekap Data Wilayah
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        Sistem Informasi Kebencanaan Kabupaten Bogor
                    </p>
                </div>
                <button
                    onClick={downloadRecapCsv}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors shadow-sm shadow-blue-500/20"
                >
                    <Download size={16} />
                    Unduh Excel
                </button>
            </div>
            
            <div className="overflow-x-auto flex-grow h-[400px] max-h-[600px] custom-scrollbar">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 z-10 shadow-sm">
                        <tr>
                            <th className="px-5 py-3.5 font-bold min-w-36">Kecamatan</th>
                            <th className="px-5 py-3.5 font-bold min-w-40">Desa/Kelurahan</th>
                            <th className="px-5 py-3.5 font-bold text-right">Aduan</th>
                            <th className="px-5 py-3.5 font-bold text-right">Korban</th>
                            <th className="px-5 py-3.5 font-bold text-right">Meninggal</th>
                            <th className="px-5 py-3.5 font-bold text-right">Luka Berat</th>
                            <th className="px-5 py-3.5 font-bold text-right">Luka Ringan</th>
                            <th className="px-5 py-3.5 font-bold text-right">Hilang</th>
                            <th className="px-5 py-3.5 font-bold text-right">Mengungsi</th>
                            <th className="px-5 py-3.5 font-bold min-w-48">Jenis Kerusakan</th>
                            <th className="px-5 py-3.5 font-bold text-right">Rusak Ringan</th>
                            <th className="px-5 py-3.5 font-bold text-right">Rusak Sedang</th>
                            <th className="px-5 py-3.5 font-bold text-right">Rusak Berat</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                        {recapRows.length === 0 ? (
                            <tr>
                                <td colSpan="13" className="px-5 py-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/50">
                                    <div className="flex flex-col items-center">
                                        <Table2 size={32} className="text-slate-300 dark:text-slate-600 mb-3" />
                                        <span>Tidak ada data wilayah atau laporan.</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            recapRows.map((row) => (
                                <tr key={`${row.idKecamatan}-${row.idKelurahan}`} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/70 transition-colors">
                                    <td className="px-5 py-3 font-semibold text-slate-900 dark:text-slate-100">{row.kecamatan}</td>
                                    <td className="px-5 py-3">{row.kelurahan}</td>
                                    <td className="px-5 py-3 text-right font-medium">{row.total}</td>
                                    <td className="px-5 py-3 text-right font-bold text-red-600 dark:text-red-400">{row.korban}</td>
                                    <td className="px-5 py-3 text-right">{row.meninggal}</td>
                                    <td className="px-5 py-3 text-right">{row.lukaBerat}</td>
                                    <td className="px-5 py-3 text-right">{row.lukaRingan}</td>
                                    <td className="px-5 py-3 text-right">{row.hilang}</td>
                                    <td className="px-5 py-3 text-right">{row.mengungsi}</td>
                                    <td className="px-5 py-3 truncate max-w-xs">{row.jenisKerusakanText}</td>
                                    <td className="px-5 py-3 text-right">{row.rusakRingan}</td>
                                    <td className="px-5 py-3 text-right">{row.rusakSedang}</td>
                                    <td className="px-5 py-3 text-right text-orange-600 dark:text-orange-400 font-medium">{row.rusakBerat}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    {recapRows.length > 0 && (
                        <tfoot className="sticky bottom-0 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                            <tr>
                                <td className="px-5 py-4 uppercase tracking-wider text-xs" colSpan="2">Total Akumulasi</td>
                                <td className="px-5 py-4 text-right text-blue-600 dark:text-blue-400">{recapTotals.total}</td>
                                <td className="px-5 py-4 text-right text-red-600 dark:text-red-400">{recapTotals.korban}</td>
                                <td className="px-5 py-4 text-right">{recapTotals.meninggal}</td>
                                <td className="px-5 py-4 text-right">{recapTotals.lukaBerat}</td>
                                <td className="px-5 py-4 text-right">{recapTotals.lukaRingan}</td>
                                <td className="px-5 py-4 text-right">{recapTotals.hilang}</td>
                                <td className="px-5 py-4 text-right">{recapTotals.mengungsi}</td>
                                <td className="px-5 py-4"></td>
                                <td className="px-5 py-4 text-right">{recapTotals.rusakRingan}</td>
                                <td className="px-5 py-4 text-right">{recapTotals.rusakSedang}</td>
                                <td className="px-5 py-4 text-right text-orange-600 dark:text-orange-400">{recapTotals.rusakBerat}</td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}
