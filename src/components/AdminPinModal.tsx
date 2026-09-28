import React, { useState } from 'react';
import { ShieldAlert, KeyRound, Lock, Eye, EyeOff, Check, X } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetUserName?: string;
  adminPin: string;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetUserName = 'Administrator',
  adminPin,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === adminPin.trim()) {
      setErrorMsg('');
      setPinInput('');
      onSuccess();
      onClose();
    } else {
      setErrorMsg('Incorrect Admin Security PIN. Access denied.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            onClick={() => {
              setErrorMsg('');
              setPinInput('');
              onClose();
            }}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">Admin Security Verification</h3>
          <p className="text-xs text-slate-300 mt-1">
            Switching to <strong>{targetUserName}</strong> requires the Owner / Master Administrator PIN.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">Protected Administrator Role</p>
              <p className="text-[11px] mt-0.5 text-amber-700">
                Staff and external accounts cannot access or impersonate Admin privileges without the Master PIN.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Enter Admin Security PIN
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                autoFocus
                maxLength={8}
                value={pinInput}
                onChange={e => {
                  setPinInput(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Enter 4 to 8 digit PIN"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-center tracking-widest text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errorMsg ? (
              <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> {errorMsg}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1 text-center">
                Default Master PIN: <span className="font-mono font-semibold text-slate-600">2026</span> (Can be changed in Admin settings)
              </p>
            )}
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setPinInput('');
                onClose();
              }}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!pinInput.trim()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>Verify & Unlock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
