import { Cpu, Sun, Moon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface HeaderProps {
  ticks: Record<string, number>;
  tickDirections: Record<string, 'up' | 'down' | 'neutral'>;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  isConnected: boolean;
  isConnecting: boolean;
}

export function Header({
  ticks,
  tickDirections,
  isDarkMode,
  setIsDarkMode,
  isConnected,
  isConnecting
}: HeaderProps) {
  return (
    <header className="border-b border-border bg-background/60 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-3">
        <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/10">
          <Cpu className="w-6 h-6 text-primary-foreground animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent">
            BlackRox <span className="text-primary font-semibold text-sm align-super ml-0.5">ALGO</span>
          </h1>
          <p className="text-xs text-muted-foreground">Professional High-Frequency Algo Trading Terminal</p>
        </div>
      </div>

      {/* Real-time Ticker */}
      <div className="hidden lg:flex items-center gap-6 bg-card/40 border border-border rounded-2xl px-5 py-2">
        {Object.entries(ticks).map(([symbol, price]) => {
          const dir = tickDirections[symbol] || 'neutral';
          return (
            <div key={symbol} className="flex items-center gap-2 text-xs border-r border-border/80 pr-6 last:border-r-0 last:pr-0">
              <span className="text-muted-foreground font-medium">{symbol}</span>
              <span
                className={`font-mono font-bold transition-all duration-500 px-1.5 py-0.5 rounded ${
                  dir === 'up' ? 'text-emerald-400 bg-emerald-500/10' :
                  dir === 'down' ? 'text-rose-400 bg-rose-500/10' :
                  'text-foreground'
                }`}
              >
                {price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              {dir === 'up' && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              {dir === 'down' && <ArrowDownRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
            </div>
          );
        })}
      </div>

      {/* Action Controls (Theme toggler & Connection Indicator) */}
      <div className="flex items-center gap-3">
        {/* Theme toggler */}
        <button
          onClick={() => setIsDarkMode(prev => !prev)}
          className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          title="Toggle theme (Light / Dark)"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${
          isConnected ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/20' :
          isConnecting ? 'bg-amber-950/30 text-amber-400 border-amber-500/20' :
          'bg-destructive/10 text-destructive border-destructive/20'
        }`}>
          <span className={`w-2.5 h-2.5 rounded-full ${
            isConnected ? 'bg-emerald-400 animate-ping' :
            isConnecting ? 'bg-amber-400 animate-pulse' :
            'bg-destructive'
          }`} />
          {isConnected ? 'LIVE FEED' : isConnecting ? 'CONNECTING...' : 'OFFLINE MODE'}
        </div>
      </div>
    </header>
  );
}
