interface Broker { id: string; name: string; enabled: boolean; }
interface AdminBrokersProps { brokers: Broker[]; handleToggleBroker: (id: string) => void; }

export default function AdminBrokers({ brokers, handleToggleBroker }: AdminBrokersProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-bold text-foreground">Broker Gateway Configurations</h2>
        <p className="text-xs text-muted-foreground">Manage active connection states and credentials routing flags for supported Indian Brokers</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {brokers.map(broker => (
          <div key={broker.id} className="bg-card border border-border p-5 rounded-none flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-foreground text-md">{broker.name}</h3>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">Gateway code: {broker.id}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${broker.enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
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
              className={`w-full py-2.5 rounded-none text-xs font-bold border transition-colors cursor-pointer ${broker.enabled ? 'bg-rose-500/10 text-rose-500 border-rose-500/25 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25 hover:bg-emerald-500/20'}`}
            >
              {broker.enabled ? 'Disable Gateway Connection' : 'Enable Gateway Connection'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
