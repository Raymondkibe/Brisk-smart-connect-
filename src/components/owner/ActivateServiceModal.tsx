import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Copy,
  Calendar,
  Sparkles,
  Zap,
  ArrowRight,
  CreditCard,
} from 'lucide-react';
import { api } from '../../services/api.ts';

interface ActivateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerId: string;
  ownerName?: string;
  currentExpiryDate?: string | Date | null;
  onSuccess: (updatedProfile: any, extendedDate: string, durationDays: number) => void;
  blockedFeatureName?: string | null;
}

export const ActivateServiceModal: React.FC<ActivateServiceModalProps> = ({
  isOpen,
  onClose,
  ownerId,
  ownerName,
  currentExpiryDate,
  onSuccess,
  blockedFeatureName,
}) => {
  const [activationCode, setActivationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    message: string;
    expiresAt: string;
    code: string;
    durationDays?: number;
  } | null>(null);

  if (!isOpen) return null;

  const formattedCurrentExpiry = currentExpiryDate
    ? new Date(currentExpiryDate).toLocaleDateString('en-KE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Expired';

  const isCurrentExpired = currentExpiryDate
    ? new Date(currentExpiryDate).getTime() < Date.now()
    : true;

  const handleValidateAndActivate = async (codeToSubmit?: string) => {
    const rawCode = (codeToSubmit || activationCode).trim().toUpperCase();
    if (!rawCode) {
      setError('Please enter a valid activation code (e.g. 849201 or BRISK-ACT-7X9K2P).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Sends API request to the admin backend
      const res = await api.redeemSubscriptionActivationCode(ownerId, rawCode);
      
      const durationDays = res.durationDays || 30;
      setSuccessData({
        message: res.message || 'Service successfully activated and subscription extended!',
        expiresAt: res.expiresAt,
        code: rawCode,
        durationDays,
      });

      // Notify parent to extend state & lift lockouts
      onSuccess(res.profile, res.expiresAt, durationDays);

      // Auto-close after 2.5s or allow manual dismiss
      setTimeout(() => {
        // keep modal until user clicks continue or closes
      }, 2500);
    } catch (err: any) {
      setError(
        err.message || 'Invalid or already used activation code. Please verify with your system administrator.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (preset: string) => {
    setActivationCode(preset);
    setError(null);
    handleValidateAndActivate(preset);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-sky-500/10 space-y-5 overflow-hidden">
        {/* Glow ambient decoration */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800/80 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-tight">Activate Service</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30 uppercase tracking-wider">
                  Router Owner
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Extend subscription expiry date & restore full fleet access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Paused Warning if triggered by a blocked action */}
        {blockedFeatureName && !successData && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-xs text-amber-300 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-200">Action Paused: </span>
              {blockedFeatureName} requires an active subscription license. Activate your service below to proceed.
            </div>
          </div>
        )}

        {/* Current Expiry & Status Card */}
        <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Current Expiry Date</div>
            <div className="text-sm font-black text-white mt-0.5 flex items-center gap-1.5 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedCurrentExpiry}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">License Status</div>
            <div className="mt-0.5">
              {isCurrentExpired ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  ● Expired (Locked)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ● Active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SUCCESS VIEW */}
        {successData ? (
          <div className="p-6 bg-gradient-to-b from-emerald-950/50 to-slate-950 border border-emerald-500/40 rounded-3xl text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-lg font-black text-white">Service Activated Successfully!</h4>
              <p className="text-xs text-emerald-300 mt-1 max-w-sm mx-auto">
                {successData.message}
              </p>
            </div>

            <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-emerald-500/30 text-xs space-y-1.5 max-w-xs mx-auto">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">New Subscription Expiry Date</div>
              <div className="text-base font-black text-emerald-400 font-mono">
                {new Date(successData.expiresAt).toLocaleDateString('en-KE', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
              <div className="text-[11px] text-slate-400">
                Extension Applied: <strong className="text-white">+{successData.durationDays || 30} Days</strong>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>CONTINUE TO DASHBOARD</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* CODE PROMPT VIEW */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleValidateAndActivate();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Enter Activation Code (Numeric or Prefixed)
              </label>

              <div className="relative">
                <KeyRound className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={activationCode}
                  onChange={(e) => {
                    setActivationCode(e.target.value.toUpperCase());
                    setError(null);
                  }}
                  placeholder="e.g. 849201 or BRISK-ACT-7X9K2P"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-base sm:text-lg font-mono font-black text-sky-400 uppercase tracking-widest placeholder:text-slate-600 focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 transition-all text-center sm:text-left"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 px-1">
                <span>Supports 6-digit numeric codes or official BRISK-ACT tokens</span>
                {activationCode && (
                  <span className="text-sky-400 font-mono font-bold">
                    {/^\d+$/.test(activationCode) ? `${activationCode.length}-digit numeric code` : 'Token format'}
                  </span>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-2xl text-xs text-rose-300 font-medium flex items-center gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}



            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !activationCode.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-sky-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Validating Code with Backend...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>VALIDATE & EXTEND SERVICE</span>
                </>
              )}
            </button>

            {/* PayBill Instructions Footer */}
            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                <span>Need a code? Pay via PayBill:</span>
              </div>
              <div className="font-mono text-slate-300">
                Business: <strong className="text-amber-400">222111</strong> · Acc: <strong className="text-amber-400">5414200</strong>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
