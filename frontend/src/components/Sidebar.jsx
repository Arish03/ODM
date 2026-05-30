import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Users, FolderPlus, Map, BarChart3,
  LogOut, Leaf, X, ChevronDown, ChevronLeft, ChevronRight,
  HelpCircle, Info,
} from 'lucide-react';

/* ── Admin navigation items ──────────────────────────────────── */
const ADMIN_NAV = [
  { label: 'Dashboard',   icon: LayoutDashboard, path: '/admin',             exact: true  },
  { label: 'Clients',     icon: Users,           path: '/admin/clients',      exact: false },
  { label: 'New Project', icon: FolderPlus,      path: '/admin/projects/new', exact: false },
];

/* ── Shared sidebar inner content ────────────────────────────── */
function SidebarContent({
  collapsed, isMobile, onToggle, user, navigate, location, handleLogout,
  projects, selectedProjectId, onProjectChange, activeView, onViewChange,
}) {
  const initials = user?.full_name
    ?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  const isAdmin = user?.role === 'admin';

  const isActive = (item) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  /* ── Nav link ─────────────────────────── */
  const NavLink = ({ item }) => {
    const active = isActive(item);
    const Icon = item.icon;
    return (
      <button
        onClick={() => navigate(item.path)}
        title={collapsed && !isMobile ? item.label : undefined}
        className={`
          group relative flex items-center gap-4 w-full rounded-xl text-sm font-bold uppercase tracking-wider
          transition-all duration-200 cursor-pointer text-white
          ${collapsed && !isMobile ? 'px-0 py-3 justify-center' : 'px-4 py-3'}
          ${active ? 'sidebar-nav-active' : 'hover:bg-white/10'}
        `}
      >
        <Icon size={18} className="flex-shrink-0 opacity-90" strokeWidth={1.8} />
        {(!collapsed || isMobile) && <span className="truncate">{item.label}</span>}

        {/* Collapsed tooltip */}
        {collapsed && !isMobile && (
          <span className="
            absolute left-full ml-3 px-3 py-1.5 text-snow text-xs rounded-lg whitespace-nowrap z-50
            opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150
            shadow-xl glass-card
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
        group relative flex items-center gap-4 w-full rounded-xl text-sm font-bold uppercase tracking-wider
        transition-all duration-200 cursor-pointer text-white
        ${collapsed && !isMobile ? 'px-0 py-3 justify-center' : 'px-4 py-3'}
        ${activeView === view ? 'sidebar-nav-active' : 'hover:bg-white/10'}
      `}
    >
      <Icon size={18} className="flex-shrink-0 opacity-90" strokeWidth={1.8} />
      {(!collapsed || isMobile) && <span className="truncate">{label}</span>}
      {collapsed && !isMobile && (
        <span className="
          absolute left-full ml-3 px-3 py-1.5 text-snow text-xs rounded-lg whitespace-nowrap z-50
          opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity glass-card shadow-xl
        ">
          {label}
        </span>
      )}
    </button>
  );

  return (
    <div className="flex flex-col h-full sidebar-forest">
      {/* ── Brand Header ─────────────────── */}
      <div className={`flex items-center h-16 px-3 flex-shrink-0 relative ${collapsed && !isMobile ? 'justify-center transition-all' : 'justify-between'}`}>
        {/* Logo Container (Background Div style) */}
        {(!collapsed || isMobile) ? (
          <button
            onClick={() => navigate(isAdmin ? '/admin' : '/')}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div
              className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md flex-shrink-0 shadow-lg"
              style={{
                backgroundImage: 'url(/logo.png)',
                backgroundSize: '100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
            <span className="font-extrabold text-white text-[20px] tracking-[0.12em] uppercase whitespace-nowrap overflow-hidden">lansub</span>
          </button>
        ) : (
          <button
            onClick={() => navigate(isAdmin ? '/admin' : '/')}
            className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex-shrink-0 hover:opacity-80 shadow-lg"
            style={{
              backgroundImage: 'url(/logo.png)',
              backgroundSize: '75%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        )}

        {/* Global Toggle (Always at Top Right on Desktop) */}
        {!isMobile && (
          <button
            onClick={onToggle}
            className={`
              absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white
              flex items-center justify-center text-white shadow-xl hover:scale-110 active:scale-95 transition-all z-[60]
              ${collapsed ? 'opacity-100' : 'opacity-0 group-hover/sidebar:opacity-100'} 
            `}
            style={{ opacity: collapsed ? 1 : undefined }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={12} strokeWidth={3} /> : <ChevronLeft size={12} strokeWidth={3} />}
          </button>
        )}

        {/* Mobile Close Button */}
        {isMobile && (
          <button onClick={onToggle} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      {/* White divider */}
      <div className="mx-4 h-px bg-white/20 flex-shrink-0" />

      {/* ── Navigation ──────────────────── */}
      <nav className={`flex-1 overflow-y-auto py-4 space-y-1 ${collapsed && !isMobile ? 'px-2' : 'px-4'}`}>

        {/* Admin nav */}
        {isAdmin && ADMIN_NAV.map((item) => (
          <NavLink key={item.path} item={item} />
        ))}

        {/* Client: Project selector + view toggle */}
        {!isAdmin && (
          <div className="space-y-1">
            {/* Project selector */}
            {projects && projects.length > 0 && (!collapsed || isMobile) && (
              <div className="mb-3">
                <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 px-1">Project</p>
                <div className="relative">
                  <select
                    value={selectedProjectId || ''}
                    onChange={(e) => onProjectChange?.(e.target.value)}
                    className="w-full bg-white/15 border border-white/20 text-white text-xs rounded-xl py-2 pl-3 pr-7
                      appearance-none cursor-pointer focus:outline-none focus:border-white/40 backdrop-blur-sm"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id} className="bg-navy text-white">{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
                </div>
              </div>
            )}

            <ViewButton view="map"       icon={Map}      label="Map View"   />
            <ViewButton view="analytics" icon={BarChart3} label="Analytics" />
          </div>
        )}

        {/* Admin: Project viewer (Map + Analytics) when navigated from dashboard */}
        {isAdmin && projects && projects.length > 0 && onViewChange && (
          <div className="space-y-1">
            <div className={`mt-2 mb-1 ${collapsed && !isMobile ? 'px-0' : 'px-1'}`}>
              <div className="h-px bg-white/15 mb-3" />
              {(!collapsed || isMobile) && (
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">Project Viewer</p>
              )}
            </div>

            {/* Project selector */}
            {(!collapsed || isMobile) && (
              <div className="mb-3">
                <div className="relative">
                  <select
                    value={selectedProjectId || ''}
                    onChange={(e) => onProjectChange?.(e.target.value)}
                    className="w-full bg-white/15 border border-white/20 text-white text-xs rounded-xl py-2 pl-3 pr-7
                      appearance-none cursor-pointer focus:outline-none focus:border-white/40 backdrop-blur-sm"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id} className="bg-navy text-white">{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
                </div>
              </div>
            )}

            <ViewButton view="map"       icon={Map}      label="Map View"   />
            <ViewButton view="analytics" icon={BarChart3} label="Analytics" />
          </div>
        )}
        {/* Global links */}
        <div className="pt-4 border-t border-white/10 space-y-1">
          <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 px-4">Resources</p>
          <button
            onClick={() => navigate('/how-to-use')}
            className={`
              group relative flex items-center gap-4 w-full rounded-xl text-xs font-bold uppercase tracking-widest
              text-white/70 hover:text-white hover:bg-white/10 transition-all
              ${collapsed && !isMobile ? 'px-0 py-3 justify-center' : 'px-4 py-2.5'}
              ${location.pathname === '/how-to-use' ? 'sidebar-nav-active' : ''}
            `}
          >
            <HelpCircle size={16} />
            {(!collapsed || isMobile) && <span>How to Use</span>}
          </button>
          <button
            onClick={() => navigate('/about-us')}
            className={`
              group relative flex items-center gap-4 w-full rounded-xl text-xs font-bold uppercase tracking-widest
              text-white/70 hover:text-white hover:bg-white/10 transition-all
              ${collapsed && !isMobile ? 'px-0 py-3 justify-center' : 'px-4 py-2.5'}
              ${location.pathname === '/about-us' ? 'sidebar-nav-active' : ''}
            `}
          >
            <Info size={16} />
            {(!collapsed || isMobile) && <span>About Us</span>}
          </button>
        </div>
      </nav>

      {/* White divider */}
      <div className="mx-4 h-px bg-white/20 flex-shrink-0" />

      {/* ── User + Logout ────────────────── */}
      <div className={`flex-shrink-0 py-4 space-y-1 ${collapsed && !isMobile ? 'px-2' : 'px-4'}`}>


        {/* User info */}
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-3 px-1 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-white flex-shrink-0 border-2 border-white/20">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-bold truncate">{user?.full_name}</p>
              <p className="text-white/50 text-[10px] capitalize">{user?.role}</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={collapsed && !isMobile ? 'Log Out' : undefined}
          className={`
            group relative flex items-center gap-4 w-full rounded-xl text-sm font-bold uppercase tracking-wider
            text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200
            ${collapsed && !isMobile ? 'px-0 py-3 justify-center' : 'px-4 py-3'}
          `}
        >
          <LogOut size={16} className="flex-shrink-0" strokeWidth={1.8} />
          {(!collapsed || isMobile) && <span>Log Out</span>}
          {collapsed && !isMobile && (
            <span className="absolute left-full ml-3 px-3 py-1.5 glass-card text-snow text-xs rounded-lg whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl">
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
        className={`hidden lg:flex flex-col flex-shrink-0 sidebar-transition relative group/sidebar ${collapsed ? 'w-16' : 'w-64'}`}
        style={{ boxShadow: '4px 0 24px rgba(5,46,22,0.15)', zIndex: 40 }}
      >
        <SidebarContent collapsed={collapsed} onToggle={onToggle} isMobile={false} {...sharedProps} />
      </aside>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40 flex flex-col lg:hidden transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ boxShadow: '4px 0 32px rgba(5,46,22,0.25)' }}
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
