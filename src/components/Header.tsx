import React, { useState } from 'react';
import {
  Building2,
  Database,
  Menu,
  ChevronDown,
  RefreshCw,
  AlertTriangle,
  Settings,
  Shield,
  Layers,
  FileText,
  LogOut,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onToggleSidebar: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, activeView, setActiveView }) => {
  const {
    currentUser,
    warehouses,
    selectedWarehouseId,
    setSelectedWarehouseId,
    materials,
    isSupabaseConnected,
    checkSupabaseStatus,
    logout,
  } = useERP();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [checkingDb, setCheckingDb] = useState(false);

  // Count low stock
  const lowStockCount = materials.filter(m => m.stock_quantity <= m.min_threshold).length;

  const handleTestSupabase = async () => {
    setCheckingDb(true);
    await checkSupabaseStatus();
    setCheckingDb(false);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between no-print shadow-xs">
      {/* Left Side: Mobile Menu + Active Depot Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Warehouse Selector */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="hidden sm:block">
            <label htmlFor="warehouse-filter" className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 leading-none">
              Active Depot
            </label>
            <select
              id="warehouse-filter"
              value={selectedWarehouseId}
              onChange={e => setSelectedWarehouseId(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
            >
              <option value="ALL">All Ethiopian Warehouses (Consolidated)</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Right Side: PWA Button + Supabase Connection + Alerts + Active Session Badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* Supabase Connection Status Pill */}
        <button
          onClick={handleTestSupabase}
          className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition ${
            isSupabaseConnected
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
          }`}
          title="Click to check Supabase backend status"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-blue-400'
            }`}
          />
          <Database className="w-3.5 h-3.5" />
          <span>{isSupabaseConnected ? 'Supabase Live' : 'Offline / Local Store'}</span>
          {checkingDb && <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />}
        </button>

        {/* Low Stock Quick Alert */}
        {lowStockCount > 0 && (
          <button
            onClick={() => setActiveView('materials')}
            className="relative p-2 rounded-lg text-amber-700 hover:bg-amber-50 transition border border-amber-200"
            title={`${lowStockCount} items below minimum safety threshold`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {lowStockCount}
            </span>
          </button>
        )}

        {/* Clean Enterprise Account Info */}
        <div className="relative">
          <button
            id="btn-profile-dropdown"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {currentUser?.full_name?.charAt(0) || 'E'}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[140px]">
                {currentUser?.full_name || 'Enterprise Operator'}
              </div>
              <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider leading-none">
                {currentUser?.role || 'Operator'} • Backend Managed
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Clean Session Dropdown */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
              <div className="px-3.5 py-2.5 border-b border-slate-100">
                <div className="font-bold text-slate-900 text-sm">{currentUser?.full_name || 'Enterprise Operator'}</div>
                <div className="text-slate-500 text-[11px] truncate">{currentUser?.email || 'operator@erp-enterprise.et'}</div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold uppercase text-[10px]">
                    {currentUser?.role || 'Operator'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                    AUTHENTICATED
                  </span>
                </div>
              </div>

              <div className="p-2 space-y-1">
                <button
                  onClick={() => {
                    setActiveView('daily_report');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition font-medium text-xs text-left"
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Daily Operational Report</span>
                </button>
                <button
                  onClick={() => {
                    setActiveView('backups');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition font-medium text-xs text-left"
                >
                  <Database className="w-4 h-4 text-blue-600" />
                  <span>Cloud Backup & Restore</span>
                </button>
                <button
                  onClick={() => {
                    setActiveView('settings');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition font-medium text-xs text-left"
                >
                  <Settings className="w-4 h-4 text-slate-600" />
                  <span>System Settings</span>
                </button>

                <div className="pt-1 mt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition font-semibold text-xs text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Sign Out (Switch Account)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
