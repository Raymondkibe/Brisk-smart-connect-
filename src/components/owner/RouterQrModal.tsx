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
  Radio,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Check,
  Info,
} from 'lucide-react';
import type { RouterDevice } from '../../types/index.ts';

interface RouterQrModalProps {
  router: RouterDevice | null;
  onClose: () => void;
  businessName?: string;
  supportPhone?: string;
  businessLocation?: string;
}

export const RouterQrModal: React.FC<RouterQrModalProps> = ({
  router,
  onClose,
  businessName = 'BRISK Smart WiFi',
  supportPhone = '0722 000 111 / 0799 123 456',
  businessLocation = 'Central Area',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [qrMode, setQrMode] = useState<'WIFI_CONNECT' | 'PORTAL_URL' | 'PRINT_STAND'>('WIFI_CONNECT');
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [wifiPassword, setWifiPassword] = useState('');
  const [isOpenHotspot, setIsOpenHotspot] = useState(true);

  if (!router) return null;

  const ssid = router.networkName || router.name || 'BRISK_Smart_WiFi';
  const portalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/portal?routerId=${encodeURIComponent(router.id)}&ssid=${encodeURIComponent(ssid)}&location=${encodeURIComponent(router.location || businessLocation)}`
    : `https://brisksmartconnect.vercel.app/portal?routerId=${router.id}`;

  // Generate standard Android/iOS WiFi QR string
  const wifiQrString = isOpenHotspot
    ? `WIFI:T:nopass;S:${ssid};;`
    : `WIFI:T:WPA;S:${ssid};P:${wifiPassword};;`;

  const currentPayload = qrMode === 'WIFI_CONNECT' || qrMode === 'PRINT_STAND'
    ? wifiQrString
    : portalUrl;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        currentPayload,
        {
          width: 320,
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
  }, [currentPayload]);

  const handleDownloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `WiFi-QR-${ssid.replace(/[^a-zA-Z0-9-_]/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>WiFi Access Pass - ${ssid}</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; color: #0f172a; margin: 0; padding: 20px; }
            .card { border: 2px dashed #0284c7; border-radius: 24px; padding: 36px 24px; max-width: 440px; margin: 0 auto; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
            .badge { display: inline-block; background: #0284c7; color: white; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: bold; letter-spacing: 1px; }
            .biz { font-size: 24px; font-weight: 900; margin-top: 14px; color: #020617; }
            .ssid { font-size: 18px; font-weight: bold; color: #0284c7; margin-top: 6px; }
            .loc { font-size: 13px; color: #64748b; margin-top: 2px; }
            .qr-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; margin: 20px auto; width: 260px; }
            .qr-img { width: 240px; height: 240px; display: block; margin: 0 auto; }
            .scan-tip { font-size: 14px; font-weight: bold; color: #0f172a; margin-top: 10px; }
            .steps { text-align: left; background: #f1f5f9; border-radius: 12px; padding: 14px 18px; font-size: 12px; line-height: 1.6; margin-top: 16px; }
            .steps ol { margin: 0; padding-left: 20px; }
            .mpesa-tag { font-size: 12px; font-weight: bold; color: #059669; margin-top: 16px; }
            .footer { font-size: 11px; color: #94a3b8; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 12px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">FREE GUEST WIFI HOTSPOT</div>
            <div class="biz">${businessName}</div>
            <div class="ssid">Network SSID: <strong>${ssid}</strong></div>
            <div class="loc">Location: ${router.location || businessLocation}</div>

            <div class="qr-box">
              <img src="${dataUrl}" class="qr-img" alt="WiFi QR Code" />
              <div class="scan-tip">POINT PHONE CAMERA TO CONNECT</div>
            </div>

            <div class="steps">
              <ol>
                <li>Open your smartphone camera or QR scanner.</li>
                <li>Tap <strong>"Join '${ssid}'"</strong> when prompted.</li>
                <li>Choose a high-speed pass & pay via <strong>M-Pesa STK Push</strong>.</li>
                <li>Browse immediately at full speed!</li>
              </ol>
            </div>

            <div class="mpesa-tag">Lipa na M-Pesa Automated Online Activation</div>
            <div class="footer">Customer Support: ${supportPhone} · Powered by BRISK Smart Connect</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 1000);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleCopyWifiString = () => {
    navigator.clipboard.writeText(wifiQrString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsapp = () => {
    const text = `Connect to ${businessName} Guest WiFi!\n\nNetwork: ${ssid}\nLocation: ${router.location || businessLocation}\n\nScan QR or open portal: ${portalUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">Dynamic Router WiFi QR Code</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  AUTO-CONNECT
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {router.name} ({router.model}) · {router.location}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="p-1 bg-slate-950 border border-slate-800 rounded-2xl grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => setQrMode('WIFI_CONNECT')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              qrMode === 'WIFI_CONNECT'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>WiFi Direct Join</span>
          </button>

          <button
            type="button"
            onClick={() => setQrMode('PORTAL_URL')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              qrMode === 'PORTAL_URL'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Captive Portal Link</span>
          </button>

          <button
            type="button"
            onClick={() => setQrMode('PRINT_STAND')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              qrMode === 'PRINT_STAND'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Stand / Poster</span>
          </button>
        </div>

        {/* Hotspot Security Options */}
        {qrMode !== 'PORTAL_URL' && (
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <label className="text-slate-300 font-semibold flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOpenHotspot}
                  onChange={(e) => setIsOpenHotspot(e.target.checked)}
                  className="rounded border-slate-700 text-amber-400 focus:ring-0"
                />
                <span>Open Captive Hotspot (No WPA WiFi password needed)</span>
              </label>
            </div>

            {!isOpenHotspot && (
              <div className="flex items-center gap-2">
                <span className="text-slate-400">WPA Passphrase:</span>
                <input
                  type="text"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  placeholder="e.g. WiFiPass123"
                  className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs w-36"
                />
              </div>
            )}
          </div>
        )}

        {/* QR Code Canvas and Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          {/* QR Canvas Display */}
          <div className="bg-white p-5 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center mx-auto">
            <canvas ref={canvasRef} className="max-w-[240px] max-h-[240px] w-full h-auto" />
            <div className="mt-3 text-slate-950 font-black text-sm">
              {ssid}
            </div>
            <div className="text-[11px] text-slate-600 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Point phone camera to connect</span>
            </div>
          </div>

          {/* Router Information & How It Works */}
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Router Broadcast Details
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Broadcast SSID:</span>
                <strong className="text-amber-400 font-mono">{ssid}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gateway IP:</span>
                <span className="text-sky-400 font-mono">{router.ipAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hardware:</span>
                <span className="text-white">{router.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="text-slate-300">{router.location || businessLocation}</span>
              </div>
            </div>

            <div className="p-3.5 bg-sky-950/40 border border-sky-800/40 rounded-2xl space-y-1.5 text-sky-200">
              <div className="font-bold flex items-center gap-1.5 text-sky-300">
                <Info className="w-3.5 h-3.5 text-sky-400" />
                <span>How Guests Connect Instantly</span>
              </div>
              <p className="text-[11px] text-sky-300/80 leading-relaxed">
                When visitors scan this QR code using iOS Camera or Android Quick Settings, their device automatically associates with
                <strong> "{ssid}"</strong> and triggers the captive portal checkout page.
              </p>
            </div>

            {/* Quick Link box */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
              <div className="truncate text-slate-400 text-[11px] font-mono">
                {portalUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyWifiString}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied WiFi String' : 'Copy WiFi String'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsapp}
              className="px-3.5 py-2.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Share via WhatsApp</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download QR PNG</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-amber-400/20 flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Table Tent / Poster</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
