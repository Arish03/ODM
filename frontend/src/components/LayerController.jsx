import { useState, useEffect } from 'react';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';

export default function LayerController({ layers, setLayers }) {
  const [expanded, setExpanded] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) setExpanded(false);
      else setExpanded(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleOverlay = (key) =>
    setLayers((prev) => ({ ...prev, overlays: { ...prev.overlays, [key]: !prev.overlays[key] } }));

  const setBase = (type) =>
    setLayers((prev) => ({ ...prev, base: type }));

  const RadioOpt = ({ value, label }) => {
    const active = layers.base === value;
    return (
      <label className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
        <div
          className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
          style={{ borderColor: active ? '#22c55e' : 'rgba(34,197,94,0.35)' }}
        >
          {active && <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />}
        </div>
        <input type="radio" name="base" className="sr-only" checked={active} onChange={() => setBase(value)} />
        <span
          className="text-xs transition-colors"
          style={{ color: active ? '#064e3b' : '#6b7280' }}
        >
          {label}
        </span>
      </label>
    );
  };

  const CheckOpt = ({ value, label }) => {
    const active = layers.overlays[value];
    return (
      <label className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
        <div
          onClick={() => toggleOverlay(value)}
          className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all"
          style={active
            ? { background: '#22c55e', borderColor: '#22c55e' }
            : { borderColor: 'rgba(34,197,94,0.35)' }}
        >
          {active && (
            <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
              <path d="M1 3.5L3 5.5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <input type="checkbox" className="sr-only" checked={active} onChange={() => toggleOverlay(value)} />
        <span className="text-xs transition-colors" style={{ color: active ? '#064e3b' : '#6b7280' }}>
          {label}
        </span>
      </label>
    );
  };

  return (
    <div
      className="absolute top-4 left-4 z-10 w-56 overflow-hidden rounded-2xl transition-all duration-300"
      style={{
        height: expanded ? 'auto' : '44px',
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(34,197,94,0.22)',
        boxShadow: '0 8px 32px rgba(34,197,94,0.15), 0 4px 12px rgba(0,0,0,0.05)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        style={{ borderBottom: expanded ? '1px solid rgba(34,197,94,0.15)' : 'none' }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(34,197,94,0.12)' }}
          >
            <Layers size={13} className="text-primary" />
          </div>
          <span className="text-xs font-bold text-snow uppercase tracking-wider">Map Layers</span>
        </div>
        <div className="text-muted">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 py-3 space-y-4">
          {/* Base map */}
          <div>
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Base Map</p>
            <div className="space-y-0.5">
              <RadioOpt value="ortho" label="Orthomosaic (Aerial)" />
              <RadioOpt value="dtm"   label="DTM — Ground Model" />
              <RadioOpt value="dsm"   label="DSM — Surface Model" />
            </div>
          </div>

          {/* Overlays */}
          <div>
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Overlays</p>
            <div className="space-y-0.5">
              <CheckOpt value="boundary" label="Plantation Boundary" />
              <CheckOpt value="trees"    label="Tree Locations" />
              <CheckOpt value="health"   label="Health Analysis" />
              <CheckOpt value="height"   label="Height Heatmap" />
            </div>
          </div>

         
        </div>
      )}
    </div>
  );
}