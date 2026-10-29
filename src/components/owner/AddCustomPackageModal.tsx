import React, { useState } from 'react';
import {
  X,
  Plus,
  Package,
  Zap,
  Clock,
  DollarSign,
  Gauge,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import type { WifiPackage } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface AddCustomPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerId: string;
  onPackageCreated: (newPackage: WifiPackage) => void;
  initialPackage?: WifiPackage | null;
  onPackageUpdated?: (updatedPackage: WifiPackage) => void;
}

export const AddCustomPackageModal: React.FC<AddCustomPackageModalProps> = ({
  isOpen,
  onClose,
  ownerId,
  onPackageCreated,
  initialPackage,
  onPackageUpdated,
}) => {
  const isEditing = Boolean(initialPackage);

  const [name, setName] = useState(initialPackage?.name || '');
  const [priceKes, setPriceKes] = useState<number>(initialPackage?.priceKes || 50);
  const [durationValue, setDurationValue] = useState<number>(() => {
    if (!initialPackage) return 12;
    if (initialPackage.durationHours % (24 * 30) === 0 && initialPackage.durationHours >= 24 * 30) {
      return initialPackage.durationHours / (24 * 30);
    }
    if (initialPackage.durationHours % 24 === 0 && initialPackage.durationHours >= 24) {
      return initialPackage.durationHours / 24;
    }
    return initialPackage.durationHours;
  });
  const [durationUnit, setDurationUnit] = useState<'HOURS' | 'DAYS' | 'MONTHS'>(() => {
    if (!initialPackage) return 'HOURS';
    if (initialPackage.durationHours % (24 * 30) === 0 && initialPackage.durationHours >= 24 * 30) return 'MONTHS';
    if (initialPackage.durationHours % 24 === 0 && initialPackage.durationHours >= 24) return 'DAYS';
    return 'HOURS';
  });
  const [downloadSpeedMbps, setDownloadSpeedMbps] = useState<number>(initialPackage?.downloadSpeedMbps || 15);
  const [uploadSpeedMbps, setUploadSpeedMbps] = useState<number>(initialPackage?.uploadSpeedMbps || 10);
  const [deviceLimit, setDeviceLimit] = useState<number>(initialPackage?.deviceLimit || 1);
  const [dataQuotaType, setDataQuotaType] = useState<'UNLIMITED' | 'CAPPED'>(initialPackage?.fairUsageGb ? 'CAPPED' : 'UNLIMITED');
  const [quotaGb, setQuotaGb] = useState<number>(initialPackage?.fairUsageGb || 10);
  const [description, setDescription] = useState(initialPackage?.description || 'High-speed reliable internet pass for streaming and browsing.');
  const [category, setCategory] = useState<'HOURLY' | 'DAILY' | 'MULTI_DAY' | 'MONTHLY'>(initialPackage?.category || 'HOURLY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a package name.');
      return;
    }
    if (priceKes <= 0) {
      setError('Please provide a valid price in KES.');
      return;
    }

    setLoading(true);
    setError('');

    // Calculate total hours
    const totalHours =
      durationUnit === 'HOURS'
        ? durationValue
        : durationUnit === 'DAYS'
        ? durationValue * 24
        : durationValue * 24 * 30;

    const durationLabel =
      durationUnit === 'HOURS'
        ? `${durationValue} hour${durationValue > 1 ? 's' : ''}`
        : durationUnit === 'DAYS'
        ? `${durationValue} day${durationValue > 1 ? 's' : ''}`
        : `${durationValue} month${durationValue > 1 ? 's' : ''}`;

    const pkgPayload: Partial<WifiPackage> = {
      name: name.trim(),
      priceKes: Number(priceKes),
      durationHours: totalHours,
      durationLabel,
      speedLabel: `${downloadSpeedMbps} Mbps`,
      downloadSpeedMbps: Number(downloadSpeedMbps),
      uploadSpeedMbps: Number(uploadSpeedMbps),
      category,
      deviceLimit: Number(deviceLimit),
      fairUsageGb: dataQuotaType === 'CAPPED' ? Number(quotaGb) : undefined,
      description: description.trim(),
      isCustom: true,
      tenantId: ownerId,
    };

    try {
      if (isEditing && initialPackage?.id) {
        const res = await api.updateCustomPackage(initialPackage.id, pkgPayload);
        if (res && res.package) {
          if (onPackageUpdated) onPackageUpdated(res.package);
          else onPackageCreated(res.package);
          onClose();
        }
      } else {
        const res = await api.addCustomPackage(pkgPayload);
        if (res && res.package) {
          onPackageCreated(res.package);
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save WiFi package.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">{isEditing ? 'Edit WiFi Package' : 'Create Custom WiFi Package'}</h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-400 text-[10px] font-bold">
                  {isEditing ? 'UPDATE PLAN' : 'HOTSPOT RATE'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEditing ? 'Modify your package pricing, speeds, durations, and device limits.' : 'Add your own bespoke plan to sell to guests on your hotspot captive portal.'}
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

        {error && (
          <div className="p-3 bg-red-950/70 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Package Name & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Package Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 12 Hours Unlimited / Sunday Pass"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Price (KES) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">KES</span>
                <input
                  type="number"
                  min="1"
                  required
                  value={priceKes}
                  onChange={(e) => setPriceKes(Number(e.target.value))}
                  placeholder="50"
                  className="w-full pl-12 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Duration & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-slate-300 font-semibold mb-1">Validity Duration *</label>
              <input
                type="number"
                min="1"
                required
                value={durationValue}
                onChange={(e) => setDurationValue(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-slate-300 font-semibold mb-1">Duration Unit</label>
              <select
                value={durationUnit}
                onChange={(e) => {
                  const unit = e.target.value as any;
                  setDurationUnit(unit);
                  if (unit === 'HOURS') setCategory('HOURLY');
                  else if (unit === 'DAYS') setCategory(durationValue > 1 ? 'MULTI_DAY' : 'DAILY');
                  else setCategory('MONTHLY');
                }}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
              >
                <option value="HOURS">Hours</option>
                <option value="DAYS">Days</option>
                <option value="MONTHS">Months (30d)</option>
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-slate-300 font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
              >
                <option value="HOURLY">Hourly</option>
                <option value="DAILY">Daily</option>
                <option value="MULTI_DAY">Multi-Day</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
          </div>

          {/* Bandwidth Limits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Download Speed (Mbps)</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={downloadSpeedMbps}
                  onChange={(e) => setDownloadSpeedMbps(Number(e.target.value))}
                  className="w-full pr-12 pl-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Mbps</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Upload Speed (Mbps)</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={uploadSpeedMbps}
                  onChange={(e) => setUploadSpeedMbps(Number(e.target.value))}
                  className="w-full pr-12 pl-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Mbps</span>
              </div>
            </div>
          </div>

          {/* Concurrent Devices & Quota */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Max Devices / User</label>
              <select
                value={deviceLimit}
                onChange={(e) => setDeviceLimit(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
              >
                <option value={1}>1 Device</option>
                <option value={2}>2 Devices</option>
                <option value={3}>3 Devices</option>
                <option value={5}>5 Devices</option>
                <option value={10}>10 Devices (Office/Family)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Data Cap Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDataQuotaType('UNLIMITED')}
                  className={`py-2 px-2.5 rounded-xl border text-center font-bold transition-all ${
                    dataQuotaType === 'UNLIMITED'
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Unlimited
                </button>
                <button
                  type="button"
                  onClick={() => setDataQuotaType('CAPPED')}
                  className={`py-2 px-2.5 rounded-xl border text-center font-bold transition-all ${
                    dataQuotaType === 'CAPPED'
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Data Capped
                </button>
              </div>
            </div>
          </div>

          {dataQuotaType === 'CAPPED' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Fair Usage Allowance (GB)</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={quotaGb}
                  onChange={(e) => setQuotaGb(Number(e.target.value))}
                  className="w-full pr-12 pl-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">GB</span>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Customer Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Display text for customer portal card..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Live Preview of Package Card */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Captive Portal Card Preview:
            </div>
            <div className="p-4 bg-slate-900 border border-amber-400/40 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                  <span>{name || 'Custom Package'}</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                    Custom Host Plan
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {downloadSpeedMbps} Mbps · {durationValue} {durationUnit.toLowerCase()} · {dataQuotaType === 'UNLIMITED' ? 'Unlimited Data' : `${quotaGb} GB Cap`}
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-black text-amber-400 font-mono">
                  KES {priceKes}
                </div>
                <button type="button" className="mt-1 px-3 py-1 bg-amber-400 text-slate-950 text-[10px] font-bold rounded-lg pointer-events-none">
                  BUY NOW
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-400/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create & Publish Package'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
