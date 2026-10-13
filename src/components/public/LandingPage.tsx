import React, { useState } from 'react';
import {
  Wifi,
  Radio,
  Zap,
  ShieldCheck,
  Smartphone,
  Ticket,
  Users,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Server,
  DollarSign,
  Clock,
  HelpCircle,
  Layers,
  ChevronRight,
  Headphones,
} from 'lucide-react';
import type { WifiPackage, SubscriptionPlan } from '../../types/index.ts';

interface LandingPageProps {
  packages: WifiPackage[];
  subscriptionPlans: SubscriptionPlan[];
  onSelectPackage: (pkg: WifiPackage) => void;
  onSelectPlan: (plan: SubscriptionPlan) => void;
  onOpenAuth: (mode: 'LOGIN' | 'REGISTER') => void;
  onOpenHostModal: () => void;
  onOpenVoucher: () => void;
  onGoToPortal: (view: 'CUSTOMER' | 'OWNER' | 'ADMIN' | 'EXPIRED') => void;
  onGoToAbout: () => void;
  onGoToContact: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  packages,
  subscriptionPlans,
  onSelectPackage,
  onSelectPlan,
  onOpenAuth,
  onOpenHostModal,
  onOpenVoucher,
  onGoToPortal,
  onGoToAbout,
  onGoToContact,
}) => {
  const [packageCategory, setPackageCategory] = useState<'ALL' | 'HOURLY' | 'DAILY' | 'MULTI_DAY' | 'MONTHLY'>('ALL');

  const filteredPackages = packages.filter((pkg) => {
    if (packageCategory === 'ALL') return true;
    return pkg.category === packageCategory;
  });

  return (
    <div className="min-h-screen text-slate-100 selection:bg-amber-400 selection:text-slate-950">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 border-b border-slate-900 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-slate-950/0 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Brand Kicker / Slogan Banner */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-amber-400 font-semibold mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Smart WiFi. Smart Host. Smarter You.</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
              Real-World WiFi & Hotspot Management{' '}
              <span className="bg-gradient-to-r from-sky-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                Simplified
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Manage WiFi networks, routers, customers, packages, payments, and hotspots from one
              powerful platform. Built for Kenya with automated Safaricom M-Pesa STK push.
            </p>

            {/* Hero CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onOpenAuth('REGISTER')}
                className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm shadow-xl shadow-amber-400/20 transition-all flex items-center gap-2 hover:-translate-y-0.5"
              >
                <span>GET STARTED FREE</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenAuth('LOGIN')}
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold rounded-xl text-sm transition-colors"
              >
                LOGIN TO DASHBOARD
              </button>

              <button
                onClick={onOpenVoucher}
                className="px-5 py-3.5 bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 border border-sky-800/60 font-semibold rounded-xl text-sm transition-colors flex items-center gap-2"
              >
                <Ticket className="w-4 h-4 text-amber-400" />
                <span>REDEEM VOUCHER</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-slate-800/80 text-left">
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/60">
                <div className="text-2xl font-black text-white">14 Days</div>
                <div className="text-xs text-slate-400 mt-0.5">Free Trial for Router Owners</div>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/60">
                <div className="text-2xl font-black text-amber-400">3 Days</div>
                <div className="text-xs text-slate-400 mt-0.5">Free Package for New Customers</div>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/60">
                <div className="text-2xl font-black text-sky-400">Instant</div>
                <div className="text-xs text-slate-400 mt-0.5">M-Pesa STK Push Activation</div>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/60">
                <div className="text-2xl font-black text-emerald-400">10% + 10%</div>
                <div className="text-xs text-slate-400 mt-0.5">Referral & Host Commissions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Showcase Section (with text and image) */}
      <section className="py-16 bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Text content area */}
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-950/60 border border-sky-800/50 rounded-full text-xs text-sky-300 font-semibold">
                <Wifi className="w-3.5 h-3.5 text-sky-400" />
                <span>Next-Gen Hotspot & Community Wireless</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Empowering Communities with Seamless, High-Speed Connectivity
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                BRISK Smart Connect delivers high-performance hotspot infrastructure engineered specifically
                for the Kenyan market. From busy open-air retail markets in Kiambu to student apartment complexes
                and suburban cafés, our platform automates user authentication, bandwidth queue shaping, and
                instant M-Pesa payments without requiring dedicated on-premise billing servers.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="font-bold text-white block">Automated M-Pesa Reconciliation</span>
                  <span className="text-slate-400 text-[11px] mt-0.5 block">
                    Zero manual vouchers required; Safaricom STK callbacks activate devices in under 3 seconds.
                  </span>
                </div>
                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="font-bold text-white block">Multi-Router Central Cloud</span>
                  <span className="text-slate-400 text-[11px] mt-0.5 block">
                    Manage MikroTik RouterOS 7.x, Ubiquiti UniFi, and TP-Link Omada from one single dashboard.
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={onGoToAbout}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Learn About Our Mission</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onGoToContact}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs transition-colors"
                >
                  Contact Our Team
                </button>
              </div>
            </div>

            {/* Responsive image placeholder & showcase area */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl group">
                <img
                  src="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80"
                  alt="High-Speed WiFi Hotspot and Network Hardware"
                  className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 p-4 bg-slate-950/90 backdrop-blur-md rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center">
                      <Wifi className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">BRISK Kiambu Central Hotspot</div>
                      <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>● 87 Active Users Online · 100 Mbps Backbone</span>
                      </div>
                    </div>
                  </div>

                  <span className="hidden sm:inline-block px-2.5 py-1 bg-sky-950 text-sky-300 border border-sky-800 text-[10px] font-mono rounded-lg">
                    MikroTik RB4011
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Customer WiFi Packages Section */}
      <section id="packages" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">
            Official BRISK Hotspot Rates
          </div>
          <h2 className="text-3xl font-extrabold text-white">Choose Your WiFi Package</h2>
          <p className="mt-2 text-sm text-slate-400">
            Uncapped high-speed broadband. Connect your phone, laptop, smart TV, or home router.
          </p>

          {/* Category Filter Tabs */}
          <div className="mt-6 inline-flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
            {(
              [
                { id: 'ALL', label: 'All Packages' },
                { id: 'HOURLY', label: 'Hourly' },
                { id: 'DAILY', label: 'Daily' },
                { id: 'MULTI_DAY', label: 'Multi-Day' },
                { id: 'MONTHLY', label: '30-Day Monthly' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPackageCategory(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  packageCategory === tab.id
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-slate-900/90 border rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-amber-400/50 hover:shadow-xl hover:shadow-amber-400/5 ${
                pkg.isPopular ? 'border-amber-400/80 ring-1 ring-amber-400/30' : 'border-slate-800'
              }`}
            >
              {pkg.isPopular && (
                <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider rounded-md shadow-sm">
                  POPULAR
                </div>
              )}

              <div>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-base font-bold text-white">{pkg.name}</h3>
                  <div className="text-xs text-sky-400 font-semibold">{pkg.speedLabel}</div>
                </div>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-xs font-bold text-slate-400">KES</span>
                  <span className="text-2xl font-black text-amber-400">
                    {pkg.priceKes.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500">/ {pkg.durationLabel}</span>
                </div>

                <p className="mt-3 text-xs text-slate-400 leading-relaxed min-h-[32px]">
                  {pkg.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Up to {pkg.deviceLimit} simultaneous devices</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Instant M-Pesa automatic reconnection</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Low latency gaming & video streaming</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3">
                <button
                  onClick={() => onSelectPackage(pkg)}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-md shadow-sky-600/20 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>BUY WITH M-PESA</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Router Owner 14-Day Free Trial & Subscription Plans */}
      <section id="router-owners" className="py-20 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Trial Announcement Card */}
          <div className="mb-14 p-6 sm:p-8 bg-gradient-to-r from-sky-950 via-slate-900 to-amber-950/40 border border-amber-400/40 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold rounded-full">
                <Radio className="w-3.5 h-3.5" />
                <span>ROUTER OWNER 14-DAY FREE TRIAL</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Launch Your WiFi Hotspot Business Today
              </h3>
              <p className="text-sm text-slate-300 max-w-xl">
                Every new Router Owner gets 14 full days free. Connect your MikroTik, UniFi, or Omada
                devices, generate vouchers, and collect payments directly to your M-Pesa.
              </p>
            </div>
            <button
              onClick={() => onOpenAuth('REGISTER')}
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm shadow-xl shadow-amber-400/20 whitespace-nowrap transition-all"
            >
              START 14-DAY TRIAL
            </button>
          </div>

          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
              Router Owner Subscriptions
            </div>
            <h2 className="text-3xl font-extrabold text-white">Transparent 30-Day Platform Plans</h2>
            <p className="mt-2 text-sm text-slate-400">
              Pick the tier that fits your hotspot network footprint. Upgrade or scale anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <h3 className="text-base font-bold text-white">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xs font-semibold text-slate-400">KES</span>
                    <span className="text-2xl font-black text-amber-400">
                      {plan.priceKes.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500">/ 30d</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 font-medium text-white">
                      <Radio className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{plan.maxRouters} Router{plan.maxRouters > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-white">
                      <Wifi className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{plan.maxAccessPoints} Access Points</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-white">
                      <Users className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>Up to {plan.maxCustomers.toLocaleString()} Customers</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800/60 space-y-1 text-slate-400">
                      {plan.features.slice(3).map((f, i) => (
                        <div key={i} className="flex items-center gap-1 text-[11px]">
                          <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3">
                  <button
                    onClick={() => onSelectPlan(plan)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors"
                  >
                    SELECT PLAN
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">
            Architecture & Workflow
          </div>
          <h2 className="text-3xl font-extrabold text-white">How BRISK Smart Connect Works</h2>
          <p className="mt-2 text-sm text-slate-400">
            A real-world automated bridge between Safaricom M-Pesa, MikroTik RouterOS, and customers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl relative">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm mb-4">
              01
            </div>
            <h4 className="text-base font-bold text-white">Connect Routers</h4>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Paste the generated BRISK setup script into your MikroTik terminal or link via WireGuard & API.
            </p>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl relative">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm mb-4">
              02
            </div>
            <h4 className="text-base font-bold text-white">Configure Captive Portal</h4>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Users who join your SSID are automatically greeted by your branded BRISK Hotspot portal.
            </p>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4">
              03
            </div>
            <h4 className="text-base font-bold text-white">Instant M-Pesa STK</h4>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Customers choose 1 hour, 1 day, or 30 days and enter their PIN directly on their phone.
            </p>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl relative">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm mb-4">
              04
            </div>
            <h4 className="text-base font-bold text-white">Automated Expiry & Redirection</h4>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              When duration finishes, bandwidth is gracefully closed and the user redirected to renew.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Become a WiFi Host Spotlight */}
      <section className="py-16 bg-slate-900/70 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 bg-slate-950 border border-slate-800 rounded-3xl relative overflow-hidden">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>BRISK WIFI HOST PROGRAM</span>
              </div>
              <h3 className="text-3xl font-extrabold text-white">
                Have Fast Internet at Your Building or Shop?
              </h3>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                Apply to become an authorized BRISK WiFi Host. We inspect your network, supply high-power
                access points, and you earn an eligible <span className="text-amber-400 font-bold">10% Host Commission</span>{' '}
                on all voucher and M-Pesa sales from your location.
              </p>

              <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Zero upfront equipment deposit required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Separate host accounting from referral earnings</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Weekly M-Pesa automatic disbursements</span>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={onOpenHostModal}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-colors"
                >
                  APPLY TO BECOME A WIFI HOST
                </button>
                <button
                  onClick={() => onGoToPortal('CUSTOMER')}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-colors"
                >
                  VIEW CUSTOMER DEMO
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Hardware Compatibility & Installations */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
              Supported Hardware
            </div>
            <h2 className="text-3xl font-extrabold text-white">Engineered for Telecom Standards</h2>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              BRISK Smart Connect connects with leading enterprise and community networking hardware.
              Run high-concurrency captive hotspots with zero local server maintenance.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="font-bold text-white">MikroTik RouterOS</div>
                <div className="text-slate-400 text-[11px] mt-0.5">v7.x Hotspot & PPPoE Server</div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="font-bold text-white">Ubiquiti UniFi</div>
                <div className="text-slate-400 text-[11px] mt-0.5">U6-Pro, AC-Lite, Mesh APs</div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="font-bold text-white">TP-Link Omada</div>
                <div className="text-slate-400 text-[11px] mt-0.5">EAP650, EAP610 Cloud SDN</div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="font-bold text-white">OpenWrt & Linux</div>
                <div className="text-slate-400 text-[11px] mt-0.5">WireGuard & iptables tunnels</div>
              </div>
            </div>
          </div>

          {/* Installation pricing */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Professional Technician Installation</h3>
            <p className="text-xs text-slate-400">
              Need on-site cabling, pole mounting, or point-to-point wireless alignment in Kiambu or Nairobi?
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold text-white">Wired Hotspot Setup</div>
                  <div className="text-[11px] text-slate-400">Outdoor Cat6 STP, crimping & router config</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-extrabold text-amber-400">KES 2,999</div>
                  <div className="text-[10px] text-slate-500">Fixed rate</div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold text-white">Wireless Point-to-Point (PtP)</div>
                  <div className="text-[11px] text-slate-400">Long-range dish alignment & mast mounting</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-extrabold text-amber-400">KES 8,499</div>
                  <div className="text-[10px] text-slate-500">Fixed rate</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onGoToPortal('CUSTOMER')}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
            >
              Request Technician Visit
            </button>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white">
                <Wifi className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white">BRISK Smart Connect</span>
                <p className="text-[11px] text-slate-400">Smart WiFi. Smart Host. Smarter You.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-slate-400">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-amber-400">
                Home
              </button>
              <button onClick={onGoToAbout} className="hover:text-amber-400">
                About Us
              </button>
              <button onClick={onGoToContact} className="hover:text-amber-400">
                Contact
              </button>
              <button onClick={() => onGoToPortal('CUSTOMER')} className="hover:text-amber-400">
                Customer Portal
              </button>
              <button onClick={() => onGoToPortal('OWNER')} className="hover:text-amber-400">
                Router Owner
              </button>
              <button onClick={() => onGoToPortal('ADMIN')} className="hover:text-amber-400">
                Super Admin
              </button>
              <button onClick={() => onGoToPortal('EXPIRED')} className="hover:text-amber-400">
                Hotspot Expiry Portal
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
            <p>© 2026 BRISK Smart Connect. All rights reserved. Operating across Nairobi, Kiambu & Central Kenya.</p>
            <p>Safaricom Daraja M-Pesa Integrated · MikroTik RouterOS 7.x Compatible</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
