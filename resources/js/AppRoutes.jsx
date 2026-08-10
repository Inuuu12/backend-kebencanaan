import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';

// Public Pages (Keep static to avoid waterfall on initial load)
import Landing from './Pages/Public/Landing';
import News from './Pages/Public/News';
import NewsDetail from './Pages/Public/NewsDetail';
import Info from './Pages/Public/Info';
import Aduan from './Pages/Public/Aduan';
import Login from './Pages/Auth/Login';

// Dashboards (Lazy Loaded)
const KabupatenDashboard = lazy(() => import('./Pages/Kabupaten/Dashboard'));
const KabupatenPenanganan = lazy(() => import('./Pages/Kabupaten/Penanganan'));
const KabupatenProfile = lazy(() => import('./Pages/Kabupaten/Profile'));

const KecamatanDashboard = lazy(() => import('./Pages/Kecamatan/Dashboard'));
const KecamatanPenanganan = lazy(() => import('./Pages/Kecamatan/Penanganan'));
const KecamatanRecap = lazy(() => import('./Pages/Kecamatan/Recap'));
const KecamatanStatistics = lazy(() => import('./Pages/Kecamatan/Statistics'));
const KecamatanProfile = lazy(() => import('./Pages/Kecamatan/Profile'));

const KelurahanDashboard = lazy(() => import('./Pages/Kelurahan/Dashboard'));
const KelurahanPenanganan = lazy(() => import('./Pages/Kelurahan/Penanganan'));
const KelurahanLaporan = lazy(() => import('./Pages/Kelurahan/Laporan'));
const KelurahanProfile = lazy(() => import('./Pages/Kelurahan/Profile'));

// Reports (Lazy Loaded)
const ReportList = lazy(() => import('./Pages/Reports/ReportList'));
const ReportDetail = lazy(() => import('./Pages/Reports/ReportDetail'));
const ReportCreate = lazy(() => import('./Pages/Reports/ReportCreate'));

// GIS (Heavy Leaflet Dependency - Lazy Loaded)
const DisasterMap = lazy(() => import('./Pages/GIS/DisasterMap'));

// Global Page Loader for Suspense Fallback
const PageLoader = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
        <span className="font-semibold text-slate-600 dark:text-slate-400">Memuat Halaman...</span>
    </div>
);

function PrivateRoute({ children, allowedRoles }) {
    const { user, isLoading } = useAuth();

    if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />; // or to unauthorized page
    }

    return children;
}

export default function AppRoutes() {
    const { user, isLoading } = useAuth();

    if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading Application...</div>;

    return (
        <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    {/* Public Pages */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/news" element={<News />} />
                    <Route path="/news/:id" element={<NewsDetail />} />
                    <Route path="/info" element={<Info />} />
                    <Route path="/lapor" element={<Aduan />} />

                    {/* Public Auth Route */}
                    <Route path="/login" element={user ? <Navigate to={
                        (user.role === 'superadmin') ? '/dashboard/kabupaten' : 
                        user.role === 'admin_kecamatan' ? '/dashboard/kecamatan' : 
                        '/dashboard/kelurahan'
                    } replace /> : <Login />} />

                    {/* Protected Routes */}
                    <Route path="/dashboard/kabupaten/*" element={
                        <PrivateRoute allowedRoles={['superadmin']}>
                            <Routes>
                                <Route path="/" element={<KabupatenDashboard />} />
                                <Route path="/aduan" element={<ReportList />} />
                                <Route path="/aduan/buat" element={<ReportCreate />} />
                                <Route path="/aduan/:id" element={<ReportDetail />} />
                                <Route path="/peta" element={<DisasterMap />} />
                                <Route path="/penanganan" element={<KabupatenPenanganan />} />
                                <Route path="/profil" element={<KabupatenProfile />} />
                            </Routes>
                        </PrivateRoute>
                    } />

                    <Route path="/dashboard/kecamatan/*" element={
                        <PrivateRoute allowedRoles={['admin_kecamatan']}>
                            <Routes>
                                <Route path="/" element={<KecamatanDashboard />} />
                                <Route path="/aduan" element={<ReportList />} />
                                <Route path="/aduan/buat" element={<ReportCreate />} />
                                <Route path="/aduan/:id" element={<ReportDetail />} />
                                <Route path="/peta" element={<DisasterMap />} />
                                <Route path="/penanganan" element={<KecamatanPenanganan />} />
                                <Route path="/rekap" element={<KecamatanRecap />} />
                                <Route path="/statistik" element={<KecamatanStatistics />} />
                                <Route path="/profil" element={<KecamatanProfile />} />
                            </Routes>
                        </PrivateRoute>
                    } />

                    <Route path="/dashboard/kelurahan/*" element={
                        <PrivateRoute allowedRoles={['admin_kelurahan']}>
                            <Routes>
                                <Route path="/" element={<KelurahanDashboard />} />
                                <Route path="/aduan" element={<ReportList />} />
                                <Route path="/aduan/buat" element={<ReportCreate />} />
                                <Route path="/aduan/:id" element={<ReportDetail />} />
                                <Route path="/peta" element={<DisasterMap />} />
                                <Route path="/penanganan" element={<KelurahanPenanganan />} />
                                <Route path="/laporan" element={<KelurahanLaporan />} />
                                <Route path="/profil" element={<KelurahanProfile />} />
                            </Routes>
                        </PrivateRoute>
                    } />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
