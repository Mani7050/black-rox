interface Strategy { id: string; name: string; instrument: string; type: string; status: string; capital: number; pnl: number; }
interface AdminTradingProps { strategies: Strategy[]; handleToggleStrategy: (id: string) => void; }

export default function AdminTrading({ strategies, handleToggleStrategy }: AdminTradingProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-bold text-foreground">Platform Trading Management</h2>
        <p className="text-xs text-muted-foreground">Monitor running strategy instances, view system-wide transaction metrics and order execution flows</p>
      </div>
      <div className="bg-card border border-border rounded-none p-5">
        <h3 className="text-sm font-bold text-foreground mb-4">Active Deployments</h3>
        <div className="space-y-3">
          {strategies.map(strat => (
            <div key={strat.id} className="flex justify-between items-center p-3 rounded-none border border-border bg-background/50 text-xs">
              <div>
                <p className="font-bold text-foreground">{strat.name}</p>
                <p className="text-muted-foreground text-[10px]">{strat.instrument} • {strat.type}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono">Capital: ₹{strat.capital.toLocaleString()}</span>
                <span className={`font-mono font-bold ${strat.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  PNL: ₹{strat.pnl.toLocaleString()}
                </span>
                <button
                  onClick={() => handleToggleStrategy(strat.id)}
                  className={`px-3 py-1.5 rounded-none font-bold cursor-pointer ${strat.status === 'active' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}
                >
                  {strat.status === 'active' ? 'Stop' : 'Start'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
