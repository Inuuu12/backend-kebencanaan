export const getAdminScopeFilters = (user) => {
    if (!user) return {};

    if (user.role === 'admin_kelurahan' && user.id_kelurahan) {
        return { kelurahan_id: user.id_kelurahan };
    }

    if (user.role === 'admin_kecamatan' && user.id_kecamatan) {
        return { kecamatan_id: user.id_kecamatan };
    }

    return {};
};

export const getAdminScopeLabel = (user) => {
    if (!user) return 'Seluruh Kabupaten Bogor';

    if (user.role === 'admin_kelurahan') {
        return user.nama_kelurahan
            ? `Desa/Kelurahan ${user.nama_kelurahan}`
            : 'Desa/Kelurahan';
    }

    if (user.role === 'admin_kecamatan') {
        return user.nama_kecamatan
            ? `Kecamatan ${user.nama_kecamatan}`
            : 'Kecamatan';
    }

    return 'Seluruh Kabupaten Bogor';
};

export const canCreateAdminReport = (user) => {
    return user?.role !== 'admin_kelurahan';
};
