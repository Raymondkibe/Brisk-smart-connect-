import React, { useState } from 'react';
import {
  X,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wifi,
  Receipt,
  RotateCw,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { WifiPackage, SubscriptionPlan, Transaction } from '../../types/index.ts';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem: {
    type: 'CUSTOMER_WIFI' | 'ROUTER_OWNER_SUBSCRIPTION' | 'INSTALLATION';
    id: string;
    name: string;
    priceKes: number;
    durationLabel?: string;
    speedLabel?: string;
  } | null;
  userId: string;
  defaultPhone?: string;
  onPaymentSuccess: (tx: Transaction) => void;
  onViewReceipt: (tx: Transaction) => void;
}

type StepState = 'INPUT' | 'WAITING' | 'SUCCESS' | 'FAILED';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  targetItem,
  userId,
  defaultPhone = '0799123456',
  onPaymentSuccess,
  onViewReceipt,
}) => {
  const [phone, setPhone] = useState(defaultPhone);
  const [state, setState] = useState<StepState>('INPUT');
  const [errorMessage, setErrorMessage] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);
  const [countdown, setCountdown] = useState(15);

  if (!isOpen || !targetItem) return null;

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setState('WAITING');
    setCountdown(12);

    try {
      const res = await api.initiateMpesaStk({
        phone,
        amount: targetItem.priceKes,
        type: targetItem.type,
        reference: `BRK-${targetItem.id}`,
        packageId: targetItem.id,
      });

      setCheckoutRequestId(res.checkoutRequestId);

      // Simulate network wait for PIN entry then automatic backend verification
      setTimeout(async () => {
        try {
          const verifyRes = await api.verifyMpesaPayment({
            checkoutRequestId: res.checkoutRequestId,
            phone,
            amount: targetItem.priceKes,
            type: targetItem.type,
            packageId: targetItem.id,
            userId,
          });

          if (verifyRes.success && verifyRes.transaction) {
            setCompletedTx(verifyRes.transaction);
            setState('SUCCESS');
            onPaymentSuccess(verifyRes.transaction);
          } else {
            setState('FAILED');
            setErrorMessage('Payment verification timeout. Please check your M-Pesa balance.');
          }
        } catch (err: any) {
          setState('FAILED');
          setErrorMessage(err.message || 'Payment verification failed');
        }
      }, 4000);
    } catch (err: any) {
      setState('FAILED');
      setErrorMessage(err.message || 'Could not initiate STK push');
    }
  };

  const handleReset = () => {
    setState('INPUT');
    setErrorMessage('');
    setCompletedTx(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">M-Pesa Express Checkout</h3>
              <p className="text-xs text-slate-400">Safaricom Daraja Instant Push</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Package Details */}
        <div className="mt-4 p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-slate-400">Selected Item</span>
              <h4 className="text-base font-bold text-white">{targetItem.name}</h4>
              {targetItem.durationLabel && (
                <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>{targetItem.durationLabel} Access</span>
                  {targetItem.speedLabel && (
                    <>
                      <span>·</span>
                      <span className="text-sky-400 font-medium">{targetItem.speedLabel}</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Amount Due</span>
              <div className="text-lg font-extrabold text-amber-400">
                KES {targetItem.priceKes.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic States */}
        {state === 'INPUT' && (
          <form onSubmit={handleInitiatePayment} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                M-Pesa Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07XXXXXXXX or 01XXXXXXXX"
                  className="w-full pl-3 pr-24 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono"
                />
                <span className="absolute right-3 top-2.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                  SAFARICOM
                </span>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">
                A prompt will appear on your phone asking for your M-Pesa PIN.
              </p>
            </div>

            <div className="p-3 bg-sky-950/30 border border-sky-800/40 rounded-xl flex items-start gap-2.5 text-xs text-sky-200">
              <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span>
                Secured via Safaricom Daraja API. Your router session activates instantly upon confirmation.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-400/20 transition-colors flex items-center justify-center gap-2"
            >
              <span>PAY KES {targetItem.priceKes.toLocaleString()} NOW</span>
            </button>
          </form>
        )}

        {state === 'WAITING' && (
          <div className="mt-6 py-6 text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-amber-400 animate-spin" />
              <Smartphone className="w-6 h-6 text-amber-400 absolute inset-0 m-auto" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">STK Push Sent to Your Phone</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Please check <span className="font-mono text-amber-300">{phone}</span> and enter your M-Pesa
                PIN to authorize KES {targetItem.priceKes.toLocaleString()}.
              </p>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Waiting for Safaricom authorization callback...
            </div>
          </div>
        )}

        {state === 'SUCCESS' && completedTx && (
          <div className="mt-5 space-y-4">
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-center space-y-1.5">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-emerald-300">✓ PAYMENT SUCCESSFUL</h4>
              <p className="text-xs text-slate-300">
                Your package is now active. High-speed internet access has been provisioned on the network.
              </p>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Receipt Number</span>
                <span className="font-mono font-semibold text-white">{completedTx.receiptNumber}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>M-Pesa Reference</span>
                <span className="font-mono font-semibold text-amber-400">{completedTx.reference}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Amount Paid</span>
                <span className="font-semibold text-white">KES {completedTx.amountKes}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status</span>
                <span className="text-emerald-400 font-semibold">● ACTIVE</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => onViewReceipt(completedTx)}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
              >
                <Receipt className="w-4 h-4 text-sky-400" />
                View Receipt
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-3 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-sky-600/20 transition-colors"
              >
                <Wifi className="w-4 h-4 text-white" />
                Connect to WiFi
              </button>
            </div>
          </div>
        )}

        {state === 'FAILED' && (
          <div className="mt-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
            <div>
              <h4 className="text-base font-bold text-white">Payment Unsuccessful</h4>
              <p className="text-xs text-red-400/90 mt-1 max-w-xs mx-auto">
                {errorMessage || 'The payment request was cancelled or timed out.'}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl inline-flex items-center gap-1.5 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
