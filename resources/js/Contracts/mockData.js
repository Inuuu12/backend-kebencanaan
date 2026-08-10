/**
 * Data Contracts (Mock Data) untuk Bencana Web / SIGAB.
 * File ini digunakan sebagai referensi bentuk data (shapes) untuk Frontend React
 * selama proses integrasi API (Phase 3+).
 */

export const MOCK_REGIONS = {
    districts: [
        { id: 1, name: 'Kecamatan Sukamaju' },
        { id: 2, name: 'Kecamatan Sukadamai' },
    ],
    villages: [
        { id: 1, district_id: 1, name: 'Desa Maju Jaya' },
        { id: 2, district_id: 1, name: 'Desa Maju Makmur' },
        { id: 3, district_id: 2, name: 'Desa Damai Sejahtera' },
    ]
};

export const MOCK_CATEGORIES = [
    { id: 1, name: 'Banjir', icon: 'waves' },
    { id: 2, name: 'Tanah Longsor', icon: 'mountain' },
    { id: 3, name: 'Gempa Bumi', icon: 'activity' },
];

export const MOCK_INCIDENTS = [
    {
        id: 1,
        title: 'Banjir Bandang Desa Maju Jaya',
        category_id: 1,
        category: MOCK_CATEGORIES[0],
        district_id: 1,
        village_id: 1,
        district_name: 'Kecamatan Sukamaju',
        village_name: 'Desa Maju Jaya',
        status: 'active', // active, resolved
        severity: 'high', // low, medium, high
        description: 'Banjir merendam sekitar 50 rumah warga.',
        date_occurred: '2026-08-09T08:00:00Z',
        latitude: -6.123456,
        longitude: 106.123456,
        created_at: '2026-08-09T08:30:00Z',
    },
];

export const MOCK_REPORTS = [
    {
        id: 1,
        reporter_name: 'Budi Santoso',
        reporter_phone: '081234567890',
        category_id: 2,
        category: MOCK_CATEGORIES[1],
        description: 'Jalan tertutup material longsor, kendaraan tidak bisa melintas.',
        latitude: -6.234567,
        longitude: 106.234567,
        photo_url: '/storage/reports/sample.jpg',
        status: 'pending', // pending, verified, rejected
        incident_id: null,
        created_at: '2026-08-09T09:15:00Z',
    }
];

export const MOCK_WARNINGS = [
    {
        id: 1,
        title: 'Peringatan Hujan Lebat',
        level: 'warning', // info, warning, danger
        source: 'BMKG',
        instruction: 'Warga di bantaran sungai diharap waspada potensi banjir.',
        active_until: '2026-08-10T12:00:00Z',
        created_at: '2026-08-09T07:00:00Z',
    }
];

export const MOCK_ASSESSMENTS = [
    {
        id: 1,
        incident_id: 1,
        officer_name: 'Petugas Lapangan A',
        victims_dead: 0,
        victims_injured: 5,
        victims_evacuated: 120,
        buildings_damaged_heavy: 10,
        buildings_damaged_medium: 15,
        buildings_damaged_light: 25,
        infrastructure_damaged: 'Jembatan desa terputus',
        notes: 'Dibutuhkan segera perahu karet dan logistik makanan.',
        assessed_at: '2026-08-09T10:00:00Z',
    }
];

export const MOCK_NEEDS = [
    {
        id: 1,
        incident_id: 1,
        category: 'Food',
        item_name: 'Beras',
        quantity_needed: 500, // kg
        quantity_fulfilled: 200,
        unit: 'kg',
        priority: 'high',
        status: 'partial', // pending, partial, fulfilled
    }
];

export const MOCK_MARKERS = MOCK_INCIDENTS.map(incident => ({
    id: incident.id,
    type: 'incident',
    lat: incident.latitude,
    lng: incident.longitude,
    icon: incident.category.icon,
    popupData: {
        title: incident.title,
        status: incident.status,
        severity: incident.severity,
        time: incident.date_occurred,
    }
}));
