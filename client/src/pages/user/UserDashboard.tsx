interface Credential {
  id: string;
  status: string;
  funds?: number;
}

interface Strategy {
  id: string;
  status: string;
}

interface Trade {
  id: string;
}

interface UserDashboardProps {
  user: { name: string; lotMultiplier?: number } | null;
  overallPnl: number;
  strategies: Strategy[];
  credentials: Credential[];
  trades: Trade[];
  isAutoTradingOn: boolean;
  setIsAutoTradingOn: (val: boolean | ((prev: boolean) => boolean)) => void;
  addToast: (type: string, title: string, msg: string) => void;
  pnlHistory: { time: string; pnl: number }[];
  customMultiplier: string;
  setCustomMultiplier: (val: string) => void;
  handleUpdateLotMultiplier: (val: number) => void;
}

function getChartPoints(pnlHistory: { pnl: number }[]): string {
  if (pnlHistory.length < 2) return '';
  const max = Math.max(...pnlHistory.map(p => p.pnl));
  const min = Math.min(...pnlHistory.map(p => p.pnl));
  const range = max - min || 1;
  return pnlHistory.map((p, i) => {
    const x = 15 + (i / (pnlHistory.length - 1)) * 570;
    const y = 165 - ((p.pnl - min) / range) * 150;
    return `${x},${y}`;
  }).join(' ');
}

function getChartAreaPoints(pnlHistory: { pnl: number }[]): string {
  if (pnlHistory.length < 2) return '';
  const pts = getChartPoints(pnlHistory);
  const first = pts.split(' ')[0].split(',')[0];
  const last = pts.split(' ').at(-1)!.split(',')[0];
  return `${pts} ${last},165 ${first},165`;
}

export default function UserDashboard({
  user,
  overallPnl,
  strategies,
  credentials,
  trades,
  isAutoTradingOn,
  setIsAutoTradingOn,
  addToast,
  pnlHistory,
  customMultiplier,
  setCustomMultiplier,
  handleUpdateLotMultiplier,
}: UserDashboardProps) {
  const totalFunds = credentials
    .filter(c => c.status === 'connected')
    .reduce((acc, c) => acc + (c.funds || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Trading Overview</h2>
          <p className="text-xs text-muted-foreground">
            Welcome back, <span className="text-primary font-semibold">{user?.name}</span>. Monitor algorithms, active positions and margins.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Auto-Trading:</span>
          <button
            onClick={() => {
              setIsAutoTradingOn((prev: boolean) => !prev);
              addToast(
                isAutoTradingOn ? 'warning' : 'success',
                'Auto-Trading Switch',
                `Automated trades have been ${isAutoTradingOn ? 'PAUSED' : 'RESUMED'}`
              );
            }}
            className={`px-3 py-1.5 rounded-none text-xs font-bold border transition-colors cursor-pointer ${
              isAutoTradingOn
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
            }`}
          >
            {isAutoTradingOn ? '● Active (Monitoring)' : '○ Paused (Manual Mode)'}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-5 rounded-none">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Net Profit / Loss</span>
          <span className={`text-3xl font-black block mt-1 ${overallPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            ₹{overallPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-muted-foreground block mt-2">Today's live trading results</span>
        </div>

        <div className="bg-card border border-border p-5 rounded-none">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Running Algorithms</span>
          <span className="text-3xl font-black text-foreground block mt-1">
            {strategies.filter(s => s.status === 'active').length}
          </span>
          <span className="text-[10px] text-muted-foreground block mt-2">Active scanners tracking symbols</span>
        </div>

        <div className="bg-card border border-border p-5 rounded-none">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Broker Margins</span>
          <span className="text-3xl font-black text-foreground block mt-1">
            ₹{totalFunds.toLocaleString()}
          </span>
          <span className="text-[10px] text-muted-foreground block mt-2">Total funds across connected Demat</span>
        </div>

        <div className="bg-card border border-border p-5 rounded-none">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Trades Executed</span>
          <span className="text-3xl font-black text-foreground block mt-1">{trades.length}</span>
          <span className="text-[10px] text-emerald-500 font-semibold block mt-2">100% order fill rate</span>
        </div>
      </div>

      {/* Chart & Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* P&L Curve Chart */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-none flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-md font-bold text-foreground">Real-time P&L Yield Curve</h3>
            <p className="text-xs text-muted-foreground">Visualizing net profit performance variance updated dynamically</p>
          </div>
          <div className="mt-6 flex-1 flex items-center justify-center min-h-[180px]">
            <svg viewBox="0 0 600 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="15" y1="15" x2="585" y2="15" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4,4" />
              <line x1="15" y1="95" x2="585" y2="95" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4,4" />
              <line x1="15" y1="165" x2="585" y2="165" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4,4" />
              {pnlHistory.length > 1 && (
                <>
                  <polygon points={getChartAreaPoints(pnlHistory)} fill="url(#curveGrad)" />
                  <polyline fill="none" stroke="#10b981" strokeWidth="2.5" points={getChartPoints(pnlHistory)} />
                </>
              )}
            </svg>
          </div>
        </div>

        {/* Lot Sizing Controls */}
        <div className="bg-card border border-border p-5 rounded-none flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Volume Sizing Controls</h3>
            <p className="text-xs text-muted-foreground">Scale trading lot size multiplier dynamically</p>
          </div>

          <div className="my-5 space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Current Multiplier:</span>
              <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                {user?.lotMultiplier?.toFixed(2) || '1.00'}x
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[0.5, 1.0, 2.0, 5.0].map(mult => (
                <button
                  key={mult}
                  onClick={() => handleUpdateLotMultiplier(mult)}
                  className={`py-1.5 rounded-none border text-xs font-bold transition-all cursor-pointer ${
                    user?.lotMultiplier === mult
                      ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                      : 'bg-background border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {mult}x
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="Custom (e.g. 1.5)"
                value={customMultiplier}
                onChange={e => setCustomMultiplier(e.target.value)}
                className="w-full bg-background border border-border rounded-none px-3 py-1.5 text-xs outline-none focus:border-primary"
              />
              <button
                onClick={() => customMultiplier && handleUpdateLotMultiplier(parseFloat(customMultiplier))}
                className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-none transition-colors shrink-0 cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
            💡 A strategy targeting 25 lots executes exactly{' '}
            <strong>{Math.round(25 * (user?.lotMultiplier || 1.0))} lots</strong> on your Demat.
          </p>
        </div>
      </div>
    </div>
  );
}
