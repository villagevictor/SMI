import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Calendar,
  Building2,
  Copy,
  Check,
  Printer,
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  AlertTriangle,
  Boxes,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';

export const DailyReportView: React.FC = () => {
  const {
    transactions,
    materials,
    warehouses,
    suppliers,
    selectedWarehouseId,
    setSelectedWarehouseId,
    systemSettings,
    addToast,
    currentUser,
  } = useERP();

  // Selected Date state (defaults to today's date YYYY-MM-DD)
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [copied, setCopied] = useState(false);

  // Filter transactions by selected date and warehouse
  const dayTransactions = useMemo(() => {
    return transactions.filter(t => {
      const txDate = t.timestamp.slice(0, 10);
      const matchesDate = txDate === selectedDate;
      const matchesWarehouse =
        selectedWarehouseId === 'ALL' || t.warehouse_name === warehouses.find(w => w.id === selectedWarehouseId)?.name;
      return matchesDate && matchesWarehouse;
    });
  }, [transactions, selectedDate, selectedWarehouseId, warehouses]);

  // Stock In receipts
  const stockIns = useMemo(() => dayTransactions.filter(t => t.type === 'IN'), [dayTransactions]);

  // Stock Out dispatches
  const stockOuts = useMemo(() => dayTransactions.filter(t => t.type === 'OUT'), [dayTransactions]);

  // Summary Metrics
  const totalStockInQty = useMemo(() => stockIns.reduce((sum, t) => sum + t.quantity, 0), [stockIns]);
  const totalStockInValue = useMemo(() => stockIns.reduce((sum, t) => sum + (t.total_amount || 0), 0), [stockIns]);

  const totalStockOutQty = useMemo(() => stockOuts.reduce((sum, t) => sum + t.quantity, 0), [stockOuts]);
  const totalStockOutValue = useMemo(() => stockOuts.reduce((sum, t) => sum + (t.total_amount || 0), 0), [stockOuts]);

  // Low Stock Items in selected warehouse
  const lowStockItems = useMemo(() => {
    return materials.filter(m => {
      const matchesWarehouse = selectedWarehouseId === 'ALL' || m.warehouse_id === selectedWarehouseId;
      return matchesWarehouse && m.stock_quantity <= m.min_threshold;
    });
  }, [materials, selectedWarehouseId]);

  const activeWarehouseName = useMemo(() => {
    if (selectedWarehouseId === 'ALL') return 'All Ethiopian Warehouses (Consolidated)';
    return warehouses.find(w => w.id === selectedWarehouseId)?.name || 'Central Depot';
  }, [selectedWarehouseId, warehouses]);

  // Format the readable copyable text report
  const formattedTextReport = useMemo(() => {
    const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    let report = `========================================\n`;
    report += `ENTERPRISE ERP - DAILY OPERATIONAL REPORT\n`;
    report += `Date: ${formattedDate}\n`;
    report += `Depot: ${activeWarehouseName}\n`;
    report += `Currency: ${systemSettings.currency || 'ETB'} (Ethiopian Birr)\n`;
    report += `========================================\n\n`;

    report += `📊 EXECUTIVE SUMMARY\n`;
    report += `• Total Stock In (GRN): ${stockIns.length} Receipts | ${totalStockInQty.toLocaleString()} Units | ${totalStockInValue.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB\n`;
    report += `• Total Stock Out (Sales): ${stockOuts.length} Invoices | ${totalStockOutQty.toLocaleString()} Units | ${totalStockOutValue.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB\n`;
    report += `• Net Inventory Delta: ${(totalStockInQty - totalStockOutQty) >= 0 ? '+' : ''}${(totalStockInQty - totalStockOutQty).toLocaleString()} Units\n`;
    report += `• Today's Total Gross Revenue: ${totalStockOutValue.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB\n`;
    report += `• Low Safety Threshold Alerts: ${lowStockItems.length} Materials\n\n`;

    report += `📥 STOCK IN (GRN RECEIPTS) [${stockIns.length}]\n`;
    if (stockIns.length === 0) {
      report += `  (No stock-in receipts recorded for this date)\n`;
    } else {
      stockIns.forEach((item, idx) => {
        const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const sup = suppliers.find(s => s.id === item.supplier_id)?.name || 'Direct Procurement';
        report += `  ${idx + 1}. [${time}] ${item.reference_number || 'GRN'} | ${item.material_name} | Qty: ${item.quantity} ${item.material_unit} | Val: ${item.total_amount?.toLocaleString()} ETB | Supplier: ${sup}\n`;
      });
    }
    report += `\n`;

    report += `📤 STOCK OUT & BILLING (INVOICES) [${stockOuts.length}]\n`;
    if (stockOuts.length === 0) {
      report += `  (No dispatches or sales recorded for this date)\n`;
    } else {
      stockOuts.forEach((item, idx) => {
        const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        report += `  ${idx + 1}. [${time}] ${item.invoice_number || 'INV'} | ${item.material_name} | Qty: ${item.quantity} ${item.material_unit} | Val: ${item.total_amount?.toLocaleString()} ETB | Customer: ${item.customer_name || 'Retail Client'}\n`;
      });
    }
    report += `\n`;

    if (lowStockItems.length > 0) {
      report += `⚠️ CRITICAL STOCK THRESHOLD WARNINGS [${lowStockItems.length}]\n`;
      lowStockItems.forEach((m, idx) => {
        report += `  ${idx + 1}. ${m.name} (${m.sku}) - Current: ${m.stock_quantity} ${m.unit} | Safety Min: ${m.min_threshold} ${m.unit}\n`;
      });
      report += `\n`;
    }

    report += `----------------------------------------\n`;
    report += `Generated By: ${currentUser?.full_name || 'Enterprise Operator'}\n`;
    report += `Company: ${systemSettings.company_name || 'Enterprise ERP PLC'}\n`;
    report += `Timestamp: ${new Date().toLocaleString()}\n`;
    report += `========================================\n`;

    return report;
  }, [
    selectedDate,
    activeWarehouseName,
    systemSettings,
    stockIns,
    stockOuts,
    totalStockInQty,
    totalStockInValue,
    totalStockOutQty,
    totalStockOutValue,
    lowStockItems,
    suppliers,
    currentUser,
  ]);

  const handleCopyReport = () => {
    navigator.clipboard.writeText(formattedTextReport);
    setCopied(true);
    addToast('success', 'Report Copied!', 'Daily operational report copied to clipboard. Ready to paste in Telegram, WhatsApp, or Email.');
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action Buttons */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Daily Operational Report
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Consolidated daily inventory movements, receipts, dispatches, revenue turnover, and 1-click copyable summary.
          </p>
        </div>

        {/* Action Controls: Copy & Print */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleCopyReport}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition ${
              copied
                ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Daily Report'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition"
            title="Print Report"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden md:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Date & Warehouse Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-slate-600">Select Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
            />
          </div>

          {/* Quick Date Short-cuts */}
          <button
            onClick={() => setSelectedDate(todayStr)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedDate === todayStr ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Today
          </button>
        </div>

        {/* Depot Filter */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 w-full sm:w-auto">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold text-slate-600">Depot:</span>
          <select
            value={selectedWarehouseId}
            onChange={e => setSelectedWarehouseId(e.target.value)}
            className="text-xs font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
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

      {/* Daily Metrics Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock In */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Stock In</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {totalStockInQty.toLocaleString()} <span className="text-xs font-normal text-slate-500">units</span>
            </div>
            <div className="text-xs font-bold text-emerald-600 mt-0.5">
              {totalStockInValue.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
            </div>
            <div className="text-[11px] text-slate-400 mt-1">{stockIns.length} GRN receipt(s)</div>
          </div>
        </div>

        {/* Total Stock Out / Dispatches */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Dispatches</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {totalStockOutQty.toLocaleString()} <span className="text-xs font-normal text-slate-500">units</span>
            </div>
            <div className="text-xs font-bold text-rose-600 mt-0.5">
              {totalStockOutValue.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
            </div>
            <div className="text-[11px] text-slate-400 mt-1">{stockOuts.length} invoice(s) issued</div>
          </div>
        </div>

        {/* Today's Gross Turnover */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daily Gross Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {totalStockOutValue.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs font-normal text-slate-500">ETB</span>
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              Billing Turnover
            </div>
            <div className="text-[11px] text-slate-400 mt-1">{activeWarehouseName}</div>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Safety Thresholds</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {lowStockItems.length} <span className="text-xs font-normal text-slate-500">alerts</span>
            </div>
            <div className="text-xs font-semibold text-amber-600 mt-0.5">
              {lowStockItems.length === 0 ? 'All stocks safe' : 'Re-order needed'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Below minimum buffer</div>
          </div>
        </div>
      </div>

      {/* Copyable Report Text Preview Box */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Copy className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold text-white">Copyable Text Report (Instant Share)</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
              Ready to Paste
            </span>
          </div>

          <button
            onClick={handleCopyReport}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
              copied
                ? 'bg-emerald-500 text-slate-950 font-black'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
          </button>
        </div>

        <div className="mt-3">
          <pre className="p-3 bg-slate-950 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre leading-relaxed border border-slate-800 max-h-60">
            {formattedTextReport}
          </pre>
        </div>
      </div>

      {/* Itemized Transactions Breakdown for the Day */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock In Receipts Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">Today's Stock In Receipts</h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
              {stockIns.length} Records
            </span>
          </div>

          {stockIns.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No stock in receipts recorded on this date.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stockIns.map(item => (
                <div key={item.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{item.material_name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span className="font-mono text-blue-600 font-semibold">{item.reference_number || 'GRN'}</span>
                      <span>•</span>
                      <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span>{item.warehouse_name}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-emerald-700">
                      +{item.quantity.toLocaleString()} {item.material_unit}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {item.total_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock Out & Invoices Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-rose-600" />
              <h3 className="text-base font-bold text-slate-900">Today's Invoices & Dispatches</h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700">
              {stockOuts.length} Records
            </span>
          </div>

          {stockOuts.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No dispatches or sales invoices recorded on this date.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stockOuts.map(item => (
                <div key={item.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{item.material_name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span className="font-mono text-purple-600 font-semibold">{item.invoice_number || 'INV'}</span>
                      <span>•</span>
                      <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span>{item.customer_name || 'Retail Client'}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-rose-700">
                      -{item.quantity.toLocaleString()} {item.material_unit}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {item.total_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
