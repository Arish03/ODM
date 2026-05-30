import { useState, useEffect } from 'react';
import { MapPin, TreePine, Ruler, HeartPulse, Maximize2, Search, Filter } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import api from '../../api/client';

const PALETTE = {
  primary:   '#f97316',
  secondary: '#22c55e',
  warning:   '#eab308',
  danger:    '#FF4D4F',
  muted:     '#6b7280',
  edge:      'rgba(34,197,94,0.20)',
  card:      'rgba(255,255,255,0.72)',
};

/* ── KPI card ────────────────────────────────────────────── */
function KpiCard({ label, value, sub, icon: Icon, accentColor }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 group"
      style={{
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(34,197,94,0.20)',
        boxShadow: '0 4px 24px rgba(34,197,94,0.08)',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 12px 36px ${accentColor}25`}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(34,197,94,0.08)'}
    >
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
           style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />
      <div className="relative flex justify-between items-start z-10">
        <div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-3">{label}</p>
          <p className="text-snow text-3xl font-black leading-none mb-1">{value}</p>
          <p className="text-muted text-xs">{sub}</p>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
          style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}25` }}
        >
          <Icon size={18} style={{ color: accentColor }} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

/* ── Health badge ────────────────────────────────────────── */
function HealthBadge({ status }) {
  const styles = {
    Healthy:  { background: 'rgba(22,163,74,0.10)',  border: '1px solid rgba(22,163,74,0.25)',  color: '#15803d' },
    Moderate: { background: 'rgba(234,179,8,0.10)',  border: '1px solid rgba(234,179,8,0.25)',  color: '#a16207' },
    Poor:     { background: 'rgba(239,68,68,0.10)',  border: '1px solid rgba(239,68,68,0.25)',  color: '#dc2626' },
  };
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
      style={styles[status] || { background: 'rgba(107,114,128,0.10)', border: '1px solid rgba(107,114,128,0.20)', color: '#6b7280' }}
    >
      {status || 'N/A'}
    </span>
  );
}

/* ── Custom tooltip ─────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3.5 py-2.5 text-sm"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(34,197,94,0.22)',
        boxShadow: '0 8px 24px rgba(34,197,94,0.12)',
      }}
    >
      {label && <p className="text-muted text-xs mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-snow font-bold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

/* ── Main Component ──────────────────────────────────────── */
export default function AnalyticsView({ project, onLocateOnMap }) {
  const [analytics, setAnalytics] = useState(null);
  const [trees, setTrees]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [filter, setFilter]       = useState({ health: '', search: '' });

  const fetchData = () => {
    if (!project) return;
    setLoading(true);
    setError(null);
    Promise.all([
      api.get(`/projects/${project.id}/analytics`),
      api.get(`/projects/${project.id}/trees/list`),
    ]).then(([statsRes, listRes]) => {
      setAnalytics(statsRes.data);
      setTrees(listRes.data);
    }).catch((err) => {
      console.error('Analytics fetch error:', err);
      setError(err?.response?.data?.detail || 'Failed to load analytics data.');
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
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
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-muted text-sm">{error || 'Failed to load analytics data.'}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          style={{ background: 'rgba(34,197,94,0.10)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.25)' }}
        >
          Retry
        </button>
      </div>
    );
  }

  const healthData = [
    { name: 'Healthy',  value: analytics.health_breakdown.healthy,  color: '#22c55e' },
    { name: 'Moderate', value: analytics.health_breakdown.moderate, color: '#eab308' },
    { name: 'Poor',     value: analytics.health_breakdown.poor,     color: '#ef4444' },
  ].filter((d) => d.value > 0);

  const glassPanelStyle = {
    background: 'rgba(255,255,255,0.72)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(34,197,94,0.20)',
    boxShadow: '0 4px 24px rgba(34,197,94,0.08)',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative z-10">
      {/* Header */}
      <div>
        <h1 className="text-snow text-2xl font-bold">Analytics</h1>
        <p className="text-muted text-sm mt-0.5">Inventory overview for <span className="text-subtle font-semibold">{project.name}</span></p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Trees"        value={analytics.total_trees.toLocaleString()} sub="Individual detections"   icon={TreePine}   accentColor="#22c55e" />
        <KpiCard label="Avg Canopy Height"  value={`${analytics.average_height || 0}m`}    sub="Mean height across stand" icon={Ruler}       accentColor="#16a34a" />
        <KpiCard label="Health Score"       value={`${analytics.health_score || 0}%`}       sub="Percentage healthy"       icon={HeartPulse}  accentColor="#f97316" />
        <KpiCard label="Area"               value={`${analytics.area_hectares || 0} ha`}    sub="Total boundary"          icon={Maximize2}   accentColor="#eab308" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie — health */}
        <div className="rounded-2xl p-5" style={glassPanelStyle}>
          <h3 className="text-snow font-bold text-sm mb-4">Health Classification</h3>
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
        <div className="rounded-2xl p-5" style={glassPanelStyle}>
          <h3 className="text-snow font-bold text-sm mb-4">Height Distribution (m)</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.height_distribution} margin={{ top: 0, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.15)" vertical={false} />
                <XAxis dataKey="range" stroke={PALETTE.muted} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={PALETTE.muted} fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<ChartTooltip />} />
                <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} name="Trees" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tree inventory table */}
      <div className="rounded-2xl overflow-hidden" style={glassPanelStyle}>
        {/* Table header */}
        <div className="flex items-start sm:items-center justify-between gap-3 px-5 py-4 flex-wrap"
             style={{ borderBottom: '1px solid rgba(34,197,94,0.15)' }}>
          <h2 className="text-snow font-bold text-sm">Master Tree Inventory</h2>
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
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.22)', color: '#16a34a' }}
            >
              {filteredTrees.length} / {trees.length}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto" style={{ maxHeight: 480 }}>
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr style={{ borderBottom: '1px solid rgba(34,197,94,0.15)', background: 'rgba(240,253,244,0.85)', backdropFilter: 'blur(12px)' }}>
                {['Tree ID', 'Batch Group', 'Height (m)', 'Health', 'Coordinates', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-muted uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTrees.slice(0, 100).map((tree) => {
                const batchLower = Math.floor((tree.tree_index - 1) / 100) * 100 + 1;
                const batchUpper = (Math.floor((tree.tree_index - 1) / 100) + 1) * 100;
                return (
                  <tr
                    key={tree.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid rgba(34,197,94,0.08)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="px-4 py-3 font-bold text-primary">#{tree.tree_index}</td>
                    <td className="px-4 py-3 text-subtle text-xs">{batchLower} — {batchUpper}</td>
                    <td className="px-4 py-3 text-snow">{tree.height_m}m</td>
                    <td className="px-4 py-3"><HealthBadge status={tree.health_status} /></td>
                    <td className="px-4 py-3 font-mono text-muted text-[11px]">
                      {tree.latitude?.toFixed(6)}, {tree.longitude?.toFixed(6)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onLocateOnMap(tree)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ border: '1px solid rgba(34,197,94,0.25)', color: '#16a34a' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.10)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <MapPin size={11} />Locate
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredTrees.length > 100 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-muted text-xs">
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