import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Leaf, ArrowRight, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername]       = useState('');
  const [password, setPassword]       = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login }  = useAuth();
  const navigate   = useNavigate();

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
    <div className="flex h-screen overflow-hidden" style={{ background: '#f8fafc' }}>


      {/* ── Left panel — decorative ──────────────────────── */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden sidebar-forest">
        {/* Inner glow orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[120px]"
             style={{ background: 'rgba(34,197,94,0.25)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full blur-[100px]"
             style={{ background: 'rgba(134,239,172,0.20)' }} />



        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center h-full px-16">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-16">
            <div
              className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-2xl flex-shrink-0"
              style={{
                backgroundImage: 'url(/logo.png)',
                backgroundSize: '100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
            <span className="text-white text-3xl font-black tracking-[0.2em] uppercase">Lansub</span>
          </div>

          <h1 className="text-white text-4xl font-black leading-tight mb-4">
            GIS-Powered<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-200">
              Plantation Analytics
            </span>
          </h1>
          <p className="text-white/60 text-base leading-relaxed max-w-md mb-12">
            Process drone imagery, visualize tree inventories, and monitor plantation health with precision geospatial tools.
          </p>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-3">
            {['Drone Imagery', 'Tree Detection', 'Health Analysis', 'GIS Mapping'].map((f) => (
              <span
                key={f}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-white/80 uppercase tracking-wider"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative z-10 px-16 py-6 border-t border-white/10">
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">© 2026 Open Drone Mapping · LanSub Intelligence</p>
        </div>
      </div>

      {/* ── Right panel — login form ─────────────────────── */}
      <div className="flex flex-col items-center justify-center w-full lg:w-[440px] xl:w-[480px] flex-shrink-0 px-8 py-12 relative z-10">
        {/* Glass login card */}
        <div className="w-full max-w-sm glass-modal rounded-3xl p-8 relative overflow-hidden">
          {/* Inner top glow */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden font-black">
            <div
              className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex-shrink-0 backdrop-blur-md shadow-lg"
              style={{
                backgroundImage: 'url(/logo1.png)',
                backgroundSize: '100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
            <span className="text-snow text-xl uppercase tracking-widest font-black">Lansub</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-snow text-2xl font-black mb-1.5">Welcome back</h2>
            <p className="text-muted text-sm">Sign in to your PlantView account</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 px-4 py-3 rounded-xl border"
                 style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' }}>
              <Lock size={14} className="text-danger mt-0.5 flex-shrink-0" />
              <p className="text-danger text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-subtle text-xs font-bold mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <div className="relative group/input">
                <div className="absolute left-12.5 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within/input:text-primary pointer-events-none">
                  <User size={0} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  autoFocus
                  className="input-base pl-15 pr-4 py-3 rounded-xl ring-offset-background placeholder:text-muted/50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-subtle text-xs font-bold mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative group/input">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within/input:text-primary pointer-events-none">
                  <Lock size={0} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="input-base pl-11 pr-11 py-3 rounded-xl placeholder:text-muted/50"
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
              className="w-full flex items-center justify-center gap-2 font-bold text-sm rounded-xl py-3.5 mt-2 text-white
                disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                boxShadow: loading ? 'none' : '0 8px 24px rgba(34,197,94,0.35)',
              }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={15} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}