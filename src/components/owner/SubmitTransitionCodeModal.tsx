import React, { useState } from 'react';
import {
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Copy,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Send,
  Smartphone,
  Check,
} from 'lucide-react';
import { api } from '../../services/api.ts';

interface SubmitTransitionCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerId: string;
  ownerName?: string;
  ownerPhone?: string;
  currentExpiryDate?: string | Date | null;
  onSuccess: (updatedProfile?: any) => void;
  blockedFeatureName?: string | null;
}

export const SubmitTransitionCodeModal: React.FC<SubmitTransitionCodeModalProps> = ({
  isOpen,
  onClose,
  ownerId,
  ownerName = 'Router Owner',
  ownerPhone = '0722000111',
  currentExpiryDate,
  onSuccess,
  blockedFeatureName,
}) => {
  const [transitionCode, setTransitionCode] = useState('');
  const [amount, setAmount] = useState(1500);
  const [planName, setPlanName] = useState('BRISK Pro Host (30 Days)');
  const [phone, setPhone] = useState(ownerPhone);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedRequest, setSubmittedRequest] = useState<any | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [autoActivated, setAutoActivated] = useState<boolean>(false);
  const [stkPushDispatched, setStkPushDispatched] = useState<boolean>(false);
  const [stkLoading, setStkLoading] = useState<boolean>(false);
  const [copiedPaybill, setCopiedPaybill] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopyPaybill = () => {
    navigator.clipboard.writeText('222111');
    setCopiedPaybill(true);
    setTimeout(() => setCopiedPaybill(false), 2000);
  };

  const handleTriggerStkPrompt = async () => {
    setStkLoading(true);
    setError(null);
    try {
      await api.initiateMpesaStk({
        phone: phone || ownerPhone,
        amount: Number(amount),
        type: 'ROUTER_OWNER_SUBSCRIPTION',
        reference: `RENEW-${planName.slice(0, 6).toUpperCase()}`,
      });
      setStkPushDispatched(true);
    } catch (err: any) {
      setError(err.message || 'M-Pesa STK push dispatched to phone.');
    } finally {
      setStkLoading(false);
    }
  };

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = transitionCode.trim().toUpperCase();
    if (!cleanCode) {
      setError('Please enter your M-Pesa transition code from Safaricom (e.g. QKR49X2PLA).');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.submitManualSubscriptionPayment({
        ownerId,
        ownerName,
        phone,
        planName,
        amountKes: Number(amount),
        transactionReference: cleanCode,
      });

      if (res && res.request) {
        setSubmittedRequest(res.request);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit transition code. Please verify details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckApprovalStatus = async () => {
    setCheckingStatus(true);
    try {
      const res = await api.getOwnerManualRequests(ownerId);
      if (res && res.profile) {
        const isNowActive =
          res.profile.subscriptionStatus === 'ACTIVE' &&
          Boolean(res.profile.subscriptionExpiresAt && new Date(res.profile.subscriptionExpiresAt).getTime() > Date.now());

        if (isNowActive) {
          setAutoActivated(true);
          onSuccess(res.profile);
        } else {
          // Check requests
          const matching = res.requests.find(
            (r) => r.transactionReference.toUpperCase() === transitionCode.trim().toUpperCase()
          );
          if (matching && matching.status === 'APPROVED') {
            setAutoActivated(true);
            onSuccess(res.profile);
          } else {
            alert('Your payment is currently under review by the Admin. As soon as the Admin approves your transition code, your subscription will automatically activate immediately.');
          }
        }
      }
    } catch (err: any) {
      console.warn('Error checking status:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-[#0b1426] border border-blue-900/40 rounded-3xl shadow-2xl shadow-blue-950/60 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#0e1933] to-[#0a1224] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight">
                Renew Subscription & Auto-Activate
              </h3>
              <p className="text-xs text-slate-400">
                M-Pesa Paybill or STK Push · Admin Auto-Activation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Blocked feature alert banner if user was blocked */}
          {blockedFeatureName && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                <strong>{blockedFeatureName}</strong> requires an active subscription license. Submit your M-Pesa transition code below for instant auto-activation.
              </span>
            </div>
          )}

          {/* Success / Auto-Activated State */}
          {autoActivated ? (
            <div className="p-6 bg-emerald-950/70 border border-emerald-500/60 rounded-2xl text-center space-y-4 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white">
                  Subscription Approved & Auto-Activated!
                </h4>
                <p className="text-xs text-emerald-300 mt-1">
                  The Admin has verified your transition code. Your router owner subscription is active and all network management features are unlocked!
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          ) : submittedRequest ? (
            /* Pending Verification Screen */
            <div className="p-5 bg-[#0e1933] border border-amber-500/40 rounded-2xl space-y-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                    Payment Submitted · Awaiting Admin Approval
                  </span>
                  <h4 className="text-sm font-black text-white mt-0.5">
                    Transition Code: <span className="font-mono text-cyan-300">{submittedRequest.transactionReference}</span>
                  </h4>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                The Super Admin will review your M-Pesa transition code. Once approved in the Admin Console, <strong className="text-emerald-400">your subscription will automatically activate instantly</strong>. No activation codes are needed!
              </p>

              <div className="p-3 bg-[#080d1a] rounded-xl border border-slate-800 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Amount:</span>
                  <span className="text-amber-400 font-bold">KES {submittedRequest.amountKes}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Plan:</span>
                  <span className="text-white">{submittedRequest.planName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Status:</span>
                  <span className="text-amber-300 font-bold">PENDING APPROVAL</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCheckApprovalStatus}
                  disabled={checkingStatus}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${checkingStatus ? 'animate-spin' : ''}`} />
                  {checkingStatus ? 'Checking Status...' : 'Check Admin Approval Status'}
                </button>
                <button
                  type="button"
                  onClick={() => setSubmittedRequest(null)}
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs"
                >
                  Edit Code
                </button>
              </div>
            </div>
          ) : (
            /* Normal 2-Step Flow */
            <div className="space-y-4">
              {/* Step 1: M-Pesa Instructions Card */}
              <div className="p-4 bg-[#0e1933] border border-blue-900/40 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                      1
                    </span>
                    <span className="font-bold text-white text-xs">Pay via Safaricom M-Pesa</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono">Official Paybill</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-[#080d1a] rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">PayBill Number</span>
                      <strong className="text-sm font-mono font-black text-cyan-300">222111</strong>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyPaybill}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                      title="Copy Paybill"
                    >
                      {copiedPaybill ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="p-2.5 bg-[#080d1a] rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Account Number</span>
                    <strong className="text-sm font-mono font-black text-cyan-300">5414200</strong>
                  </div>
                </div>

                {/* Quick STK push option */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">Prefer an instant prompt on your phone?</span>
                  <button
                    type="button"
                    onClick={handleTriggerStkPrompt}
                    disabled={stkLoading}
                    className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Smartphone className="w-3 h-3 text-emerald-400" />
                    {stkLoading ? 'Sending STK...' : 'Send STK Prompt'}
                  </button>
                </div>

                {stkPushDispatched && (
                  <p className="text-[10px] text-emerald-400 font-semibold animate-fade-in">
                    ✓ Prompt sent to your phone! Complete the PIN on your phone, then copy the confirmation code below.
                  </p>
                )}
              </div>

              {/* Step 2: Enter Transition Code Form */}
              <form onSubmit={handleSubmitCode} className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-600 text-white font-bold text-[10px] flex items-center justify-center">
                    2
                  </span>
                  <span className="font-bold text-white text-xs">
                    Enter M-Pesa Transition Code
                  </span>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    M-Pesa Transaction Code (Safaricom Confirmation)
                  </label>
                  <input
                    type="text"
                    value={transitionCode}
                    onChange={(e) => setTransitionCode(e.target.value.toUpperCase())}
                    placeholder="e.g. QKR49X2PLA"
                    className="w-full px-3 py-2.5 bg-[#080d1a] border border-slate-800 rounded-xl text-white font-mono text-sm tracking-wider uppercase focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Copy the 10-character reference from your M-Pesa confirmation SMS.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Amount (KES)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#080d1a] border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Your M-Pesa Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-[#080d1a] border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-[11px] text-rose-400 font-semibold bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/30">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting || !transitionCode.trim()}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-60 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      Submitting for Admin Verification...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Submit Transition Code for Admin Auto-Activation
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
