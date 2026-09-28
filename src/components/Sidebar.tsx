import React from 'react';
import {
  LayoutDashboard,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Building2,
  Users,
  ShieldCheck,
  KeyRound,
  ClipboardList,
  CloudUpload,
  Settings,
  X,
  Boxes,
  Lock,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { AdminPinModal } from './AdminPinModal';
import { useState } from 'react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  isOpen,
  onClose,
}) => {
  const { currentUser, materials, allProfiles, loginAs, adminSecurityPin } = useERP();
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [targetViewAfterPin, setTargetViewAfterPin] = useState<string>('security_pin');

  const lowStockCount = materials.filter(m => m.stock_quantity <= m.min_threshold).length;

  const ownerOrAdminProfile =
    allProfiles.find(p => p.email.toLowerCase() === 'ashenafihailay645@gmail.com') ||
    allProfiles.find(p => p.role === 'Admin') ||
    allProfiles[0];

  const handleNavClick = (itemId: string, requiresAdmin?: boolean) => {
    if (requiresAdmin && currentUser?.role !== 'Admin') {
      setTargetViewAfterPin(itemId);
      setPinModalOpen(true);
      return;
    }
    setActiveView(itemId);
    onClose();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'materials', label: 'Materials & Catalog', icon: Package, badge: lowStockCount > 0 ? `${lowStockCount} alert` : null, badgeColor: 'bg-amber-500 text-white' },
    { id: 'stock_in', label: 'Stock In (GRN)', icon: ArrowDownLeft, color: 'text-emerald-400' },
    { id: 'stock_out', label: 'Stock Out & Billing', icon: ArrowUpRight, color: 'text-rose-400' },
    { id: 'invoices', label: 'Invoices & Receipts', icon: FileText },
    { id: 'warehouses', label: 'Warehouses', icon: Building2 },
    { id: 'suppliers', label: 'Suppliers', icon: Users },
    { id: 'admin', label: 'Admin & Permissions', icon: ShieldCheck, requiresAdmin: true, badge: 'ADMIN', badgeColor: 'bg-blue-900/80 text-blue-300 border border-blue-700/60' },
    { id: 'security_pin', label: 'Owner & Admin PIN', icon: KeyRound, requiresAdmin: true, color: 'text-amber-400', badge: 'SECURITY', badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40' },
    { id: 'activity_logs', label: 'Activity Logs', icon: ClipboardList },
    { id: 'backups', label: 'Cloud Backups & DB', icon: CloudUpload },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden no-print"
        />
      )}

      {/* Sidebar Container: Slate primary navigation (#0f172a / #1e293b) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 no-print ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-md shadow-blue-600/30">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-white tracking-wide uppercase">
                ENTERPRISE ERP
              </div>
              <div className="text-[10px] font-semibold text-slate-400 tracking-wider">
                INVENTORY & ACCOUNTING
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currency & Context Pill */}
        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/30 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">System Currency</span>
          <span className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800/60 font-bold text-xs tracking-wider">
            ETB (Birr)
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = activeView === item.id;
            const Icon = item.icon;
            const isProtected = item.requiresAdmin && currentUser?.role !== 'Admin';

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id, item.requiresAdmin)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.color || 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                      {item.badge}
                    </span>
                  )}
                  {isProtected && !item.badge && (
                    <Lock className="w-3 h-3 text-amber-400/80" />
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Master Security PIN Quick Access Banner */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
          <button
            onClick={() => handleNavClick('security_pin', true)}
            className="w-full p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-600/15 to-amber-500/10 border border-amber-500/30 hover:border-amber-400 transition text-left flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-amber-300 leading-tight">
                  Master Security PIN
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Status: <span className="text-amber-400 font-bold tracking-widest">ARMED ••••</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
              MANAGE
            </span>
          </button>
        </div>

        {/* Bottom User Card */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-white flex items-center justify-center font-bold text-xs">
              {currentUser?.full_name.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                <span>{currentUser?.full_name}</span>
                {currentUser?.role === 'Admin' && (
                  <span className="text-[9px] bg-blue-500/30 text-blue-300 px-1 py-0.2 rounded font-bold">
                    ADMIN
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 truncate">{currentUser?.email}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Admin Security PIN Unlock Modal */}
      <AdminPinModal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        onSuccess={() => {
          if (ownerOrAdminProfile) {
            loginAs(ownerOrAdminProfile.id);
          }
          setActiveView(targetViewAfterPin);
          onClose();
        }}
        targetUserName={ownerOrAdminProfile?.full_name || 'Administrator'}
        adminPin={adminSecurityPin}
      />
    </>
  );
};
