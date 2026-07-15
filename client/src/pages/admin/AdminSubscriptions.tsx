import { Plus } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  maxLotLimit: number;
  maxCapital: number;
  maxOpenPositions: number;
}

interface AdminSubscriptionsProps {
  plans: Plan[];
  setShowAddPlanModal: (show: boolean) => void;
  handleDeletePlan: (id: string) => void;
}

export default function AdminSubscriptions({ plans, setShowAddPlanModal, handleDeletePlan }: AdminSubscriptionsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Subscription Catalog Management</h2>
          <p className="text-xs text-muted-foreground">Manage and define subscription models, licensing thresholds, pricing & sizing caps</p>
        </div>
        <button
          onClick={() => setShowAddPlanModal(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-none flex items-center gap-2 shadow cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Define Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className="bg-card border border-border p-5 rounded-none flex flex-col justify-between hover:shadow-md transition-shadow">
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
              className="w-full text-center py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-bold rounded-none border border-rose-500/20 transition-all mt-4 cursor-pointer"
            >
              Remove Plan Template
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
