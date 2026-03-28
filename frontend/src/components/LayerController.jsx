import { Layers, Radio } from 'lucide-react';

export default function LayerController({ layers, setLayers }) {
  const toggleOverlay = (key) => {
    setLayers((prev) => ({
      ...prev,
      overlays: { ...prev.overlays, [key]: !prev.overlays[key] },
    }));
  };

  const setBase = (type) => {
    setLayers((prev) => ({ ...prev, base: type }));
  };

  const RadioOpt = ({ value, label }) => (
    <label className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
      <div
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          layers.base === value ? 'border-primary' : 'border-muted group-hover:border-subtle'
        }`}
      >
        {layers.base === value && <div className="w-2 h-2 rounded-full bg-primary" />}
      </div>
      <input
        type="radio"
        name="base"
        className="sr-only"
        checked={layers.base === value}
        onChange={() => setBase(value)}
      />
      <span className={`text-xs transition-colors ${layers.base === value ? 'text-snow' : 'text-subtle group-hover:text-snow'}`}>
        {label}
      </span>
    </label>
  );

  const CheckOpt = ({ value, label }) => (
    <label className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
      <div
        onClick={() => toggleOverlay(value)}
        className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all ${
          layers.overlays[value]
            ? 'bg-primary border-primary'
            : 'border-muted group-hover:border-subtle'
        }`}
      >
        {layers.overlays[value] && (
          <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
            <path d="M1 3.5L3 5.5L7 1" stroke="#0B0F19" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <input
        type="checkbox"
        className="sr-only"
        checked={layers.overlays[value]}
        onChange={() => toggleOverlay(value)}
      />
      <span className={`text-xs transition-colors ${layers.overlays[value] ? 'text-snow' : 'text-subtle group-hover:text-snow'}`}>
        {label}
      </span>
    </label>
  );

  return (
    <div className="absolute top-4 left-4 z-10 w-56 bg-card/90 backdrop-blur-xl border border-edge rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-edge">
        <Layers size={14} className="text-primary" />
        <span className="text-xs font-semibold text-snow uppercase tracking-wider">Map Layers</span>
      </div>

      <div className="px-4 py-3 space-y-4">
        {/* Base map */}
        <div>
          <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">Base Map</p>
          <div className="space-y-0.5">
            <RadioOpt value="ortho" label="Orthomosaic (Aerial)" />
            <RadioOpt value="dtm"   label="DTM — Ground Model" />
            <RadioOpt value="dsm"   label="DSM — Surface Model" />
          </div>
        </div>

        {/* Overlays */}
        <div>
          <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">Overlays</p>
          <div className="space-y-0.5">
            <CheckOpt value="boundary" label="Plantation Boundary" />
            <CheckOpt value="trees"    label="Tree Locations" />
            <CheckOpt value="health"   label="Health Analysis" />
            <CheckOpt value="height"   label="Height Heatmap" />
          </div>
        </div>

        {/* Footer note */}
        <p className="text-[9px] text-muted leading-relaxed border-t border-edge pt-3">
          Drone data processed with GDAL · Spatial analysis via PostGIS
        </p>
      </div>
    </div>
  );
}