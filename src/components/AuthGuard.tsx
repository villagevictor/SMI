import React, { useState } from 'react';
import {
  Boxes,
  Mail,
  User,
  Clock,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  LogOut,
  Send,
  Database,
  Lock,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const {
    currentUser,
    requestAppAccess,
    checkLiveApprovalStatus,
    logout,
  } = useERP();

  const [inputEmail, setInputEmail] = useState('');
  const [inputFullName, setInputFullName] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [isPinRequired, setIsPinRequired] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkingApproval, setCheckingApproval] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. If user is signed in and status is ACTIVE -> Allow full app access
  if (currentUser && currentUser.status === 'active') {
    return <>{children}</>;
  }

  // 2. Handler: Submit Email / Request Access (Play Store initial launch)
  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!inputEmail.trim() || !inputEmail.includes('@')) {
      setErrorMessage('Please enter a valid work email address.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await requestAppAccess(inputEmail.trim(), inputFullName.trim());
      if (result.status === 'pin_required') {
        setIsPinRequired(true);
        setErrorMessage('');
      } else if (result.status === 'error') {
        setErrorMessage(result.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Handler: Submit Master PIN for Owner Email Verification
  const handleVerifyOwnerPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!pinInput.trim()) {
      setErrorMessage('Please enter your Master Security PIN.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await requestAppAccess(inputEmail.trim(), inputFullName.trim(), pinInput.trim());
      if (result.status === 'error') {
        setErrorMessage(result.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'PIN verification failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Handler: Check Live Approval Status against Supabase
  const handleCheckStatus = async () => {
    setCheckingApproval(true);
    setErrorMessage('');
    try {
      const res = await checkLiveApprovalStatus(currentUser?.email);
      if (!res.approved) {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not verify status with Supabase.');
    } finally {
      setCheckingApproval(false);
    }
  };

  // 5. Screen: PENDING ADMIN APPROVAL
  if (currentUser && currentUser.status === 'pending') {
    const adminEmail = 'ashenafihailay645@gmail.com';
    const mailtoSubject = encodeURIComponent(`[ERP Access Request] Authorization for ${currentUser.email}`);
    const mailtoBody = encodeURIComponent(
      `Hello Administrator,\n\nI have installed the Ethiopia Enterprise ERP app on my device and requested access.\n\nApplicant Details:\n- Name: ${currentUser.full_name || currentUser.email}\n- Email: ${currentUser.email}\n- Date: ${new Date().toLocaleDateString()}\n\nPlease approve my account in the Supabase 'profiles' table (change status to 'active').\n\nThank you!`
    );
    const directMailtoUrl = `mailto:${adminEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center text-white shadow-2xl relative overflow-hidden">
          {/* Subtle top decoration */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />

          {/* Pending Pulse Icon */}
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-400">
            <Clock className="w-8 h-8 animate-spin" style={{ animationDuration: '4s' }} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-500/30">
            <span>Status: Awaiting Administrator Approval</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-2">
            Access Request Submitted
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
            Welcome, <strong className="text-white">{currentUser.full_name || currentUser.email}</strong>! Your application has been registered in the <strong>Supabase cloud database</strong> and dispatched to the System Administrator for authorization.
          </p>

          <div className="mt-4 p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-left text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-2">
              <span>Your Registered Email:</span>
              <strong className="text-white font-mono">{currentUser.email}</strong>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-2">
              <span>Admin Recipient:</span>
              <strong className="text-amber-300 font-mono">{adminEmail}</strong>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Supabase Cloud Sync:</span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Profile Stored (Pending)
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-3.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 space-y-2.5">
            {/* Real-time Supabase Check */}
            <button
              onClick={handleCheckStatus}
              disabled={checkingApproval}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75"
            >
              <RefreshCw className={`w-4 h-4 ${checkingApproval ? 'animate-spin' : ''}`} />
              <span>{checkingApproval ? 'Checking Supabase Status...' : 'Check Approval Status Now'}</span>
            </button>

            {/* Direct Send Email to Admin fallback */}
            <a
              href={directMailtoUrl}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700"
            >
              <Mail className="w-4 h-4 text-amber-400" />
              <span>Send Direct Email Notification to Admin</span>
            </a>

            {/* Change Email */}
            <button
              onClick={logout}
              className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign In with Another Email Address</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 6. Screen: BLOCKED USER
  if (currentUser && currentUser.status === 'blocked') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-8 text-center text-white shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Access Suspended</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            The account associated with <strong className="text-white">{currentUser.email}</strong> has been suspended by the System Administrator.
          </p>
          <button
            onClick={logout}
            className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign In with Another Email</span>
          </button>
        </div>
      </div>
    );
  }

  // 7. Screen: OWNER MASTER PIN VERIFICATION (Only when owner email entered)
  if (isPinRequired) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />

          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-400">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white text-center tracking-tight">
            Administrator Verification
          </h2>

          <p className="text-xs text-slate-400 text-center mt-2 leading-relaxed">
            This account (<strong className="text-white">{inputEmail}</strong>) is designated as the <strong>System Owner</strong>. Please enter your Master Security PIN to log in.
          </p>

          <form onSubmit={handleVerifyOwnerPin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Master Security PIN
              </label>
              <input
                type="password"
                required
                autoFocus
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                placeholder="Enter 4-digit PIN"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-center font-mono text-xl tracking-widest focus:border-amber-500 focus:outline-hidden transition"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75"
            >
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{submitting ? 'Verifying PIN...' : 'Verify & Log In as Administrator'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsPinRequired(false);
                setPinInput('');
                setErrorMessage('');
              }}
              className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition"
            >
              Cancel / Back to Email Entry
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 8. Screen: INITIAL PLAY STORE APP LAUNCH - ENTER WORK EMAIL
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        {/* Top Accent Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600" />

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-600/30">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-wide uppercase text-white">
              ETHIOPIA ENTERPRISE ERP
            </h1>
            <div className="text-[11px] font-semibold text-slate-400 tracking-wider">
              INVENTORY, WAREHOUSES & BILLING
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mb-6 space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Sign In / Request Access
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Please enter your work email to connect to the ERP system. Access requests are delivered to the Administrator (<strong>ashenafihailay645@gmail.com</strong>) for authorization.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmitEmail} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name (Optional)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inputFullName}
                onChange={e => setInputFullName(e.target.value)}
                placeholder="e.g. Abebe Kebede"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-xs sm:text-sm focus:border-blue-500 focus:outline-hidden transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Work Email Address <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={inputEmail}
                onChange={e => setInputEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-xs sm:text-sm focus:border-blue-500 focus:outline-hidden transition font-mono"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75"
          >
            {submitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{submitting ? 'Connecting to Supabase...' : 'Continue / Request Authorization'}</span>
          </button>
        </form>

        {/* Supabase Connectivity Badge */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Supabase Cloud Integration:</span>
          </span>
          <span className="flex items-center gap-1 font-semibold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Connected
          </span>
        </div>
      </div>
    </div>
  );
};

export const SignUpModal: React.FC<{ isOpen: boolean; onClose: () => void }> = () => null;
