import { useState, useCallback, createContext, useContext, useRef } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

const TOAST_CONFIG = {
  success: { icon: CheckCircle2, accentColor: '#16a34a', iconColor: '#15803d' },
  error:   { icon: XCircle,      accentColor: '#ef4444', iconColor: '#dc2626' },
  warning: { icon: AlertTriangle,accentColor: '#f59e0b', iconColor: '#d97706' },
  info:    { icon: Info,         accentColor: '#22c55e', iconColor: '#16a34a' },
};

function ToastItem({ id, message, type, onRemove }) {
  const cfg  = TOAST_CONFIG[type] || TOAST_CONFIG.info;
  const Icon = cfg.icon;

  return (
    <div
      className="toast-enter relative flex items-start gap-3 rounded-xl px-4 py-3 min-w-[300px] max-w-sm overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.90)',
        backdropFilter: 'blur(24px)',
        border: `1px solid ${cfg.accentColor}30`,
        boxShadow: `0 8px 24px ${cfg.accentColor}15, 0 4px 12px rgba(0,0,0,0.06)`,
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute top-0 left-0 w-[3px] h-full rounded-l-xl"
        style={{ background: cfg.accentColor }}
      />

      <Icon size={17} className="flex-shrink-0 mt-0.5 ml-2" style={{ color: cfg.iconColor }} />
      <span className="text-snow text-sm flex-1 leading-relaxed">{message}</span>
      <button
        onClick={() => onRemove(id)}
        className="text-muted hover:text-snow transition-colors flex-shrink-0 ml-1"
        aria-label="Dismiss"
      >
        <X size={13} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info') => {
    const id = ++counterRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3800);
  }, [removeToast]);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info:    (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem {...t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
