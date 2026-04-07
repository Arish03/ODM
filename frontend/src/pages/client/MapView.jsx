import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import api from '../../api/client';
import LayerController from '../../components/LayerController';

export default function MapView({ project }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [layers, setLayers] = useState({
    base: 'ortho',
    overlays: { boundary: true, trees: true, health: false, height: false },
  });
  const [heightRange, setHeightRange] = useState({ min: 0, max: 15 });

  useEffect(() => {
    if (!mapContainer.current || !project) return;

    const boundary = project.boundary_geojson ? JSON.parse(project.boundary_geojson) : null;
    let center = [0, 0];
    let zoom = 2;
    let bounds = null;

    if (boundary?.features?.length > 0) {
      const coords = boundary.features[0].geometry.coordinates[0];
      const lngs = coords.map((c) => c[0]);
      const lats = coords.map((c) => c[1]);
      center = [(Math.min(...lngs) + Math.max(...lngs)) / 2, (Math.min(...lats) + Math.max(...lats)) / 2];
      bounds = [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ];
      zoom = 18;
    }

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: { type: 'raster', tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, attribution: '© OpenStreetMap' },
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm', minzoom: 0, maxzoom: 19 }],
      },
      center,
      zoom,
      antialias: true,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (bounds) {
        map.current.fitBounds(bounds, { padding: 40, maxZoom: 20 });
      }
      setupSourcesAndLayers();
    });

    return () => { if (map.current) { map.current.remove(); map.current = null; } };
  }, [project?.id]);

  const setupSourcesAndLayers = () => {
    if (!map.current || !project) return;
    const { id: projectId } = project;
    const baseUrl = window.location.origin;

    ['ortho', 'dtm', 'dsm'].forEach((type) => {
      map.current.addSource(type, {
        type: 'raster',
        tiles: [`${baseUrl}/tiles/${projectId}/${type}/{z}/{x}/{y}.png`],
        tileSize: 256,
        scheme: 'xyz',
        minzoom: 2,
        maxzoom: 22,
      });
      map.current.addLayer({
        id: `${type}-layer`,
        type: 'raster',
        source: type,
        layout: { visibility: layers.base === type ? 'visible' : 'none' },
      });
    });

    if (project.boundary_geojson) {
      map.current.addSource('boundary', { type: 'geojson', data: JSON.parse(project.boundary_geojson) });
      map.current.addLayer({
        id: 'boundary-line',
        type: 'line',
        source: 'boundary',
        paint: { 'line-color': '#f97316', 'line-width': 3, 'line-opacity': 0.9 },
        layout: { visibility: layers.overlays.boundary ? 'visible' : 'none' },
      });
    }

    async function addTrees() {
      try {
        const res = await api.get(`/projects/${projectId}/trees`);
        if (!map.current) return;
        const treeData = res.data;
        if (treeData?.features?.length > 0) {
          const heights = treeData.features.map((f) => f.properties.height_m).filter((h) => h != null);
          if (heights.length > 0) {
            const min = Math.min(...heights);
            const max = Math.max(...heights);
            setHeightRange({ min, max });
            map.current.addSource('trees', { type: 'geojson', data: treeData });
            setupTreeLayers({ min, max });
          }
        }
      } catch (err) {
        console.error('Failed to load tree data', err);
      }
    }
    addTrees();
  };

  const setupTreeLayers = ({ min, max }) => {
    if (!map.current) return;
    const delta = max - min;

    map.current.addLayer({
      id: 'trees-point', type: 'circle', source: 'trees',
      paint: { 'circle-radius': 4, 'circle-color': '#ffffff', 'circle-stroke-width': 1, 'circle-stroke-color': '#000000' },
      layout: { visibility: layers.overlays.trees && !layers.overlays.health && !layers.overlays.height ? 'visible' : 'none' },
    });

    map.current.addLayer({
      id: 'trees-health', type: 'circle', source: 'trees',
      paint: {
        'circle-radius': 6,
        'circle-color': ['match', ['get', 'health_status'], 'Healthy', '#22c55e', 'Moderate', '#eab308', 'Poor', '#FF4D4F', '#64748b'],
        'circle-stroke-width': 1.5, 'circle-stroke-color': '#000000',
      },
      layout: { visibility: layers.overlays.health ? 'visible' : 'none' },
    });

    map.current.addLayer({
      id: 'trees-height', type: 'circle', source: 'trees',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['get', 'height_m'], min, 8, min + delta * 0.5, 12, max, 18],
        'circle-color': ['interpolate', ['linear'], ['get', 'height_m'],
          min,                  '#fef08a',
          min + delta * 0.15,   '#facc15',
          min + delta * 0.30,   '#eab308',
          min + delta * 0.45,   '#84cc16',
          min + delta * 0.60,   '#22c55e',
          min + delta * 0.75,   '#16a34a',
          min + delta * 0.90,   '#15803d',
          max,                  '#14532d',
        ],
        'circle-opacity': 0.85, 'circle-stroke-width': 1, 'circle-stroke-color': '#000000',
      },
      layout: { visibility: layers.overlays.height ? 'visible' : 'none' },
    });

    const treeLayers = ['trees-point', 'trees-health', 'trees-height'];

    treeLayers.forEach((lyr) => {
      map.current.on('click', lyr, handleTreeClick);
    });
    map.current.on('mouseenter', treeLayers, () => { map.current.getCanvas().style.cursor = 'pointer'; });
    map.current.on('mouseleave', treeLayers, () => { map.current.getCanvas().style.cursor = ''; });
  };

  const handleTreeClick = (e) => {
    const features = map.current.queryRenderedFeatures(e.point, { layers: ['trees-point', 'trees-health', 'trees-height'] });
    if (!features.length) return;
    const tree = features[0].properties;
    new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(`
        <div class="tree-popup">
          <div class="tree-popup__header">
            <span class="tree-popup__id">Tree #${tree.tree_index}</span>
          </div>
          <div class="tree-popup__row">
            <span class="tree-popup__label">Height</span>
            <span class="tree-popup__value">${tree.height_m}m</span>
          </div>
          <div class="tree-popup__row">
            <span class="tree-popup__label">Health</span>
            <span class="tree-popup__value">${tree.health_status || 'N/A'}</span>
          </div>
          <div class="tree-popup__row">
            <span class="tree-popup__label">Location</span>
            <span class="tree-popup__value" style="font-size:10px">${Number(tree.latitude).toFixed(6)}, ${Number(tree.longitude).toFixed(6)}</span>
          </div>
        </div>
      `)
      .addTo(map.current);
  };

  // Switch base layer
  useEffect(() => {
    if (!map.current?.isStyleLoaded()) return;
    ['ortho', 'dtm', 'dsm'].forEach((type) => {
      if (map.current.getLayer(`${type}-layer`))
        map.current.setLayoutProperty(`${type}-layer`, 'visibility', layers.base === type ? 'visible' : 'none');
    });
  }, [layers.base]);

  // Switch overlays
  useEffect(() => {
    if (!map.current?.isStyleLoaded()) return;
    if (map.current.getLayer('boundary-line'))
      map.current.setLayoutProperty('boundary-line', 'visibility', layers.overlays.boundary ? 'visible' : 'none');
    const showBasic = layers.overlays.trees && !layers.overlays.health && !layers.overlays.height;
    if (map.current.getLayer('trees-point')) map.current.setLayoutProperty('trees-point', 'visibility', showBasic ? 'visible' : 'none');
    if (map.current.getLayer('trees-health')) map.current.setLayoutProperty('trees-health', 'visibility', layers.overlays.health ? 'visible' : 'none');
    if (map.current.getLayer('trees-height')) map.current.setLayoutProperty('trees-height', 'visibility', layers.overlays.height ? 'visible' : 'none');
  }, [layers.overlays]);

  return (
    <div className="relative w-full" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Aurora orbs behind map */}
      <div className="aurora-orb-2 opacity-50" style={{ left: '20%' }} />

      {/* Map canvas */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Layer controller */}
      <LayerController layers={layers} setLayers={setLayers} />

      {/* Height legend */}
      {layers.overlays.height && (
        <div
          className="absolute right-4 bottom-8 z-10 rounded-2xl p-4 shadow-2xl w-28"
          style={{
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(34,197,94,0.22)',
            boxShadow: '0 8px 32px rgba(34,197,94,0.15)',
          }}
        >
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest text-center mb-3">Height (m)</p>
          <div className="flex gap-2.5 h-48">
            <div
              className="w-3 rounded-full flex-shrink-0"
              style={{
                background: 'linear-gradient(to top, #fef08a 0%, #facc15 15%, #eab308 30%, #84cc16 45%, #22c55e 60%, #16a34a 75%, #15803d 90%, #14532d 100%)',
                border: '1px solid rgba(0,0,0,0.05)',
              }}
            />
            <div className="flex flex-col justify-between text-[10px] font-bold text-snow">
              {[heightRange.max, 0.85, 0.71, 0.57, 0.42, 0.28, 0.14, 0].map((fr, i) => (
                <span key={i}>
                  {typeof fr === 'number' && fr < 1 && fr > 0
                    ? (heightRange.min + (heightRange.max - heightRange.min) * fr).toFixed(1)
                    : fr === 0
                    ? heightRange.min.toFixed(1)
                    : fr.toFixed(1)}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}