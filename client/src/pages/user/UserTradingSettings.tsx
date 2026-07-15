interface TradingSettingsProps {
  riskDefaultLotSize: string;
  setRiskDefaultLotSize: (val: string) => void;
  riskDailyLimit: string;
  setRiskDailyLimit: (val: string) => void;
  riskStopLoss: string;
  setRiskStopLoss: (val: string) => void;
  riskTarget: string;
  setRiskTarget: (val: string) => void;
  riskMaxTrades: string;
  setRiskMaxTrades: (val: string) => void;
  isUpdatingRiskSettings: boolean;
  handleUpdateRiskSettings: (e: React.FormEvent) => void;
}

export default function UserTradingSettings({
  riskDefaultLotSize, setRiskDefaultLotSize,
  riskDailyLimit, setRiskDailyLimit,
  riskStopLoss, setRiskStopLoss,
  riskTarget, setRiskTarget,
  riskMaxTrades, setRiskMaxTrades,
  isUpdatingRiskSettings,
  handleUpdateRiskSettings,
}: TradingSettingsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-bold text-foreground">Personalized Safety Limits & Risk Parameters</h2>
        <p className="text-xs text-muted-foreground">Set your default lot sizes, stop loss rules, and maximum active positions</p>
      </div>

      <div className="bg-card border border-border p-5 rounded-none max-w-lg shadow-sm">
        <h3 className="text-sm font-bold text-foreground mb-4">Risk Controls Configuration</h3>
        <form onSubmit={handleUpdateRiskSettings} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-muted-foreground mb-1">Default Lot Size</label>
              <input
                type="number" required value={riskDefaultLotSize}
                onChange={e => setRiskDefaultLotSize(e.target.value)}
                className="w-full bg-background border border-border rounded-none px-3 py-2.5 outline-none focus:border-primary text-foreground font-mono"
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Daily Loss Limit (₹)</label>
              <input
                type="number" required value={riskDailyLimit}
                onChange={e => setRiskDailyLimit(e.target.value)}
                className="w-full bg-background border border-border rounded-none px-3 py-2.5 outline-none focus:border-primary text-foreground font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-muted-foreground mb-1">Stop Loss % (SL%)</label>
              <input
                type="number" step="0.1" required value={riskStopLoss}
                onChange={e => setRiskStopLoss(e.target.value)}
                className="w-full bg-background border border-border rounded-none px-3 py-2.5 outline-none focus:border-primary text-foreground font-mono"
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Target Profit % (TP%)</label>
              <input
                type="number" step="0.1" required value={riskTarget}
                onChange={e => setRiskTarget(e.target.value)}
                className="w-full bg-background border border-border rounded-none px-3 py-2.5 outline-none focus:border-primary text-foreground font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-muted-foreground mb-1">Max Open Positions Count</label>
            <input
              type="number" required value={riskMaxTrades}
              onChange={e => setRiskMaxTrades(e.target.value)}
              className="w-full bg-background border border-border rounded-none px-3 py-2.5 outline-none focus:border-primary text-foreground font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isUpdatingRiskSettings}
            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-none mt-4 cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {isUpdatingRiskSettings ? 'Updating safety params...' : 'Save Safety Configurations'}
          </button>
        </form>
      </div>
    </div>
  );
}
