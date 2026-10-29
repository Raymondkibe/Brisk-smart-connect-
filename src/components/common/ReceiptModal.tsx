import React from 'react';
import { X, Printer, Download, CheckCircle, Wifi, Shield } from 'lucide-react';
import type { Transaction } from '../../types/index.ts';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, transaction }) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-2xl p-6 overflow-hidden border border-slate-200 print:m-0 print:p-0 print:border-none print:shadow-none">
        {/* Close Button (Hidden on Print) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        {/* Brand Header */}
        {(() => {
          const isPlatformSub = transaction.type === 'ROUTER_OWNER_SUBSCRIPTION';
          const isPppoe = transaction.type === 'CUSTOMER_PPPOE';

          return (
            <>
              <div className="text-center pb-5 border-b border-dashed border-slate-300">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 text-white rounded-xl mb-2 shadow-md ${
                    isPlatformSub ? 'bg-amber-600' : 'bg-sky-600'
                  }`}
                >
                  <Wifi className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-black tracking-tight text-slate-950">
                  {isPlatformSub ? 'BRISK SMART CONNECT' : (transaction.ispBusinessName || 'BRISK SMART CONNECT')}
                </h2>
                <p className="text-xs text-slate-500 font-medium tracking-wide">
                  {isPlatformSub
                    ? 'Cloud ISP Management Software · SaaS Provider'
                    : 'Smart WiFi & Broadband · Powered by BRISK'}
                </p>
                <div
                  className={`inline-block mt-2 px-2.5 py-0.5 text-xs font-semibold rounded-md border ${
                    isPlatformSub
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : isPppoe
                      ? 'bg-purple-50 text-purple-800 border-purple-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {isPlatformSub
                    ? 'PLATFORM SAAS SUBSCRIPTION RECEIPT'
                    : isPppoe
                    ? 'HOME / BIZ FIBRE BROADBAND RECEIPT'
                    : 'HOTSPOT INTERNET ACCESS RECEIPT'}
                </div>
              </div>

              {/* Receipt Key Info */}
              <div className="py-4 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Receipt #:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{transaction.receiptNumber}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">
                    {isPlatformSub ? 'ISP Owner / Tenant:' : 'Customer / Subscriber:'}
                  </span>
                  <span className="font-bold text-slate-900">{transaction.userName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Payment Flow:</span>
                  <span className={`font-semibold ${isPlatformSub ? 'text-amber-800' : 'text-sky-800'}`}>
                    {isPlatformSub
                      ? 'Platform SaaS (ISP -> BRISK Software)'
                      : 'Internet Access (Customer -> ISP Provider)'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Beneficiary / Payee:</span>
                  <span className="font-semibold text-slate-900">
                    {transaction.beneficiaryName ||
                      (isPlatformSub ? 'BRISK Smart Connect (Platform SaaS)' : 'Kiambu Smart WiFi Networks (ISP)')}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Destination Account:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {transaction.recipientAccount ||
                      (isPlatformSub ? 'BRISK Platform Paybill 408801' : 'ISP Hotspot Till 882194')}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Package / Service:</span>
                  <span className="font-semibold text-sky-800">{transaction.packageName || 'WiFi Service'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Payment Method:</span>
                  <span className="font-semibold text-slate-800">{transaction.paymentMethod}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Transaction Reference:</span>
                  <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                    {transaction.reference}
                  </span>
                </div>

                {transaction.mpesaPhone && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Phone Number:</span>
                    <span className="font-mono text-slate-700">{transaction.mpesaPhone}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Date & Time:</span>
                  <span className="text-slate-700">
                    {new Date(transaction.createdAt).toLocaleString('en-KE', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>

                <div className="pt-3 border-t border-dashed border-slate-300 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-900">Total Amount:</span>
                  <span className="text-xl font-extrabold text-slate-950 font-mono">
                    KES {transaction.amountKes.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-emerald-600 font-bold">
                  <span>Status:</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> PAID & ACTIVATED
                  </span>
                </div>
              </div>

              {/* Security & Verification Footer */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Shield className="w-3.5 h-3.5 text-sky-600" />
                  <span>
                    {isPlatformSub
                      ? 'Official BRISK SaaS License Receipt'
                      : 'Cryptographically Verified ISP Internet Access Receipt'}
                  </span>
                </div>
                <p>
                  {isPlatformSub
                    ? 'Covers 30 days of multi-tenant MikroTik RouterOS automation, captive portal hosting, and automated M-Pesa billing.'
                    : 'Keep this receipt for session restoration or support queries. Direct inquiries to support@briskconnect.co.ke.'}
                </p>
              </div>
            </>
          );
        })()}

        {/* Action Buttons (Print / Close) */}
        <div className="mt-5 grid grid-cols-2 gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
