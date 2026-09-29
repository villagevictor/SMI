import React, { useState } from 'react';
import { ERPProvider } from './context/ERPContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { ToastContainer } from './components/Toast';
import { ThermalReceiptModal } from './components/ThermalReceiptModal';
import { AuthGuard } from './components/AuthGuard';

// Views - Exactly the 9 requested business modules
import { DashboardView } from './views/DashboardView';
import { MaterialsView } from './views/MaterialsView';
import { StockInView } from './views/StockInView';
import { StockOutView } from './views/StockOutView';
import { InvoicesView } from './views/InvoicesView';
import { DailyReportView } from './views/DailyReportView';
import { WarehousesView } from './views/WarehousesView';
import { SuppliersView } from './views/SuppliersView';
import { BackupsView } from './views/BackupsView';
import { SettingsView } from './views/SettingsView';

function ERPContent() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView setActiveView={setActiveView} />;
      case 'materials':
        return <MaterialsView />;
      case 'stock_in':
        return <StockInView />;
      case 'stock_out':
        return <StockOutView />;
      case 'invoices':
        return <InvoicesView />;
      case 'daily_report':
        return <DailyReportView />;
      case 'warehouses':
        return <WarehousesView />;
      case 'suppliers':
        return <SuppliersView />;
      case 'backups':
        return <BackupsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Printable Thermal Receipt Modal */}
      <ThermalReceiptModal />

      {/* Top Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - 9 Modules Only */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Central Workspace */}
        <main className="flex-1 overflow-y-auto lg:pl-64 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation (5 Core Fast Actions) */}
      <BottomNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
}

export default function App() {
  return (
    <ERPProvider>
      <AuthGuard>
        <ERPContent />
      </AuthGuard>
    </ERPProvider>
  );
}
