import { useState, useEffect } from 'react';
import { MapPin, TreePine, Ruler, HeartPulse, Maximize2, Search, Filter } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import api from '../../api/client';

const PALETTE = {
  primary:   '#00D1FF',
  secondary: '#00FFA3',
  warning:   '#FFB020',
  danger:    '#FF4D4F',
  muted:     '#64748B',
  edge:      '#1E2A3F',
  card:      '#121826',
};

/* ── KPI card ────────────────────────────────────────────── */
function KpiCard({ label, value, sub, icon: Icon, accent, iconColor }) {
  return (
    <div className="relative bg-card border border-edge rounded-2xl p-5 overflow-hidden hover:-translate-y-0.5 transition-transform">
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${accent}`} />
      <div className={`absolute top-4 right-4 w-9 h-9 rounded-xl bg-elevated flex items-center justify-center ${iconColor}`}>
        <Icon size={17} />
      </div>
      <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-2">{label}</p>
      <p className="text-snow text-3xl font-black leading-none mb-1">{value}</p>
      <p className="text-muted text-xs">{sub}</p>
    </div>
  );
}

/* ── Health badge ────────────────────────────────────────── */
function HealthBadge({ status }) {
  const cfg = {
    Healthy:  'bg-secondary/10 text-secondary border-secondary/20',
    Moderate: 'bg-warning/10 text-warning border-warning/20',
    Poor:     'bg-danger/10 text-danger border-danger/20',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg[status] || 'bg-elevated text-muted border-edge'}`}>
      {status || 'N/A'}
    </span>
  );
}

/* ── Custom tooltip ─────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-edge rounded-xl px-3.5 py-2.5 shadow-xl text-sm">
      {label && <p className="text-muted text-xs mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-snow font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

/* ── Main Component ──────────────────────────────────────── */
export default function AnalyticsView({ project, onLocateOnMap }) {
  const [analytics, setAnalytics] = useState(null);
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ health: '', search: '' });

  useEffect(() => {
    if (!project) return;
    setLoading(true);
    Promise.all([
      api.get(`/projects/${project.id}/analytics`),
      api.get(`/projects/${project.id}/trees/list`),
    ]).then(([statsRes, listRes]) => {
      setAnalytics(statsRes.data);
      setTrees(listRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [project?.id]);

  const filteredTrees = trees.filter((t) => {
    if (filter.health && t.health_status !== filter.health) return false;
    if (filter.search && !t.tree_index.toString().includes(filter.search)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-edge border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return <div className="flex items-center justify-center py-24 text-muted text-sm">Failed to load analytics data.</div>;
  }

  const healthData = [
    { name: 'Healthy',  value: analytics.health_breakdown.healthy,  color: PALETTE.secondary },
    { name: 'Moderate', value: analytics.health_breakdown.moderate, color: PALETTE.warning   },
    { name: 'Poor',     value: analytics.health_breakdown.poor,     color: PALETTE.danger    },
  ].filter((d) => d.value > 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-snow text-2xl font-bold">Analytics</h1>
        <p className="text-muted text-sm mt-0.5">Inventory overview for <span className="text-subtle">{project.name}</span></p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Trees" value={analytics.total_trees.toLocaleString()} sub="Individual detections"
          icon={TreePine} accent="bg-gradient-to-r from-primary to-primary/50" iconColor="text-primary"
        />
        <KpiCard
          label="Avg Canopy Height" value={`${analytics.average_height || 0}m`} sub="Mean height across stand"
          icon={Ruler} accent="bg-gradient-to-r from-secondary to-secondary/50" iconColor="text-secondary"
        />
        <KpiCard
          label="Health Score" value={`${analytics.health_score || 0}%`} sub="Percentage healthy"
          icon={HeartPulse} accent="bg-gradient-to-r from-secondary to-warning/50" iconColor="text-secondary"
        />
        <KpiCard
          label="Area" value={`${analytics.area_hectares || 0} ha`} sub="Total boundary"
          icon={Maximize2} accent="bg-gradient-to-r from-warning to-warning/50" iconColor="text-warning"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie — health */}
        <div className="bg-card border border-edge rounded-2xl p-5">
          <h3 className="text-snow font-semibold text-sm mb-4">Health Classification</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={healthData} innerRadius={65} outerRadius={100} paddingAngle={4} dataKey="value">
                  {healthData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-5 mt-1">
            {healthData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-subtle">{d.name}:</span>
                <span className="text-snow font-bold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar — height distribution */}
        <div className="bg-card border border-edge rounded-2xl p-5">
          <h3 className="text-snow font-semibold text-sm mb-4">Height Distribution (m)</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.height_distribution} margin={{ top: 0, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.edge} vertical={false} />
                <XAxis dataKey="range" stroke={PALETTE.muted} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={PALETTE.muted} fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<ChartTooltip />} />
                <Bar dataKey="count" fill={PALETTE.primary} radius={[4, 4, 0, 0]} name="Trees" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tree inventory table */}
      <div className="bg-card border border-edge rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="flex items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-edge flex-wrap">
          <h2 className="text-snow font-semibold text-sm">Master Tree Inventory</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input
                type="text"
                placeholder="Search Tree ID…"
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="input-base pl-8 pr-3 py-2 w-36 rounded-lg text-xs"
              />
            </div>
            {/* Health filter */}
            <div className="relative">
              <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <select
                value={filter.health}
                onChange={(e) => setFilter({ ...filter, health: e.target.value })}
                className="input-base pl-8 pr-6 py-2 rounded-lg text-xs appearance-none cursor-pointer"
              >
                <option value="">All Health</option>
                <option value="Healthy">Healthy</option>
                <option value="Moderate">Moderate</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
            <span className="text-muted text-xs">{filteredTrees.length} / {trees.length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto" style={{ maxHeight: 480 }}>
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-edge bg-elevated">
                {['Tree ID', 'Height (m)', 'Health', 'Coordinates', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-muted uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTrees.slice(0, 100).map((tree) => (
                <tr key={tree.id} className="border-b border-edge/50 hover:bg-elevated/40 transition-colors">
                  <td className="px-4 py-3 font-bold text-primary">#{tree.tree_index}</td>
                  <td className="px-4 py-3 text-snow">{tree.height_m}m</td>
                  <td className="px-4 py-3"><HealthBadge status={tree.health_status} /></td>
                  <td className="px-4 py-3 font-mono text-muted text-[11px]">
                    {tree.latitude?.toFixed(6)}, {tree.longitude?.toFixed(6)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onLocateOnMap(tree)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-edge text-subtle hover:text-primary hover:border-primary/40 text-xs transition-colors"
                    >
                      <MapPin size={11} />Locate
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTrees.length > 100 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-muted text-xs">
                    Showing first 100 of {filteredTrees.length}. Use filters to narrow results.
                  </td>
                </tr>
              )}
              {filteredTrees.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted text-sm">No trees match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}