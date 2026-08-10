import React from 'react';
import Layout from '../../Components/Layout';
import { 
    LineChart, 
    Line, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { BarChart3, TrendingUp, Package } from 'lucide-react';

export default function Statistics() {
    const district = { name: 'Kecamatan Setempat' };
    const trends = [];
    const logisticsStats = [];
    // Colors for the pie chart / line representations
    const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#10b981', '#a855f7'];

    return (
        <Layout activePage="statistics" title={`Analisis Statistik Bencana ${district.name}`}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '2rem' }}>
                {/* Disaster Trends Chart */}
                <div className="panel-card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={18} className="color-primary" />
                        Tren Kejadian Bencana Harian
                    </h3>
                    <div style={{ flexGrow: 1, width: '100%', height: '320px' }}>
                        {trends.length === 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                                Belum ada tren data bencana tercatat.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={trends}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                                    <YAxis stroke="var(--text-muted)" fontSize={11} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'var(--bg-secondary)', 
                                            borderColor: 'var(--border-color)', 
                                            color: 'var(--text-primary)',
                                            borderRadius: '8px'
                                        }} 
                                    />
                                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                                    <Line type="monotone" dataKey="total" name="Total Kejadian" stroke="#f8fafc" strokeWidth={2} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="banjir" name="Banjir" stroke="#06b6d4" strokeWidth={2} />
                                    <Line type="monotone" dataKey="longsor" name="Longsor" stroke="#f97316" strokeWidth={2} />
                                    <Line type="monotone" dataKey="kebakaran" name="Kebakaran" stroke="#ef4444" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Logistics Stats Chart */}
                <div className="panel-card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Package size={18} className="color-primary" />
                        Status Penyaluran Bantuan Logistik (Unit / Box)
                    </h3>
                    <div style={{ flexGrow: 1, width: '100%', height: '320px' }}>
                        {logisticsStats.length === 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                                Belum ada pengajuan logistik bantuan.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={logisticsStats}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="item_name" stroke="var(--text-muted)" fontSize={11} />
                                    <YAxis stroke="var(--text-muted)" fontSize={11} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'var(--bg-secondary)', 
                                            borderColor: 'var(--border-color)', 
                                            color: 'var(--text-primary)',
                                            borderRadius: '8px'
                                        }} 
                                    />
                                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                                    <Bar dataKey="requested" name="Diajukan Kelurahan" fill="rgba(234, 179, 8, 0.65)" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="approved" name="Disetujui Kecamatan" fill="rgba(16, 185, 129, 0.65)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
