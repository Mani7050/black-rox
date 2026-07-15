interface Credential {
  id: string;
  broker: string;
  userId: string;
  status: string;
  lastConnected?: string | null;
  funds?: number;
  margin?: number;
}

interface UserBrokerProps {
  credentials: Credential[];
  brokerSelect: string;
  setBrokerSelect: (val: string) => void;
  brokerUserId: string;
  setBrokerUserId: (val: string) => void;
  brokerKey: string;
  setBrokerKey: (val: string) => void;
  brokerSecret: string;
  setBrokerSecret: (val: string) => void;
  brokerTotp: string;
  setBrokerTotp: (val: string) => void;
  handleConnectDemat: (e: React.FormEvent) => void;
  handleDisconnectBroker: (id: string) => void;
}

export default function UserBroker({
  credentials, brokerSelect, setBrokerSelect,
  brokerUserId, setBrokerUserId,
  brokerKey, setBrokerKey,
  brokerSecret, setBrokerSecret,
  brokerTotp, setBrokerTotp,
  handleConnectDemat, handleDisconnectBroker,
}: UserBrokerProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-bold text-foreground">Broker Credentials Connection</h2>
        <p className="text-xs text-muted-foreground">Securely link your Indian broker API to route algorithmic trades directly into your demat</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connect Form */}
        <div className="lg:col-span-1 bg-card border border-border p-5 rounded-none shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4">Connect Broker Gateway</h3>
          <form onSubmit={handleConnectDemat} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-muted-foreground mb-1">Select Demat Broker</label>
              <select
                value={brokerSelect}
                onChange={e => setBrokerSelect(e.target.value)}
                className="w-full bg-background border border-border rounded-none px-3 py-2.5 outline-none font-bold"
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
                type="text" required value={brokerUserId}
                onChange={e => setBrokerUserId(e.target.value)}
                placeholder="e.g. AB1234"
                className="w-full bg-background border border-border rounded-none px-3 py-2.5 outline-none focus:border-primary text-foreground"
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">API Key</label>
              <input
                type="text" required value={brokerKey}
                onChange={e => setBrokerKey(e.target.value)}
                placeholder="KiteConnect api_key"
                className="w-full bg-background border border-border rounded-none px-3 py-2.5 outline-none focus:border-primary text-foreground"
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">API Secret Key</label>
              <input
                type="password" required value={brokerSecret}
                onChange={e => setBrokerSecret(e.target.value)}
                placeholder="KiteConnect secret"
                className="w-full bg-background border border-border rounded-none px-3 py-2.5 outline-none focus:border-primary text-foreground"
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">TOTP Secret (For 2FA Auto-Login)</label>
              <input
                type="text" required value={brokerTotp}
                onChange={e => setBrokerTotp(e.target.value)}
                placeholder="Google Authenticator secret string"
                className="w-full bg-background border border-border rounded-none px-3 py-2.5 outline-none focus:border-primary text-foreground"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-none mt-4 cursor-pointer hover:opacity-90 transition-opacity"
            >
              Authenticate Session
            </button>
          </form>
        </div>

        {/* Linked Accounts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border p-5 rounded-none shadow-sm">
            <h3 className="text-sm font-bold text-foreground mb-4">Active Broker Accounts</h3>
            {credentials.length === 0 ? (
              <p className="text-xs text-muted-foreground">No active broker sessions found. Connect your credentials on the left.</p>
            ) : (
              <div className="space-y-4">
                {credentials.map(cred => (
                  <div key={cred.id} className="p-4 bg-background border border-border rounded-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <p className="font-bold text-foreground">{cred.broker} ({cred.userId})</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Session: Connected • Last sync {new Date(cred.lastConnected || '').toLocaleTimeString()}
                      </p>
                      <div className="flex gap-4 mt-2 font-mono text-[10px]">
                        <span>Funds: ₹{cred.funds?.toLocaleString()}</span>
                        <span>Margin: ₹{cred.margin?.toLocaleString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDisconnectBroker(cred.id)}
                      className="px-3.5 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-bold rounded-none border border-rose-500/20 text-center cursor-pointer transition-colors"
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
  );
}
