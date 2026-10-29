import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  CheckCircle2,
  Clock,
  Building,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  X,
  Sparkles,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { OwnerPaymentMethod, PaymentMethodType, User, RouterOwnerProfile } from '../../types/index.ts';

interface OwnerPaymentMethodsViewProps {
  currentUser: User;
  profile?: RouterOwnerProfile;
  initialMethods?: OwnerPaymentMethod[];
  onRefreshState?: () => void;
}

export const OwnerPaymentMethodsView: React.FC<OwnerPaymentMethodsViewProps> = ({
  currentUser,
  profile,
  initialMethods,
  onRefreshState,
}) => {
  const [methods, setMethods] = useState<OwnerPaymentMethod[]>(initialMethods || []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [payoutType, setPayoutType] = useState<PaymentMethodType>('MPESA_TILL');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [businessName, setBusinessName] = useState<string>(profile?.businessName || '');
  const [phone, setPhone] = useState<string>(currentUser.phone || '');
  const [bankName, setBankName] = useState<string>('Equity Bank');
  const [accountName, setAccountName] = useState<string>(currentUser.name || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadMethods = async () => {
    setIsLoading(true);
    try {
      const res = await api.getOwnerPaymentMethods(currentUser.id);
      setMethods(res.methods || []);
    } catch (err: any) {
      console.warn('Could not fetch payment methods:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialMethods && initialMethods.length > 0) {
      setMethods(initialMethods.filter((m) => m.owner_id === currentUser.id || !m.owner_id));
    } else {
      loadMethods();
    }
  }, [currentUser.id, initialMethods]);

  const handleCopy = (txt: string, id: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!accountNumber.trim()) {
      setFormError('Please enter the Till, Paybill, or Account Number.');
      return;
    }

    setIsSubmitting(true);
    try {
      let label = 'M-Pesa Buy Goods';
      if (payoutType === 'MPESA_PAYBILL') label = 'M-Pesa Paybill';
      else if (payoutType === 'MPESA_PHONE') label = 'M-Pesa Phone Number';
      else if (payoutType === 'BANK') label = `${bankName} Account`;

      await api.createOwnerPaymentMethod({
        owner_id: currentUser.id,
        type: payoutType,
        label,
        number: accountNumber.trim(),
        business_name: businessName.trim() || profile?.businessName || 'My WiFi Business',
        phone: phone.trim() || currentUser.phone,
        bank_name: payoutType === 'BANK' ? bankName : undefined,
        account_name: payoutType === 'BANK' ? accountName : undefined,
      });

      setSuccessMsg('Payment method submitted! Pending super admin verification.');
      setIsModalOpen(false);
      setAccountNumber('');
      await loadMethods();
      if (onRefreshState) onRefreshState();

      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit payment method.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingCount = methods.filter((m) => m.status === 'pending').length;
  const activeCount = methods.filter((m) => m.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <CreditCard className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100">Payout Payment Methods</h1>
          </div>
          <p className="text-xs text-slate-400">
            Configure M-Pesa Buy Goods Till, Paybill, or Bank accounts for automated revenue disbursements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Payment Method
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Channels</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100">{activeCount}</div>
          <span className="text-[11px] text-emerald-400 font-medium mt-1 block">Ready for automated payouts</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Review</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100">{pendingCount}</div>
          <span className="text-[11px] text-amber-400 font-medium mt-1 block">Awaiting admin compliance check</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Configured</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100">{methods.length}</div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">Registered payout accounts</span>
        </div>
      </div>

      {/* Methods List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold text-slate-200">Registered Accounts</h2>
          </div>
          <button
            type="button"
            onClick={loadMethods}
            disabled={isLoading}
            className="text-xs text-slate-400 hover:text-sky-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {methods.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-300 mb-1">No payment methods configured</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Add your Safaricom M-Pesa Buy Goods Till, Paybill, or Bank account so customers can pay directly and you receive payouts.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add First Payout Method
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {methods.map((method) => {
              const isTill = method.type === 'MPESA_TILL';
              const isPaybill = method.type === 'MPESA_PAYBILL';
              const isBank = method.type === 'BANK';
              const isActive = method.status === 'active';

              return (
                <div key={method.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/20 transition-colors">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isActive
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}
                    >
                      {isBank ? <Building className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-100">{method.label}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {isActive ? 'Active / Verified' : 'Pending Review'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                          {method.number}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(method.number, method.id)}
                          className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          {copiedId === method.id ? <Check className="w-3.5 h-3.5 text-emerald-400 inline" /> : <Copy className="w-3.5 h-3.5 inline" />}
                        </button>
                      </div>

                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                        <span>Business: <strong className="text-slate-300">{method.business_name || 'My Hotspot'}</strong></span>
                        <span>•</span>
                        <span>Phone: <strong className="text-slate-300 font-mono">{method.phone}</strong></span>
                        {method.bank_name && (
                          <>
                            <span>•</span>
                            <span>Bank: <strong className="text-slate-300">{method.bank_name}</strong></span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center">
                    {isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                        <ShieldCheck className="w-4 h-4" /> Verified Payout Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                        <Clock className="w-4 h-4" /> In Verification Queue
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Payment Method Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-base text-slate-100">Add Payout Account</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Payout Channel Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: 'MPESA_TILL' as PaymentMethodType, label: 'M-Pesa Till', sub: 'Buy Goods' },
                    { type: 'MPESA_PAYBILL' as PaymentMethodType, label: 'M-Pesa Paybill', sub: 'Shortcode' },
                    { type: 'MPESA_PHONE' as PaymentMethodType, label: 'Phone Number', sub: 'Send Money' },
                    { type: 'BANK' as PaymentMethodType, label: 'Bank Account', sub: 'EFT / RTGS' },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setPayoutType(item.type)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        payoutType === item.type
                          ? 'bg-sky-500/10 border-sky-500 text-sky-300 ring-1 ring-sky-500/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs">{item.label}</div>
                      <div className="text-[10px] text-slate-500">{item.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Number / Account */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  {payoutType === 'MPESA_TILL'
                    ? 'Buy Goods Till Number *'
                    : payoutType === 'MPESA_PAYBILL'
                    ? 'Paybill Business Shortcode *'
                    : payoutType === 'BANK'
                    ? 'Bank Account Number *'
                    : 'M-Pesa Phone Number *'}
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder={
                    payoutType === 'MPESA_TILL'
                      ? 'e.g. 5414200'
                      : payoutType === 'MPESA_PAYBILL'
                      ? 'e.g. 408801'
                      : payoutType === 'BANK'
                      ? 'e.g. 0180293847291'
                      : 'e.g. 0722000111'
                  }
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-sky-400 font-mono font-bold focus:outline-none focus:border-sky-500 transition-all"
                />
              </div>

              {/* Bank-specific fields */}
              {payoutType === 'BANK' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Bank Name
                    </label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                    >
                      <option value="Equity Bank">Equity Bank</option>
                      <option value="KCB Bank">KCB Bank</option>
                      <option value="Co-operative Bank">Co-operative Bank</option>
                      <option value="Absa Bank">Absa Bank</option>
                      <option value="Standard Chartered">Standard Chartered</option>
                      <option value="NCBA Bank">NCBA Bank</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Account Name
                    </label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="Account holder name"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              )}

              {/* Business Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Business / Hotspot Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Kiambu FastNet WiFi"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-sky-500 transition-all"
                />
              </div>

              {/* Notification Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Notification Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0722000111"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500 transition-all"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" /> Submit for Verification
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
