import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Users, FolderPlus, Map, BarChart3,
  ChevronLeft, ChevronRight, LogOut, Leaf, X, ChevronDown,
} from 'lucide-react';

/* ── Admin navigation items ──────────────────────────────────── */
const ADMIN_NAV = [
  { label: 'Dashboard',   icon: LayoutDashboard, path: '/admin',              exact: true },
  { label: 'Clients',     icon: Users,           path: '/admin/clients',       exact: false },
  { label: 'New Project', icon: FolderPlus,      path: '/admin/projects/new',  exact: false },
];

/* ── Sidebar inner content shared between desktop & mobile ──── */
function SidebarContent({
  collapsed,
  isMobile,
  onToggle,
  user,
  navigate,
  location,
  handleLogout,
  // client-only
  projects,
  selectedProjectId,
  onProjectChange,
  activeView,
  onViewChange,
}) {
  const initials = user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  const isAdmin = user?.role === 'admin';

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  /* ── Nav link ─────────────────────────── */
  const NavLink = ({ item }) => {
    const active = isActive(item);
    const Icon = item.icon;
    return (
      <button
        onClick={() => navigate(item.path)}
        title={collapsed && !isMobile ? item.label : undefined}
        className={`
          group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
          transition-all duration-200 cursor-pointer
          ${active
            ? 'bg-primary/10 text-primary'
            : 'text-muted hover:text-snow hover:bg-elevated'
          }
        `}
      >
        {/* Active indicator */}
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
        )}
        <Icon size={18} className={`flex-shrink-0 ${active ? 'text-primary' : ''}`} />
        {(!collapsed || isMobile) && <span className="truncate">{item.label}</span>}

        {/* Collapsed tooltip */}
        {collapsed && !isMobile && (
          <span className="
            absolute left-full ml-3 px-2.5 py-1.5 bg-elevated border border-edge
            text-snow text-xs rounded-lg whitespace-nowrap z-50
            opacity-0 group-hover:opacity-100 pointer-events-none
            transition-opacity duration-150 shadow-xl
          ">
            {item.label}
          </span>
        )}
      </button>
    );
  };

  /* ── Client view toggle ───────────────── */
  const ViewButton = ({ view, icon: Icon, label }) => (
    <button
      onClick={() => onViewChange?.(view)}
      title={collapsed && !isMobile ? label : undefined}
      className={`
        group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
        transition-all duration-200 cursor-pointer
        ${activeView === view
          ? 'bg-primary/10 text-primary'
          : 'text-muted hover:text-snow hover:bg-elevated'
        }
      `}
    >
      {activeView === view && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
      )}
      <Icon size={18} className="flex-shrink-0" />
      {(!collapsed || isMobile) && <span className="truncate">{label}</span>}
      {collapsed && !isMobile && (
        <span className="
          absolute left-full ml-3 px-2.5 py-1.5 bg-elevated border border-edge
          text-snow text-xs rounded-lg whitespace-nowrap z-50
          opacity-0 group-hover:opacity-100 pointer-events-none
          transition-opacity duration-150 shadow-xl
        ">
          {label}
        </span>
      )}
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ──────────────────────── */}
      <div className={`flex items-center h-16 px-3 border-b border-edge flex-shrink-0 ${collapsed && !isMobile ? 'justify-center' : 'justify-between'}`}>
        {(!collapsed || isMobile) && (
          <button onClick={() => navigate(isAdmin ? '/admin' : '/')} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
              <Leaf size={16} className="text-navy" />
            </div>
            <span className="font-bold text-snow text-base tracking-tight">PlantView</span>
          </button>
        )}
        {collapsed && !isMobile && (
          <button onClick={() => navigate(isAdmin ? '/admin' : '/')} className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center hover:opacity-80 transition-opacity">
            <Leaf size={16} className="text-navy" />
          </button>
        )}

        {/* Toggle / close button */}
        {isMobile ? (
          <button onClick={onToggle} className="p-1.5 rounded-lg text-muted hover:text-snow hover:bg-elevated transition-colors">
            <X size={18} />
          </button>
        ) : (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-muted hover:text-snow hover:bg-elevated transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* ── Navigation ──────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">

        {/* Admin nav */}
        {isAdmin && ADMIN_NAV.map((item) => (
          <NavLink key={item.path} item={item} />
        ))}

        {/* Client: Project selector + view toggle */}
        {!isAdmin && (
          <div className="space-y-1">
            {/* Project selector */}
            {projects && projects.length > 0 && (!collapsed || isMobile) && (
              <div className="px-3 mb-3">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Project</p>
                <div className="relative">
                  <select
                    value={selectedProjectId || ''}
                    onChange={(e) => onProjectChange?.(e.target.value)}
                    className="input-base text-xs rounded-lg py-2 pl-3 pr-7 appearance-none cursor-pointer"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>
              </div>
            )}

            {/* View toggle */}
            <ViewButton view="map" icon={Map} label="Map View" />
            <ViewButton view="analytics" icon={BarChart3} label="Analytics" />
          </div>
        )}
      </nav>

      {/* ── User + Logout ────────────────── */}
      <div className="flex-shrink-0 border-t border-edge px-2 py-3 space-y-1">
        {/* User info */}
        <div className={`flex items-center gap-3 px-3 py-2 ${collapsed && !isMobile ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 flex items-center justify-center text-xs font-bold text-navy flex-shrink-0">
            {initials}
          </div>
          {(!collapsed || isMobile) && (
            <div className="min-w-0">
              <p className="text-snow text-xs font-semibold truncate">{user?.full_name}</p>
              <p className="text-muted text-[10px] capitalize">{user?.role}</p>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={collapsed && !isMobile ? 'Log Out' : undefined}
          className="group relative flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-muted hover:text-danger hover:bg-danger/10 transition-all duration-200"
        >
          <LogOut size={16} className="flex-shrink-0" />
          {(!collapsed || isMobile) && <span>Log Out</span>}
          {collapsed && !isMobile && (
            <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-elevated border border-edge text-snow text-xs rounded-lg whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-xl">
              Log Out
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Main Sidebar component ─────────────────────────────────── */
export default function Sidebar({
  collapsed, onToggle,
  mobileOpen, onMobileClose,
  projects, selectedProjectId, onProjectChange,
  activeView, onViewChange,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };
  const sharedProps = {
    user, navigate, location, handleLogout,
    projects, selectedProjectId, onProjectChange, activeView, onViewChange,
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-card border-r border-edge flex-shrink-0 sidebar-transition overflow-hidden ${collapsed ? 'w-16' : 'w-60'}`}
      >
        <SidebarContent collapsed={collapsed} onToggle={onToggle} isMobile={false} {...sharedProps} />
      </aside>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-edge z-40 flex flex-col lg:hidden transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent
          collapsed={false}
          isMobile={true}
          onToggle={onMobileClose}
          navigate={(path) => { navigate(path); onMobileClose(); }}
          {...sharedProps}
        />
      </aside>
    </>
  );
}
