import React, { useEffect, useState } from 'react';
import Layout from '../../Components/Layout';
import { 
    AlertTriangle, 
    CheckCircle2, 
    Clock, 
    AlertOctagon, 
    Activity, 
    MapPin, 
    Building2,
    Loader2
} from 'lucide-react';
import { useAuth } from '../../AuthContext';
import RegionRecapTable from '../../Components/RegionRecapTable';
import AnalyticsCharts from '../../Components/AnalyticsCharts';
import { motion } from 'framer-motion';
import { dashboardService } from '../../api/services/dashboard';
import { reportService } from '../../api/services/reports';
import { getResponseDataArray } from '../../lib/mapBoundaries';

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function Dashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState({
        summary: { total: 0, pending: 0, handling: 0, resolved: 0 },
        stats: { banjir: 0, longsor: 0, kebakaran: 0, puting_beliung: 0, gempa: 0, lainnya: 0 },
        complaints: [],
        regionalStats: []
    });

    // Fetch API Data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [summaryRes, reportsRes] = await Promise.all([
                    dashboardService.getSummary(),
                    reportService.getMapReports()
                ]);

                setData({
                    summary: summaryRes.data?.summary || { total: 0, pending: 0, handling: 0, resolved: 0 },
                    stats: summaryRes.data?.stats || { banjir: 0, longsor: 0, kebakaran: 0, puting_beliung: 0, gempa: 0, lainnya: 0 },
                    complaints: getResponseDataArray(reportsRes),
                    regionalStats: summaryRes.data?.regionalStats || []
                });
            } catch (err) {
                console.error("Dashboard fetch error:", err);
                setError("Gagal memuat data dashboard.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Map rendering has been moved to RegionRecapTable

    return (
        <Layout activePage="dashboard" title="Pusdalops Kabupaten Bogor">
            {/* Statistics Row */}
            <motion.div 
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
                <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-5 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all relative overflow-hidden group">
                    {loading && <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-800/50 animate-pulse"></div>}
                    <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:bg-slate-800 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 transition-colors shrink-0">
                        <AlertOctagon size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">{loading ? '-' : data.summary.total}</span>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Total Laporan</span>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-5 shadow-sm hover:shadow-xl hover:border-orange-500/30 transition-all relative overflow-hidden group">
                    {loading && <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-800/50 animate-pulse"></div>}
                    <div className="w-14 h-14 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors shrink-0">
                        <Clock size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">{loading ? '-' : data.summary.pending}</span>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Menunggu Verifikasi</span>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-5 shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all relative overflow-hidden group">
                    {loading && <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-800/50 animate-pulse"></div>}
                    <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0">
                        <Activity size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">{loading ? '-' : data.summary.handling}</span>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Progres Penanganan</span>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-5 shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all relative overflow-hidden group">
                    {loading && <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-800/50 animate-pulse"></div>}
                    <div className="w-14 h-14 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0">
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">{loading ? '-' : data.summary.resolved}</span>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Laporan Selesai</span>
                    </div>
                </motion.div>
            </motion.div>

            {/* Dashboard Sections Grid */}
            <div className="w-full">
                {/* Analytics Charts */}
                <AnalyticsCharts stats={data.stats} complaints={data.complaints} regionalStats={data.regionalStats} />
            </div>
        </Layout>
    );
}
