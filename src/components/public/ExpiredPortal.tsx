import React from 'react';
import { AlertTriangle, WifiOff, Smartphone, Ticket, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import type { WifiPackage } from '../../types/index.ts';

interface ExpiredPortalProps {
  onSelectPackage: (pkg: WifiPackage) => void;
  onOpenVoucher: () => void;
  packages: WifiPackage[];
  onReturnHome: () => void;
}

export const ExpiredPortal: React.FC<ExpiredPortalProps> = ({
  onSelectPackage,
  onOpenVoucher,
  packages,
  onReturnHome,
}) => {
  // Common quick packages
  const quickPackages = packages.filter((p) =>
    ['pkg-1d', 'pkg-3d', 'pkg-7d'].includes(p.id)
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <WifiOff className="w-8 h-8" />
        </div>

        {/* Captive Portal Headline */}
        <div>
          <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
            MikroTik Captive Redirection
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">YOUR PACKAGE HAS EXPIRED</h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300">
            Your previous WiFi session time has elapsed. Choose another package or enter a voucher to restore
            high-speed internet immediately.
          </p>
        </div>

        {/* Previous Package info */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-around text-slate-400">
          <div>
            <span>Previous Package: </span>
            <strong className="text-white">3 Days</strong>
          </div>
          <div>
            <span>Status: </span>
            <strong className="text-red-400">EXPIRED</strong>
          </div>
        </div>

        {/* Quick package picks */}
        <div className="space-y-2.5 text-left">
          <div className="text-xs font-semibold text-slate-300">Quick Renewal Options:</div>
          {quickPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="p-3.5 bg-slate-950/80 border border-slate-800 hover:border-amber-400/60 rounded-2xl flex items-center justify-between transition-colors"
            >
              <div>
                <div className="text-sm font-bold text-white">{pkg.name}</div>
                <div className="text-xs text-sky-400 font-medium">
                  {pkg.durationLabel} · {pkg.speedLabel}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-black text-amber-400">KES {pkg.priceKes}</div>
                </div>
                <button
                  onClick={() => onSelectPackage(pkg)}
                  className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>RENEW</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Alternative: Enter Voucher */}
        <div className="pt-2 border-t border-slate-800 space-y-3">
          <button
            onClick={onOpenVoucher}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Ticket className="w-4 h-4 text-amber-400" />
            <span>I HAVE A VOUCHER CODE</span>
          </button>

          <button
            onClick={onReturnHome}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Return to Public Website
          </button>
        </div>

        {/* Network isolation assurance */}
        <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
          <span>Session securely controlled by BRISK MikroTik Gateway Engine</span>
        </div>
      </div>
    </div>
  );
};
