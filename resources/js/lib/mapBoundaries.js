export const getResponseDataArray = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    return [];
};

export const normalizeName = (value) => {
    return String(value || '')
        .toLowerCase()
        .replace(/\b(kec|kecamatan|kel|kelurahan|desa)\b\.?/g, '')
        .replace(/[^a-z0-9]+/g, '')
        .trim();
};

const pointInRing = (point, ring) => {
    const [lng, lat] = point;
    let inside = false;

    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [lngI, latI] = ring[i];
        const [lngJ, latJ] = ring[j];
        const intersects = ((latI > lat) !== (latJ > lat)) &&
            (lng < ((lngJ - lngI) * (lat - latI)) / ((latJ - latI) || Number.EPSILON) + lngI);

        if (intersects) inside = !inside;
    }

    return inside;
};

const pointInPolygon = (point, polygonCoordinates) => {
    if (!Array.isArray(polygonCoordinates?.[0])) return false;
    if (!pointInRing(point, polygonCoordinates[0])) return false;

    return !polygonCoordinates.slice(1).some((hole) => pointInRing(point, hole));
};

const pointInGeometry = (point, geometry) => {
    if (!geometry) return false;

    if (geometry.type === 'Polygon') {
        return pointInPolygon(point, geometry.coordinates);
    }

    if (geometry.type === 'MultiPolygon') {
        return geometry.coordinates.some((polygon) => pointInPolygon(point, polygon));
    }

    if (geometry.type === 'GeometryCollection') {
        return geometry.geometries?.some((item) => pointInGeometry(point, item)) || false;
    }

    return false;
};

const boundaryContainsPoint = (boundary, latitude, longitude) => {
    const geojson = boundary?.geojson || boundary;
    const point = [Number(longitude), Number(latitude)];

    if (!Number.isFinite(point[0]) || !Number.isFinite(point[1])) return false;

    if (geojson?.type === 'Feature') {
        return pointInGeometry(point, geojson.geometry);
    }

    if (geojson?.type === 'FeatureCollection') {
        return geojson.features?.some((feature) => pointInGeometry(point, feature.geometry)) || false;
    }

    return pointInGeometry(point, geojson);
};

export const findBoundaryContainingPoint = (boundaries, latitude, longitude, level = 'kecamatan') => {
    return boundaries.find((boundary) => {
        return boundary.level === level && boundaryContainsPoint(boundary, latitude, longitude);
    }) || null;
};

const boundaryStyle = (level) => {
    if (level === 'kabupaten') {
        return {
            color: '#f97316',
            weight: 3.5,
            fillColor: '#f97316',
            fillOpacity: 0.08,
            opacity: 0.95,
        };
    }

    if (level === 'kecamatan') {
        return {
            color: '#38bdf8',
            weight: 2,
            fillColor: '#38bdf8',
            fillOpacity: 0.06,
            opacity: 0.9,
        };
    }

    return {
        color: '#22c55e',
        weight: 1.5,
        fillColor: '#22c55e',
        fillOpacity: 0.045,
        opacity: 0.8,
    };
};

const boundaryLabel = (boundary) => {
    if (boundary.level === 'kabupaten') return `Kabupaten ${boundary.name}`;
    if (boundary.level === 'kecamatan') return `Kecamatan ${boundary.name}`;
    if (boundary.level === 'kelurahan') return `${boundary.name} - Kecamatan ${boundary.parent_name || '-'}`;
    return boundary.name || 'Wilayah';
};

export const drawAdminBoundaries = (L, group, boundaries, options = {}) => {
    if (!L || !group) return null;

    const {
        levels = ['kabupaten', 'kecamatan', 'kelurahan'],
        filter = null,
        fitMap = null,
        fitOptions = { padding: [24, 24], maxZoom: 13 },
        styleForBoundary = null,
        labelFilter = null,
        labelFormatter = null,
        labelClassName = 'sigab-boundary-label',
        boundsFilter = null,
    } = options;

    group.clearLayers();

    const bounds = L.latLngBounds([]);

    boundaries
        .filter((boundary) => levels.includes(boundary.level))
        .filter((boundary) => !filter || filter(boundary))
        .forEach((boundary) => {
            const geojson = boundary.geojson || boundary;
            const style = styleForBoundary ? styleForBoundary(boundary, boundaryStyle(boundary.level)) : boundaryStyle(boundary.level);
            const layer = L.geoJSON(geojson, {
                style,
                interactive: false, // Optimasi: Matikan interaksi mouse pada poligon untuk mencegah lag parah di mobile
                onEachFeature: (feature, featureLayer) => {
                    if (labelFilter && labelFilter(boundary)) {
                        const tooltipClassName = typeof labelClassName === 'function'
                            ? labelClassName(boundary)
                            : labelClassName;

                        featureLayer.bindTooltip(labelFormatter ? labelFormatter(boundary) : boundaryLabel(boundary), {
                            permanent: true,
                            direction: 'center',
                            className: tooltipClassName,
                        });
                    }
                },
            });

            group.addLayer(layer);

            const layerBounds = layer.getBounds();
            if (layerBounds.isValid() && (!boundsFilter || boundsFilter(boundary))) {
                bounds.extend(layerBounds);
            }
        });

    if (fitMap && bounds.isValid()) {
        fitMap.fitBounds(bounds, fitOptions);
    }

    return bounds;
};
