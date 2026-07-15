interface Signal { id: string; instrument: string; type: string; price: number; time: string; status: string; }
interface AdminSignalsProps { signalsList: Signal[]; setShowBroadcastSignalModal: (show: boolean) => void; }
import { Plus } from 'lucide-react';

export default function AdminSignals({ signalsList, setShowBroadcastSignalModal }: AdminSignalsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Signal Station Console</h2>
          <p className="text-xs text-muted-foreground">Broadcast manual Buy/Sell trading signals to all connected strategy subscribers</p>
        </div>
        <button
          onClick={() => setShowBroadcastSignalModal(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-none flex items-center gap-2 shadow cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Broadcast Trade Signal
        </button>
      </div>
      <div className="bg-card border border-border rounded-none overflow-hidden">
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
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${sig.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
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
  );
}
