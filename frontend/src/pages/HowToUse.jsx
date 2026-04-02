import { HelpCircle, Terminal, CloudUpload, Play, LayoutDashboard, Map as MapIcon, BarChart3, Leaf, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';

/* ── Step Card ───────────────────────────────────────────── */
function StepCard({ number, title, desc, icon: Icon, color }) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 group"
      style={{
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(34,197,94,0.20)',
        boxShadow: '0 8px 32px rgba(34,197,94,0.08)',
      }}
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={80} style={{ color }} />
      </div>

      <div className="relative z-10">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}
        >
          <Icon size={22} style={{ color }} strokeWidth={2.5} />
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color }}>Step {number}</span>
        </div>
        <h3 className="text-snow text-xl font-black mb-3">{title}</h3>
        <p className="text-muted text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────── */
export default function HowToUse() {
  const navigate = useNavigate();
  const steps = [
    {
      number: '01',
      title: 'Initialize Project',
      icon: Terminal,
      color: '#22c55e',
      desc: 'Admins trigger the workflow by creating a project anchor. Define the name, location, and assign it to a specific client to begin the geospatial journey.'
    },
    {
      number: '02',
      title: 'Upload Layers',
      icon: CloudUpload,
      color: '#16a34a',
      desc: 'Upload high-resolution orthomosaics (.tif) and elevation models (DTM/DSM). For vector analysis, drag-and-drop boundary, tree inventory, and health shapefiles (.shp, .shx, .dbf, .prj).'
    },
    {
      number: '03',
      title: 'GIS Processing',
      icon: Play,
      color: '#f97316',
      desc: 'Our cluster workers take over. We generate XYZ map tiles from raw rasters and perform spatial intersections on vector data to calculate plantation-wide health indices across every tree.'
    },
    {
      number: '04',
      title: 'Analyze & Deliver',
      icon: LayoutDashboard,
      color: '#064e3b',
      desc: 'Access your dedicated dashboard. Interact with the precision map, view height heatmaps, and export comprehensive tree-level audit reports with a single click.'
    }
  ];

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-12 relative z-10">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 lg:left-10 flex items-center gap-2 px-3 py-1.5 rounded-xl text-subtle hover:text-snow transition-all hover:bg-white/10"
        style={{ border: '1px solid rgba(34,197,94,0.20)' }}
      >
        <ChevronLeft size={16} /> <span className="text-xs font-bold uppercase tracking-widest">Back</span>
      </button>

      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 mb-2">
          <HelpCircle size={14} className="text-primary" />
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Platform Guide</span>
        </div>
        <h1 className="text-snow text-4xl font-black tracking-tight leading-tight">
          How to use <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Open Drone Map</span>
        </h1>
        <p className="text-muted text-lg leading-relaxed">
          Master the precision agriculture workflow from raw drone imagery to actionable plantation intelligence.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        {steps.map((s) => <StepCard key={s.number} {...s} />)}
      </div>

      {/* Documentation Highlight */}
      <div className="rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10"
           style={{
             background: 'rgba(5,46,22,0.85)',
             backdropFilter: 'blur(32px)',
             border: '1px solid rgba(255,255,255,0.15)',
             boxShadow: '0 24px 64px rgba(5,46,22,0.30)'
           }}>
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 text-white/80 text-[10px] uppercase font-bold tracking-widest">
            Detailed Documentation
          </div>
          <h2 className="text-white text-3xl font-black leading-tight">Master every geospatial layer</h2>
          <p className="text-white/60 text-base leading-relaxed">
            Our platform supports the industry standard GIS ecosystem. We ingest multi-part shapefiles and GDAL-compatible rasters natively, ensuring your data remains accurate within 1cm of precision.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="flex items-center gap-2 text-white/90 text-sm font-bold">
              <MapIcon size={18} className="text-primary" /> XYZ Tile Tunnels
            </div>
            <div className="flex items-center gap-2 text-white/90 text-sm font-bold">
              <BarChart3 size={18} className="text-primary" /> Spatial Intersection
            </div>
            <div className="flex items-center gap-2 text-white/90 text-sm font-bold">
              <Leaf size={18} className="text-primary" /> Plant Health Indices
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/3 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full flex items-center justify-center bg-white/5 border border-white/10 relative">

            <Play size={40} className="text-white fill-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
