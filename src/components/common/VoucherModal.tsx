import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, Ticket, ArrowRight } from 'lucide-react';
import { api } from '../../services/api.ts';

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onVoucherSuccess: (result: any) => void;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({
  isOpen,
  onClose,
  userId,
  onVoucherSuccess,
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.redeemVoucher(code.trim(), userId);
      setSuccessData(res);
      onVoucherSuccess(res);
    } catch (err: any) {
      setError(err.message || 'Failed to redeem voucher code.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCode('');
    setError('');
    setSuccessData(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Redeem WiFi Voucher</h3>
              <p className="text-xs text-slate-400">Instant access pass token</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!successData ? (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Voucher Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="BRK-XXXX-XXXX"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-base tracking-widest text-center text-amber-400 placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono font-bold"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">
                Scratch off your physical card or enter code from your SMS ticket.
              </p>
            </div>



            {error && (
              <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl flex items-start gap-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-400/20 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Validating Voucher...</span>
              ) : (
                <>
                  <span>REDEEM VOUCHER</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-emerald-300">✓ VOUCHER REDEEMED</h4>
              <p className="text-xs text-slate-300">{successData.message}</p>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Package</span>
                <span className="font-semibold text-white">{successData.voucher?.packageName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Speed Allocation</span>
                <span className="font-semibold text-sky-400">{successData.voucher?.speed}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Network Hotspot</span>
                <span className="font-semibold text-amber-400">{successData.voucher?.network}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleReset}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors"
              >
                Redeem Another
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-3 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/20 transition-colors"
              >
                Start Browsing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
