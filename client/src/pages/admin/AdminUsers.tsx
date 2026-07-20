import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Plus, XCircle, Eye, Pencil, Info, Sliders, Briefcase, RefreshCw, Ban, Trash2, List, LayoutGrid } from 'lucide-react';

import type { User, SubscriptionPlan as Plan } from '../../types';

interface AdminUsersProps {
  usersList: User[];
  openActionMenuId: string | null;
  setOpenActionMenuId: (id: string | null) => void;
  setShowAddUserModal: (show: boolean) => void;
  setSelectedUserForView: (user: User) => void;
  setShowViewUserModal: (show: boolean) => void;
  setSelectedUserForEdit: (user: User) => void;
  setEditUserName: (name: string) => void;
  setEditUserEmail: (email: string) => void;
  setEditUserRole: (role: 'admin' | 'user') => void;
  setEditUserMultiplier: (multiplier: string) => void;
  setShowEditUserModal: (show: boolean) => void;
  setSelectedUserForPlan: (user: User) => void;
  setAssignedPlanId: (id: string) => void;
  setShowAssignPlanModal: (show: boolean) => void;
  handleResetUserApi: (id: string) => void;
  handleToggleUserStatus: (id: string) => void;
  setSelectedUserForDelete: (user: User) => void;
  setShowDeleteUserModal: (show: boolean) => void;
  currentUserId: string | undefined;
  plans: Plan[];
}

export default function AdminUsers({
  usersList,
  openActionMenuId,
  setOpenActionMenuId,
  setShowAddUserModal,
  setSelectedUserForView,
  setShowViewUserModal,
  setSelectedUserForEdit,
  setEditUserName,
  setEditUserEmail,
  setEditUserRole,
  setEditUserMultiplier,
  setShowEditUserModal,
  setSelectedUserForPlan,
  setAssignedPlanId,
  setShowAssignPlanModal,
  handleResetUserApi,
  handleToggleUserStatus,
  setSelectedUserForDelete,
  setShowDeleteUserModal,
  currentUserId,
  plans,
}: AdminUsersProps) {
  // View mode state (matching Trading & Broker Management)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

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
        <div className="flex items-center gap-3">
          {/* View mode toggle switch */}
          <div className="flex items-center bg-muted/60 p-1 border border-border rounded-none shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-none transition-colors ${
                viewMode === 'table' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-none transition-colors ${
                viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-none flex items-center gap-2 shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create User Account
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="w-full overflow-x-auto md:overflow-visible">
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
              {usersList.filter(u => u.role !== 'admin').map(u => {
                const initials = u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                let hash = 0;
                for (let i = 0; i < u.name.length; i++) hash = u.name.charCodeAt(i) + ((hash << 5) - hash);
                const colorClass = avatarColors[Math.abs(hash) % avatarColors.length];
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="p-1.5 rounded-none hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px] rounded-none bg-card border border-border shadow-xl p-0 py-1.5">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUserForView(u);
                              setShowViewUserModal(true);
                            }}
                            className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground"
                          >
                            <Eye className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUserForEdit(u);
                              setEditUserName(u.name);
                              setEditUserEmail(u.email);
                              setEditUserRole(u.role as 'admin' | 'user');
                              setEditUserMultiplier(u.lotMultiplier?.toString() || '1.0');
                              setShowEditUserModal(true);
                            }}
                            className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground"
                          >
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span>Edit Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUserForPlan(u);
                              setAssignedPlanId(plans[0]?.id || '');
                              setShowAssignPlanModal(true);
                            }}
                            className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground"
                          >
                            <Briefcase className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span>Assign Plan</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleResetUserApi(u.id)}
                            className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>Reset API</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border/60 my-1 -mx-0" />
                          <DropdownMenuItem
                            onClick={() => handleToggleUserStatus(u.id)}
                            disabled={u.id === currentUserId}
                            className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground ${
                              u.status !== 'suspended' ? 'text-rose-500 focus:text-rose-500 focus:bg-rose-500/10' : 'text-emerald-500 focus:text-emerald-500 focus:bg-emerald-500/10'
                            }`}
                          >
                            <Ban className="w-3.5 h-3.5 shrink-0" />
                            <span>{u.status !== 'suspended' ? 'Suspend User' : 'Activate User'}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUserForDelete(u);
                              setShowDeleteUserModal(true);
                            }}
                            disabled={u.id === currentUserId}
                            className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 rounded-none focus:bg-red-500/10 focus:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Delete User</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {usersList.filter(u => u.role !== 'admin').map(u => {
            const initials = u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            let hash = 0;
            for (let i = 0; i < u.name.length; i++) hash = u.name.charCodeAt(i) + ((hash << 5) - hash);
            const colorClass = avatarColors[Math.abs(hash) % avatarColors.length];
            return (
              <div key={u.id} className="bg-card border border-border p-5 rounded-none flex flex-col justify-between space-y-4 hover:border-foreground/30 transition-all shadow-sm">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${colorClass}`}>
                      {initials}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-bold text-sm text-foreground">{u.name}</h3>
                      <span className="text-xs font-mono text-muted-foreground">{u.email}</span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded-none hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px] rounded-none bg-card border border-border shadow-xl p-0 py-1.5">
                      <DropdownMenuItem
                        onClick={() => { setSelectedUserForView(u); setShowViewUserModal(true); }}
                        className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground"
                      >
                        <Eye className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span>View Details</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUserForEdit(u);
                          setEditUserName(u.name);
                          setEditUserEmail(u.email);
                          setEditUserRole(u.role as 'admin' | 'user');
                          setEditUserMultiplier(u.lotMultiplier?.toString() || '1.0');
                          setShowEditUserModal(true);
                        }}
                        className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground"
                      >
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span>Edit Details</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUserForPlan(u);
                          setAssignedPlanId(plans[0]?.id || '');
                          setShowAssignPlanModal(true);
                        }}
                        className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span>Assign Plan</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleResetUserApi(u.id)}
                        className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Reset API</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border/60 my-1 -mx-0" />
                      <DropdownMenuItem
                        onClick={() => handleToggleUserStatus(u.id)}
                        disabled={u.id === currentUserId}
                        className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 rounded-none focus:bg-muted focus:text-foreground ${
                          u.status !== 'suspended' ? 'text-rose-500 focus:text-rose-500 focus:bg-rose-500/10' : 'text-emerald-500 focus:text-emerald-500 focus:bg-emerald-500/10'
                        }`}
                      >
                        <Ban className="w-3.5 h-3.5 shrink-0" />
                        <span>{u.status !== 'suspended' ? 'Suspend User' : 'Activate User'}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => { setSelectedUserForDelete(u); setShowDeleteUserModal(true); }}
                        disabled={u.id === currentUserId}
                        className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 rounded-none focus:bg-red-500/10 focus:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Delete User</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Role</span>
                    <span className="font-semibold text-foreground capitalize">{u.role}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Lot Multiplier</span>
                    <span className="font-mono font-bold text-foreground">{u.lotMultiplier?.toFixed(2) || '1.00'}x</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Joined</span>
                    <span className="font-mono text-muted-foreground text-[11px]">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Status</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <button
                        onClick={() => handleToggleUserStatus(u.id)}
                        disabled={u.id === currentUserId}
                        className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40 disabled:cursor-not-allowed ${
                          u.status !== 'suspended' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        title={u.status !== 'suspended' ? 'Click to Suspend' : 'Click to Activate'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            u.status !== 'suspended' ? 'translate-x-3' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        u.status !== 'suspended' ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        {u.status !== 'suspended' ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

