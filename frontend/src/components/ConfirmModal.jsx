import { AlertTriangle, Info, CheckCircle2, XCircle, X } from 'lucide-react';

const TYPE_CFG = {
  info:    { icon: Info,          border: 'border-primary/30',   btn: 'bg-primary',   iconCls: 'text-primary'   },
  warning: { icon: AlertTriangle, border: 'border-warning/30',   btn: 'bg-warning',   iconCls: 'text-warning'   },
  danger:  { icon: XCircle,       border: 'border-danger/30',    btn: 'bg-danger',    iconCls: 'text-danger'    },
  success: { icon: CheckCircle2,  border: 'border-secondary/30', btn: 'bg-secondary', iconCls: 'text-secondary' },
};

export default function ConfirmModal({
  show,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel,
  type = 'info',
  onConfirm,
  onCancel,
}) {
  if (!show) return null;

  const cfg = TYPE_CFG[type] || TYPE_CFG.info;
  const Icon = cfg.icon;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[3000] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}
    >
      <div className={`bg-card border ${cfg.border} rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200`}>
        {/* Header */}
        <div className="flex items-start gap-3 p-5 pb-3">
          <div className={`w-9 h-9 rounded-xl bg-elevated flex items-center justify-center flex-shrink-0 ${cfg.iconCls}`}>
            <Icon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-snow text-base font-semibold leading-tight">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-muted hover:text-snow transition-colors flex-shrink-0"
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
        <div className="flex items-center justify-end gap-2.5 px-5 pb-5">
          {cancelLabel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-edge text-subtle text-sm font-medium hover:text-snow hover:border-subtle transition-colors"
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg ${cfg.btn} text-navy text-sm font-semibold hover:opacity-90 transition-opacity`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}