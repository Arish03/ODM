import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Cpu, CheckCircle2, ShieldCheck, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import api from '../../api/client';
import AppShell from '../../components/AppShell';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/Toast';

/* ── Status badge config ─────────────────────────────────── */
const STATUS_CFG = {
  created:    { label: 'Created',    cls: 'bg-subtle/10 text-subtle border-subtle/20' },
  unassigned: { label: 'Unassigned', cls: 'bg-primary/10 text-primary border-primary/20' },
  uploading:  { label: 'Uploading',  cls: 'bg-primary/10 text-primary border-primary/20' },
  processing: { label: 'Processing', cls: 'bg-warning/10 text-warning border-warning/20', dot: true },
  ready:      { label: 'Ready',      cls: 'bg-secondary/10 text-secondary border-secondary/20' },
  error:      { label: 'Error',      cls: 'bg-danger/10 text-danger border-danger/20' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.created;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      {cfg.dot && <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />}
      {cfg.label}
    </span>
  );
}

/* ── KPI card ────────────────────────────────────────────── */
function KpiCard({ label, value, sub, icon: Icon, glow, accent }) {
  return (
    <div className={`relative bg-card border border-edge rounded-2xl p-5 overflow-hidden hover:-translate-y-0.5 transition-transform duration-200`}>
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${accent}`} />
      {/* Icon */}
      <div className={`absolute top-4 right-4 w-9 h-9 rounded-xl ${glow} flex items-center justify-center`}>
        <Icon size={18} className="opacity-80" />
      </div>
      <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-2">{label}</p>
      <p className="text-snow text-3xl font-black leading-none mb-1">{value}</p>
      <p className="text-muted text-xs">{sub}</p>
    </div>
  );
}

/* ── Skeleton row ────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr className="border-b border-edge/50">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3.5 bg-elevated rounded-full animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  );
}

/* ── Main Component ──────────────────────────────────────── */
export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState({ total: 0, processing: 0, ready: 0 });
  const [confirmModal, setConfirmModal] = useState({ show: false });
  const navigate = useNavigate();
  const toast = useToast();

  const computeMetrics = (list) => {
    const m = list.reduce(
      (acc, p) => {
        acc.total++;
        if (p.status === 'processing') acc.processing++;
        if (p.status === 'ready') acc.ready++;
        return acc;
      },
      { total: 0, processing: 0, ready: 0 }
    );
    setMetrics(m);
  };

  const fetchProjects = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get('/projects');
      setProjects(res.data.projects);
      computeMetrics(res.data.projects);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    const interval = setInterval(() => fetchProjects(true), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteProject = (project) => {
    setConfirmModal({
      show: true,
      title: 'Delete Project',
      message: `Are you sure you want to permanently delete "${project.name}"? All tiles and uploaded data will be removed.`,
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
          toast.error('Failed to delete project. Please try again.');
        }
      },
      onCancel: () => setConfirmModal({ show: false }),
    });
  };

  return (
    <AppShell>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* ── Page header ─────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-snow text-2xl font-bold mb-0.5">Dashboard</h1>
            <p className="text-muted text-sm">Manage plantation projects and data processing.</p>
          </div>
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={() => fetchProjects(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-edge text-subtle hover:text-snow hover:border-subtle text-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => navigate('/admin/clients')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-edge text-subtle hover:text-snow hover:border-subtle text-sm font-medium transition-colors"
            >
              Manage Clients
            </button>
            <button
              onClick={() => navigate('/admin/projects/new')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-navy text-sm font-semibold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all"
            >
              + New Project
            </button>
          </div>
        </div>

        {/* ── KPI cards ───────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total Projects" value={metrics.total} sub="In system"
            icon={FolderOpen} glow="bg-primary/10 text-primary" accent="bg-gradient-to-r from-primary to-primary/50"
          />
          <KpiCard
            label="Processing" value={metrics.processing} sub="Background tasks"
            icon={Cpu} glow="bg-warning/10 text-warning" accent="bg-gradient-to-r from-warning to-warning/50"
          />
          <KpiCard
            label="Ready" value={metrics.ready} sub="Client-accessible"
            icon={CheckCircle2} glow="bg-secondary/10 text-secondary" accent="bg-gradient-to-r from-secondary to-secondary/50"
          />
          <KpiCard
            label="System Status" value="Online" sub="All services healthy"
            icon={ShieldCheck} glow="bg-primary/10 text-primary" accent="bg-gradient-to-r from-primary/60 to-secondary/60"
          />
        </div>

        {/* ── Projects table ──────────────────────── */}
        <div className="bg-card border border-edge rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-edge">
            <h2 className="text-snow font-semibold text-sm">All Projects</h2>
            <span className="text-muted text-xs">{projects.length} total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-edge bg-elevated/40">
                  {['Project Name', 'Location', 'Assigned Client', 'Status', 'Created', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-muted uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-muted text-sm">
                      No projects yet. <button onClick={() => navigate('/admin/projects/new')} className="text-primary hover:underline">Create one</button>
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr key={project.id} className="border-b border-edge/50 hover:bg-elevated/40 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-snow">{project.name}</td>
                      <td className="px-4 py-3.5 text-subtle">{project.location || '—'}</td>
                      <td className="px-4 py-3.5 text-subtle">{project.client_name || <span className="text-muted italic">Unassigned</span>}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={project.status} /></td>
                      <td className="px-4 py-3.5 text-muted text-xs">{new Date(project.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-edge text-subtle hover:text-snow hover:border-subtle text-xs transition-colors"
                          >
                            <ExternalLink size={11} />View
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-edge text-danger/70 hover:text-danger hover:border-danger/40 hover:bg-danger/5 text-xs transition-colors"
                          >
                            <Trash2 size={11} />Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmModal {...confirmModal} />
    </AppShell>
  );
}