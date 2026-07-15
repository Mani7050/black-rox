const fs = require('fs');
const path = require('path');

const filePath = path.resolve('c:/Users/Mani/black-rox/client/src/App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = '        <main className="flex-1 overflow-y-auto pb-24 md:pb-8 p-6 bg-muted/20">';
const endMarker = '        </main>';

const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
  console.error("Start marker not found!");
  process.exit(1);
}

// Find the corresponding closing </main>
// There might be nested tags, but the main </main> is the one right before the closing </div> of the sidebar wrapper
// In our case, the last </main> is located right before:
// `      </div>\n    </div>\n  );\n}\n\nexport default App;`
const endSearchStr = '      </div>\n    </div>\n  );\n}\n\nexport default App;';
const searchIndex = content.lastIndexOf(endSearchStr);
if (searchIndex === -1) {
  console.error("End search structure not found!");
  process.exit(1);
}

// Find </main> before searchIndex
const lastMainIndex = content.lastIndexOf(endMarker, searchIndex);
if (lastMainIndex === -1 || lastMainIndex < startIndex) {
  console.error("Closing main tag not found!");
  process.exit(1);
}

const endIndex = lastMainIndex + endMarker.length;

const replacement = `        <main className="flex-1 overflow-y-auto pb-24 md:pb-8 p-6 bg-muted/20">
          
          {/* ================= ADMIN TABS ================= */}
          
          {/* ADMIN TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'admin_dashboard' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">System Operations Dashboard</h2>
                  <p className="text-xs text-muted-foreground">Global overview of users, brokers, and active risk metrics</p>
                </div>
                <button
                  onClick={handleEmergencySquareOff}
                  className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 text-xs font-bold rounded-xl shadow-lg transition-transform hover:scale-102"
                >
                  <AlertOctagon className="w-4 h-4" />
                  EMERGENCY SQUARE-OFF (ALL POSITIONS)
                </button>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card border border-border p-5 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Total Accounts</span>
                  <span className="text-3xl font-black text-foreground block mt-1">{usersList.length}</span>
                  <span className="text-[10px] text-emerald-500 font-semibold mt-2 block">
                    {usersList.filter(u => u.status !== 'suspended').length} Active Users
                  </span>
                </div>
                <div className="bg-card border border-border p-5 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Broker Connections</span>
                  <span className="text-3xl font-black text-foreground block mt-1">
                    {credentials.filter(c => c.status === 'connected').length}
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-2">Active live API streams</span>
                </div>
                <div className="bg-card border border-border p-5 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Today's System Trades</span>
                  <span className="text-3xl font-black text-foreground block mt-1">{trades.length}</span>
                  <span className="text-[10px] text-emerald-555 font-semibold block mt-2">100% execution accuracy</span>
                </div>
                <div className="bg-card border border-border p-5 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Gross P&L (All Bots)</span>
                  <span className={\`text-3xl font-black block mt-1 \${overallPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}\`}>
                    ₹{overallPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-2">Aggregated strategy yields</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Activity */}
                <div className="bg-card border border-border rounded-2xl p-5">
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
                <div className="bg-card border border-border rounded-2xl p-5">
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
          )}

          {/* ADMIN TAB 2: USER MANAGEMENT */}
          {activeTab === 'admin_users' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">User Management</h2>
                  <p className="text-xs text-muted-foreground">Manage user accounts, block access, configure custom sizing multipliers</p>
                </div>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow"
                >
                  <Plus className="w-4 h-4" />
                  Create User Account
                </button>
              </div>

              {/* Users Table */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border text-xs font-bold text-muted-foreground">
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Lot Multiplier</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {usersList.map(u => (
                      <tr key={u.id} className="hover:bg-muted/10">
                        <td className="p-4 font-bold text-foreground">{u.name}</td>
                        <td className="p-4 font-mono">{u.email}</td>
                        <td className="p-4 capitalize">
                          <span className={\`px-2 py-0.5 rounded text-[10px] font-bold \${
                            u.role === 'admin' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground'
                          }\`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold">{u.lotMultiplier?.toFixed(2) || '1.00'}x</td>
                        <td className="p-4">
                          <span className={\`px-2 py-0.5 rounded text-[10px] font-bold \${
                            u.status !== 'suspended' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                          }\`}>
                            {u.status !== 'suspended' ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedUserForPlan(u);
                              setAssignedPlanId(plans[0]?.id || '');
                              setShowAssignPlanModal(true);
                            }}
                            className="bg-card border border-border hover:bg-muted text-[10px] font-bold px-2.5 py-1.5 rounded-lg"
                          >
                            Assign Plan
                          </button>
                          <button
                            onClick={() => handleResetUserApi(u.id)}
                            className="bg-card border border-border hover:bg-muted text-[10px] font-bold px-2.5 py-1.5 rounded-lg text-amber-500"
                          >
                            Reset API
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            disabled={u.id === user?.id}
                            className={\`px-2.5 py-1.5 rounded-lg text-[10px] font-bold \${
                              u.status !== 'suspended'
                                ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                            }\`}
                          >
                            {u.status !== 'suspended' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ADMIN TAB 3: SUBSCRIPTION MANAGEMENT */}
          {activeTab === 'admin_subscriptions' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Subscription Catalog Management</h2>
                  <p className="text-xs text-muted-foreground">Manage and define subscription models, licensing thresholds, pricing & sizing caps</p>
                </div>
                <button
                  onClick={() => setShowAddPlanModal(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow"
                >
                  <Plus className="w-4 h-4" />
                  Define Plan
                </button>
              </div>

              {/* Plans List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(plan => (
                  <div key={plan.id} className="bg-card border border-border p-5 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-md text-foreground">{plan.name}</h3>
                          <span className="text-[10px] text-muted-foreground font-mono">ID: {plan.id}</span>
                        </div>
                        <span className="text-lg font-black text-primary">₹{plan.price}</span>
                      </div>

                      <div className="space-y-2 border-t border-border/60 py-3 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-bold">{plan.durationDays} Days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Lot Limit:</span>
                          <span className="font-bold font-mono">{plan.maxLotLimit} Lots</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Capital Limit:</span>
                          <span className="font-bold font-mono">₹{plan.maxCapital.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Open Trades:</span>
                          <span className="font-bold">{plan.maxOpenPositions} Positions</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="w-full text-center py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-bold rounded-xl border border-rose-500/20 transition-all mt-4"
                    >
                      Remove Plan Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADMIN TAB 4: BROKER MANAGEMENT */}
          {activeTab === 'admin_brokers' && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-bold text-foreground">Broker Gateway Configurations</h2>
                <p className="text-xs text-muted-foreground">Manage active connection states and credentials routing flags for supported Indian Brokers</p>
              </div>

              {/* Supported Brokers List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {brokers.map(broker => (
                  <div key={broker.id} className="bg-card border border-border p-5 rounded-2xl flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-foreground text-md">{broker.name}</h3>
                        <p className="text-xs text-muted-foreground capitalize mt-0.5">Gateway code: {broker.id}</p>
                      </div>
                      <span className={\`px-2 py-0.5 rounded text-[10px] font-extrabold \${
                        broker.enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'
                      }\`}>
                        {broker.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>

                    <div className="my-5 border-t border-border/60 py-3 text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">OAuth Handshake:</span>
                        <span className="font-semibold text-emerald-500">Live API SDK Handshake (KiteConnect v3)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Interactive Session:</span>
                        <span className="font-semibold">Requires TOTP on daily login</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleBroker(broker.id)}
                      className={\`w-full py-2.5 rounded-xl text-xs font-bold border transition-colors \${
                        broker.enabled
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/25 hover:bg-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25 hover:bg-emerald-500/20'
                      }\`}
                    >
                      {broker.enabled ? 'Disable Gateway Connection' : 'Enable Gateway Connection'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADMIN TAB 5: TRADING MANAGEMENT */}
          {activeTab === 'admin_trading' && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-bold text-foreground">Platform Trading Management</h2>
                <p className="text-xs text-muted-foreground">Monitor running strategy instances, view system-wide transaction metrics and order execution flows</p>
              </div>

              {/* Running Strategies Table */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="text-sm font-bold text-foreground mb-4">Active Deployments</h3>
                <div className="space-y-3">
                  {strategies.map(strat => (
                    <div key={strat.id} className="flex justify-between items-center p-3 rounded-xl border border-border bg-background/50 text-xs">
                      <div>
                        <p className="font-bold text-foreground">{strat.name}</p>
                        <p className="text-muted-foreground text-[10px]">{strat.instrument} • {strat.type}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono">Capital: ₹{strat.capital.toLocaleString()}</span>
                        <span className={\`font-mono font-bold \${strat.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}\`}>
                          PNL: ₹{strat.pnl.toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleToggleStrategy(strat.id)}
                          className={\`px-3 py-1.5 rounded-lg font-bold \${
                            strat.status === 'active'
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          }\`}
                        >
                          {strat.status === 'active' ? 'Stop' : 'Start'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ADMIN TAB 6: RISK MANAGEMENT */}
          {activeTab === 'admin_risk' && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-bold text-foreground">Global Platform Risk Controls</h2>
                <p className="text-xs text-muted-foreground">Admin panel to configure maximum limit limits, daily trades capping, and safety thresholds</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border p-5 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-foreground">Sizing Parameters</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-muted-foreground mb-1.5">Max Lot Limit (Per Plan Order)</label>
                      <input type="number" defaultValue="50" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary text-foreground" />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1.5">Max Daily Trades Capping</label>
                      <input type="number" defaultValue="20" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary text-foreground" />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1.5">Max Capital (Margin Utilization per User)</label>
                      <input type="number" defaultValue="2500000" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary text-foreground" />
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border p-5 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-foreground">Loss Prevention Limits</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-muted-foreground mb-1.5">Max Daily Loss Limit per Account (₹)</label>
                      <input type="number" defaultValue="25000" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary text-foreground" />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1.5">Max Open Positions Count</label>
                      <input type="number" defaultValue="5" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary text-foreground" />
                    </div>
                    <button
                      onClick={() => addToast('success', 'Risk Configuration Applied', 'Successfully updated global safety boundaries.')}
                      className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl transition-all shadow mt-6"
                    >
                      Save Global Safety Constraints
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ADMIN TAB 7: SIGNAL MANAGEMENT */}
          {activeTab === 'admin_signals' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Signal Station Console</h2>
                  <p className="text-xs text-muted-foreground">Broadcast manual Buy/Sell trading signals to all connected strategy subscribers</p>
                </div>
                <button
                  onClick={() => setShowBroadcastSignalModal(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow"
                >
                  <Plus className="w-4 h-4" />
                  Broadcast Trade Signal
                </button>
              </div>

              {/* Past Signals Table */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border text-xs font-bold text-muted-foreground">
                      <th className="p-4">Signal ID</th>
                      <th className="p-4">Instrument</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Reference Price</th>
                      <th className="p-4">Broadcast Time</th>
                      <th className="p-4">Execution Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {signalsList.map(sig => (
                      <tr key={sig.id} className="hover:bg-muted/10 font-mono">
                        <td className="p-4 font-bold">{sig.id}</td>
                        <td className="p-4 text-foreground font-semibold">{sig.instrument}</td>
                        <td className="p-4">
                          <span className={\`px-2 py-0.5 rounded text-[10px] font-extrabold \${
                            sig.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                          }\`}>
                            {sig.type}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-foreground">₹{sig.price.toFixed(2)}</td>
                        <td className="p-4 text-muted-foreground">{new Date(sig.time).toLocaleTimeString()}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20 font-bold capitalize">
                            {sig.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ADMIN TAB 8: PAYMENT CONTROL */}
          {activeTab === 'admin_payments' && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-bold text-foreground">Invoice & Payment Controls</h2>
                <p className="text-xs text-muted-foreground">Review account licensing transactions, download invoices and manage subscription payments</p>
              </div>

              {/* Transactions Ledger */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border text-xs font-bold text-muted-foreground">
                      <th className="p-4">Receipt ID</th>
                      <th className="p-4">User Account</th>
                      <th className="p-4">License Plan</th>
                      <th className="p-4">Amount Paid</th>
                      <th className="p-4">Transaction Date</th>
                      <th className="p-4">Receipt Status</th>
                      <th className="p-4 text-right">Invoices</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {paymentsList.map(pay => (
                      <tr key={pay.id} className="hover:bg-muted/10 font-mono">
                        <td className="p-4 font-bold">{pay.id}</td>
                        <td className="p-4 text-foreground font-semibold">{pay.userEmail}</td>
                        <td className="p-4">{pay.planName}</td>
                        <td className="p-4 font-bold text-foreground">₹{pay.amount}</td>
                        <td className="p-4 text-muted-foreground">{new Date(pay.date).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-extrabold capitalize">
                            {pay.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => addToast('success', 'PDF Invoice Generated', \`Invoice PDF for receipt \${pay.id} downloaded successfully.\`)}
                            className="bg-card border border-border hover:bg-muted text-[10px] font-bold px-2 py-1 rounded"
                          >
                            PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ADMIN TAB 9: REPORTS & SHEETS */}
          {activeTab === 'admin_reports' && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-bold text-foreground">Analytics Sheets & Audits</h2>
                <p className="text-xs text-muted-foreground">Export and examine user-wise strategy yields and trade performance spreadsheets</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border p-5 rounded-2xl text-center flex flex-col justify-between">
                  <div className="flex flex-col items-center">
                    <FileSpreadsheet className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-bold text-xs text-foreground">User-wise PnL Report</h3>
                    <p className="text-[11px] text-muted-foreground mt-1">Export complete table mapping user profits and loss statistics</p>
                  </div>
                  <button onClick={() => addToast('success', 'Report Exported', 'User Performance spreadsheet downloaded.')} className="w-full py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow mt-4">
                    Download XLSX Spreadsheet
                  </button>
                </div>

                <div className="bg-card border border-border p-5 rounded-2xl text-center flex flex-col justify-between">
                  <div className="flex flex-col items-center">
                    <FileText className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-bold text-xs text-foreground">Complete Order Book</h3>
                    <p className="text-[11px] text-muted-foreground mt-1">Download complete history logs of today's buy and sell transactions</p>
                  </div>
                  <button onClick={() => addToast('success', 'Report Exported', 'Platform trade ledger downloaded.')} className="w-full py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow mt-4">
                    Download CSV Ledger
                  </button>
                </div>

                <div className="bg-card border border-border p-5 rounded-2xl text-center flex flex-col justify-between">
                  <div className="flex flex-col items-center">
                    <Shield className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-bold text-xs text-foreground">Audit Compliance Report</h3>
                    <p className="text-[11px] text-muted-foreground mt-1">Export full history record of administrator changes and safety triggers</p>
                  </div>
                  <button onClick={() => addToast('success', 'Report Exported', 'System Audit logs exported.')} className="w-full py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow mt-4">
                    Export PDF Compliance
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ADMIN TAB 10: NOTIFICATIONS CENTER */}
          {activeTab === 'admin_notifications' && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-bold text-foreground">Alert Template Broadcast Center</h2>
                <p className="text-xs text-muted-foreground">Send real-time alerts or system notifications directly to the live screens of connected retail users</p>
              </div>

              <div className="bg-card border border-border p-5 rounded-2xl max-w-lg">
                <h3 className="text-sm font-bold text-foreground mb-4">Send System-wide Message</h3>
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-muted-foreground mb-1.5">Notification Banner Message</label>
                    <textarea rows={3} placeholder="Type operational alerts here..." className="w-full bg-background border border-border rounded-xl p-3 outline-none focus:border-primary text-foreground" />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5">Severity Badge Color</label>
                    <select className="w-full bg-background border border-border rounded-xl px-3 py-2 font-semibold">
                      <option value="info">Information (Blue)</option>
                      <option value="warning">Warning Notice (Orange)</option>
                      <option value="error">Emergency Alert (Red)</option>
                    </select>
                  </div>
                  <button
                    onClick={() => addToast('success', 'Alert Broadcasted', 'Notification banner pushed to active client sessions.')}
                    className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-xl"
                  >
                    Broadcast System Alert Banner
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ADMIN TAB 11: SYSTEM SETTINGS */}
          {activeTab === 'admin_settings' && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-bold text-foreground">System & API Configurations</h2>
                <p className="text-xs text-muted-foreground">Adjust server database synchronization and security timeouts</p>
              </div>

              <div className="bg-card border border-border p-5 rounded-2xl max-w-lg space-y-4 text-xs">
                <h3 className="text-sm font-bold text-foreground">Global Parameters</h3>
                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <div>
                    <p className="font-semibold text-foreground">Server Sandbox Simulation Mode</p>
                    <p className="text-[10px] text-muted-foreground">Allows offline trade executions with ticker directions</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 cursor-pointer accent-primary" />
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <div>
                    <p className="font-semibold text-foreground">Maintenance Mode</p>
                    <p className="text-[10px] text-muted-foreground">Prevents user logins while compiling updates</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4 cursor-pointer accent-primary" />
                </div>
                <button
                  onClick={() => addToast('success', 'Backup Initiated', 'Database state saved locally to server/backup_state.json')}
                  className="bg-card border border-border hover:bg-muted px-4 py-2 font-bold rounded-xl flex items-center gap-2"
                >
                  <Database className="w-4 h-4 text-primary" />
                  Initiate System Backup
                </button>
              </div>
            </div>
          )}

          {/* ADMIN TAB 12: AUDIT LOGS */}
          {activeTab === 'admin_audit' && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-bold text-foreground">Audit Compliance Log</h2>
                <p className="text-xs text-muted-foreground">Secured ledger recording user logins, status modifications, and risk limit changes</p>
              </div>

              <div className="bg-background border border-border rounded-2xl p-5 font-mono text-[12px] overflow-y-auto max-h-[500px]">
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
          )}
          
          {/* ================= USER TABS ================= */}
          
          {/* USER TAB 1: OVERVIEW TERMINAL */}
          {activeTab === 'user_dashboard' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Trading Overview</h2>
                  <p className="text-xs text-muted-foreground">Welcome back, \${user?.name}. Monitor algorithms, active positions and margins.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Auto-Trading Status:</span>
                  <button
                    onClick={() => {
                      setIsAutoTradingOn(prev => !prev);
                      addToast(isAutoTradingOn ? 'warning' : 'success', 'Auto-Trading Switch', \`Automated trades placement has been \${isAutoTradingOn ? 'PAUSED' : 'RESUMED'}\`);
                    }}
                    className={\`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors \${
                      isAutoTradingOn
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }\`}
                  >
                    {isAutoTradingOn ? 'Active (Monitoring)' : 'Paused (Manual Mode)'}
                  </button>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card border border-border p-5 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Net Profit / Loss</span>
                  <span className={\`text-3xl font-black block mt-1 \${overallPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}\`}>
                    ₹{overallPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-2">Today's live trading results</span>
                </div>
                <div className="bg-card border border-border p-5 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Running Algorithms</span>
                  <span className="text-3xl font-black text-foreground block mt-1">
                    {strategies.filter(s => s.status === 'active').length}
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-2">Active scanners tracking symbols</span>
                </div>
                <div className="bg-card border border-border p-5 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Broker Margins available</span>
                  <span className="text-3xl font-black text-foreground block mt-1">
                    ₹{credentials.filter(c => c.status === 'connected').reduce((acc, c) => acc + (c.funds || 0), 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-2">Total funds across connected Demat</span>
                </div>
                <div className="bg-card border border-border p-5 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Trades Executed</span>
                  <span className="text-3xl font-black text-foreground block mt-1">{trades.length}</span>
                  <span className="text-[10px] text-emerald-500 font-semibold block mt-2">100% order fill rate</span>
                </div>
              </div>

              {/* Chart & Quick Settings Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* SVG Performance Line Chart */}
                <div className="lg:col-span-2 bg-card border border-border p-6 rounded-2xl flex flex-col justify-between shadow-sm">
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
                          <polygon points={getChartAreaPoints()} fill="url(#curveGrad)" />
                          <polyline fill="none" stroke="#10b981" strokeWidth="2.5" points={getChartPoints()} />
                        </>
                      )}
                    </svg>
                  </div>
                </div>

                {/* Sizing Controller panel */}
                <div className="bg-card border border-border p-5 rounded-2xl flex flex-col justify-between">
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
                          className={\`py-1.5 rounded-lg border text-xs font-bold transition-all \${
                            user?.lotMultiplier === mult
                              ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                              : 'bg-background border-border text-muted-foreground hover:bg-muted'
                          }\`}
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
                        onChange={(e) => setCustomMultiplier(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none"
                      />
                      <button
                        onClick={() => customMultiplier && handleUpdateLotMultiplier(parseFloat(customMultiplier))}
                        className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    💡 scaling factor: A strategy targeting 25 lots executes exactly <strong>{Math.round(25 * (user?.lotMultiplier || 1.0))} lots</strong> on your Demat.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* USER TAB 2: BROKER CONNECTION */}
          {activeTab === 'user_broker' && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-bold text-foreground">Broker Credentials Connection</h2>
                <p className="text-xs text-muted-foreground">Securely link your Indian broker API to route algorithmic trades directly into your demat</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <div className="lg:col-span-1 bg-card border border-border p-5 rounded-2xl shadow-sm">
                  <h3 className="text-sm font-bold text-foreground mb-4">Connect Broker Gateway</h3>
                  <form onSubmit={handleConnectDemat} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-muted-foreground mb-1">Select Demat Broker</label>
                      <select
                        value={brokerSelect}
                        onChange={(e) => setBrokerSelect(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none font-bold"
                      >
                        <option value="zerodha">Zerodha Kite</option>
                        <option value="angelone">Angel One</option>
                        <option value="upstox">Upstox</option>
                        <option value="dhan">Dhan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1">Broker User ID</label>
                      <input
                        type="text"
                        required
                        value={brokerUserId}
                        onChange={(e) => setBrokerUserId(e.target.value)}
                        placeholder="e.g. AB1234"
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1">API Key</label>
                      <input
                        type="text"
                        required
                        value={brokerKey}
                        onChange={(e) => setBrokerKey(e.target.value)}
                        placeholder="KiteConnect api_key"
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1">API Secret Key</label>
                      <input
                        type="password"
                        required
                        value={brokerSecret}
                        onChange={(e) => setBrokerSecret(e.target.value)}
                        placeholder="KiteConnect secret"
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1">TOTP Secret (For 2FA Auto-Login)</label>
                      <input
                        type="text"
                        required
                        value={brokerTotp}
                        onChange={(e) => setBrokerTotp(e.target.value)}
                        placeholder="Google Authenticator secret string"
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-xl mt-4"
                    >
                      Authenticate Session
                    </button>
                  </form>
                </div>

                {/* Linked Accounts */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
                    <h3 className="text-sm font-bold text-foreground mb-4">Active Broker Accounts</h3>
                    {credentials.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No active broker sessions found. Connect your credentials on the left.</p>
                    ) : (
                      <div className="space-y-4">
                        {credentials.map(cred => (
                          <div key={cred.id} className="p-4 bg-background border border-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                            <div>
                              <p className="font-bold text-foreground">{cred.broker} ({cred.userId})</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Session: Connected • Last sync {new Date(cred.lastConnected || '').toLocaleTimeString()}</p>
                              <div className="flex gap-4 mt-2 font-mono text-[10px]">
                                <span>Funds: ₹{cred.funds?.toLocaleString()}</span>
                                <span>Margin: ₹{cred.margin?.toLocaleString()}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDisconnectBroker(cred.id)}
                              className="px-3.5 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-bold rounded-xl border border-rose-500/20 text-center"
                            >
                              Sever Connection
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USER TAB 3: SUBSCRIPTION PLAN */}
          {activeTab === 'user_subscription' && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-bold text-foreground">License & Subscription</h2>
                <p className="text-xs text-muted-foreground">View current subscription allocation settings and license constraints</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Plan */}
                <div className="lg:col-span-1 bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
                  <span className="text-[9px] uppercase font-extrabold tracking-wider bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded">
                    Current Active License
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Pro Scalper</h3>
                    <p className="text-xs text-muted-foreground">Renewal due in 18 Days (30-day template)</p>
                  </div>
                  <div className="border-t border-border/60 pt-3 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Lot Size limit:</span>
                      <span className="font-bold font-mono">10 Lots</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Allocated Capital:</span>
                      <span className="font-bold font-mono">₹5,000,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Open Positions:</span>
                      <span className="font-bold">5 Open Trades</span>
                    </div>
                  </div>
                </div>

                {/* Available Plans Catalog */}
                <div className="lg:col-span-2 bg-card border border-border p-5 rounded-2xl shadow-sm">
                  <h3 className="text-sm font-bold text-foreground mb-4 font-bold">License Upgrades Directory</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 border border-border bg-background/50 rounded-xl flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-xs">VIP Unlimited Plan</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Scale without safety limits</p>
                        <p className="text-sm font-black text-primary mt-2">₹9,999 / 90 Days</p>
                      </div>
                      <button onClick={() => addToast('info', 'Upgrade Requested', 'Contact admin to activate VIP Unlimited license.')} className="w-full py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl mt-4">
                        Request Upgrade
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USER TAB 4: TRADING SETTINGS */}
          {activeTab === 'user_trading_settings' && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-bold text-foreground">Personalized Safety Limits & Risk Parameters</h2>
                <p className="text-xs text-muted-foreground">Set your default lot sizes, stop loss rules, and maximum active positions</p>
              </div>

              <div className="bg-card border border-border p-5 rounded-2xl max-w-lg shadow-sm">
                <h3 className="text-sm font-bold text-foreground mb-4">Risk Controls Configuration</h3>
                <form onSubmit={handleUpdateRiskSettings} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-muted-foreground mb-1">Default Lot Size (Sizing)</label>
                      <input
                        type="number"
                        required
                        value={riskDefaultLotSize}
                        onChange={(e) => setRiskDefaultLotSize(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none text-foreground font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1">Daily Loss Limit (₹)</label>
                      <input
                        type="number"
                        required
                        value={riskDailyLimit}
                        onChange={(e) => setRiskDailyLimit(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none text-foreground font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-muted-foreground mb-1">Stop Loss Percentage (SL%)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={riskStopLoss}
                        onChange={(e) => setRiskStopLoss(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none text-foreground font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1">Target Profit Percentage (TP%)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={riskTarget}
                        onChange={(e) => setRiskTarget(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none text-foreground font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-muted-foreground mb-1">Max Open Positions Count</label>
                    <input
                      type="number"
                      required
                      value={riskMaxTrades}
                      onChange={(e) => setRiskMaxTrades(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none text-foreground font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingRiskSettings}
                    className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl mt-4"
                  >
                    {isUpdatingRiskSettings ? 'Updating safety params...' : 'Save Safety Configurations'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* USER TAB 5: ORDERS & REPORTS */}
          {activeTab === 'user_orders_reports' && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-bold text-foreground">Transaction Ledgers & Reports</h2>
                <p className="text-xs text-muted-foreground">Complete record of your demat buy and sell order fills</p>
              </div>

              {/* Orders ledger */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border text-xs font-bold text-muted-foreground">
                      <th className="p-4">Transaction ID</th>
                      <th className="p-4">Strategy Model</th>
                      <th className="p-4">Instrument</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Lots</th>
                      <th className="p-4 text-right">Yield</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs font-mono">
                    {trades.map(trade => (
                      <tr key={trade.id} className="hover:bg-muted/10">
                        <td className="p-4 font-bold">{trade.id}</td>
                        <td className="p-4 text-foreground font-semibold">{trade.strategyName}</td>
                        <td className="p-4">{trade.instrument}</td>
                        <td className="p-4">
                          <span className={\`px-2 py-0.5 rounded text-[10px] font-extrabold \${
                            trade.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                          }\`}>
                            {trade.type}
                          </span>
                        </td>
                        <td className="p-4 text-foreground">₹{trade.price.toFixed(2)}</td>
                        <td className="p-4 font-bold">{trade.quantity}</td>
                        <td className="p-4 text-right">
                          {trade.pnl !== undefined ? (
                            <span className={\`font-extrabold \${trade.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}\`}>
                              {trade.pnl >= 0 ? '+' : ''}₹{trade.pnl.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/45">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* USER TAB 6: PROFILE & SECURITY */}
          {activeTab === 'user_profile' && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-bold text-foreground">Profile Settings</h2>
                <p className="text-xs text-muted-foreground">Manage authorized email coordinates, credentials password and multi-factor safety tokens</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border p-5 rounded-2xl space-y-3.5 text-xs shadow-sm">
                  <h3 className="text-sm font-bold text-foreground mb-2">User Details</h3>
                  <div className="flex justify-between items-center py-2 border-b border-border/40">
                    <span className="text-muted-foreground font-semibold">Profile Name:</span>
                    <span className="font-bold text-foreground">{user?.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/40">
                    <span className="text-muted-foreground font-semibold">Registered Email:</span>
                    <span className="font-mono text-foreground">{user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/40">
                    <span className="text-muted-foreground font-semibold">Access Privilege:</span>
                    <span className="capitalize font-bold text-primary">{user?.role} Role</span>
                  </div>
                </div>

                <div className="bg-card border border-border p-5 rounded-2xl space-y-4 text-xs shadow-sm">
                  <h3 className="text-sm font-bold text-foreground">Security Toggles</h3>
                  <div className="flex justify-between items-center py-2 border-b border-border/40">
                    <div>
                      <p className="font-semibold text-foreground">Enforce 2FA Authenticator Token</p>
                      <p className="text-[10px] text-muted-foreground">Mandates typing 6-digit pin during login</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 cursor-pointer accent-primary" />
                  </div>
                  <button
                    onClick={() => addToast('success', 'Security Token Generated', 'New 2FA setup QR Code token generated.')}
                    className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-xl mt-4"
                  >
                    Setup New Authenticator Token
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= GLOBAL DIALOG MODALS ================= */}

          {/* Modal 1: Add User Modal */}
          {showAddUserModal && (
            <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-zoom-in">
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="absolute right-4 top-4 p-1 rounded-lg hover:bg-muted text-muted-foreground"
                >
                  <XCircle className="w-4 h-4" />
                </button>
                <h3 className="text-md font-bold text-foreground mb-1">Create User Account</h3>
                <p className="text-xs text-muted-foreground mb-5">Provision a new retail trader or admin user to access the terminal</p>
                <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-muted-foreground mb-1.5">Full Name</label>
                    <input type="text" required value={newUserName} onChange={(e) => setNewUserName(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-foreground" />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5">Email Address</label>
                    <input type="email" required value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-foreground" />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5">Password</label>
                    <input type="password" required value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-foreground" />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5">Account Access Role</label>
                    <select value={newUserRole} onChange={(e: any) => setNewUserRole(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none font-bold">
                      <option value="user">Retail Trader (User)</option>
                      <option value="admin">System Operations (Admin)</option>
                    </select>
                  </div>
                  <div className="flex gap-3 justify-end pt-4 border-t border-border mt-5">
                    <button type="button" onClick={() => setShowAddUserModal(false)} className="px-4 py-2 rounded-xl border border-border text-muted-foreground hover:bg-muted font-semibold">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold shadow">Create</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal 2: Add Subscription Plan Modal */}
          {showAddPlanModal && (
            <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-zoom-in">
                <button
                  onClick={() => setShowAddPlanModal(false)}
                  className="absolute right-4 top-4 p-1 rounded-lg hover:bg-muted text-muted-foreground"
                >
                  <XCircle className="w-4 h-4" />
                </button>
                <h3 className="text-md font-bold text-foreground mb-1">Create Subscription Plan Template</h3>
                <p className="text-xs text-muted-foreground mb-5">Define a licensing model plan with specific sizing parameters</p>
                <form onSubmit={handleCreatePlan} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-muted-foreground mb-1">Plan Display Name</label>
                    <input type="text" required value={newPlanName} onChange={(e) => setNewPlanName(e.target.value)} placeholder="e.g. Premium Scalper" className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none text-foreground" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-muted-foreground mb-1">Price (₹)</label>
                      <input type="number" required value={newPlanPrice} onChange={(e) => setNewPlanPrice(e.target.value)} placeholder="4999" className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none text-foreground" />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1">Duration (Days)</label>
                      <input type="number" required value={newPlanDuration} onChange={(e) => setNewPlanDuration(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none text-foreground" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-muted-foreground mb-1">Max Lot limit</label>
                      <input type="number" value={newPlanMaxLot} onChange={(e) => setNewPlanMaxLot(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none text-foreground" />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1">Max Cap (₹)</label>
                      <input type="number" value={newPlanMaxCapital} onChange={(e) => setNewPlanMaxCapital(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none text-foreground" />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1">Max Open Pos</label>
                      <input type="number" value={newPlanMaxOpenPositions} onChange={(e) => setNewPlanMaxOpenPositions(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none text-foreground" />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end pt-4 border-t border-border mt-5">
                    <button type="button" onClick={() => setShowAddPlanModal(false)} className="px-4 py-2 rounded-xl border border-border text-muted-foreground hover:bg-muted font-semibold">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold shadow">Save Plan</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal 3: Broadcast Signal Modal */}
          {showBroadcastSignalModal && (
            <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-zoom-in">
                <button
                  onClick={() => setShowBroadcastSignalModal(false)}
                  className="absolute right-4 top-4 p-1 rounded-lg hover:bg-muted text-muted-foreground"
                >
                  <XCircle className="w-4 h-4" />
                </button>
                <h3 className="text-md font-bold text-foreground mb-1">Broadcast Manual Order Signal</h3>
                <p className="text-xs text-muted-foreground mb-5">Instantly pushes buy/sell orders executing across subscribed user demat</p>
                <form onSubmit={handleBroadcastSignal} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-muted-foreground mb-1.5">Trade Instrument</label>
                    <select value={sigInstrument} onChange={(e) => setSigInstrument(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none font-bold">
                      <option value="NIFTY 50">NIFTY 50</option>
                      <option value="BANKNIFTY">BANKNIFTY</option>
                      <option value="FINNIFTY">FINNIFTY</option>
                      <option value="SENSEX">SENSEX</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5">Order Type Direction</label>
                    <select value={sigType} onChange={(e: any) => setSigType(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none font-bold">
                      <option value="BUY">BUY ORDER (Long)</option>
                      <option value="SELL">SELL ORDER (Short)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5">Execution Reference Price (₹)</label>
                    <input type="number" step="0.05" required value={sigPrice} onChange={(e) => setSigPrice(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none text-foreground font-mono font-bold" />
                  </div>
                  <div className="flex gap-3 justify-end pt-4 border-t border-border mt-5">
                    <button type="button" onClick={() => setShowBroadcastSignalModal(false)} className="px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:bg-muted font-semibold">Cancel</button>
                    <button type="submit" className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow">Broadcast Live</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal 4: Assign Plan Modal */}
          {showAssignPlanModal && selectedUserForPlan && (
            <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-zoom-in">
                <button
                  onClick={() => setShowAssignPlanModal(false)}
                  className="absolute right-4 top-4 p-1 rounded-lg hover:bg-muted text-muted-foreground"
                >
                  <XCircle className="w-4 h-4" />
                </button>
                <h3 className="text-md font-bold text-foreground mb-1">Assign Subscription License</h3>
                <p className="text-xs text-muted-foreground mb-5">Link a specific subscription model to user: <strong>{selectedUserForPlan.name}</strong></p>
                <form onSubmit={handleAssignPlan} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-muted-foreground mb-1.5">Choose License Model Template</label>
                    <select
                      value={assignedPlanId}
                      onChange={(e) => setAssignedPlanId(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none font-bold"
                    >
                      {plans.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-3 justify-end pt-4 border-t border-border mt-5">
                    <button type="button" onClick={() => setShowAssignPlanModal(false)} className="px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:bg-muted font-semibold">Cancel</button>
                    <button type="submit" className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow">Assign License</button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>
`;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully replaced layout code!");
