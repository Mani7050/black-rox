import React, { useState } from 'react';
import type { Strategy } from '../../types';
import {
  List,
  LayoutGrid,
  MoreVertical,
  Eye,
  CheckCircle2,
  Ban,
  Save,
  Info
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

interface UserStrategiesProps {
  strategies: Strategy[];
  handleSaveStrategy: (id: string, strategyCode: string, quantity: number, status: 'active' | 'inactive') => void;
  addToast: (type: 'info' | 'success' | 'warning' | 'error', title: string, message: string) => void;
}

export default function UserStrategies({ strategies, handleSaveStrategy, addToast }: UserStrategiesProps) {
  // View mode state (matching Admin Trading & Broker Management)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modal for strategy info
  const [infoModalStrat, setInfoModalStrat] = useState<Strategy | null>(null);

  // Local state for row modifications
  const [rowStates, setRowStates] = useState<Record<string, { strategyCode: string; quantity: number; status: 'active' | 'inactive' }>>({});

  const getRowState = (strat: Strategy) => {
    return rowStates[strat.id] || {
      strategyCode: strat.strategyCode || strat.name,
      quantity: strat.quantity !== undefined ? strat.quantity : 1,
      status: strat.status || 'inactive'
    };
  };

  const updateRowState = (id: string, field: 'strategyCode' | 'quantity' | 'status', value: any) => {
    setRowStates(prev => {
      const currentStrat = strategies.find(s => s.id === id);
      const existing = prev[id] || {
        strategyCode: currentStrat?.strategyCode || currentStrat?.name || '',
        quantity: currentStrat?.quantity !== undefined ? currentStrat.quantity : 1,
        status: currentStrat?.status || 'inactive'
      };
      return {
        ...prev,
        [id]: {
          ...existing,
          [field]: value
        }
      };
    });
  };

  const handleSaveRow = (strat: Strategy) => {
    const state = getRowState(strat);
    handleSaveStrategy(strat.id, state.strategyCode, state.quantity, state.status);
    addToast('success', 'Strategy Saved', `Updated configuration for ${strat.asset || strat.name} (${state.strategyCode})`);
  };

  const getAvatarColor = (name: string) => {
    const avatarColors = [
      'bg-rose-500/15 text-rose-600 dark:bg-rose-500/25 dark:text-rose-400',
      'bg-amber-500/15 text-amber-600 dark:bg-amber-500/25 dark:text-amber-400',
      'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400',
      'bg-blue-500/15 text-blue-600 dark:bg-blue-500/25 dark:text-blue-400',
      'bg-purple-500/15 text-purple-600 dark:bg-purple-500/25 dark:text-purple-400',
      'bg-indigo-500/15 text-indigo-600 dark:bg-indigo-500/25 dark:text-indigo-400',
      'bg-pink-500/15 text-pink-600 dark:bg-pink-500/25 dark:text-pink-400'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header Section - Matching Admin Trading & Broker Management */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Assets & Strategies</h2>
          <p className="text-xs text-muted-foreground">
            Manage your trading strategies across different assets
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Table / Grid View Toggle */}
          <div className="flex items-center border border-border bg-card p-0.5 rounded-none">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-none cursor-pointer transition-colors ${
                viewMode === 'table'
                  ? 'bg-primary text-primary-foreground font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-none cursor-pointer transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary text-primary-foreground font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* View Modes */}
      {viewMode === 'table' ? (
        /* Supported Strategies Table Layout - Matching Admin Trading Layout */
        <div className="w-full overflow-x-auto md:overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-xs font-bold text-muted-foreground">
                <th className="p-4 py-3">Asset Name</th>
                <th className="p-4 py-3">Asset Type</th>
                <th className="p-4 py-3">Strategy Code</th>
                <th className="p-4 py-3 text-center">Default Lot Qty</th>
                <th className="p-4 py-3 text-center">Max Limit</th>
                <th className="p-4 py-3 text-center">Status</th>
                <th className="p-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {strategies.map((strat) => {
                const assetName = strat.asset || strat.instrument || strat.name;
                const initials = getInitials(assetName);
                const colorClass = getAvatarColor(assetName);
                const rowState = getRowState(strat);
                const isEnabled = rowState.status === 'active';

                const options = strat.availableOptions || [strat.strategyCode || strat.name, 'DefaultBot'];
                const isSelectedCodeInOptions = options.includes(rowState.strategyCode);
                const dropdownOptions = isSelectedCodeInOptions ? options : [rowState.strategyCode, ...options];

                return (
                  <tr key={strat.id} className="hover:bg-muted/10 transition-colors whitespace-nowrap">
                    {/* Asset Name with Circle Avatar */}
                    <td className="p-4 py-3.5">
                      <div className="flex items-center gap-3 font-semibold text-foreground">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${colorClass}`}>
                          {initials}
                        </div>
                        <span>{assetName}</span>
                      </div>
                    </td>

                    {/* Asset Type */}
                    <td className="p-4 py-3.5 text-muted-foreground">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-muted border border-border text-muted-foreground">
                        {strat.assetType || strat.type || 'INDEX'}
                      </span>
                    </td>

                    {/* Strategy Option Dropdown */}
                    <td className="p-4 py-3.5 min-w-[160px]">
                      <select
                        value={rowState.strategyCode}
                        onChange={(e) => updateRowState(strat.id, 'strategyCode', e.target.value)}
                        className="w-full bg-background border border-border rounded-none px-2.5 py-1.5 text-xs font-semibold text-foreground outline-none focus:border-primary transition-colors cursor-pointer"
                      >
                        {dropdownOptions.map((opt, idx) => (
                          <option key={idx} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Default Lot Qty (Editable Input) */}
                    <td className="p-4 py-3.5 text-center w-32">
                      <input
                        type="number"
                        min="0"
                        max={strat.limit || 10000}
                        value={rowState.quantity}
                        onChange={(e) => updateRowState(strat.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-20 bg-background border border-border rounded-none px-2.5 py-1.5 text-xs text-center font-bold text-foreground outline-none focus:border-primary transition-colors mx-auto"
                      />
                    </td>

                    {/* Max Limit */}
                    <td className="p-4 py-3.5 text-center text-muted-foreground font-mono">
                      {strat.limit || 500}
                    </td>

                    {/* Status Pill Badge */}
                    <td className="p-4 py-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                        isEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'
                      }`}>
                        {isEnabled ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </td>

                    {/* Actions: Save Button + Dropdown Menu */}
                    <td className="p-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSaveRow(strat)}
                          className="px-3 py-1 bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs rounded-none transition-opacity cursor-pointer flex items-center gap-1.5"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Save
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="p-1.5 rounded-none hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px] rounded-none bg-card border border-border shadow-xl p-0 py-1.5">
                            <DropdownMenuItem
                              onClick={() => setInfoModalStrat(strat)}
                              className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground"
                            >
                              <Eye className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              <span>View Specs</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateRowState(strat.id, 'status', isEnabled ? 'inactive' : 'active')}
                              className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted ${
                                isEnabled ? 'text-rose-500 focus:text-rose-500 focus:bg-rose-500/10' : 'text-emerald-500 focus:text-emerald-500 focus:bg-emerald-500/10'
                              }`}
                            >
                              {isEnabled ? (
                                <>
                                  <Ban className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                                  <span>Disable Strategy</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                                  <span>Enable Strategy</span>
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border/60 my-1 -mx-0" />
                            <DropdownMenuItem
                              onClick={() => handleSaveRow(strat)}
                              className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors cursor-pointer flex items-center gap-2 rounded-none"
                            >
                              <Save className="w-3.5 h-3.5 shrink-0" />
                              <span>Save Parameters</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {strategies.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground text-xs">
                    No strategies available in catalog. Admin will configure strategies for you.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Supported Strategies Grid List - Matching Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {strategies.map((strat) => {
            const assetName = strat.asset || strat.instrument || strat.name;
            const initials = getInitials(assetName);
            const colorClass = getAvatarColor(assetName);
            const rowState = getRowState(strat);
            const isEnabled = rowState.status === 'active';

            const options = strat.availableOptions || [strat.strategyCode || strat.name, 'DefaultBot'];
            const isSelectedCodeInOptions = options.includes(rowState.strategyCode);
            const dropdownOptions = isSelectedCodeInOptions ? options : [rowState.strategyCode, ...options];

            return (
              <div key={strat.id} className="bg-card border border-border p-5 rounded-none flex flex-col justify-between hover:shadow-md transition-shadow relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${colorClass}`}>
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-md">{assetName}</h3>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-muted border border-border text-muted-foreground px-2 py-0.5 rounded mt-0.5 inline-block">
                        {strat.assetType || strat.type || 'INDEX'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      isEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'
                    }`}>
                      {isEnabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="p-1 rounded-none hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px] rounded-none bg-card border border-border shadow-xl p-0 py-1.5">
                        <DropdownMenuItem
                          onClick={() => setInfoModalStrat(strat)}
                          className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 rounded-none"
                        >
                          <Eye className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span>View Specs</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateRowState(strat.id, 'status', isEnabled ? 'inactive' : 'active')}
                          className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 rounded-none ${
                            isEnabled ? 'text-rose-500 focus:text-rose-500' : 'text-emerald-500 focus:text-emerald-500'
                          }`}
                        >
                          {isEnabled ? (
                            <>
                              <Ban className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                              <span>Disable Strategy</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                              <span>Enable Strategy</span>
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-border/60 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Strategy Code</label>
                      <select
                        value={rowState.strategyCode}
                        onChange={(e) => updateRowState(strat.id, 'strategyCode', e.target.value)}
                        className="w-full bg-background border border-border rounded-none px-2 py-1 text-xs font-semibold text-foreground outline-none focus:border-primary cursor-pointer"
                      >
                        {dropdownOptions.map((opt, idx) => (
                          <option key={idx} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Lot Quantity</label>
                      <input
                        type="number"
                        min="0"
                        max={strat.limit || 10000}
                        value={rowState.quantity}
                        onChange={(e) => updateRowState(strat.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full bg-background border border-border rounded-none px-2 py-1 text-xs font-bold text-foreground outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-muted-foreground font-mono">Max Capping: {strat.limit || 500}</span>
                    <button
                      onClick={() => handleSaveRow(strat)}
                      className="px-4 py-1.5 bg-primary text-primary-foreground font-bold text-xs rounded-none cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Specs Modal */}
      {infoModalStrat && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border w-full max-w-lg p-6 rounded-none shadow-xl relative animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start border-b border-border pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Info className="w-5 h-5 text-sky-500" />
                  {infoModalStrat.asset || infoModalStrat.name} Specs
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Algorithm parameters and execution specifications
                </p>
              </div>
              <button
                onClick={() => setInfoModalStrat(null)}
                className="text-muted-foreground hover:text-foreground font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex gap-2 items-center">
                <span className="font-bold text-muted-foreground">Asset:</span>
                <span className="font-bold text-foreground">{infoModalStrat.asset || infoModalStrat.instrument}</span>
                <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-muted border border-border text-muted-foreground">
                  {infoModalStrat.assetType || infoModalStrat.type || 'INDEX'}
                </span>
              </div>

              <div>
                <span className="font-bold text-muted-foreground block mb-1">Strategy Name:</span>
                <span className="font-mono bg-muted/50 border border-border px-2.5 py-1 block rounded-none text-foreground">
                  {infoModalStrat.strategyCode || infoModalStrat.name}
                </span>
              </div>

              <div>
                <span className="font-bold text-muted-foreground block mb-1">Description:</span>
                <p className="p-3 bg-background border border-border rounded-none text-muted-foreground leading-relaxed">
                  {infoModalStrat.description || 'Automated high-speed algorithmic trading strategy with dynamic risk control and real-time execution.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-muted/30 border border-border rounded-none">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Max Lot Capping</span>
                  <span className="text-sm font-bold text-foreground font-mono">{infoModalStrat.limit || 1000}</span>
                </div>
                <div className="p-3 bg-muted/30 border border-border rounded-none">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Default Lot Size</span>
                  <span className="text-sm font-bold text-foreground font-mono">{infoModalStrat.quantity || 1}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-border pt-4 flex justify-end">
              <button
                onClick={() => setInfoModalStrat(null)}
                className="px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-none cursor-pointer hover:opacity-90 transition-opacity"
              >
                Close Specs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
