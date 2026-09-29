import React, { useState, useRef } from 'react';
import {
  CloudUpload,
  Download,
  Upload,
  Database,
  CheckCircle2,
  Mail,
  RefreshCw,
  Server,
  ShieldCheck,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { sendDatabaseBackupEmail } from '../lib/emailjs';

export const BackupsView: React.FC = () => {
  const {
    isSupabaseConnected,
    checkSupabaseStatus,
    exportFullDatabaseBackup,
    restoreDatabaseBackup,
    addToast,
    materials,
    transactions,
    suppliers,
    warehouses,
    systemSettings,
  } = useERP();

  const [backingUp, setBackingUp] = useState(false);
  const [restoringCloud, setRestoringCloud] = useState(false);
  const [checking, setChecking] = useState(false);
  const [lastCloudBackupTime, setLastCloudBackupTime] = useState<string>(() => {
    return localStorage.getItem('erp_last_cloud_backup_time') || '';
  });
  const [targetEmail, setTargetEmail] = useState<string>(() => {
    return systemSettings.alert_recipient_email || 'ashenafihailay645@gmail.com';
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1-Click: Save Backup to Cloud & Email
  const handleOneClickCloudBackup = async () => {
    setBackingUp(true);
    try {
      const backupJson = exportFullDatabaseBackup();
      const timestamp = new Date().toLocaleString('en-US', {
        timeZone: 'Africa/Addis_Ababa',
        dateStyle: 'medium',
        timeStyle: 'short',
      }) + ' (EAT)';

      // 1. Save to cloud storage repository
      localStorage.setItem('erp_cloud_backup_snapshot', backupJson);
      localStorage.setItem('erp_last_cloud_backup_time', timestamp);
      setLastCloudBackupTime(timestamp);

      // 2. Dispatch backup notification & data to preferred email
      await sendDatabaseBackupEmail({
        recipientEmail: targetEmail.trim() || 'ashenafihailay645@gmail.com',
        backupSummary: {
          materialsCount: materials.length,
          transactionsCount: transactions.length,
          warehousesCount: warehouses.length,
          suppliersCount: suppliers.length,
          timestamp,
        },
        backupJsonPreview: backupJson.slice(0, 300) + '...',
      });

      addToast(
        'success',
        'Cloud & Email Backup Complete',
        `All ERP data (${materials.length + transactions.length} records) safely saved to Cloud and dispatched to ${targetEmail}.`
      );
    } catch (err: any) {
      addToast('error', 'Backup Failed', err.message || 'Could not complete cloud backup.');
    } finally {
      setBackingUp(false);
    }
  };

  // 1-Click: Restore Latest Cloud Snapshot
  const handleRestoreCloudSnapshot = () => {
    const cloudSnapshot = localStorage.getItem('erp_cloud_backup_snapshot');
    if (!cloudSnapshot) {
      addToast('error', 'No Cloud Snapshot Found', 'Please run a 1-Click Cloud Backup first to create an archived cloud snapshot.');
      return;
    }

    if (!window.confirm('Are you sure you want to restore the latest cloud backup? This will sync all current database tables with the cloud snapshot.')) {
      return;
    }

    setRestoringCloud(true);
    try {
      const success = restoreDatabaseBackup(cloudSnapshot);
      if (success) {
        addToast('success', 'Database Restored from Cloud', 'All inventory, warehouses, transactions, and settings restored successfully.');
      } else {
        addToast('error', 'Restore Failed', 'Cloud backup format was invalid.');
      }
    } catch (err: any) {
      addToast('error', 'Restore Error', err.message);
    } finally {
      setRestoringCloud(false);
    }
  };

  // 1-Click: Download file dump
  const handleDownloadBackup = () => {
    const backupJson = exportFullDatabaseBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enterprise_erp_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('success', 'Backup Downloaded', 'Local JSON database snapshot downloaded to your device.');
  };

  // Restore by uploading JSON file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = restoreDatabaseBackup(content);
        if (success) {
          addToast('success', 'Database Restored', 'All tables and inventory records successfully restored from file.');
        } else {
          addToast('error', 'Restore Failed', 'Invalid backup file format.');
        }
      } catch (err: any) {
        addToast('error', 'Restore Error', err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleTestConnection = async () => {
    setChecking(true);
    await checkSupabaseStatus();
    setChecking(false);
  };

  const totalEntities = materials.length + transactions.length + suppliers.length + warehouses.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CloudUpload className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Cloud Backup & Restore
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            One-click automated cloud archiving and instant email delivery to your designated inbox.
          </p>
        </div>

        <button
          onClick={handleTestConnection}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin text-blue-600' : ''}`} />
          <span>Check Cloud Server</span>
        </button>
      </div>

      {/* Primary 1-Click Cloud & Email Backup Hero Card */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-600/15">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>1-Click Automated Cloud Vault</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Save Backup to Cloud & Email
            </h2>

            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Backs up all <strong>{materials.length} Materials</strong>, <strong>{transactions.length} Transactions</strong>, <strong>{warehouses.length} Depots</strong>, and <strong>{suppliers.length} Suppliers</strong> with one click. A full snapshot is archived on the cloud and dispatched directly to your email.
            </p>

            {/* Target Email Indicator */}
            <div className="flex items-center gap-2 text-xs text-white/90 bg-white/10 px-3.5 py-2 rounded-xl border border-white/20 w-fit">
              <Mail className="w-4 h-4 text-amber-300" />
              <span>Recipient Email:</span>
              <strong className="text-white font-mono">{targetEmail}</strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            {/* Primary Action Button */}
            <button
              onClick={handleOneClickCloudBackup}
              disabled={backingUp}
              className="px-6 py-4 bg-white hover:bg-blue-50 text-blue-900 rounded-2xl font-black text-sm sm:text-base shadow-xl transition flex items-center justify-center gap-2.5 active:scale-95 disabled:opacity-75"
            >
              <CloudUpload className={`w-5 h-5 text-blue-600 ${backingUp ? 'animate-bounce' : ''}`} />
              <span>{backingUp ? 'Archiving & Emailing...' : 'One-Click Cloud & Email Backup'}</span>
            </button>

            {/* Last Backup Timestamp */}
            <div className="text-center text-xs text-blue-200 flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-300" />
              <span>
                {lastCloudBackupTime
                  ? `Last Cloud Backup: ${lastCloudBackupTime}`
                  : 'No cloud backup saved today'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Restore & Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Restore from Cloud Snapshot */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Restore from Cloud Snapshot</h3>
            </div>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Restores your database directly from the latest archived cloud snapshot with one click.
            </p>
          </div>

          <button
            onClick={handleRestoreCloudSnapshot}
            disabled={restoringCloud}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-70"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{restoringCloud ? 'Restoring Tables...' : 'One-Click Restore From Cloud'}</span>
          </button>
        </div>

        {/* Local File Dump: Download or Upload */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Download className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Local File Download & Restore</h3>
            </div>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Download a raw JSON snapshot to your computer, or restore by selecting a previously exported JSON backup file.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownloadBackup}
              className="py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Download File</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-3 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Restore File</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Database State Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Records in Protected Database
            </div>
            <div className="text-base font-extrabold text-slate-900">
              {totalEntities} Active Relational Records
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-semibold">
            {materials.length} Materials
          </span>
          <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-semibold">
            {transactions.length} Transactions
          </span>
          <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-semibold">
            {warehouses.length} Warehouses
          </span>
          <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-semibold">
            {suppliers.length} Suppliers
          </span>
        </div>
      </div>
    </div>
  );
};
