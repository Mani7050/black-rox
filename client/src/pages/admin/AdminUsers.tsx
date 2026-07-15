import { MoreVertical, Plus, XCircle } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lotMultiplier?: number;
  createdAt?: string;
  lastLogin?: string;
}

interface Plan {
  id: string;
  name: string;
}

interface AdminUsersProps {
  usersList: User[];
  openActionMenuId: string | null;
  setOpenActionMenuId: (id: string | null) => void;
  setShowAddUserModal: (show: boolean) => void;
  setSelectedUserForPlan: (user: User) => void;
  setAssignedPlanId: (id: string) => void;
  setShowAssignPlanModal: (show: boolean) => void;
  handleResetUserApi: (id: string) => void;
  handleToggleUserStatus: (id: string) => void;
  currentUserId: string | undefined;
  plans: Plan[];
}

export default function AdminUsers({
  usersList,
  openActionMenuId,
  setOpenActionMenuId,
  setShowAddUserModal,
  setSelectedUserForPlan,
  setAssignedPlanId,
  setShowAssignPlanModal,
  handleResetUserApi,
  handleToggleUserStatus,
  currentUserId,
  plans,
}: AdminUsersProps) {
  const avatarColors = [
    'bg-rose-500/15 text-rose-600',
    'bg-amber-500/15 text-amber-600',
    'bg-emerald-500/15 text-emerald-600',
    'bg-blue-500/15 text-blue-600',
    'bg-purple-500/15 text-purple-600',
    'bg-indigo-500/15 text-indigo-600',
    'bg-pink-500/15 text-pink-600',
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">User Management</h2>
          <p className="text-xs text-muted-foreground">Manage user accounts, block access, configure custom sizing multipliers</p>
        </div>
        <button
          onClick={() => setShowAddUserModal(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-none flex items-center gap-2 shadow cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create User Account
        </button>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/40 border-b border-border text-xs font-bold text-muted-foreground">
              <th className="p-4 py-3">Name</th>
              <th className="p-4 py-3">Email</th>
              <th className="p-4 py-3">Role</th>
              <th className="p-4 py-3">Lot Multiplier</th>
              <th className="p-4 py-3">Created At</th>
              <th className="p-4 py-3">Last Login</th>
              <th className="p-4 py-3">Status</th>
              <th className="p-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-xs">
            {usersList.map(u => {
              const initials = u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              let hash = 0;
              for (let i = 0; i < u.name.length; i++) hash = u.name.charCodeAt(i) + ((hash << 5) - hash);
              const colorClass = avatarColors[Math.abs(hash) % avatarColors.length];
              const isMenuOpen = openActionMenuId === u.id;

              return (
                <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-4 py-3.5 flex items-center gap-3 font-semibold text-foreground">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${colorClass}`}>
                      {initials}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="p-4 py-3.5 font-mono text-muted-foreground">{u.email}</td>
                  <td className="p-4 py-3.5 capitalize">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'admin' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 py-3.5 font-mono font-bold text-foreground">{u.lotMultiplier?.toFixed(2) || '1.00'}x</td>
                  <td className="p-4 py-3.5 font-mono text-muted-foreground text-[11px]">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </td>
                  <td className="p-4 py-3.5 font-mono text-muted-foreground">
                    {u.lastLogin ? (
                      <div className="flex flex-col">
                        <span className="text-foreground font-semibold text-[11px]">
                          {new Date(u.lastLogin).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {new Date(u.lastLogin).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/60 italic text-[11px]">Never</span>
                    )}
                  </td>
                  <td className="p-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleUserStatus(u.id)}
                        disabled={u.id === currentUserId}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40 disabled:cursor-not-allowed ${
                          u.status !== 'suspended' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        title={u.status !== 'suspended' ? 'Click to Suspend' : 'Click to Activate'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            u.status !== 'suspended' ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        u.status !== 'suspended' ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        {u.status !== 'suspended' ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 py-3.5 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setOpenActionMenuId(isMenuOpen ? null : u.id)}
                        className="p-1.5 rounded-none hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {isMenuOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenActionMenuId(null)} />
                          <div className="absolute right-0 top-8 z-20 bg-card border border-border shadow-xl min-w-[160px] py-1 animate-zoom-in">
                            <button
                              onClick={() => {
                                setSelectedUserForPlan(u);
                                setAssignedPlanId(plans[0]?.id || '');
                                setShowAssignPlanModal(true);
                                setOpenActionMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                            >
                              Assign Plan
                            </button>
                            <button
                              onClick={() => { handleResetUserApi(u.id); setOpenActionMenuId(null); }}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-amber-500 hover:bg-muted transition-colors cursor-pointer"
                            >
                              Reset API
                            </button>
                            <div className="border-t border-border my-1" />
                            <button
                              onClick={() => { handleToggleUserStatus(u.id); setOpenActionMenuId(null); }}
                              disabled={u.id === currentUserId}
                              className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                u.status !== 'suspended' ? 'text-rose-500 hover:bg-rose-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'
                              }`}
                            >
                              {u.status !== 'suspended' ? 'Suspend User' : 'Activate User'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
