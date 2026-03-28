import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

/**
 * AppShell — the master layout wrapper used by all protected pages.
 * Renders sidebar (collapsible desktop + mobile drawer) + main content area.
 *
 * Client-specific props (projects, selectedProjectId, onProjectChange,
 * activeView, onViewChange) are optional — passed only by ClientPortal.
 */
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
    <div className="flex h-screen bg-navy overflow-hidden">
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar — only visible on small screens */}
        <div className="flex items-center h-14 px-4 bg-card border-b border-edge flex-shrink-0 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-muted hover:text-snow hover:bg-elevated transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="ml-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-navy text-xs font-bold">P</span>
            </div>
            <span className="font-semibold text-snow text-sm">PlantView</span>
          </div>
        </div>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
