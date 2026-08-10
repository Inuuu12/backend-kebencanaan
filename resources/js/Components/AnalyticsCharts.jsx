import React, { useMemo } from 'react';
import { 
    PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { Activity, Building2 } from 'lucide-react';

const COLORS = {
    banjir: '#06b6d4',
    longsor: '#f97316',
    kebakaran: '#ef4444',
    puting_beliung: '#a855f7',
    gempa: '#10b981',
    lainnya: '#3b82f6'
};

const CHART_LABELS = {
    banjir: 'Banjir',
    longsor: 'Tanah Longsor',
    kebakaran: 'Kebakaran',
    puting_beliung: 'Puting Beliung',
    gempa: 'Gempa Bumi',
    lainnya: 'Lainnya'
};

export default function AnalyticsCharts({ stats, complaints }) {
    // Prepare Data for Pie Chart
    const pieData = useMemo(() => {
        if (!stats) return [];
        return Object.keys(stats)
            .filter(key => stats[key] > 0)
            .map(key => ({
                name: CHART_LABELS[key] || key,
                value: stats[key],
                color: COLORS[key] || COLORS.lainnya
            }));
    }, [stats]);

    // Prepare Data for Trend Bar Chart (Last 7 Days)
    const trendData = useMemo(() => {
        if (!complaints || complaints.length === 0) return [];

        const last7Days = Array.from({length: 7}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0]; // YYYY-MM-DD
        });

        const dailyCounts = {};
        last7Days.forEach(date => dailyCounts[date] = 0);

        complaints.forEach(c => {
            const dateStr = (c.report_date || c.created_at || '').split('T')[0];
            if (dailyCounts[dateStr] !== undefined) {
                dailyCounts[dateStr]++;
            }
        });

        return last7Days.map(date => {
            const d = new Date(date);
            return {
                name: `${d.getDate()}/${d.getMonth()+1}`,
                jumlah: dailyCounts[date]
            };
        });
    }, [complaints]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flexGrow: 1 }}>
            
            {/* Type Distribution */}
            <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', margin: 0 }}>
                    <Building2 size={18} className="color-primary" />
                    Distribusi Jenis Bencana
                </h3>
                
                <div style={{ height: '220px', width: '100%' }}>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    formatter={(value) => [`${value} Aduan`, 'Jumlah']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                            Belum ada data distribusi bencana
                        </div>
                    )}
                </div>
                
                {/* Custom Legend */}
                {pieData.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                        {pieData.map((entry, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                                <span className="text-gray-600 dark:text-gray-400">{entry.name}: <strong>{entry.value}</strong></span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Trends Chart */}
            <div className="panel-card" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '260px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', margin: 0 }}>
                    <Activity size={18} className="color-primary" />
                    Tren Aduan 7 Hari Terakhir
                </h3>
                
                <div style={{ height: '200px', width: '100%', marginTop: '10px' }}>
                    {trendData.some(d => d.jumlah > 0) ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
                                <RechartsTooltip 
                                    cursor={{ fill: 'rgba(249, 115, 22, 0.05)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="jumlah" fill="#FF750F" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                            <Activity size={24} className="opacity-50" />
                            <span className="text-sm">Belum ada aduan dalam 7 hari terakhir</span>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
