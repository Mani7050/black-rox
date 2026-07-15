interface Trade {
  id: string;
  strategyName: string;
  instrument: string;
  type: string;
  price: number;
  quantity: number;
  pnl?: number;
}

interface UserOrdersProps {
  trades: Trade[];
}

export default function UserOrders({ trades }: UserOrdersProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-bold text-foreground">Transaction Ledgers & Reports</h2>
        <p className="text-xs text-muted-foreground">Complete record of your demat buy and sell order fills</p>
      </div>

      <div className="bg-card border border-border rounded-none overflow-hidden shadow-sm">
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
            {trades.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground text-xs">
                  No trade records found. Trades will appear here once your strategies execute orders.
                </td>
              </tr>
            ) : (
              trades.map(trade => (
                <tr key={trade.id} className="hover:bg-muted/10">
                  <td className="p-4 font-bold">{trade.id}</td>
                  <td className="p-4 text-foreground font-semibold">{trade.strategyName}</td>
                  <td className="p-4">{trade.instrument}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      trade.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="p-4 text-foreground">₹{trade.price.toFixed(2)}</td>
                  <td className="p-4 font-bold">{trade.quantity}</td>
                  <td className="p-4 text-right">
                    {trade.pnl !== undefined ? (
                      <span className={`font-extrabold ${trade.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trade.pnl >= 0 ? '+' : ''}₹{trade.pnl.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/45">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
