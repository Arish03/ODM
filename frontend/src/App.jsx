import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';
import api from './api/client';

// Pages
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProjectWizard from './pages/admin/ProjectWizard';
import AdminClients from './pages/admin/AdminClients';
import MapView from './pages/client/MapView';
import AnalyticsView from './pages/client/AnalyticsView';

/* ── Client Portal — manages project + view state ──────────── */
function ClientPortal() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [activeView, setActiveView] = useState('map');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await api.get('/projects');
        setProjects(res.data.projects);
        if (res.data.projects.length > 0) {
          setSelectedProjectId(res.data.projects[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch projects', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-navy">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-edge border-t-primary rounded-full animate-spin" />
          <p className="text-muted text-sm">Loading projects…</p>
        </div>
      </div>
    );
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  if (projects.length === 0) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-full gap-4 py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-elevated border border-edge flex items-center justify-center text-3xl">
            📂
          </div>
          <h2 className="text-snow text-xl font-semibold">No Projects Assigned</h2>
          <p className="text-muted text-sm max-w-xs">
            You don't have any projects assigned yet. Please contact an administrator.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      projects={projects}
      selectedProjectId={selectedProjectId}
      onProjectChange={setSelectedProjectId}
      activeView={activeView}
      onViewChange={setActiveView}
    >
      {activeView === 'map' ? (
        <MapView project={selectedProject} />
      ) : (
        <AnalyticsView project={selectedProject} onLocateOnMap={() => setActiveView('map')} />
      )}
    </AppShell>
  );
}

/* ── Root App ───────────────────────────────────────────────── */
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/projects/new"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ProjectWizard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/clients"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminClients />
                </ProtectedRoute>
              }
            />

            {/* Client route */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ClientPortal />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}