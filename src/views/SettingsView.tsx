import React, { useState } from 'react';
import {
  Settings,
  Mail,
  Building2,
  Database,
  Send,
  CheckCircle2,
  AlertCircle,
  Save,
  Key,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { sendLowStockAlertEmail } from '../lib/emailjs';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  testSupabaseConnection,
  SUPABASE_SQL_SCHEMA,
} from '../lib/supabase';

export const SettingsView: React.FC = () => {
  const { systemSettings, updateSettings, addToast, materials, isSupabaseConnected } = useERP();

  const [companyName, setCompanyName] = useState(systemSettings.company_name);
  const [currency, setCurrency] = useState(systemSettings.currency);
  const [tin, setTin] = useState(systemSettings.tin_number);
  const [address, setAddress] = useState(systemSettings.address);
  const [phone, setPhone] = useState(systemSettings.phone);

  // EmailJS settings
  const [serviceId, setServiceId] = useState(systemSettings.emailjs_service_id || 'service_enterprise_erp');
  const [templateId, setTemplateId] = useState(systemSettings.emailjs_template_id || 'template_low_stock');
  const [publicKey, setPublicKey] = useState(systemSettings.emailjs_public_key || 'user_public_key_mock');
  const [alertEmail, setAlertEmail] = useState(systemSettings.alert_recipient_email || 'ashenafihailay645@gmail.com');

  const [testingEmail, setTestingEmail] = useState(false);

  // Supabase Custom Project settings
  const initialSupabase = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(initialSupabase.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(initialSupabase.anonKey);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const handleTestAndSaveSupabase = async () => {
    setTestingSupabase(true);
    const result = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
    setTestingSupabase(false);
    if (result.success) {
      saveStoredSupabaseConfig(supabaseUrl, supabaseAnonKey);
      addToast('success', 'Supabase Connected', result.message);
    } else {
      addToast('error', 'Connection Error', result.message);
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    addToast('info', 'SQL Copied', 'SQL Schema copied to clipboard. Paste it into your Supabase SQL Editor.');
    setTimeout(() => setCopiedSchema(false), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      company_name: companyName,
      currency,
      tin_number: tin,
      address,
      phone,
      emailjs_service_id: serviceId,
      emailjs_template_id: templateId,
      emailjs_public_key: publicKey,
      alert_recipient_email: alertEmail,
    });
    addToast('success', 'Settings Saved', 'System configurations updated successfully.');
  };

  const handleSendTestEmail = async () => {
    setTestingEmail(true);
    const sampleMaterial = materials.find(m => m.stock_quantity <= m.min_threshold) || materials[0];

    const res = await sendLowStockAlertEmail({
      materialName: sampleMaterial?.name || 'Deformed Rebar Steel 12mm',
      sku: sampleMaterial?.sku || 'ET-STL-012',
      currentStock: sampleMaterial?.stock_quantity || 15,
      minThreshold: sampleMaterial?.min_threshold || 25,
      unit: sampleMaterial?.unit || 'Pcs',
      warehouseName: 'Addis Ababa Central Depot',
      recipientEmail: alertEmail,
      serviceId,
      templateId,
      publicKey,
    });

    setTestingEmail(false);
    if (res.success) {
      addToast('success', 'Email Alert Dispatched', `Test low-stock notification sent to ${alertEmail}`);
    } else {
      addToast('warning', 'Email Notification Note', `${res.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Enterprise Configuration & Integrations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Customize company legal entities, tax TIN numbers, and configure EmailJS alert credentials.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Legal Profile */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Company & Invoice Identity
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Legal Name</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">TIN Number (Ethiopia)</label>
                <input
                  type="text"
                  value={tin}
                  onChange={e => setTin(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Code</label>
                <input
                  type="text"
                  value={currency}
                  disabled
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 bg-slate-50 text-slate-500 rounded-xl font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Head Office Address</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          {/* EmailJS & Low Stock Alerting */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-600" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  EmailJS Low Stock Alert Service
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Automated
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Alert Recipient Email
              </label>
              <input
                type="email"
                required
                value={alertEmail}
                onChange={e => setAlertEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold text-blue-900"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Instant email alerts will be sent here whenever inventory drops to or below the minimum threshold.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service ID</label>
                <input
                  type="text"
                  value={serviceId}
                  onChange={e => setServiceId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Template ID</label>
                <input
                  type="text"
                  value={templateId}
                  onChange={e => setTemplateId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Public Key / User ID</label>
              <input
                type="text"
                value={publicKey}
                onChange={e => setPublicKey(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
              />
            </div>

            {/* Test Email Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={testingEmail}
                className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{testingEmail ? 'Sending Test Alert...' : 'Send Test Low-Stock Email Alert'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Supabase Cloud Database Connection Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <span>Supabase Cloud Database Connection</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isSupabaseConnected
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                      }`}
                    />
                    {isSupabaseConnected ? 'Connected & Active' : 'Not Connected'}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Connect your own Supabase project to sync users, inventory, stock logs, and multi-device approvals.
                </p>
              </div>
            </div>

            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition border border-emerald-200 self-start sm:self-auto"
            >
              <span>Open Supabase Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Quick Setup Instructions */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              How to Connect Your Supabase Project (3 Easy Steps):
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11.5px] leading-relaxed">
              <li>
                Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">supabase.com/dashboard</a> and click <strong>"+ New Project"</strong>.
              </li>
              <li>
                In your project, click the <strong>Settings (gear icon)</strong> &gt; <strong>Data API</strong> (or API settings).
              </li>
              <li>
                Copy the <strong>Project URL</strong> and <strong>anon / public API Key</strong> and paste them in the fields below.
              </li>
            </ol>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Supabase Project URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                required
                value={supabaseUrl}
                onChange={e => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project-id.supabase.co"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Example: <code className="text-slate-600 font-mono">https://xyzcompany.supabase.co</code>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Supabase Anon / Public Key <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={supabaseAnonKey}
                onChange={e => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Found under <strong>Project Settings &gt; Data API &gt; Project API keys &gt; anon public</strong>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCopySchema}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition border border-slate-300"
            >
              {copiedSchema ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSchema ? 'SQL Schema Copied!' : 'Copy Database SQL Schema'}</span>
            </button>

            <button
              type="button"
              onClick={handleTestAndSaveSupabase}
              disabled={testingSupabase}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition disabled:opacity-75"
            >
              <RefreshCw className={`w-4 h-4 ${testingSupabase ? 'animate-spin' : ''}`} />
              <span>{testingSupabase ? 'Verifying Connection...' : 'Save & Connect to Supabase'}</span>
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save System Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
