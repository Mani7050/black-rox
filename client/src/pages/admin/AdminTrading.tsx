import React, { useState } from 'react';
import type { Strategy } from '../../types';
import {
  Plus,
  Trash2,
  List,
  LayoutGrid,
  MoreVertical,
  Eye,
  Pencil,
  CheckCircle2,
  Ban,
  Info
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

interface AdminTradingProps {
  strategies: Strategy[];
  handleToggleStrategy: (id: string) => void;
  handleCreateStrategy: (data: { asset: string; assetType: string; name: string; strategyCode: string; quantity: number; limit: number; description: string }) => void;
  handleDeleteStrategy: (id: string) => void;
}

export default function AdminTrading({
  strategies,
  handleToggleStrategy,
  handleCreateStrategy,
  handleDeleteStrategy,
}: AdminTradingProps) {
  // View mode state (matching Broker Management)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStratForEdit, setSelectedStratForEdit] = useState<Strategy | null>(null);
  const [infoModalStrat, setInfoModalStrat] = useState<Strategy | null>(null);

  // Add form fields
  const [asset, setAsset] = useState('');
  const [assetType, setAssetType] = useState('INDEX');
  const [name, setName] = useState('');
  const [strategyCode, setStrategyCode] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [limit, setLimit] = useState('500');
  const [description, setDescription] = useState('');

  // Edit form fields
  const [editCode, setEditCode] = useState('');
  const [editQty, setEditQty] = useState('1');
  const [editLimit, setEditLimit] = useState('500');
  const [editDesc, setEditDesc] = useState('');

  const onSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset || !name) return;
    handleCreateStrategy({
      asset,
      assetType,
      name,
      strategyCode: strategyCode || name,
      quantity: parseInt(quantity) || 1,
      limit: parseInt(limit) || 500,
      description
    });
    setShowAddModal(false);
    setAsset('');
    setName('');
    setStrategyCode('');
    setQuantity('1');
    setLimit('500');
    setDescription('');
  };

  const openEditModal = (strat: Strategy) => {
    setSelectedStratForEdit(strat);
    setEditCode(strat.strategyCode || strat.name);
    setEditQty(String(strat.quantity || 1));
    setEditLimit(String(strat.limit || 500));
    setEditDesc(strat.description || '');
    setShowEditModal(true);
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
      {/* Header Section - Exactly matching Broker Management */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Platform Trading & Strategy Management</h2>
          <p className="text-xs text-muted-foreground">
            Manage active strategy configurations and parameters for supported trading instruments
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Table / Grid View Toggle (Matching Broker Management) */}
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

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-none flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create New Strategy
          </button>
        </div>
      </div>

      {/* View Modes */}
      {viewMode === 'table' ? (
        /* Supported Strategies Table Layout - Exactly matching Broker Gateway Table */
        <div className="w-full overflow-x-auto md:overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-xs font-bold text-muted-foreground">
                <th className="p-4 py-3">Asset Name</th>
                <th className="p-4 py-3">Strategy Code</th>
                <th className="p-4 py-3">Asset Type</th>
                <th className="p-4 py-3">Default Lot Qty</th>
                <th className="p-4 py-3">Max Limit</th>
                <th className="p-4 py-3">Status</th>
                <th className="p-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {strategies.map((strat) => {
                const assetName = strat.asset || strat.instrument || strat.name;
                const initials = getInitials(assetName);
                const colorClass = getAvatarColor(assetName);
                const isEnabled = strat.status === 'active';

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

                    {/* Strategy Code */}
                    <td className="p-4 py-3.5 font-mono text-muted-foreground">
                      {strat.strategyCode || strat.name}
                    </td>

                    {/* Asset Type */}
                    <td className="p-4 py-3.5 text-muted-foreground">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-muted border border-border text-muted-foreground">
                        {strat.assetType || strat.type || 'INDEX'}
                      </span>
                    </td>

                    {/* Default Lot Qty */}
                    <td className="p-4 py-3.5 font-mono font-bold text-foreground">
                      {strat.quantity !== undefined ? strat.quantity : 1}
                    </td>

                    {/* Max Limit */}
                    <td className="p-4 py-3.5 text-muted-foreground font-mono">
                      {strat.limit || 500}
                    </td>

                    {/* Status Pill Badge - Matching ENABLED / DISABLED style */}
                    <td className="p-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                        isEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'
                      }`}>
                        {isEnabled ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </td>

                    {/* Actions Dropdown */}
                    <td className="p-4 py-3.5 text-right">
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
                            onClick={() => openEditModal(strat)}
                            className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground"
                          >
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span>Edit Strategy</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleStrategy(strat.id)}
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
                            onClick={() => handleDeleteStrategy(strat.id)}
                            className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-rose-500/10 focus:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Delete Strategy</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}

              {strategies.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground text-xs">
                    No strategies available in catalog. Click "Create New Strategy" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Supported Strategies Grid List - Exactly matching Broker Gateway Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {strategies.map((strat) => {
            const assetName = strat.asset || strat.instrument || strat.name;
            const initials = getInitials(assetName);
            const colorClass = getAvatarColor(assetName);
            const isEnabled = strat.status === 'active';

            return (
              <div key={strat.id} className="bg-card border border-border p-5 rounded-none flex flex-col justify-between hover:shadow-md transition-shadow relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${colorClass}`}>
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-md">{assetName}</h3>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5 font-mono">
                        Code: {strat.strategyCode || strat.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      isEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'
                    }`}>
                      {isEnabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                    <div>
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
                            className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground"
                          >
                            <Eye className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span>View Specs</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEditModal(strat)}
                            className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground"
                          >
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span>Edit Strategy</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleStrategy(strat.id)}
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
                            onClick={() => handleDeleteStrategy(strat.id)}
                            className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-rose-500/10 focus:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Delete Strategy</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-border/60">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Asset Type</span>
                    <span className="font-bold text-foreground">{strat.assetType || strat.type || 'INDEX'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Default Lot Qty</span>
                    <span className="font-bold text-foreground font-mono">{strat.quantity !== undefined ? strat.quantity : 1}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Max Lot Limit</span>
                    <span className="font-bold text-foreground font-mono">{strat.limit || 500}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Allocated Headroom</span>
                    <span className="font-bold text-foreground font-mono">₹{(strat.capital || 100000).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Strategy Side Sheet Drawer */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-card border-l border-border h-full w-full max-w-lg p-6 overflow-y-auto animate-in slide-in-from-right duration-300 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-border pb-4 mb-6">
                <div>
                  <h3 className="text-base font-extrabold text-foreground">Create Asset Strategy Template</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Configure algorithm parameters for trading terminals</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-muted-foreground hover:text-foreground font-bold p-1.5 hover:bg-muted rounded-none transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form id="create-strategy-form" onSubmit={onSubmitCreate} className="space-y-5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground mb-1.5 font-bold">Asset Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. FINNIFTY"
                      value={asset}
                      onChange={(e) => setAsset(e.target.value)}
                      className="w-full bg-background border border-border rounded-none px-3 py-2 outline-none font-bold text-foreground focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5 font-bold">Asset Type *</label>
                    <select
                      value={assetType}
                      onChange={(e) => setAssetType(e.target.value)}
                      className="w-full bg-background border border-border rounded-none px-3 py-2 outline-none font-bold text-foreground focus:border-primary cursor-pointer"
                    >
                      <option value="INDEX">INDEX</option>
                      <option value="COMMODITY">COMMODITY</option>
                      <option value="STOCK">STOCK</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground mb-1.5 font-bold">Strategy Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. FinDeltaNeutral"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-background border border-border rounded-none px-3 py-2 outline-none font-bold text-foreground focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5 font-bold">Strategy Code</label>
                    <input
                      type="text"
                      placeholder="e.g. AXFIN"
                      value={strategyCode}
                      onChange={(e) => setStrategyCode(e.target.value)}
                      className="w-full bg-background border border-border rounded-none px-3 py-2 outline-none font-mono text-foreground focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground mb-1.5 font-bold">Default Quantity</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full bg-background border border-border rounded-none px-3 py-2 outline-none font-mono text-foreground focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5 font-bold">Max Limit</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={limit}
                      onChange={(e) => setLimit(e.target.value)}
                      className="w-full bg-background border border-border rounded-none px-3 py-2 outline-none font-mono text-foreground focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1.5 font-bold">Strategy Description</label>
                  <textarea
                    rows={4}
                    placeholder="Describe the logic and execution parameters of this algorithm..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-background border border-border rounded-none px-3 py-2 outline-none text-foreground focus:border-primary leading-relaxed"
                  />
                </div>
              </form>
            </div>

            <div className="pt-6 border-t border-border flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-border text-muted-foreground hover:text-foreground font-bold rounded-none cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="create-strategy-form"
                className="px-5 py-2 bg-primary text-primary-foreground font-bold rounded-none cursor-pointer hover:opacity-90 transition-opacity"
              >
                Save Strategy Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {infoModalStrat && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border w-full max-w-lg p-6 rounded-none shadow-xl relative animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start border-b border-border pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Info className="w-5 h-5 text-sky-500" />
                  {infoModalStrat.asset || infoModalStrat.name} Specifications
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Algorithm execution settings and user boundaries
                </p>
              </div>
              <button onClick={() => setInfoModalStrat(null)} className="text-muted-foreground hover:text-foreground font-bold p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex gap-2 items-center">
                <span className="font-bold text-muted-foreground">Asset Name:</span>
                <span className="font-bold text-foreground">{infoModalStrat.asset || infoModalStrat.instrument}</span>
                <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-muted border border-border text-muted-foreground">
                  {infoModalStrat.assetType || infoModalStrat.type || 'INDEX'}
                </span>
              </div>

              <div>
                <span className="font-bold text-muted-foreground block mb-1">Strategy Code:</span>
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
                  <span className="text-sm font-bold text-foreground font-mono">{infoModalStrat.limit || 500}</span>
                </div>
                <div className="p-3 bg-muted/30 border border-border rounded-none">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Default Lot Size</span>
                  <span className="text-sm font-bold text-foreground font-mono">{infoModalStrat.quantity !== undefined ? infoModalStrat.quantity : 1}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-border pt-4 flex justify-end">
              <button
                onClick={() => setInfoModalStrat(null)}
                className="px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-none cursor-pointer hover:opacity-90"
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
