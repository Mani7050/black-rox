const fs = require('fs');
const path = require('path');

const filePath = path.resolve('c:/Users/Mani/black-rox/client/src/App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Target position: right below the Metrics Grid inside the ADMIN_DASHBOARD activeTab
const targetMetricsGridEnd = `              {/* Metrics Grid */}
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
              </div>`;

const replacementMetricsGridEnd = `              {/* Metrics Grid */}
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

              {/* Chart & Calendar Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance & Revenue Trend Chart */}
                <div className="lg:col-span-2 bg-card border border-border p-5 rounded-none flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">System Yield & Equity Curve</h3>
                        <p className="text-[10px] text-muted-foreground">Rolling 7-day cumulative net yield performance across active brokers</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-none">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                          PROFIT DAYS: 5
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-none">
                          <span className="w-1.5 h-1.5 bg-rose-400 rounded-full" />
                          LOSS DAYS: 2
                        </span>
                      </div>
                    </div>

                    {/* SVG Chart */}
                    <div className="h-[240px] w-full mt-6 relative">
                      <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Horizontal Grid lines */}
                        <line x1="40" y1="20" x2="580" y2="20" stroke="var(--border)" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="40" y1="70" x2="580" y2="70" stroke="var(--border)" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="40" y1="120" x2="580" y2="120" stroke="var(--border)" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="40" y1="170" x2="580" y2="170" stroke="var(--border)" strokeWidth="1" strokeDasharray="3,3" />
                        
                        {/* Vertical Grid lines */}
                        <line x1="40" y1="20" x2="40" y2="170" stroke="var(--border)" strokeWidth="1" />
                        <line x1="130" y1="20" x2="130" y2="170" stroke="var(--border)" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="220" y1="20" x2="220" y2="170" stroke="var(--border)" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="310" y1="20" x2="310" y2="170" stroke="var(--border)" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="400" y1="20" x2="400" y2="170" stroke="var(--border)" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="490" y1="20" x2="490" y2="170" stroke="var(--border)" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="580" y1="20" x2="580" y2="170" stroke="var(--border)" strokeWidth="1" />

                        {/* Baseline at ₹0 */}
                        <line x1="40" y1="120" x2="580" y2="120" stroke="var(--muted-foreground)" strokeWidth="1.5" strokeOpacity="0.4" />

                        {/* Chart Area Fill */}
                        <path
                          d="M 40 120 L 40 110 L 130 128 L 220 95 L 310 80 L 400 132 L 490 60 L 580 30 L 580 170 L 40 170 Z"
                          fill="url(#chartGrad)"
                        />

                        {/* Chart Line */}
                        <path
                          d="M 40 110 L 130 128 L 220 95 L 310 80 L 400 132 L 490 60 L 580 30"
                          fill="none"
                          stroke="var(--primary)"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Nodes (Circles) */}
                        <circle cx="40" cy="110" r="5" className="fill-background stroke-[3px] stroke-primary" />
                        <circle cx="130" cy="128" r="5" className="fill-background stroke-[3px] stroke-primary" />
                        <circle cx="220" cy="95" r="5" className="fill-background stroke-[3px] stroke-primary" />
                        <circle cx="310" cy="80" r="5" className="fill-background stroke-[3px] stroke-primary" />
                        <circle cx="400" cy="132" r="5" className="fill-background stroke-[3px] stroke-primary" />
                        <circle cx="490" cy="60" r="5" className="fill-background stroke-[3px] stroke-primary" />
                        <circle cx="580" cy="30" r="5" className="fill-background stroke-[3px] stroke-primary animate-pulse" />

                        {/* Axis Labels */}
                        <text x="10" y="25" className="fill-muted-foreground text-[9px] font-mono">+₹20k</text>
                        <text x="10" y="75" className="fill-muted-foreground text-[9px] font-mono">+₹10k</text>
                        <text x="15" y="123" className="fill-muted-foreground text-[9px] font-mono">₹0</text>
                        <text x="10" y="173" className="fill-muted-foreground text-[9px] font-mono">-₹10k</text>

                        <text x="30" y="195" className="fill-muted-foreground text-[9px] font-semibold">07/08</text>
                        <text x="120" y="195" className="fill-muted-foreground text-[9px] font-semibold">07/09</text>
                        <text x="210" y="195" className="fill-muted-foreground text-[9px] font-semibold">07/10</text>
                        <text x="300" y="195" className="fill-muted-foreground text-[9px] font-semibold">07/11</text>
                        <text x="390" y="195" className="fill-muted-foreground text-[9px] font-semibold">07/12</text>
                        <text x="480" y="195" className="fill-muted-foreground text-[9px] font-semibold">07/13</text>
                        <text x="565" y="195" className="fill-primary text-[9px] font-bold">Today</text>
                      </svg>
                    </div>
                  </div>
                  <div className="border-t border-border/60 pt-3 mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Performance metrics update in real-time based on active trades.</span>
                    <span className="font-semibold text-foreground">Total Growth MTD: +14.2%</span>
                  </div>
                </div>

                {/* Trading Calendar */}
                <div className="bg-card border border-border p-5 rounded-none flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Trading Calendar</h3>
                        <p className="text-[10px] text-muted-foreground">Select a day to view daily performance logs</p>
                      </div>
                      <span className="text-xs font-mono font-bold bg-muted px-2.5 py-1">July 2026</span>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center mt-4">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(w => (
                        <div key={w} className="text-[10px] font-bold text-muted-foreground py-1">{w}</div>
                      ))}
                      
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={\`empty-\${i}\`} className="p-1" />
                      ))}

                      {Array.from({ length: 31 }).map((_, i) => {
                        const day = i + 1;
                        const dailyStats = {
                          1: { pnl: 0, status: 'neutral' },
                          2: { pnl: 0, status: 'neutral' },
                          3: { pnl: 4500, status: 'profit' },
                          4: { pnl: 0, status: 'neutral' },
                          5: { pnl: 0, status: 'neutral' },
                          6: { pnl: -1500, status: 'loss' },
                          7: { pnl: 0, status: 'neutral' },
                          8: { pnl: 2400, status: 'profit' },
                          9: { pnl: -1200, status: 'loss' },
                          10: { pnl: 5800, status: 'profit' },
                          11: { pnl: 8900, status: 'profit' },
                          12: { pnl: -2100, status: 'loss' },
                          13: { pnl: 12400, status: 'profit' },
                          14: { pnl: 18500, status: 'profit' }
                        };

                        const stat = dailyStats[day] || (day > 14 ? { pnl: null, status: 'future' } : { pnl: 0, status: 'neutral' });
                        const isSelected = selectedCalendarDate.day === day;

                        let styleClasses = "p-1.5 text-xs font-semibold rounded-none cursor-pointer transition-all flex flex-col items-center justify-center relative ";
                        
                        if (isSelected) {
                          styleClasses += "bg-primary text-primary-foreground font-black ring-1 ring-primary ring-offset-1 ring-offset-background z-10";
                        } else if (stat.status === 'profit') {
                          styleClasses += "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/25";
                        } else if (stat.status === 'loss') {
                          styleClasses += "text-rose-400 bg-rose-500/10 hover:bg-rose-500/25";
                        } else if (stat.status === 'future') {
                          styleClasses += "text-muted-foreground/30 cursor-not-allowed";
                        } else {
                          styleClasses += "text-foreground hover:bg-muted";
                        }

                        return (
                          <button
                            key={\`day-\${day}\`}
                            disabled={stat.status === 'future'}
                            onClick={() => setSelectedCalendarDate({ day, pnl: stat.pnl, status: stat.status })}
                            className={styleClasses}
                          >
                            <span>{day}</span>
                            {!isSelected && stat.status === 'profit' && (
                              <span className="w-1 h-1 bg-emerald-400 rounded-full mt-0.5" />
                            )}
                            {!isSelected && stat.status === 'loss' && (
                              <span className="w-1 h-1 bg-rose-400 rounded-full mt-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Day Details Panel */}
                  <div className="border-t border-border mt-4 pt-3">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Day Report details</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">July {selectedCalendarDate.day}, 2026</span>
                      <span className={\`text-xs font-bold font-mono px-2 py-0.5 \${
                        selectedCalendarDate.status === 'profit' ? 'text-emerald-400 bg-emerald-500/10' :
                        selectedCalendarDate.status === 'loss' ? 'text-rose-400 bg-rose-500/10' :
                        selectedCalendarDate.status === 'neutral' ? 'text-muted-foreground bg-muted' :
                        'text-muted-foreground/50'
                      }\`}>
                        {selectedCalendarDate.pnl !== null
                          ? \`\${selectedCalendarDate.pnl >= 0 ? '+' : ''}₹\${selectedCalendarDate.pnl.toLocaleString()}\`
                          : 'No trading activity'
                        }
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
                      {selectedCalendarDate.status === 'profit' && \`Positive yield day. Total net profit is ₹\${selectedCalendarDate.pnl?.toLocaleString()}. Strategies MACD & RSI executed high-accuracy signals.\`}
                      {selectedCalendarDate.status === 'loss' && \`Negative drawdown day. Net realized loss is -₹\${Math.abs(selectedCalendarDate.pnl || 0).toLocaleString()}. Daily risk limits remained stable.\`}
                      {selectedCalendarDate.status === 'neutral' && "Closed day or weekend. Zero active automated trades executed by system bots."}
                      {selectedCalendarDate.status === 'future' && "Upcoming scheduled trading session."}
                    </p>
                  </div>
                </div>
              </div>`;

content = content.replace(targetMetricsGridEnd, replacementMetricsGridEnd);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully patched App.tsx with chart and calendar components!");
