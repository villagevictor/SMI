import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Trash2,
  Lock,
  Unlock,
  KeyRound,
  Check,
  X,
  Building2,
  Mail,
  Clock,
  Ban,
  Sliders,
  Eye,
  EyeOff,
  Save,
  Users,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { Profile, UserRole, UserStatus } from '../types';
import { SecurityPinView } from './SecurityPinView';

interface AdminViewProps {
  setActiveView?: (view: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ setActiveView }) => {
  const {
    allProfiles,
    updateUserStatus,
    updateUserRole,
    updateUserPermissions,
    deleteProfile,
    warehouses,
    currentUser,
    adminSecurityPin,
    setAdminSecurityPin,
  } = useERP();

  const [adminTab, setAdminTab] = useState<'users' | 'security_pin'>('users');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(allProfiles[0] || null);

  // Edit permissions state
  const [editingPerms, setEditingPerms] = useState<any>(selectedProfile?.permissions || {});

  // Master PIN state
  const [pinInput, setPinInput] = useState(adminSecurityPin);
  const [showPin, setShowPin] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    setAdminSecurityPin(pinInput.trim());
    setIsChangingPin(false);
  };

  const handleSelectProfile = (p: Profile) => {
    setAdminTab('users');
    setSelectedProfile(p);
    setEditingPerms(JSON.parse(JSON.stringify(p.permissions)));
  };

  const handleTogglePerm = (module: string, action: string) => {
    setEditingPerms((prev: any) => {
      const copy = { ...prev };
      if (!copy[module]) copy[module] = {};
      copy[module][action] = !copy[module][action];
      return copy;
    });
  };

  const handleSavePerms = () => {
    if (!selectedProfile) return;
    updateUserPermissions(selectedProfile.id, editingPerms);
  };

  const modulesList = [
    { id: 'dashboard', label: 'Dashboard Overview', actions: ['view'] },
    { id: 'materials', label: 'Materials Catalog', actions: ['view', 'create', 'update', 'delete'] },
    { id: 'stock_in', label: 'Stock In (GRN)', actions: ['view', 'create'] },
    { id: 'stock_out', label: 'Stock Out & Invoicing', actions: ['view', 'create'] },
    { id: 'invoices', label: 'Invoices & Receipts', actions: ['view'] },
    { id: 'warehouses', label: 'Warehouses', actions: ['view', 'create', 'update', 'delete'] },
    { id: 'suppliers', label: 'Suppliers', actions: ['view', 'create', 'update', 'delete'] },
    { id: 'admin', label: 'Admin RBAC', actions: ['view', 'manage_users'] },
    { id: 'activity_logs', label: 'Activity Logs', actions: ['view'] },
    { id: 'backups', label: 'Cloud Backups & DB', actions: ['view', 'create', 'restore'] },
    { id: 'settings', label: 'System Settings', actions: ['view', 'update'] },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              User Management & Role Permissions (RBAC)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enforce Supabase Row-Level Security policies, approve pending staff registrations, and configure granular JSONB permissions.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" />
          <span>Security Guard Active</span>
        </div>
      </div>

      {/* Switcher Navigation: User Accounts vs Owner & Admin Security PIN */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-200">
        <button
          onClick={() => setAdminTab('users')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            adminTab === 'users'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-300'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-blue-600" />
          <span>Staff Accounts & Permissions ({allProfiles.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('security_pin')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            adminTab === 'security_pin'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
              : 'text-amber-800 hover:bg-amber-100/60'
          }`}
        >
          <KeyRound className="w-4 h-4 text-amber-700" />
          <span>Owner & Administrator Security PIN</span>
          <span className="px-1.5 py-0.5 bg-amber-900/15 text-slate-900 text-[10px] rounded font-mono font-bold tracking-widest">
            ••••
          </span>
        </button>
      </div>

      {/* Master Admin Security PIN Management Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-md border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Owner & Administrator Security PIN</h3>
                <span className="px-2 py-0.5 bg-blue-500/30 text-blue-300 rounded text-[10px] font-semibold">
                  Protection Active
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Only someone who knows this Security PIN can switch to an Admin account (like <strong>Dawit Haile</strong> or <strong>Ashenafi Hailay</strong>) or unlock admin controls. Regular staff users cannot access admin privileges.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-700/60 shrink-0">
            {isChangingPin ? (
              <form onSubmit={handleUpdatePin} className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={8}
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  placeholder="New PIN"
                  className="w-28 px-2.5 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-white font-mono text-center font-bold text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPin(false);
                    setPinInput(adminSecurityPin);
                  }}
                  className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Master PIN
                  </div>
                  <div className="font-mono text-base font-bold text-amber-400 tracking-wider">
                    {showPin ? adminSecurityPin : '••••'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                  title={showPin ? 'Hide PIN' : 'Reveal PIN'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsChangingPin(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded-lg text-xs font-semibold transition"
                >
                  Change PIN
                </button>
                {setActiveView && (
                  <button
                    type="button"
                    onClick={() => setActiveView('security_pin')}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs transition flex items-center gap-1 shadow-xs"
                    title="Open full Security PIN dashboard"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>PIN Center</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: User Profiles Datagrid & PIN Button */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          {/* Owner & Administrator Security PIN Quick Button */}
          <div
            onClick={() => setAdminTab('security_pin')}
            className={`p-3 rounded-xl border cursor-pointer transition mb-3 flex items-center justify-between ${
              adminTab === 'security_pin'
                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm ring-2 ring-amber-400 font-bold'
                : 'bg-amber-50/70 border-amber-200/80 hover:bg-amber-100 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                  adminTab === 'security_pin' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
                }`}
              >
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black">Owner & Admin PIN Center</div>
                <div className="text-[10px] text-amber-800 font-mono font-semibold">
                  Access: Protected ••••
                </div>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                adminTab === 'security_pin' ? 'bg-slate-950 text-amber-300' : 'bg-amber-200 text-amber-900'
              }`}
            >
              {adminTab === 'security_pin' ? 'ACTIVE' : 'MANAGE'}
            </span>
          </div>

          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              ERP User Accounts ({allProfiles.length})
            </h3>
          </div>

          <div className="space-y-2">
            {allProfiles.map(p => {
              const isSelected = selectedProfile?.id === p.id;
              const isPending = p.status === 'pending';
              const isOwner = p.email.toLowerCase() === 'ashenafihailay645@gmail.com' || p.id === 'user-owner-00';
              const isAdmin = p.role === 'Admin';

              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectProfile(p)}
                  className={`p-3 rounded-xl border cursor-pointer transition text-xs ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{p.full_name}</span>
                      {isOwner && (
                        <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 text-[9px] font-black rounded uppercase">
                          Owner
                        </span>
                      )}
                      {!isOwner && isAdmin && (
                        <span className="text-[9px] text-amber-700 bg-amber-50 px-1 py-0.2 rounded font-semibold flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> PIN
                        </span>
                      )}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        p.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : isPending
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div className="text-slate-500 text-[11px] mt-0.5 truncate">{p.email}</div>

                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                      {p.role}
                    </span>
                    <span className="text-slate-600">
                      {warehouses.find(w => w.id === p.warehouse_id)?.name || 'Central'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected User Inspection, Status Toggle & Granular Permissions Grid */}
        <div className="lg:col-span-2 space-y-6">
          {adminTab === 'security_pin' ? (
            <SecurityPinView setActiveView={setActiveView} />
          ) : selectedProfile ? (
            <>
              {/* Account Quick Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedProfile.full_name}</h2>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{selectedProfile.email}</span>
                      <span>• Registered {new Date(selectedProfile.created_at).toLocaleDateString()}</span>
                    </p>
                  </div>

                  {/* Actions: Approve / Block / Delete */}
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedProfile.status !== 'active' && (
                      <button
                        onClick={() => updateUserStatus(selectedProfile.id, 'active')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Approve User</span>
                      </button>
                    )}

                    {selectedProfile.email.toLowerCase() === 'ashenafihailay645@gmail.com' || selectedProfile.id === 'user-owner-00' ? (
                      <span className="px-3 py-1.5 bg-purple-50 border border-purple-200 text-purple-700 rounded-xl text-xs font-bold">
                        Protected System Owner
                      </span>
                    ) : (
                      <>
                        {selectedProfile.status !== 'blocked' && (
                          <button
                            onClick={() => updateUserStatus(selectedProfile.id, 'blocked')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Block User</span>
                          </button>
                        )}

                        {confirmDeleteId === selectedProfile.id ? (
                          <div className="flex items-center gap-1.5 bg-rose-50 p-1 rounded-xl border border-rose-200">
                            <span className="text-[10px] text-rose-700 font-bold px-1.5">Confirm?</span>
                            <button
                              onClick={() => {
                                deleteProfile(selectedProfile.id);
                                setSelectedProfile(allProfiles[0] || null);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition"
                            >
                              Yes, Delete
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] transition"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(selectedProfile.id)}
                            disabled={selectedProfile.id === currentUser?.id}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition disabled:opacity-20"
                            title="Delete profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Role Switcher */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
                  <span className="font-semibold text-slate-700">Assigned ERP Role:</span>
                  {(['Admin', 'Manager', 'Staff'] as UserRole[]).map(role => (
                    <button
                      key={role}
                      onClick={() => updateUserRole(selectedProfile.id, role)}
                      className={`px-3 py-1 rounded-lg font-bold transition ${
                        selectedProfile.role === role
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Granular Permissions JSONB Matrix */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-blue-600" />
                      <span>Granular JSONB Permissions Matrix</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Toggle precise feature rights stored in the user profile record.
                    </p>
                  </div>

                  <button
                    onClick={handleSavePerms}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                  >
                    Save Permissions
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/70">
                        <th className="py-2.5 px-3">System Module</th>
                        <th className="py-2.5 px-3 text-center">View / Read</th>
                        <th className="py-2.5 px-3 text-center">Create / Add</th>
                        <th className="py-2.5 px-3 text-center">Update / Edit</th>
                        <th className="py-2.5 px-3 text-center">Delete / Manage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {modulesList.map(mod => {
                        const currentModPerms = editingPerms[mod.id] || {};

                        return (
                          <tr key={mod.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-2.5 px-3 font-semibold text-slate-800">
                              {mod.label}
                            </td>

                            {/* View */}
                            <td className="py-2.5 px-3 text-center">
                              {mod.actions.includes('view') ? (
                                <input
                                  type="checkbox"
                                  checked={Boolean(currentModPerms.view)}
                                  onChange={() => handleTogglePerm(mod.id, 'view')}
                                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                                />
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>

                            {/* Create */}
                            <td className="py-2.5 px-3 text-center">
                              {mod.actions.includes('create') ? (
                                <input
                                  type="checkbox"
                                  checked={Boolean(currentModPerms.create)}
                                  onChange={() => handleTogglePerm(mod.id, 'create')}
                                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                                />
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>

                            {/* Update */}
                            <td className="py-2.5 px-3 text-center">
                              {mod.actions.includes('update') ? (
                                <input
                                  type="checkbox"
                                  checked={Boolean(currentModPerms.update)}
                                  onChange={() => handleTogglePerm(mod.id, 'update')}
                                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                                />
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>

                            {/* Delete / Manage */}
                            <td className="py-2.5 px-3 text-center">
                              {mod.actions.includes('delete') || mod.actions.includes('manage_users') || mod.actions.includes('restore') ? (
                                <input
                                  type="checkbox"
                                  checked={Boolean(currentModPerms.delete || currentModPerms.manage_users || currentModPerms.restore)}
                                  onChange={() => handleTogglePerm(mod.id, mod.actions.includes('manage_users') ? 'manage_users' : mod.actions.includes('restore') ? 'restore' : 'delete')}
                                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                                />
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              Select a user account from the list to inspect permissions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
