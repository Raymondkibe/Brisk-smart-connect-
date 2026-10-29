import React, { useState } from 'react';
import {
  Check,
  Zap,
  ShieldCheck,
  Radio,
  Server,
  Clock,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Users,
  Smartphone,
  ChevronRight,
  Globe,
  Lock,
} from 'lucide-react';
import type { SubscriptionPlan } from '../../types/index.ts';

interface PricingPageProps {
  subscriptionPlans: SubscriptionPlan[];
  onSelectPlan: (plan: SubscriptionPlan) => void;
  onGoToRegister: () => void;
  onGoToLogin: () => void;
  onReturnHome: () => void;
  onGoToPortal: () => void;
  currentPlanId?: string;
}

export const PricingPage: React.FC<PricingPageProps> = ({
  subscriptionPlans,
  onSelectPlan,
  onGoToRegister,
  onGoToLogin,
  onReturnHome,
  onGoToPortal,
  currentPlanId = 'plan-pro',
}) => {
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');

  // SaaS Plans detailed matrix
  const detailedPlans = [
    {
      id: 'plan-starter',
      name: 'Starter Host',
      tagline: 'Ideal for single router cafes, cybercafes, and small residential hotspots.',
      priceKes: 450,
      annualPriceKes: 4500,
      color: 'sky',
      badge: 'POPULAR FOR BEGINNERS',
      features: [
        { name: '1 - 2 Connected Routers (MikroTik / Ruijie)', included: true },
        { name: 'Up to 150 Simultaneous Active Users', included: true },
        { name: 'Automated M-Pesa STK Push Billing', included: true },
        { name: 'WiFi Voucher Scratchcard Generator', included: true },
        { name: 'QR Code Slip Printable Exporter', included: true },
        { name: 'Default Brandable Captive Portal', included: true },
        { name: 'WhatsApp & SMS Transaction Alerts', included: false },
        { name: 'PPPoE Home Fiber Subscriber Management', included: false },
        { name: 'Multi-Staff RBAC Accounts', included: false },
        { name: '24/7 Dedicated Network SLA', included: false },
      ],
      limits: {
        routers: '2 Routers',
        users: '150 Users',
        staff: '1 Operator',
        trialDays: 14,
      },
    },
    {
      id: 'plan-pro',
      name: 'BRISK Pro Host',
      tagline: 'Built for growing estate WISPs, apartments, shopping centers, and busy hotspots.',
      priceKes: 1200,
      annualPriceKes: 12000,
      color: 'amber',
      badge: 'RECOMMENDED BY WISPS',
      highlighted: true,
      features: [
        { name: 'Up to 10 Connected Routers & Access Points', included: true },
        { name: 'Up to 1,500 Simultaneous Active Users', included: true },
        { name: 'Automated M-Pesa STK Push (Daraja 2.0 API)', included: true },
        { name: 'Full Captive Portal Designer Studio', included: true },
        { name: 'Custom Logos, Aurora Gradients & Themes', included: true },
        { name: 'Batch QR Code Voucher & Receipt Printing', included: true },
        { name: 'Automated Expiry & Recurring M-Pesa Engine', included: true },
        { name: 'WhatsApp Cloud API Notifications', included: true },
        { name: 'PPPoE Client Subscriber Billing (50 lines)', included: true },
        { name: 'Up to 3 Staff Members with Permissions', included: true },
      ],
      limits: {
        routers: '10 Routers',
        users: '1,500 Users',
        staff: '3 Operators',
        trialDays: 14,
      },
    },
    {
      id: 'plan-enterprise',
      name: 'Enterprise ISP',
      tagline: 'For regional fiber providers, multi-town ISP operators, and large network fleets.',
      priceKes: 3500,
      annualPriceKes: 35000,
      color: 'pink',
      badge: 'FULL POWER ISP',
      features: [
        { name: 'Unlimited Routers, Switches & AP Fleets', included: true },
        { name: 'Unlimited Simultaneous Active Users', included: true },
        { name: 'Custom B2C M-Pesa Paybill & Till Integration', included: true },
        { name: 'White-Label Domain & Custom SSL Portals', included: true },
        { name: 'High-Volume PPPoE & RADIUS AAA Cloud Server', included: true },
        { name: 'Automated MikroTik Remote Script Provisioning', included: true },
        { name: 'Dedicated WhatsApp Business Cloud Adapter', included: true },
        { name: 'Unlimited Staff Accounts with Granular RBAC', included: true },
        { name: 'Real-time Network Telemetry & Syslog Audits', included: true },
        { name: 'Direct Priority SLA & Phone Engineer Support', included: true },
      ],
      limits: {
        routers: 'Unlimited',
        users: 'Unlimited',
        staff: 'Unlimited',
        trialDays: 14,
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-400 selection:text-slate-950">
      {/* Hero Header */}
      <section className="relative overflow-hidden pt-16 pb-20 border-b border-slate-900 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-slate-950/0 to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Breadcrumb / Back */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <button
              onClick={onReturnHome}
              className="text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <span>Home</span>
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-bold text-amber-400">Platform SaaS Pricing</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-amber-400 font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>TRANSPARENT HOST PLANS · NO HIDDEN COMMISSIONS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Predictable SaaS Pricing for{' '}
            <span className="bg-gradient-to-r from-pink-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
              Smart WiFi Operators
            </span>
          </h1>

          <p className="mt-4 text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Choose the plan that fits your router deployment. All plans include a <strong>14-day risk-free trial</strong>,
            automated M-Pesa Daraja STK prompt dispatch, and real-time captive portal customization.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center p-1 bg-slate-900 border border-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                billingCycle === 'MONTHLY'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('ANNUAL')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                billingCycle === 'ANNUAL'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] uppercase font-black">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {detailedPlans.map((plan) => {
            const isHighlighted = plan.highlighted;
            const price = billingCycle === 'ANNUAL' ? Math.round(plan.annualPriceKes / 12) : plan.priceKes;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                  isHighlighted
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 border-amber-400/80 shadow-2xl shadow-amber-500/10 scale-100 lg:-translate-y-2'
                    : 'bg-slate-900/70 border border-slate-800 hover:border-slate-700 shadow-xl'
                }`}
              >
                {/* Header Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-white">{plan.name}</h3>
                    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
                      {plan.id === 'plan-starter' && <Radio className="w-4 h-4" />}
                      {plan.id === 'plan-pro' && <Zap className="w-4 h-4" />}
                      {plan.id === 'plan-enterprise' && <Server className="w-4 h-4" />}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 min-h-[36px]">{plan.tagline}</p>

                  {/* Price */}
                  <div className="mt-6 pt-6 border-t border-slate-800/80">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-bold text-slate-400">KES</span>
                      <span className="text-4xl font-black text-white tracking-tight">
                        {price.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">/ month</span>
                    </div>
                    <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                      Includes 14 days free trial · Cancel anytime
                    </div>
                  </div>

                  {/* Operational Limits Matrix */}
                  <div className="mt-6 p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div>
                      <div className="text-slate-400 text-[10px]">Routers</div>
                      <div className="font-bold text-white mt-0.5">{plan.limits.routers}</div>
                    </div>
                    <div className="border-x border-slate-800">
                      <div className="text-slate-400 text-[10px]">Capacity</div>
                      <div className="font-bold text-white mt-0.5">{plan.limits.users}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">Staff</div>
                      <div className="font-bold text-white mt-0.5">{plan.limits.staff}</div>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="mt-8 space-y-3">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Included Capabilities:
                    </div>
                    <ul className="space-y-2.5">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs">
                          {feature.included ? (
                            <div className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-3 h-3" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-slate-800 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                              —
                            </div>
                          )}
                          <span className={feature.included ? 'text-slate-200' : 'text-slate-500 line-through'}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card CTA */}
                <div className="mt-8 pt-6 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      const found = subscriptionPlans.find((p) => p.id === plan.id) || {
                        id: plan.id,
                        name: plan.name,
                        priceKes: plan.priceKes,
                        routerLimit: plan.id === 'plan-starter' ? 2 : plan.id === 'plan-pro' ? 10 : 999,
                        userLimit: plan.id === 'plan-starter' ? 150 : plan.id === 'plan-pro' ? 1500 : 99999,
                        features: plan.features.map((f) => f.name),
                        billingPeriod: 'MONTHLY',
                      };
                      onSelectPlan(found as SubscriptionPlan);
                    }}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                      isHighlighted
                        ? 'bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 shadow-lg shadow-amber-400/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    <span>START 14-DAY FREE TRIAL</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-center text-[10px] text-slate-500 mt-2">
                    No credit card required upfront · Instant setup
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ & Policy Section */}
      <section className="py-16 bg-slate-900/40 border-t border-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl font-black text-white">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-400">Everything you need to know about BRISK SaaS subscriptions & billing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                How does the 14-day free trial work?
              </h4>
              <p className="text-slate-400 leading-relaxed">
                When you create a Router Owner account, your 14-day trial begins immediately with full access to the Pro features,
                including captive portal customization and M-Pesa STK tests. You are only prompted to pay when your trial ends.
              </p>
            </div>

            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Can I connect my own M-Pesa Till or PayBill?
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Yes. Under the Integrations tab, enter your Safaricom Daraja Consumer Key, Secret, Shortcode, and Passkey.
                Customer payments will route directly into your own Safaricom bank account.
              </p>
            </div>

            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                What routers are supported?
              </h4>
              <p className="text-slate-400 leading-relaxed">
                MikroTik RouterOS (v6 & v7, hEX, hAP, RB3011, RB4011, CCR series), Ruijie Reyee, Ubiquiti UniFi, TP-Link Omada,
                and OpenWrt. Remote script generators are ready to paste directly into your router terminal.
              </p>
            </div>

            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                What happens if my subscription expires?
              </h4>
              <p className="text-slate-400 leading-relaxed">
                A 3-day grace period is provided with automated reminders. Customer WiFi sessions are not abruptly cut off;
                you will receive M-Pesa STK push prompts to renew seamlessly right from your owner dashboard.
              </p>
            </div>
          </div>

          {/* Bottom Banner */}
          <div className="mt-12 p-6 bg-gradient-to-r from-amber-950/60 via-slate-900 to-sky-950/60 border border-amber-400/30 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h3 className="text-lg font-black text-white">Ready to deploy your WiFi hotspot?</h3>
              <p className="text-xs text-slate-300 mt-1">Get started with a 14-day free trial or test the customer captive portal.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onGoToRegister}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs shadow-md transition-colors"
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={onGoToPortal}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors"
              >
                Preview Captive Portal
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
