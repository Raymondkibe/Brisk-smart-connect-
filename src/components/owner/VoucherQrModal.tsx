import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  QrCode,
  Download,
  Printer,
  Share2,
  Copy,
  CheckCircle2,
  Wifi,
  Sparkles,
  Smartphone,
  ExternalLink,
  MessageSquare,
  Ticket,
} from 'lucide-react';
import type { Voucher } from '../../types/index.ts';

interface VoucherQrModalProps {
  voucher: Voucher | null;
  onClose: () => void;
  networkName?: string;
  businessName?: string;
  supportPhone?: string;
}

export const VoucherQrModal: React.FC<VoucherQrModalProps> = ({
  voucher,
  onClose,
  networkName = 'BRISK Smart WiFi',
  businessName = 'Kiambu Smart WiFi Networks',
  supportPhone = '0722 000 111 / 0799 123 456',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [qrFormat, setQrFormat] = useState<'PORTAL_URL' | 'WIFI_LOGIN' | 'PIN_ONLY'>('PORTAL_URL');
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!voucher) return null;

  // Compute QR payload based on selected format
  const getPayload = () => {
    switch (qrFormat) {
      case 'PORTAL_URL':
        return `https://brisksmartconnect.vercel.app/portal?code=${encodeURIComponent(voucher.code)}`;
      case 'WIFI_LOGIN':
        // Standard Android/iOS WiFi QR code specification
        return `WIFI:T:nopass;S:${networkName};P:${voucher.code};;`;
      case 'PIN_ONLY':
      default:
        return voucher.code;
    }
  };

  const payload = getPayload();

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        payload,
        {
          width: 260,
          margin: 1.5,
          color: {
            dark: '#020617', // Slate-950
            light: '#ffffff',
          },
        },
        (err) => {
          if (!err && canvasRef.current) {
            setDataUrl(canvasRef.current.toDataURL('image/png'));
          }
        }
      );
    }
  }, [payload, voucher.code]);

  const handleDownloadQr = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `BRISK-QR-${voucher.code}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(payload);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handlePrintSlip = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Voucher Receipt - ${voucher.code}</title>
          <style>
            @page { size: 58mm auto; margin: 2mm; }
            body {
              font-family: monospace, sans-serif;
              font-size: 11px;
              color: #000;
              margin: 0;
              padding: 6px;
              text-align: center;
              background: #fff;
              max-width: 58mm;
            }
            .header { border-bottom: 1px dashed #000; padding-bottom: 4px; margin-bottom: 6px; }
            .business { font-size: 13px; font-weight: 900; text-transform: uppercase; }
            .ssid { font-size: 10px; margin-top: 2px; }
            .qr-img { width: 140px; height: 140px; margin: 6px auto; display: block; }
            .pin-box { border: 2px solid #000; padding: 6px; font-size: 16px; font-weight: 900; letter-spacing: 2px; margin: 6px 0; }
            .plan-info { font-size: 11px; font-weight: bold; margin: 4px 0; }
            .footer { border-top: 1px dashed #000; padding-top: 4px; margin-top: 6px; font-size: 9px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="business">${businessName}</div>
            <div class="ssid">WiFi: <strong>${networkName}</strong></div>
          </div>
          <div class="plan-info">
            ${voucher.packageName} · KES ${voucher.priceKes}
          </div>
          <img src="${dataUrl}" class="qr-img" alt="QR Code" />
          <div>SCAN QR OR ENTER PIN:</div>
          <div class="pin-box">${voucher.code}</div>
          <div style="font-size: 10px; margin-bottom: 4px;">
            Validity: <strong>${voucher.durationHours} Hours</strong> · 1 Device
          </div>
          <div class="footer">
            Connect: ${networkName}<br/>
            Open browser: 192.168.88.1<br/>
            Support: ${supportPhone}
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `📶 *${businessName} - WiFi Access Voucher*\n\n` +
      `🔑 *Voucher Code:* \`${voucher.code}\`\n` +
      `📦 *Package:* ${voucher.packageName} (${voucher.durationHours}h) - KES ${voucher.priceKes}\n` +
      `🌐 *WiFi Network:* ${networkName}\n` +
      `⚡ *Instant Auto-Connect Link:*\nhttps://brisksmartconnect.vercel.app/portal?code=${voucher.code}\n\n` +
      `Connect to "${networkName}" and scan the QR code or click the link to browse immediately!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden space-y-5">
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-400/10">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  VOUCHER ACCESS CARD
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                  {voucher.status}
                </span>
              </div>
              <h2 className="text-lg font-black text-white">QR Code & Customer Pass</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Pills */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            QR Code Payload Mode:
          </label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setQrFormat('PORTAL_URL')}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                qrFormat === 'PORTAL_URL'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Portal 1-Click Link
            </button>
            <button
              type="button"
              onClick={() => setQrFormat('WIFI_LOGIN')}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                qrFormat === 'WIFI_LOGIN'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              WiFi Auto-Connect
            </button>
            <button
              type="button"
              onClick={() => setQrFormat('PIN_ONLY')}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                qrFormat === 'PIN_ONLY'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              PIN Code Text
            </button>
          </div>
        </div>

        {/* QR Code Canvas & Visual Card */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5">
          {/* Printable Thermal Card Frame */}
          <div className="p-3 bg-white rounded-2xl shadow-xl shrink-0 flex flex-col items-center">
            <canvas ref={canvasRef} className="rounded-lg" />
            <div className="text-[9px] font-mono text-slate-800 font-bold uppercase tracking-wider mt-1 text-center">
              SCAN TO CONNECT
            </div>
          </div>

          {/* Voucher Details */}
          <div className="space-y-3 flex-1 min-w-0 text-center sm:text-left">
            <div>
              <div className="text-xs text-slate-400 font-semibold">{businessName}</div>
              <div className="text-lg font-black text-white flex items-center justify-center sm:justify-start gap-1.5">
                <Ticket className="w-4 h-4 text-amber-400" />
                <span>{voucher.packageName} Voucher</span>
              </div>
              <div className="text-amber-400 font-mono font-black text-sm">
                KES {voucher.priceKes.toLocaleString()}
              </div>
            </div>

            {/* PIN Code Box */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-500">Voucher PIN:</div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-base font-black text-amber-400 tracking-wider">
                  {voucher.code}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1">
              <div>Network SSID: <strong className="text-white">{networkName}</strong></div>
              <div>Duration: <strong className="text-white">{voucher.durationHours} Hours</strong></div>
              <div>Device Limit: <strong className="text-white">1 Device</strong></div>
            </div>
          </div>
        </div>

        {/* Action Buttons: Download, Print Slip, WhatsApp Share */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={handleDownloadQr}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Download PNG</span>
          </button>

          <button
            type="button"
            onClick={handlePrintSlip}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Print Thermal Slip</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Share via WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
