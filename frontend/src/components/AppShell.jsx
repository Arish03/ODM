import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function AppShell({
  children,
  projects,
  selectedProjectId,
  onProjectChange,
  activeView,
  onViewChange,
}) {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebar-collapsed') === 'true'
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f8fafc' }}>
      {/* Aurora orbs – rendered once behind everything */}
      <div className="aurora-orb-1" />
      <div className="aurora-orb-2" />
      <div className="aurora-orb-3" />

      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={handleToggle}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onProjectChange={onProjectChange}
        activeView={activeView}
        onViewChange={onViewChange}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Mobile top bar */}
        <div className="flex items-center h-14 px-4 border-b border-edge/60 flex-shrink-0 lg:hidden"
             style={{ background: 'rgba(255,255,255,0.80)', backdropFilter: 'blur(16px)' }}>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-muted hover:text-snow hover:bg-elevated transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="ml-3 flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 backdrop-blur-md flex-shrink-0"
              style={{
                backgroundImage: 'url(/logo.png)',
                backgroundSize: '75%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
            <span className="font-bold text-snow text-xs tracking-widest uppercase">Open Drone Map</span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
