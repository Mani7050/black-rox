import { CheckCircle2, XCircle, Activity, Bell } from 'lucide-react';
import type { Toast } from '../types';

interface ToastContainerProps {
  toasts: Toast[];
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 transform translate-y-0 animate-slide-in-right ${
            toast.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300' :
            toast.type === 'error' ? 'bg-rose-950/80 border-rose-500/30 text-rose-300' :
            toast.type === 'warning' ? 'bg-amber-950/80 border-amber-500/30 text-amber-300' :
            'bg-card/90 border-border/50 text-primary'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 mt-0.5 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <XCircle className="w-5 h-5 mt-0.5 text-rose-400 shrink-0" />}
          {toast.type === 'warning' && <Activity className="w-5 h-5 mt-0.5 text-amber-400 shrink-0" />}
          {toast.type === 'info' && <Bell className="w-5 h-5 mt-0.5 text-primary shrink-0" />}
          <div className="flex-1">
            <h4 className="font-semibold text-xs uppercase tracking-wider">{toast.title}</h4>
            <p className="text-sm mt-0.5 opacity-90 text-foreground">{toast.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
