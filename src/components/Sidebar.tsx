import React from 'react';
import {
  LayoutDashboard,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  FileSpreadsheet,
  Building2,
  Users,
  CloudUpload,
  Settings,
  X,
  Boxes,
  Database,
  LogOut,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';

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
  const { materials, isSupabaseConnected, currentUser, logout } = useERP();

  const lowStockCount = materials.filter(m => m.stock_quantity <= m.min_threshold).length;

  const handleNavClick = (itemId: string) => {
    setActiveView(itemId);
    onClose();
  };

  // Only the 9 business modules requested by the user
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'materials',
      label: 'Materials & Catalog',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} alert` : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    { id: 'stock_in', label: 'Stock In (GRN)', icon: ArrowDownLeft, color: 'text-emerald-400' },
    { id: 'stock_out', label: 'Stock Out & Billing', icon: ArrowUpRight, color: 'text-rose-400' },
    { id: 'invoices', label: 'Invoice & Receipts', icon: FileText },
    {
      id: 'daily_report',
      label: 'Daily Report',
      icon: FileSpreadsheet,
      badge: 'COPYABLE',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
    },
    { id: 'warehouses', label: 'Warehouses', icon: Building2 },
    { id: 'suppliers', label: 'Suppliers', icon: Users },
    { id: 'backups', label: 'Backup & Restore', icon: CloudUpload },
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

      {/* Sidebar Container */}
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
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* System Currency & Backend Indicator */}
        <div className="px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/30 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">System Currency</span>
          <span className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800/60 font-bold text-xs tracking-wider">
            ETB (Birr)
          </span>
        </div>

        {/* 9 Core Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = activeView === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
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
                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Backend Status / Enterprise Session Card */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800/60 text-blue-400 flex items-center justify-center font-bold text-xs">
              <Database className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                <span>{currentUser?.full_name || 'Enterprise Operator'}</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConnected ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                <span>{isSupabaseConnected ? 'Supabase Backend Connected' : 'Local Enterprise DB'}</span>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Sign Out / Switch User"
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
