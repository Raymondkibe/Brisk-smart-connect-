import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Printer, Download, X, Copy, QrCode, CheckCircle2, Scissors, FileText } from 'lucide-react';
import type { Voucher } from '../../types/index.ts';

const VoucherQrCanvas: React.FC<{ code: string; size?: number }> = ({ code, size = 90 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        `https://brisksmartconnect.vercel.app/portal?code=${encodeURIComponent(code)}`,
        {
          width: size,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        }
      );
    }
  }, [code, size]);

  return <canvas ref={canvasRef} className="mx-auto rounded" />;
};

interface PrintVouchersModalProps {
  isOpen: boolean;
  onClose: () => void;
  vouchers: Voucher[];
  networkName?: string;
  supportPhone?: string;
}

export const PrintVouchersModal: React.FC<PrintVouchersModalProps> = ({
  isOpen,
  onClose,
  vouchers,
  networkName = 'BRISK Smart WiFi',
  supportPhone = '0722 000 111',
}) => {
  const [printFormat, setPrintFormat] = useState<'A4_SHEET' | 'THERMAL_80MM'>('A4_SHEET');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen || vouchers.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleExportCsv = () => {
    const header = 'Code,Package,Price (KES),Speed,Duration (Hrs),Network,Status,Created At\n';
    const rows = vouchers
      .map(
        (v) =>
          `"${v.code}","${v.packageName}",${v.priceKes},"${v.speed}",${v.durationHours},"${v.network}","${v.status}","${v.createdAt}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brisk-vouchers-batch-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 shrink-0">
          <div>
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Brisk SmartConnect Voucher Batch Printer
            </div>
            <h3 className="text-xl font-black text-white">
              Printable WiFi Voucher Cards ({vouchers.length} Vouchers)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-400/20 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>PRINT CARDS</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Format Selector Bar */}
        <div className="flex items-center justify-between p-2 bg-slate-950 rounded-2xl border border-slate-800 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold px-2">Print Layout:</span>
            <button
              onClick={() => setPrintFormat('A4_SHEET')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                printFormat === 'A4_SHEET'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              A4 Sheet (Multi-Card Grid with Cut Borders)
            </button>
            <button
              onClick={() => setPrintFormat('THERMAL_80MM')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                printFormat === 'THERMAL_80MM'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Thermal 80mm POS Receipt Roll
            </button>
          </div>

          <div className="text-slate-400 hidden sm:block text-[11px]">
            {printFormat === 'A4_SHEET' ? 'Ideal for cutting with scissors' : 'Ideal for 80mm thermal receipt printers'}
          </div>
        </div>

        {/* Printable View Container */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950 rounded-2xl border border-slate-800">
          {/* FORMAT 1: A4 MULTI-CARD GRID */}
          {printFormat === 'A4_SHEET' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 printable-cards-grid">
              {vouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className="relative p-4 bg-white text-slate-950 rounded-2xl border-2 border-dashed border-slate-400 shadow-md flex flex-col justify-between space-y-3 print:break-inside-avoid print:shadow-none print:border-black"
                >
                  {/* Top Branding & Price */}
                  <div className="flex items-start justify-between border-b border-slate-200 pb-2">
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-sky-800">
                        {voucher.network || networkName}
                      </div>
                      <div className="text-xs font-bold text-slate-900">
                        {voucher.packageName}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-mono">
                        KES {voucher.priceKes}
                      </span>
                    </div>
                  </div>

                  {/* QR Code & Voucher PIN Code Box */}
                  <div className="text-center py-2 bg-slate-50 border border-slate-300 rounded-xl space-y-1.5 flex flex-col items-center">
                    <VoucherQrCanvas code={voucher.code} size={84} />
                    <div className="text-[9px] uppercase tracking-widest text-slate-500 font-semibold">
                      Voucher Login Code / PIN
                    </div>
                    <div className="text-base font-black font-mono tracking-widest text-slate-950 select-all">
                      {voucher.code}
                    </div>
                  </div>

                  {/* Instructions & Help */}
                  <div className="space-y-1 text-[10px] text-slate-600 border-t border-slate-200 pt-2">
                    <div className="flex items-center justify-between">
                      <span>Speed: <strong>{voucher.speed}</strong></span>
                      <span>Valid: <strong>{voucher.durationHours}h once used</strong></span>
                    </div>
                    <div>1. Connect WiFi: <strong>{networkName}</strong></div>
                    <div>2. Enter this code at login portal</div>
                    <div className="text-[9px] text-slate-500 pt-1 flex justify-between items-center">
                      <span>Helpline: {supportPhone}</span>
                      <Scissors className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>

                  {/* Quick Copy Action (on screen only) */}
                  <div className="print:hidden pt-1 flex justify-end">
                    <button
                      onClick={() => handleCopyCode(voucher.code)}
                      className="text-[10px] text-sky-700 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedCode === voucher.code ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FORMAT 2: THERMAL 80MM POS RECEIPT ROLL */}
          {printFormat === 'THERMAL_80MM' && (
            <div className="flex flex-col items-center space-y-6">
              {vouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className="w-full max-w-[300px] p-4 bg-white text-slate-950 rounded-xl border border-slate-300 shadow-lg text-center space-y-3 font-mono print:break-inside-avoid print:shadow-none print:border-none"
                >
                  <div className="text-xs font-black tracking-widest uppercase border-b border-black pb-1">
                    {voucher.network || networkName}
                  </div>

                  <div className="text-[11px] font-bold">
                    HOTSPOT INTERNET TICKET
                  </div>

                  <div className="py-2 flex justify-center">
                    <VoucherQrCanvas code={voucher.code} size={110} />
                  </div>

                  <div className="py-2 border-y border-dashed border-black">
                    <div className="text-[10px] uppercase text-slate-600">PIN CODE:</div>
                    <div className="text-2xl font-black tracking-widest text-black">
                      {voucher.code}
                    </div>
                  </div>

                  <div className="text-xs space-y-1 text-left">
                    <div className="flex justify-between">
                      <span>PACKAGE:</span>
                      <strong>{voucher.packageName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>AMOUNT:</span>
                      <strong>KES {voucher.priceKes}.00</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>DURATION:</span>
                      <strong>{voucher.durationHours} Hours</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>SPEED:</span>
                      <strong>{voucher.speed}</strong>
                    </div>
                  </div>

                  <div className="text-[9px] text-slate-700 border-t border-black pt-2 space-y-0.5">
                    <div>Connect to: "{networkName}"</div>
                    <div>Enter code above on captive login.</div>
                    <div>Customer Support: {supportPhone}</div>
                    <div className="pt-1 text-[8px] text-slate-500">
                      Powered by BRISK Smart Connect
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
