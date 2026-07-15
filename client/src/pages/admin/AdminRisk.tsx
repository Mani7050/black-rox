interface AdminRiskProps { addToast: (type: string, title: string, msg: string) => void; }

export default function AdminRisk({ addToast }: AdminRiskProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-bold text-foreground">Global Platform Risk Controls</h2>
        <p className="text-xs text-muted-foreground">Admin panel to configure maximum limit limits, daily trades capping, and safety thresholds</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-5 rounded-none space-y-4">
          <h3 className="text-sm font-bold text-foreground">Sizing Parameters</h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-muted-foreground mb-1.5">Max Lot Limit (Per Plan Order)</label>
              <input type="number" defaultValue="50" className="w-full bg-background border border-border rounded-none px-4 py-2.5 outline-none focus:border-primary text-foreground" />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1.5">Max Daily Trades Capping</label>
              <input type="number" defaultValue="20" className="w-full bg-background border border-border rounded-none px-4 py-2.5 outline-none focus:border-primary text-foreground" />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1.5">Max Capital (Margin Utilization per User)</label>
              <input type="number" defaultValue="2500000" className="w-full bg-background border border-border rounded-none px-4 py-2.5 outline-none focus:border-primary text-foreground" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border p-5 rounded-none space-y-4">
          <h3 className="text-sm font-bold text-foreground">Loss Prevention Limits</h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-muted-foreground mb-1.5">Max Daily Loss Limit per Account (₹)</label>
              <input type="number" defaultValue="25000" className="w-full bg-background border border-border rounded-none px-4 py-2.5 outline-none focus:border-primary text-foreground" />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1.5">Max Open Positions Count</label>
              <input type="number" defaultValue="5" className="w-full bg-background border border-border rounded-none px-4 py-2.5 outline-none focus:border-primary text-foreground" />
            </div>
            <button
              onClick={() => addToast('success', 'Risk Configuration Applied', 'Successfully updated global safety boundaries.')}
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-none transition-all shadow mt-6 cursor-pointer hover:opacity-90"
            >
              Save Global Safety Constraints
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
