import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  Copy,
  Check,
  Lock,
  Unlock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  UserCheck,
  Sliders,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';

interface SecurityPinViewProps {
  setActiveView?: (view: string) => void;
}

export const SecurityPinView: React.FC<SecurityPinViewProps> = ({ setActiveView }) => {
  const {
    adminSecurityPin,
    setAdminSecurityPin,
    currentUser,
    allProfiles,
    addToast,
  } = useERP();

  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [copied, setCopied] = useState(false);

  // Change PIN form state
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [changeError, setChangeError] = useState('');
  const [changeSuccess, setChangeSuccess] = useState('');

  // Interactive PIN testing simulator
  const [testPinInput, setTestPinInput] = useState('');
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'failed'>('idle');

  const handleCopyPin = () => {
    navigator.clipboard.writeText(adminSecurityPin);
    setCopied(true);
    addToast('info', 'PIN Copied', 'Admin PIN copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError('');
    setChangeSuccess('');

    // Check if current PIN matches (or if user is the Owner/Admin)
    if (currentPinInput.trim() !== adminSecurityPin.trim()) {
      setChangeError('Current Security PIN is incorrect.');
      return;
    }

    const trimmedNew = newPinInput.trim();
    if (!trimmedNew) {
      setChangeError('New PIN cannot be empty.');
      return;
    }

    if (trimmedNew.length < 4) {
      setChangeError('New PIN must be at least 4 characters/digits long.');
      return;
    }

    if (trimmedNew !== confirmPinInput.trim()) {
      setChangeError('New PIN and Confirm PIN do not match.');
      return;
    }

    setAdminSecurityPin(trimmedNew);
    setChangeSuccess(`Security PIN successfully updated to: ${trimmedNew}`);
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
  };

  const handleTestPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (testPinInput.trim() === adminSecurityPin.trim()) {
      setTestResult('success');
    } else {
      setTestResult('failed');
    }
  };

  const handleResetToDefault = () => {
    setAdminSecurityPin('2026');
    setChangeSuccess('Security PIN has been reset to default: 2026');
    setChangeError('');
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
  };

  const ownerProfile = allProfiles.find(
    p => p.email.toLowerCase() === 'ashenafihailay645@gmail.com' || p.id === 'user-owner-00'
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Header */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Owner & Administrator Security PIN
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Active Protection
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Owner: Ashenafi Hailay
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
                This Master PIN protects your ERP from unauthorized account takeovers. Any employee,
                newly approved staff, or guest attempting to switch to an Administrator profile (e.g.,
                <strong> Dawit Haile</strong> or <strong>Ashenafi Hailay</strong>) must enter this secret PIN.
              </p>
            </div>
          </div>

          {setActiveView && (
            <button
              onClick={() => setActiveView('admin')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition shrink-0"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Back to User Accounts</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Master PIN Status & Test Simulator */}
        <div className="lg:col-span-1 space-y-6">
          {/* Active PIN Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Current Master Security PIN
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" /> Armed
              </span>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl text-center border border-slate-800">
              <div className="font-mono text-3xl font-extrabold tracking-widest text-amber-400">
                {showCurrentPin ? adminSecurityPin : '••••'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {showCurrentPin ? 'Visible Master PIN' : 'Hidden for Security'}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCurrentPin(!showCurrentPin)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                {showCurrentPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showCurrentPin ? 'Hide PIN' : 'Reveal PIN'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyPin}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Default Factory PIN:</span>
              <span className="font-mono font-bold text-slate-800">2026</span>
            </div>
          </div>

          {/* Interactive PIN Verification Simulator */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Test PIN Protection Simulator</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Simulate what a user sees when attempting to unlock Admin privileges.
            </p>

            <form onSubmit={handleTestPin} className="space-y-3">
              <div className="relative">
                <input
                  type="password"
                  maxLength={8}
                  value={testPinInput}
                  onChange={e => {
                    setTestPinInput(e.target.value);
                    setTestResult('idle');
                  }}
                  placeholder="Enter PIN to test"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center font-mono font-bold text-base focus:ring-2 focus:ring-blue-600 focus:outline-none focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={!testPinInput.trim()}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
              >
                Test Authentication
              </button>

              {testResult === 'success' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Access Granted! PIN is valid and correct.</span>
                </div>
              )}

              {testResult === 'failed' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-800 animate-in fade-in">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Access Denied! Incorrect PIN entered.</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Change PIN Form & Security Safeguards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Change Security PIN Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Change Master Administrator PIN</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your security PIN to ensure only authorized leaders have admin access.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to 2026</span>
              </button>
            </div>

            <form onSubmit={handleChangePin} className="mt-5 space-y-4">
              {changeError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{changeError}</span>
                </div>
              )}

              {changeSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{changeSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Current PIN
                  </label>
                  <input
                    type="password"
                    maxLength={8}
                    value={currentPinInput}
                    onChange={e => setCurrentPinInput(e.target.value)}
                    placeholder="Enter current PIN"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    New Security PIN
                  </label>
                  <input
                    type="password"
                    maxLength={8}
                    value={newPinInput}
                    onChange={e => setNewPinInput(e.target.value)}
                    placeholder="4 to 8 characters"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Confirm New PIN
                  </label>
                  <input
                    type="password"
                    maxLength={8}
                    value={confirmPinInput}
                    onChange={e => setConfirmPinInput(e.target.value)}
                    placeholder="Re-type new PIN"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!currentPinInput || !newPinInput || !confirmPinInput}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>Save & Apply New PIN</span>
                </button>
              </div>
            </form>
          </div>

          {/* Detailed Security & RLS Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>What Does This PIN Protect in Your ERP?</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">
                  1. Admin Impersonation Prevention
                </span>
                Staff members switching accounts in the header or login screen cannot switch to
                <strong> Dawit Haile (Admin)</strong> or <strong>Ashenafi Hailay (Owner)</strong> without the PIN.
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">
                  2. User Account Approvals
                </span>
                When a new staff member registers and is pending review, only a PIN-authenticated
                Administrator can activate their account.
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">
                  3. Permission Matrix Changes
                </span>
                Prevents employees from granting themselves permission to delete records, modify unit prices,
                or create stock-in receipts.
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">
                  4. Database & Backups
                </span>
                Protects the Cloud Backups & DB connection view so only trusted managers can trigger
                database restores or exports.
              </div>
            </div>

            {ownerProfile && (
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-950 flex items-center justify-between">
                <div>
                  <div className="font-bold text-purple-900">Protected System Owner Record:</div>
                  <div className="text-[11px] text-purple-700 mt-0.5">
                    {ownerProfile.full_name} ({ownerProfile.email})
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-purple-200 text-purple-900 rounded-lg font-bold text-[10px] uppercase">
                  Undeletable
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
