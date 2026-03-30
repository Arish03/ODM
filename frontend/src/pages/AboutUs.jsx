import { Globe, ShieldCheck, Zap, Leaf, Target, Users, Layout, Map, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ── Info Card ───────────────────────────────────────────── */
function InfoCard({ title, desc, icon: Icon, color }) {
  return (
    <div
      className="rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:border-white/30"
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.10)',
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-6"
        style={{ background: `${color}20`, border: `1px solid ${color}30` }}
      >
        <Icon size={18} style={{ color }} strokeWidth={2.5} />
      </div>
      <h3 className="text-white text-lg font-black mb-3">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────── */
export default function AboutUs() {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen overflow-hidden sidebar-forest flex flex-col">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-2xl text-white/70 hover:text-white transition-all bg-white/5 hover:bg-white/10"
        style={{ border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)' }}
      >
        <ChevronLeft size={18} /> <span className="text-xs font-bold uppercase tracking-[0.2em]">Back</span>
      </button>

      {/* Aurora orbs overlay */}
      <div className="aurora-orb-1 opacity-40 mix-blend-screen" />
      <div className="aurora-orb-2 opacity-30 mix-blend-screen" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Logo Section */}
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.3)]">
              <img src="/logo.png" alt="Open Drone Mapping Logo" className="w-16 h-16 object-contain" />
            </div>
            <div className="space-y-3">
              <h1 className="text-white text-5xl font-black tracking-tight leading-tight">
                Lansub <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-200">Intelligence</span>
              </h1>
              <p className="text-white/60 text-lg font-medium tracking-wide border-t border-white/10 pt-4 px-12">
                The next frontier in precision drone mapping and geospatial analysis.
              </p>
            </div>
          </div>

          {/* Mission */}
          <div className="max-w-2xl mx-auto py-4">
            <p className="text-white/80 text-xl leading-relaxed font-light italic">
              "At <span className="font-bold text-white">Lansub</span>, we transform raw aerial observation into high-precision, actionable data. Our mission is to scale sustainable landscape management through advanced GIS intelligence and automated drone processing."
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <InfoCard
              title="Global Vision"
              icon={Globe}
              color="#22c55e"
              desc="Deploying spatial intelligence across borders for massive plantation estates."
            />
            <InfoCard
              title="GIS Precision"
              icon={Target}
              color="#16a34a"
              desc="Centimeter-perfect orthomosaics and multi-layer vector intersections."
            />
            <InfoCard
              title="Cloud Speed"
              icon={Zap}
              color="#f97316"
              desc="Distributed processing workers that ingest terabytes in minutes."
            />
            <InfoCard
              title="Eco Tech"
              icon={Leaf}
              color="#4ade80"
              desc="Optimizing plantation health while reducing carbon footprint through precision care."
            />
          </div>

          {/* Team / Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8">
            <div className="text-center">
              <p className="text-white text-3xl font-black mb-1">1M+</p>
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Trees Tracked</p>
            </div>
            <div className="text-center">
              <p className="text-white text-3xl font-black mb-1">50k</p>
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Hectares Scanned</p>
            </div>
            <div className="text-center">
              <p className="text-white text-3xl font-black mb-1">99%</p>
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Precision Rate</p>
            </div>
            <div className="text-center">
              <p className="text-white text-3xl font-black mb-1">24/7</p>
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Global Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Page Footer */}
      <div className="relative z-10 px-12 py-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-1.5 opacity-50">
          <Map size={14} className="text-white" />
          <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em]">Open Drone Mapping Platform v2.0</p>
        </div>
        <div className="flex gap-8">
          <div className="flex items-center gap-2 text-white/40 text-xs hover:text-white transition-colors cursor-pointer">
            <ShieldCheck size={14} /> Security Audit
          </div>
          <div className="flex items-center gap-2 text-white/40 text-xs hover:text-white transition-colors cursor-pointer">
            <Users size={14} /> Global Partners
          </div>
          <div className="flex items-center gap-2 text-white/40 text-xs hover:text-white transition-colors cursor-pointer">
            <Layout size={14} /> API Portal
          </div>
        </div>
      </div>
    </div>
  );
}
