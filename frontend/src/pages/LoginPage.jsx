import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Leaf, ArrowRight, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-navy overflow-hidden">

      {/* ── Left panel — decorative ─────────────────────────── */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden bg-gradient-to-br from-navy via-[#0d1a2f] to-navy">
        {/* Glow orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-secondary/8 blur-[80px]" />
        <div className="absolute top-[40%] left-[30%] w-[200px] h-[200px] rounded-full bg-primary/5 blur-[60px]" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#00D1FF 1px, transparent 1px), linear-gradient(90deg, #00D1FF 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center h-full px-16">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
              <Leaf size={22} className="text-navy" />
            </div>
            <span className="text-snow text-2xl font-bold tracking-tight">PlantView</span>
          </div>

          <h1 className="text-snow text-4xl font-bold leading-tight mb-4">
            GIS-Powered<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Plantation Analytics
            </span>
          </h1>
          <p className="text-muted text-base leading-relaxed max-w-md mb-12">
            Process drone imagery, visualize tree inventories, and monitor plantation health with precision geospatial tools.
          </p>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-3">
            {['Drone Imagery', 'Tree Detection', 'Health Analysis', 'GIS Mapping'].map((f) => (
              <span
                key={f}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-elevated border border-edge text-subtle"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative z-10 px-16 py-6 border-t border-edge/50">
          <p className="text-muted text-xs">© 2025 PlantView · Plantation Intelligence Platform</p>
        </div>
      </div>

      {/* ── Right panel — login form ─────────────────────────── */}
      <div className="flex flex-col items-center justify-center w-full lg:w-[420px] xl:w-[480px] bg-card border-l border-edge flex-shrink-0 px-8 py-12 relative overflow-hidden">
        {/* Subtle glow top right */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm relative z-10">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Leaf size={18} className="text-navy" />
            </div>
            <span className="text-snow text-xl font-bold">PlantView</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-snow text-2xl font-bold mb-1.5">Welcome back</h2>
            <p className="text-muted text-sm">Sign in to your account to continue</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 px-4 py-3 bg-danger/10 border border-danger/30 rounded-xl">
              <Lock size={14} className="text-danger mt-0.5 flex-shrink-0" />
              <p className="text-danger text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-subtle text-xs font-semibold mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  autoFocus
                  className="input-base pl-10 pr-4 py-3 rounded-xl"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-subtle text-xs font-semibold mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="input-base pl-10 pr-11 py-3 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-snow transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-navy font-semibold text-sm rounded-xl py-3 mt-2 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-navy/40 border-t-navy rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          {/* Demo creds (subtle) */}
          <div className="mt-8 p-3.5 bg-elevated/60 border border-edge rounded-xl">
            <p className="text-muted text-[10px] font-semibold uppercase tracking-wider mb-2">Demo Access</p>
            <div className="space-y-0.5">
              <p className="text-subtle text-xs">Admin: <span className="font-mono text-snow">admin / admin123</span></p>
              <p className="text-subtle text-xs">Client: <span className="font-mono text-snow">client / client123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}