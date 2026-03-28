import { useState, useCallback, createContext, useContext, useRef } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle2,
    bar: 'bg-secondary',
    iconColor: 'text-secondary',
    border: 'border-secondary/20',
  },
  error: {
    icon: XCircle,
    bar: 'bg-danger',
    iconColor: 'text-danger',
    border: 'border-danger/20',
  },
  warning: {
    icon: AlertTriangle,
    bar: 'bg-warning',
    iconColor: 'text-warning',
    border: 'border-warning/20',
  },
  info: {
    icon: Info,
    bar: 'bg-primary',
    iconColor: 'text-primary',
    border: 'border-primary/20',
  },
};

function ToastItem({ id, message, type, onRemove }) {
  const cfg = TOAST_CONFIG[type] || TOAST_CONFIG.info;
  const Icon = cfg.icon;

  return (
    <div
      className={`toast-enter relative flex items-start gap-3 bg-card border ${cfg.border} rounded-xl px-4 py-3 shadow-2xl min-w-[300px] max-w-sm overflow-hidden`}
    >
      {/* Accent bar */}
      <div className={`absolute top-0 left-0 w-1 h-full ${cfg.bar} rounded-l-xl`} />

      <Icon size={18} className={`${cfg.iconColor} flex-shrink-0 mt-0.5 ml-2`} />
      <span className="text-snow text-sm flex-1 leading-relaxed">{message}</span>
      <button
        onClick={() => onRemove(id)}
        className="text-muted hover:text-snow transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <X size={14} />
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
      {/* Toast container — bottom-right, stacked */}
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
