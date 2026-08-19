import React from 'react';
import Layout from '../../Components/Layout';
import RegionRecapTable from '../../Components/RegionRecapTable';
import { useAuth } from '../../AuthContext';

export default function RekapData() {
    const { user } = useAuth();

    return (
        <Layout activePage="rekap-wilayah" title="Rekap Data Wilayah">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[calc(100vh-120px)] flex flex-col gap-4">
                <RegionRecapTable user={user} isKabupaten={user?.role === 'superadmin'} isKecamatan={user?.role === 'admin_kecamatan'} />
            </div>
        </Layout>
    );
}
