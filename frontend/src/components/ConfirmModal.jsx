import { AlertTriangle, Info, CheckCircle2, XCircle, X } from 'lucide-react';

const TYPE_CFG = {
  info:    { icon: Info,          accentColor: '#22c55e', iconBg: 'rgba(34,197,94,0.12)',  iconColor: '#22c55e'  },
  warning: { icon: AlertTriangle, accentColor: '#f59e0b', iconBg: 'rgba(245,158,11,0.12)', iconColor: '#d97706'  },
  danger:  { icon: XCircle,       accentColor: '#ef4444', iconBg: 'rgba(239,68,68,0.12)',  iconColor: '#dc2626'  },
  success: { icon: CheckCircle2,  accentColor: '#16a34a', iconBg: 'rgba(22,163,74,0.12)',  iconColor: '#15803d'  },
};

export default function ConfirmModal({
  show, title, message,
  confirmLabel = 'OK', cancelLabel,
  type = 'info', onConfirm, onCancel,
}) {
  if (!show) return null;

  const cfg  = TYPE_CFG[type] || TYPE_CFG.info;
  const Icon = cfg.icon;

  const btnStyle = type === 'danger'
    ? { background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 12px rgba(239,68,68,0.30)' }
    : { background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 4px 12px rgba(34,197,94,0.30)' };

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center p-4"
      style={{ background: 'rgba(5,46,22,0.25)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}
    >
      <div
        className="w-full max-w-sm relative overflow-hidden rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.90)',
          backdropFilter: 'blur(32px)',
          border: `1px solid ${cfg.accentColor}35`,
          boxShadow: `0 24px 64px ${cfg.accentColor}20, 0 8px 24px rgba(0,0,0,0.08)`,
        }}
      >
        {/* Top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
          style={{ background: `linear-gradient(90deg, ${cfg.accentColor}, transparent)` }}
        />

        {/* Header */}
        <div className="flex items-start gap-3 p-5 pb-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: cfg.iconBg }}
          >
            <Icon size={18} style={{ color: cfg.iconColor }} />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h2 className="text-snow text-base font-bold leading-tight">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-muted hover:text-snow transition-colors flex-shrink-0 p-0.5"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-4">
          <p className="text-subtle text-sm leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2.5 px-5 pb-5 pt-3"
          style={{ borderTop: '1px solid rgba(34,197,94,0.12)' }}
        >
          {cancelLabel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-subtle text-sm font-medium hover:text-snow transition-colors"
              style={{ border: '1px solid rgba(34,197,94,0.22)' }}
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-white text-sm font-bold hover:opacity-90 transition-opacity"
            style={btnStyle}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}