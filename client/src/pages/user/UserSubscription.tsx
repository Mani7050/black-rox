interface Plan {
  id: string;
  name: string;
  durationDays: number;
  maxLotLimit: number;
  maxCapital: number;
  maxOpenPositions: number;
}

interface UserSubscriptionProps {
  user: { planId?: string } | null;
  plans: Plan[];
  addToast: (type: string, title: string, msg: string) => void;
}

export default function UserSubscription({ user, plans, addToast }: UserSubscriptionProps) {
  const activePlan = plans.find(p => p.id === user?.planId);

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-bold text-foreground">License & Subscription</h2>
        <p className="text-xs text-muted-foreground">View current subscription allocation settings and license constraints</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Plan */}
        <div className="lg:col-span-1 bg-card border border-border p-5 rounded-none shadow-sm space-y-4">
          <span className="text-[9px] uppercase font-extrabold tracking-wider bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded">
            Current Active License
          </span>
          <div>
            <h3 className="text-lg font-bold text-foreground">{activePlan?.name || 'Pro Scalper'}</h3>
            <p className="text-xs text-muted-foreground">
              Renewal due in {activePlan?.durationDays || 18} Days ({activePlan?.durationDays || 30}-day template)
            </p>
          </div>
          <div className="border-t border-border/60 pt-3 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Lot Size limit:</span>
              <span className="font-bold font-mono">{activePlan?.maxLotLimit || 10} Lots</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Allocated Capital:</span>
              <span className="font-bold font-mono">₹{(activePlan?.maxCapital || 5000000).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Open Positions:</span>
              <span className="font-bold">{activePlan?.maxOpenPositions || 5} Open Trades</span>
            </div>
          </div>
        </div>

        {/* Upgrade Plans */}
        <div className="lg:col-span-2 bg-card border border-border p-5 rounded-none shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4">License Upgrades Directory</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border border-border bg-background/50 rounded-none flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-xs">VIP Unlimited Plan</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Scale without safety limits</p>
                <p className="text-sm font-black text-primary mt-2">₹9,999 / 90 Days</p>
              </div>
              <button
                onClick={() => addToast('info', 'Upgrade Requested', 'Contact admin to activate VIP Unlimited license.')}
                className="w-full py-2 bg-primary text-primary-foreground text-xs font-bold rounded-none mt-4 cursor-pointer hover:opacity-90 transition-opacity"
              >
                Request Upgrade
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
