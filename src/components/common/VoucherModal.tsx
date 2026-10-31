import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, Ticket, ArrowRight, QrCode, Camera } from 'lucide-react';
import { api } from '../../services/api.ts';
import { QrCodeScannerModal } from './QrCodeScannerModal.tsx';
import type { ParsedQrResult } from '../../lib/qrParser.ts';

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
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  if (!isOpen) return null;


  const redeemCode = async (codeToRedeem: string) => {
    setLoading(true);
    setError('');

    try {
      const res = await api.redeemVoucher(codeToRedeem, userId);
      setSuccessData(res);
      onVoucherSuccess(res);
    } catch (err: any) {
      setError(err.message || 'Failed to redeem voucher code.');
    } finally {
      setLoading(false);
    }
  };


  const handleQrScan = (parsed: ParsedQrResult) => {
    const extracted = parsed.voucherCode || parsed.raw;
    if (extracted) {
      setCode(extracted.toUpperCase());
      setError('');
      // Auto redeem with scanned code
      redeemCode(extracted.toUpperCase());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    redeemCode(code.trim());
  };

  const handleReset = () => {
    setCode('');
    setError('');
    setSuccessData(null);
  };

  return (
    <>
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
              {/* Quick Camera QR Scan Button */}
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-400/15 via-amber-400/10 to-amber-400/15 hover:from-amber-400/25 hover:to-amber-400/25 border border-amber-400/40 hover:border-amber-400 rounded-xl text-amber-300 hover:text-amber-200 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Scan Voucher QR with Camera</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">or type code manually</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Voucher Code / Scratch PIN
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="BRK-XXXX-XXXX"
                    className="w-full pl-3 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-base tracking-widest text-center text-amber-400 placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="absolute right-2.5 p-1.5 text-slate-400 hover:text-amber-400 transition-colors"
                    title="Scan with Camera"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Scratch off your physical card or scan the printed QR code.
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

    <QrCodeScannerModal
      isOpen={isScannerOpen}
      onClose={() => setIsScannerOpen(false)}
      onScan={handleQrScan}
      title="Scan Voucher QR Code"
      hint="Align the voucher QR card inside the camera frame to auto-redeem"
    />
  </>
  );
};

