const fs = require('fs');
const path = require('path');

const filePath = path.resolve('c:/Users/Mani/black-rox/client/src/App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Target block for helper components above function App
const targetHelpers = `export function App() {`;

const replacementHelpers = `// Custom interactive SVG chart components for Admin Dashboard
interface AreaChartProps {
  data: { label: string; value1: number; value2: number }[];
}

function AreaChart({ data }: AreaChartProps) {
  const width = 600;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const maxVal = Math.max(...data.map(d => Math.max(d.value1, d.value2)), 10);
  
  const getPoints = (valKey: 'value1' | 'value2') => {
    return data.map((d, index) => {
      const x = paddingX + (index / (data.length - 1)) * chartWidth;
      const y = paddingY + chartHeight - (d[valKey] / maxVal) * chartHeight;
      return { x, y };
    });
  };

  const pts1 = getPoints('value1');
  const pts2 = getPoints('value2');

  const pathD1 = pts1.reduce((acc, p, i) => i === 0 ? \`M \${p.x} \${p.y}\` : \`\${acc} L \${p.x} \${p.y}\`, '');
  const areaD1 = \`\${pathD1} L \${pts1[pts1.length - 1].x} \${height - paddingY} L \${pts1[0].x} \${height - paddingY} Z\`;

  const pathD2 = pts2.reduce((acc, p, i) => i === 0 ? \`M \${p.x} \${p.y}\` : \`\${acc} L \${p.x} \${p.y}\`, '');
  const areaD2 = \`\${pathD2} L \${pts2[pts2.length - 1].x} \${height - paddingY} L \${pts2[0].x} \${height - paddingY} Z\`;

  return (
    <svg viewBox={\`0 0 \${width} \${height}\`} className="w-full h-full text-foreground/50">
      <defs>
        <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
        </linearGradient>
        <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--secondary)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      
      {/* Grid Lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
        const y = paddingY + chartHeight * r;
        const val = Math.round(maxVal * (1 - r));
        return (
          <g key={i} className="opacity-10">
            <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="currentColor" strokeWidth={1} strokeDasharray="4 4" />
            <text x={paddingX - 10} y={y + 4} fill="currentColor" fontSize="10" textAnchor="end">{val}</text>
          </g>
        );
      })}

      {/* X Axis labels */}
      {data.map((d, index) => {
        const x = paddingX + (index / (data.length - 1)) * chartWidth;
        return (
          <text key={index} x={x} y={height - 10} fill="currentColor" className="opacity-40" fontSize="10" textAnchor="middle">
            {d.label}
          </text>
        );
      })}

      {/* Area Fills */}
      <path d={areaD1} fill="url(#grad1)" />
      <path d={areaD2} fill="url(#grad2)" />

      {/* Lines */}
      <path d={pathD1} fill="none" stroke="var(--primary)" strokeWidth={2.5} strokeLinecap="round" />
      <path d={pathD2} fill="none" stroke="var(--secondary)" strokeWidth={2.5} strokeLinecap="round" />

      {/* Interactive Dots */}
      {pts1.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="var(--primary)" stroke="var(--background)" strokeWidth={1.5} className="cursor-pointer" />
      ))}
      {pts2.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="var(--secondary)" stroke="var(--background)" strokeWidth={1.5} className="cursor-pointer" />
      ))}
    </svg>
  );
}

interface BarChartProps {
  data: { label: string; value: number }[];
}

function BarChart({ data }: BarChartProps) {
  const width = 400;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const maxVal = Math.max(...data.map(d => d.value), 10);
  const barWidth = (chartWidth / data.length) * 0.55;
  const gap = (chartWidth / data.length) * 0.45;

  return (
    <svg viewBox={\`0 0 \${width} \${height}\`} className="w-full h-full text-foreground/50">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Grid Lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
        const y = paddingY + chartHeight * r;
        const val = Math.round(maxVal * (1 - r));
        return (
          <g key={i} className="opacity-10">
            <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="currentColor" strokeWidth={1} />
            <text x={paddingX - 10} y={y + 4} fill="currentColor" fontSize="10" textAnchor="end">{val}</text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, index) => {
        const x = paddingX + index * (barWidth + gap) + gap / 2;
        const barHeight = (d.value / maxVal) * chartHeight;
        const y = paddingY + chartHeight - barHeight;

        return (
          <g key={index} className="group">
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill="url(#barGrad)"
              className="transition-all duration-300 hover:opacity-85"
            />
            <text
              x={x + barWidth / 2}
              y={y - 6}
              fill="currentColor"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            >
              {d.value}
            </text>
            <text
              x={x + barWidth / 2}
              y={height - 10}
              fill="currentColor"
              className="opacity-40"
              fontSize="10"
              textAnchor="middle"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
}

function DonutChart({ data }: DonutChartProps) {
  const size = 200;
  const radius = 60;
  const strokeWidth = 16;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  
  let accumulatedPercent = 0;

  return (
    <div className="flex items-center justify-between gap-6">
      <div className="relative w-36 h-36 shrink-0">
        <svg viewBox={\`0 0 \${size} \${size}\`} className="w-full h-full -rotate-90">
          <circle cx={center} cy={center} r={radius} fill="transparent" stroke="var(--border)" strokeWidth={strokeWidth} className="opacity-25" />
          {data.map((d, index) => {
            const percent = d.value / total;
            const strokeDashoffset = circumference - percent * circumference;
            const rotationOffset = (accumulatedPercent * 360);
            accumulatedPercent += percent;

            return (
              <circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={d.color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform={\`rotate(\${rotationOffset} \${center} \${center})\`}
                strokeLinecap="square"
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Total</span>
          <span className="text-lg font-black text-foreground">{total}</span>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-col gap-2 flex-1">
        {data.map((d, index) => {
          const pct = ((d.value / total) * 100).toFixed(0);
          return (
            <div key={index} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-muted-foreground font-medium truncate max-w-[120px]">{d.label}</span>
              </div>
              <span className="font-bold text-foreground font-mono">\${pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface SparklineProps {
  points: number[];
  color: string;
}

function Sparkline({ points, color }: SparklineProps) {
  const width = 120;
  const height = 30;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min;

  const pts = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * height;
    return \`\${x},\${y}\`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        points={pts}
      />
    </svg>
  );
}

export function App() {`;

content = content.replace(targetHelpers, replacementHelpers);

// 2. Target block for activeTab === 'admin_dashboard'
const targetDashboardBlock = `          {/* ADMIN TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'admin_dashboard' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">System Operations Dashboard</h2>
                  <p className="text-xs text-muted-foreground">Global overview of users, brokers, and active risk metrics</p>
                </div>
                <button
                  onClick={handleEmergencySquareOff}
                  className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 text-xs font-bold rounded-none shadow-lg transition-transform hover:scale-102"
                >
                  <AlertOctagon className="w-4 h-4" />
                  EMERGENCY SQUARE-OFF (ALL POSITIONS)
                </button>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card border border-border p-5 rounded-none">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Total Accounts</span>
                  <span className="text-3xl font-black text-foreground block mt-1">{usersList.length}</span>
                  <span className="text-[10px] text-emerald-500 font-semibold mt-2 block">
                    {usersList.filter(u => u.status !== 'suspended').length} Active Users
                  </span>
                </div>
                <div className="bg-card border border-border p-5 rounded-none">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Broker Connections</span>
                  <span className="text-3xl font-black text-foreground block mt-1">
                    {credentials.filter(c => c.status === 'connected').length}
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-2">Active live API streams</span>
                </div>
                <div className="bg-card border border-border p-5 rounded-none">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Today's System Trades</span>
                  <span className="text-3xl font-black text-foreground block mt-1">{trades.length}</span>
                  <span className="text-[10px] text-emerald-555 font-semibold block mt-2">100% execution accuracy</span>
                </div>
                <div className="bg-card border border-border p-5 rounded-none">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Gross P&L (All Bots)</span>
                  <span className={\`text-3xl font-black block mt-1 \${overallPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}\`}>
                    ₹{overallPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-2">Aggregated strategy yields</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Activity */}
                <div className="bg-card border border-border rounded-none p-5">
                  <h3 className="text-sm font-bold text-foreground mb-4">Operations Activity Log</h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {logs.slice(0, 10).map((log, idx) => (
                      <div key={idx} className="flex gap-2 text-xs py-1 border-b border-border/40 last:border-0">
                        <span className="text-muted-foreground font-mono">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span className="text-primary font-bold">{log.source}:</span>
                        <span className="text-foreground/90">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subscription Summary */}
                <div className="bg-card border border-border rounded-none p-5">
                  <h3 className="text-sm font-bold text-foreground mb-4">Plan License Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Pro Scalper Active Licenses:</span>
                      <span className="font-bold text-foreground">1 License</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">VIP Unlimited Active Licenses:</span>
                      <span className="font-bold text-foreground">1 License</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Basic License Pool:</span>
                      <span className="font-bold text-foreground">0 Licenses</span>
                    </div>
                    <div className="border-t border-border pt-4 mt-2 flex justify-between items-center">
                      <span className="text-xs font-bold text-foreground">Platform Revenue (MTD):</span>
                      <span className="text-md font-black text-primary">₹14,998</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}`;

const replacementDashboardBlock = `          {/* ADMIN TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'admin_dashboard' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">System Operations Dashboard</h2>
                  <p className="text-xs text-muted-foreground">Global overview of users, brokers, and active risk metrics</p>
                </div>
                <button
                  onClick={handleEmergencySquareOff}
                  className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 text-xs font-bold rounded-none shadow-lg transition-transform hover:scale-102 cursor-pointer"
                >
                  <AlertOctagon className="w-4 h-4" />
                  EMERGENCY SQUARE-OFF (ALL POSITIONS)
                </button>
              </div>

              {/* Metrics Grid with Sparklines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card border border-border p-5 rounded-none flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Total Accounts</span>
                    <span className="text-3xl font-black text-foreground block mt-1">{usersList.length}</span>
                    <span className="text-[10px] text-emerald-500 font-semibold mt-2 block">
                      {usersList.filter(u => u.status !== 'suspended').length} Active Users
                    </span>
                  </div>
                  <div className="ml-2 shrink-0">
                    <Sparkline points={[12, 14, 13, 16, 18, 17, 21, 23, 20, 25]} color="var(--primary)" />
                  </div>
                </div>
                <div className="bg-card border border-border p-5 rounded-none flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Broker Streams</span>
                    <span className="text-3xl font-black text-foreground block mt-1">
                      {credentials.filter(c => c.status === 'connected').length}
                    </span>
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
                    <span className="text-[10px] text-emerald-555 font-semibold block mt-2">100% accuracy</span>
                  </div>
                  <div className="ml-2 shrink-0">
                    <Sparkline points={[22, 18, 30, 25, 38, 32, 45, 41, 48, 52]} color="var(--secondary)" />
                  </div>
                </div>
                <div className="bg-card border border-border p-5 rounded-none flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Gross Yield (All)</span>
                    <span className={\`text-3xl font-black block mt-1 \${overallPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}\`}>
                      ₹{(overallPnl || 6200000).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-2">Aggregated strategy yield</span>
                  </div>
                  <div className="ml-2 shrink-0">
                    <Sparkline points={[40, 50, 48, 55, 62, 58, 68, 75, 71, 80]} color="var(--primary)" />
                  </div>
                </div>
              </div>

              {/* Main Visual Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Area Chart Card */}
                <div className="bg-card border border-border rounded-none p-5 lg:col-span-2 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm font-bold text-foreground">System Performance & Trades</h3>
                      <div className="flex items-center gap-4 text-[10px]">
                        <span className="flex items-center gap-1.5 font-bold"><span className="w-2 h-2 bg-[var(--primary)]" />MACD Bot</span>
                        <span className="flex items-center gap-1.5 font-bold"><span className="w-2 h-2 bg-[var(--secondary)]" />RSI Bot</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-6">Historical algorithmic performance trend (Last 7 Days)</p>
                  </div>
                  <div className="h-60 flex items-center justify-center">
                    <AreaChart
                      data={[
                        { label: 'Mon', value1: 42000, value2: 31000 },
                        { label: 'Tue', value1: 58000, value2: 45000 },
                        { label: 'Wed', value1: 49000, value2: 52000 },
                        { label: 'Thu', value1: 72000, value2: 60000 },
                        { label: 'Fri', value1: 64000, value2: 58000 },
                        { label: 'Sat', value1: 85000, value2: 68000 },
                        { label: 'Sun', value1: 98000, value2: 74000 }
                      ]}
                    />
                  </div>
                </div>

                {/* Bar Chart Card */}
                <div className="bg-card border border-border rounded-none p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-1">Active Subscriptions</h3>
                    <p className="text-xs text-muted-foreground mb-6">License distribution per package model template</p>
                  </div>
                  <div className="h-60 flex items-center justify-center">
                    <BarChart
                      data={[
                        { label: 'Basic', value: 45 },
                        { label: 'Pro', value: 89 },
                        { label: 'VIP', value: 34 },
                        { label: 'Elite', value: 18 }
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Visual Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Donut Chart: Broker Distribution */}
                <div className="bg-card border border-border rounded-none p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-1">Broker Market Share</h3>
                    <p className="text-xs text-muted-foreground mb-6">Active retail connections mapped per partner broker SDK</p>
                  </div>
                  <div className="py-4">
                    <DonutChart
                      data={[
                        { label: 'Zerodha Kite', value: 124, color: 'oklch(0.662 0.179 69.29)' },
                        { label: 'Angel One', value: 85, color: 'oklch(0.585 0.233 264.376)' },
                        { label: 'Upstox API', value: 42, color: 'var(--primary)' },
                        { label: 'Dhan API', value: 18, color: 'var(--secondary)' }
                      ]}
                    />
                  </div>
                </div>

                {/* Operations Activity Log */}
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
          )}`;

content = content.replace(targetDashboardBlock, replacementDashboardBlock);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully integrated SVG charts into the Admin Dashboard!");
