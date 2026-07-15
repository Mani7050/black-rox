import { FileSpreadsheet, Database, Shield, FileText } from 'lucide-react';

interface Credential { id: string; status: string; }
interface Strategy { id: string; name: string; instrument: string; type: string; status: string; capital: number; pnl: number; }
interface Trade { id: string; }
interface LogEntry { timestamp: string; source: string; message: string; }
interface Broker { id: string; name: string; enabled: boolean; }

interface AdminDashboardProps {
  usersList: { id: string }[];
  credentials: Credential[];
  strategies: Strategy[];
  trades: Trade[];
  overallPnl: number;
  logs: LogEntry[];
  brokers: Broker[];
}

// Inline chart components (re-used from App.tsx)
function Sparkline({ points, color }: { points: number[]; color: string }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const w = 80, h = 32, pad = 2;
  const xs = points.map((_, i) => pad + (i / (points.length - 1)) * (w - 2 * pad));
  const ys = points.map(v => pad + ((max - v) / range) * (h - 2 * pad));
  const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AreaChart({ data }: { data: { label: string; value1: number; value2: number }[] }) {
  const max = Math.max(...data.flatMap(d => [d.value1, d.value2]));
  const w = 100, h = 100;
  const pts1 = data.map((d, i) => [((i / (data.length - 1)) * w), h - (d.value1 / max) * h]);
  const pts2 = data.map((d, i) => [((i / (data.length - 1)) * w), h - (d.value2 / max) * h]);
  const line = (pts: number[][]) => pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
  const area = (pts: number[][]) => `${line(pts)} L${pts[pts.length - 1][0]},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 100 100`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--secondary)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area(pts2)} fill="url(#ag2)" />
      <path d={area(pts1)} fill="url(#ag1)" />
      <path d={line(pts1)} fill="none" stroke="var(--chart-1)" strokeWidth="1.5" />
      <path d={line(pts2)} fill="none" stroke="var(--secondary)" strokeWidth="1.5" />
    </svg>
  );
}

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end justify-between gap-2 w-full h-full">
      {data.map(d => (
        <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
          <span className="text-[9px] text-muted-foreground font-bold">{d.value}</span>
          <div
            className="w-full rounded-none"
            style={{ height: `${(d.value / max) * 120}px`, background: 'var(--chart-1)', opacity: 0.85 }}
          />
          <span className="text-[9px] text-muted-foreground font-semibold">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((a, b) => a + b.value, 0);
  let cumulative = 0;
  const r = 40, cx = 50, cy = 50;
  const slices = data.map(d => {
    const start = (cumulative / total) * 360;
    cumulative += d.value;
    const end = (cumulative / total) * 360;
    const toRad = (deg: number) => (deg - 90) * (Math.PI / 180);
    const x1 = cx + r * Math.cos(toRad(start));
    const y1 = cy + r * Math.sin(toRad(start));
    const x2 = cx + r * Math.cos(toRad(end));
    const y2 = cy + r * Math.sin(toRad(end));
    const largeArc = end - start > 180 ? 1 : 0;
    return { ...d, path: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z` };
  });
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="w-32 h-32 shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="var(--card)" />
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} opacity={0.85} />)}
        <circle cx={cx} cy={cy} r={r * 0.55} fill="var(--card)" />
      </svg>
      <div className="flex flex-col gap-2">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-[10px]">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="font-bold text-foreground ml-auto">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard({ usersList, credentials, strategies, trades, overallPnl, logs }: AdminDashboardProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-bold text-foreground">Platform Overview</h2>
        <p className="text-xs text-muted-foreground">System-wide metrics, live strategy health, and aggregate performance analytics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border p-5 rounded-none flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Total Users</span>
            <span className="text-3xl font-black text-foreground block mt-1">{usersList.length}</span>
            <span className="text-[10px] text-muted-foreground block mt-2">Registered accounts</span>
          </div>
          <div className="ml-2 shrink-0">
            <Sparkline points={[3, 5, 4, 7, 6, 9, 8, 11, 10, 12]} color="var(--primary)" />
          </div>
        </div>
        <div className="bg-card border border-border p-5 rounded-none flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Broker Streams</span>
            <span className="text-3xl font-black text-foreground block mt-1">{credentials.filter(c => c.status === 'connected').length}</span>
            <span className="text-[10px] text-emerald-500 font-semibold mt-2 block">Live API Feed Active</span>
          </div>
          <div className="ml-2 shrink-0">
            <Sparkline points={[5, 8, 6, 9, 7, 10, 12, 11, 14, 15]} color="oklch(0.585 0.233 264.376)" />
          </div>
        </div>
        <div className="bg-card border border-border p-5 rounded-none flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Today's Trades</span>
            <span className="text-3xl font-black text-foreground block mt-1">{trades.length || 342}</span>
            <span className="text-[10px] font-semibold block mt-2">Order executions</span>
          </div>
          <div className="ml-2 shrink-0">
            <Sparkline points={[22, 18, 30, 25, 38, 32, 45, 41, 48, 52]} color="var(--secondary)" />
          </div>
        </div>
        <div className="bg-card border border-border p-5 rounded-none flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Gross Yield (All)</span>
            <span className={`text-3xl font-black block mt-1 ${overallPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              ₹{(overallPnl || 6200000).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-muted-foreground block mt-2">Aggregated strategy yield</span>
          </div>
          <div className="ml-2 shrink-0">
            <Sparkline points={[40, 50, 48, 55, 62, 58, 68, 75, 71, 80]} color="var(--primary)" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-none p-5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-bold text-foreground">System Performance & Trades</h3>
              <div className="flex items-center gap-4 text-[10px]">
                <span className="flex items-center gap-1.5 font-bold"><span className="w-2 h-2 bg-[var(--chart-1)]" />MACD Bot</span>
                <span className="flex items-center gap-1.5 font-bold"><span className="w-2 h-2 bg-[var(--secondary)]" />RSI Bot</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-6">Historical algorithmic performance trend (Last 7 Days)</p>
          </div>
          <div className="h-60 flex items-center justify-center">
            <AreaChart data={[
              { label: 'Mon', value1: 42000, value2: 31000 },
              { label: 'Tue', value1: 58000, value2: 45000 },
              { label: 'Wed', value1: 49000, value2: 52000 },
              { label: 'Thu', value1: 72000, value2: 60000 },
              { label: 'Fri', value1: 64000, value2: 58000 },
              { label: 'Sat', value1: 85000, value2: 68000 },
              { label: 'Sun', value1: 98000, value2: 74000 }
            ]} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-none p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground mb-1">Active Subscriptions</h3>
            <p className="text-xs text-muted-foreground mb-6">License distribution per package model</p>
          </div>
          <div className="h-60 flex items-center justify-center">
            <BarChart data={[
              { label: 'Basic', value: 45 },
              { label: 'Pro', value: 89 },
              { label: 'VIP', value: 34 },
              { label: 'Elite', value: 18 }
            ]} />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-none p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground mb-1">Broker Market Share</h3>
            <p className="text-xs text-muted-foreground mb-6">Active retail connections mapped per partner broker SDK</p>
          </div>
          <div className="py-4">
            <DonutChart data={[
              { label: 'Zerodha Kite', value: 124, color: 'oklch(0.662 0.179 69.29)' },
              { label: 'Angel One', value: 85, color: 'oklch(0.585 0.233 264.376)' },
              { label: 'Upstox API', value: 42, color: 'var(--primary)' },
              { label: 'Dhan API', value: 18, color: 'var(--secondary)' }
            ]} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-none p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground mb-1">Operations Activity Log</h3>
            <p className="text-xs text-muted-foreground mb-4">Latest critical execution system triggers and authorization actions</p>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[160px] pr-1 flex-1">
            {logs.slice(0, 10).map((log, idx) => (
              <div key={idx} className="flex gap-2 text-xs py-1 border-b border-border/40 last:border-0">
                <span className="text-muted-foreground font-mono">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                <span className="text-primary font-bold">{log.source}:</span>
                <span className="text-foreground/90">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
