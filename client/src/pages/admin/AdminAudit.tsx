interface AuditLog { timestamp: string; type: string; source: string; message: string; }
interface AdminAuditProps { auditLogsList: AuditLog[]; }

export default function AdminAudit({ auditLogsList }: AdminAuditProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-bold text-foreground">Audit Compliance Log</h2>
        <p className="text-xs text-muted-foreground">Secured ledger recording user logins, status modifications, and risk limit changes</p>
      </div>
      <div className="bg-background border border-border rounded-none p-5 font-mono text-[12px] overflow-y-auto max-h-[500px]">
        {auditLogsList.map((log, idx) => (
          <div key={idx} className="flex gap-3 hover:bg-muted/10 py-1 px-2 rounded border-b border-border/20 last:border-0">
            <span className="text-muted-foreground select-none">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
            <span className="text-primary font-bold">[{log.type.toUpperCase()}]</span>
            <span className="text-muted-foreground font-bold">{log.source}:</span>
            <span className="text-foreground/90">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
