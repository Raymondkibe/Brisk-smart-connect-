import React, { useState } from 'react';
import { X, Share2, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { api } from '../../services/api.ts';

interface HostModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPhone?: string;
  defaultName?: string;
}

export const HostModal: React.FC<HostModalProps> = ({
  isOpen,
  onClose,
  defaultPhone = '',
  defaultName = '',
}) => {
  const [fullName, setFullName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [internetProvider, setInternetProvider] = useState('Safaricom Home Fibre');
  const [speedMbps, setSpeedMbps] = useState(100);
  const [routerModel, setRouterModel] = useState('Fiber ONT Gateway');
  const [availability, setAvailability] = useState('24/7');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.submitHostApplication({
        fullName,
        phone,
        email,
        location,
        internetProvider,
        speedMbps,
        routerModel,
        availability,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Become a BRISK WiFi Host</h3>
              <p className="text-xs text-slate-400">Monetize your commercial or residential fiber</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-emerald-300">
              💰 Earn <strong>10% Host Commission</strong> on all customer sales made through your location.
              We supply the enterprise outdoor access point!
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Patrick Njoroge"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Phone (M-Pesa)</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07XXXXXXXX"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Physical Location / Building Name</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kiambu Road Total Station Coffee House"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1">Current Internet Provider</label>
                <select
                  value={internetProvider}
                  onChange={(e) => setInternetProvider(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  <option>Safaricom Home Fibre</option>
                  <option>Zuku Fiber</option>
                  <option>Faiba (JTL)</option>
                  <option>Liquid Intelligent Technologies</option>
                  <option>Poa Internet</option>
                  <option>Other Fiber Provider</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Subscribed Speed (Mbps)</label>
                <input
                  type="number"
                  min="20"
                  max="1000"
                  value={speedMbps}
                  onChange={(e) => setSpeedMbps(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            {error && <div className="text-red-400 text-xs">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-md flex items-center justify-center gap-1.5"
            >
              {loading ? 'Submitting Application...' : 'SUBMIT HOST APPLICATION'}
            </button>
          </form>
        ) : (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Application Received!</h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Our site inspection team will contact you at <span className="font-mono text-emerald-300">{phone}</span>{' '}
              to schedule signal testing and AP delivery.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
