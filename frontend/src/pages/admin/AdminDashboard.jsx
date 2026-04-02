import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderOpen, Cpu, CheckCircle2, ShieldCheck, Plus,
  Map as MapIcon, Clock, ChevronRight, Activity, Trash2,
} from 'lucide-react';
import api from '../../api/client';
import AppShell from '../../components/AppShell';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/Toast';

/* ── Status Theme Configurations ─────────────────────────── */
const STATUS_THEME = {
  created:    { label: 'Created',    glowColor: 'rgba(107,114,128,0.3)',  badgeBg: 'rgba(107,114,128,0.10)', badgeBorder: 'rgba(107,114,128,0.25)', textColor: '#6b7280',  topBar: '#9ca3af', ping: false },
  unassigned: { label: 'Unassigned', glowColor: 'rgba(34,197,94,0.2)',   badgeBg: 'rgba(34,197,94,0.10)',  badgeBorder: 'rgba(34,197,94,0.25)',  textColor: '#16a34a', topBar: '#22c55e', ping: false },
  uploading:  { label: 'Uploading',  glowColor: 'rgba(34,197,94,0.2)',   badgeBg: 'rgba(34,197,94,0.10)',  badgeBorder: 'rgba(34,197,94,0.25)',  textColor: '#16a34a', topBar: '#22c55e', ping: true  },
  processing: { label: 'Processing', glowColor: 'rgba(245,158,11,0.25)', badgeBg: 'rgba(245,158,11,0.10)', badgeBorder: 'rgba(245,158,11,0.30)', textColor: '#d97706', topBar: '#f59e0b', ping: true  },
  ready:      { label: 'Ready',      glowColor: 'rgba(22,163,74,0.25)',  badgeBg: 'rgba(22,163,74,0.10)',  badgeBorder: 'rgba(22,163,74,0.30)',  textColor: '#15803d', topBar: '#16a34a', ping: false },
  error:      { label: 'Error',      glowColor: 'rgba(239,68,68,0.20)',  badgeBg: 'rgba(239,68,68,0.10)',  badgeBorder: 'rgba(239,68,68,0.30)',  textColor: '#dc2626', topBar: '#ef4444', ping: false },
};

/* ── Glass KPI Card ─────────────────────────────────────── */
function GlassKpi({ label, value, sub, icon: Icon, accentColor }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 group"
      style={{
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(24px)',
        border: `1px solid rgba(34,197,94,0.20)`,
        boxShadow: `0 4px 24px rgba(34,197,94,0.08)`,
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 12px 40px ${accentColor}33, 0 4px 12px rgba(0,0,0,0.05)`}
      onMouseLeave={e => e.currentTarget.style.boxShadow = `0 4px 24px rgba(34,197,94,0.08)`}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl transition-opacity"
        style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)`, opacity: 0.8 }}
      />
      {/* Inner glow */}
      <div
        className="absolute top-0 left-0 right-0 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(ellipse at top, ${accentColor}18 0%, transparent 70%)` }}
      />

      <div className="relative flex justify-between items-start z-10">
        <div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-3">{label}</p>
          <h3 className="text-snow text-3xl font-black tracking-tight mb-1">{value}</h3>
          <p className="text-muted text-xs font-medium">{sub}</p>
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}
        >
          <Icon size={20} style={{ color: accentColor }} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────── */
export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [metrics, setMetrics]   = useState({ total: 0, processing: 0, ready: 0 });
  const [confirmModal, setConfirmModal] = useState({ show: false });
  const [currentTime, setCurrentTime]   = useState(new Date());

  const navigate = useNavigate();
  const toast    = useToast();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const computeMetrics = (list) => {
    const m = list.reduce((acc, p) => {
      acc.total++;
      if (p.status === 'processing' || p.status === 'uploading') acc.processing++;
      if (p.status === 'ready') acc.ready++;
      return acc;
    }, { total: 0, processing: 0, ready: 0 });
    setMetrics(m);
  };

  const fetchProjects = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/projects');
      setProjects(res.data.projects);
      computeMetrics(res.data.projects);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    const interval = setInterval(() => fetchProjects(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteProject = (project) => {
    setConfirmModal({
      show: true,
      title: 'Delete Project',
      message: `Permanently delete "${project.name}"? All tiles and uploaded data will be purged.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal({ show: false });
        try {
          await api.delete(`/projects/${project.id}`);
          toast.success(`Project "${project.name}" deleted.`);
          fetchProjects(true);
        } catch {
          toast.error('Failed to delete project.');
        }
      },
      onCancel: () => setConfirmModal({ show: false }),
    });
  };

  const greeting = currentTime.getHours() < 12 ? 'Good Morning'
    : currentTime.getHours() < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <AppShell>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8 relative z-10">

        {/* ── Header ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 mb-2">

              <p className="text-primary text-[10px] uppercase tracking-widest font-black">Systems Operational</p>
            </div>
            <h1 className="text-snow text-2xl sm:text-3xl font-black tracking-tight">{greeting}, Admin</h1>
            <p className="text-muted text-xs sm:text-sm font-medium">Real-time telemetry from your drone survey fleet.</p>
          </div>

          <button
            onClick={() => navigate('/admin/projects/new')}
            className="group flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto"
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              boxShadow: '0 8px 24px rgba(249,115,22,0.35)',
            }}
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            Initialize Project
          </button>
        </div>

        {/* ── KPI Grid ────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <GlassKpi label="Total Fleet Ops"      value={metrics.total}     sub="+2 this week"              icon={FolderOpen}   accentColor="#22c55e" />
          <GlassKpi label="Active Processing"    value={metrics.processing} sub="Tasks queued across nodes" icon={Cpu}          accentColor="#f59e0b" />
          <GlassKpi label="Ready for Delivery"   value={metrics.ready}     sub="Client-facing and rendered" icon={CheckCircle2} accentColor="#16a34a" />
          <GlassKpi label="Infrastructure"       value="Stable"             sub="All API gateways online"   icon={ShieldCheck}  accentColor="#22c55e" />
        </div>

        {/* ── Split Pane Layout ────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* Left: Active Fleet */}
          <div className="xl:col-span-8 space-y-5">
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-snow text-lg font-bold flex items-center gap-2">
                <MapIcon size={18} className="text-primary" />
                Active Project Fleet
              </h2>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.22)', color: '#16a34a' }}
              >
                {projects.length} Entries
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading && projects.length === 0 ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="glass-card rounded-2xl p-5 h-[170px] animate-pulse" />
                ))
              ) : projects.length === 0 ? (
                <div
                  className="md:col-span-2 py-16 text-center rounded-2xl"
                  style={{ background: 'rgba(34,197,94,0.04)', border: '2px dashed rgba(34,197,94,0.25)' }}
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                       style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.22)' }}>
                    <FolderOpen size={24} className="text-primary" />
                  </div>
                  <h3 className="text-snow font-bold mb-1">No Active Projects</h3>
                  <p className="text-muted text-sm mb-4">Initialize a new drone survey to see data here.</p>
                  <button onClick={() => navigate('/admin/projects/new')} className="text-primary text-sm font-bold hover:underline">
                    Create Project →
                  </button>
                </div>
              ) : (
                projects.map((project) => {
                  const theme = STATUS_THEME[project.status] || STATUS_THEME.created;
                  return (
                    <div
                      key={project.id}
                      className="group relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between transition-all duration-300"
                      style={{
                        background: 'rgba(255,255,255,0.72)',
                        backdropFilter: 'blur(24px)',
                        border: '1px solid rgba(34,197,94,0.18)',
                        boxShadow: '0 4px 20px rgba(34,197,94,0.07)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = `0 12px 36px ${theme.glowColor}, 0 4px 12px rgba(0,0,0,0.05)`;
                        e.currentTarget.style.borderColor = theme.topBar + '60';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(34,197,94,0.07)';
                        e.currentTarget.style.borderColor = 'rgba(34,197,94,0.18)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {/* Status top-bar */}
                      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
                           style={{ background: `linear-gradient(90deg, ${theme.topBar}, transparent)` }} />

                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="pr-4">
                          <h3 className="text-snow font-bold text-base line-clamp-1">{project.name}</h3>
                          <p className="text-muted text-xs mt-1 flex items-center gap-1.5">
                            <Clock size={12} /> {new Date(project.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold"
                          style={{ background: theme.badgeBg, border: `1px solid ${theme.badgeBorder}`, color: theme.textColor }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {theme.label}
                        </span>
                      </div>

                      {/* Card Info */}
                      <div className="space-y-2 mb-5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted">Location</span>
                          <span className="text-snow font-medium">{project.location || '—'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted">Assigned Client</span>
                          <span className="text-snow font-medium">{project.client_name || <span className="italic text-muted">Unassigned</span>}</span>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center gap-2 pt-4"
                           style={{ borderTop: '1px solid rgba(34,197,94,0.12)' }}>
                        <button
                          onClick={() => navigate('/')}
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-colors"
                          style={{ background: 'rgba(34,197,94,0.08)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.18)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.15)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.08)'; }}
                        >
                          Launch Viewer <ChevronRight size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project)}
                          className="p-2 flex items-center justify-center rounded-lg transition-colors"
                          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}
                          title="Delete Project"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Event Feed */}
          <div
            className="xl:col-span-4 rounded-2xl flex flex-col overflow-hidden max-h-[800px] relative"
            style={{
              background: 'rgba(240,253,244,0.80)',
              backdropFilter: 'blur(28px)',
              border: '1px solid rgba(34,197,94,0.22)',
              boxShadow: '0 16px 48px rgba(34,197,94,0.10)',
            }}
          >
            <div className="px-6 py-5 flex items-center gap-3 flex-shrink-0"
                 style={{ borderBottom: '1px solid rgba(34,197,94,0.15)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                   style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.22)' }}>
                <Activity size={16} className="text-primary" />
              </div>
              <div>
                <h3 className="text-snow font-bold text-sm">System Event Feed</h3>
                <p className="text-muted text-xs">Real-time status changes</p>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {projects.length === 0 ? (
                <p className="text-muted text-xs text-center italic">No recent system events.</p>
              ) : (
                projects.slice(0, 8).map((p, i) => {
                  const theme = STATUS_THEME[p.status] || STATUS_THEME.created;
                  return (
                    <div key={`${p.id}-event`} className="relative pl-6">
                      {i !== Math.min(projects.length - 1, 7) && (
                        <div className="absolute left-1.5 top-5 bottom-[-24px] w-px"
                             style={{ background: 'rgba(34,197,94,0.20)' }} />
                      )}
                      <div
                        className="absolute left-0 top-1.5 w-3 h-3 rounded-full"
                        style={{ background: theme.topBar }}
                      />
                      <p className="text-snow text-sm font-bold mb-0.5">{p.name}</p>
                      <p className="text-muted text-xs">
                        Status moved to <span className="font-bold" style={{ color: theme.textColor }}>{p.status}</span>
                      </p>
                      <p className="text-muted text-[10px] mt-1">{new Date(p.created_at).toLocaleString()}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom fade */}
            <div className="h-10 absolute bottom-0 left-0 right-0 rounded-b-2xl pointer-events-none"
                 style={{ background: 'linear-gradient(to top, rgba(240,253,244,0.95), transparent)' }} />
          </div>
        </div>
      </div>

      <ConfirmModal {...confirmModal} />
    </AppShell>
  );
}