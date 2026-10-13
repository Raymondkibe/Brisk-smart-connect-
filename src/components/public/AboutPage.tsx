import React from 'react';
import {
  Wifi,
  Target,
  Clock,
  Users,
  Award,
  Globe,
  ShieldCheck,
  Radio,
  ArrowRight,
} from 'lucide-react';

interface AboutPageProps {
  onGoHome: () => void;
  onGoContact: () => void;
  onExplorePackages: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onGoHome,
  onGoContact,
  onExplorePackages,
}) => {
  const teamMembers = [
    {
      name: 'Raymond Kamau',
      role: 'Co-Founder & Chief Executive Officer',
      bio: 'Telecom engineer and entrepreneur with 12+ years deploying enterprise MikroTik routing and community wireless ISPs across Central Kenya.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      badge: 'Executive',
    },
    {
      name: 'Sarah Njeri',
      role: 'Lead Network Infrastructure Architect',
      bio: 'MikroTik certified trainer (MTCNA, MTCRE) specialized in high-concurrency captive portals, PPPoE server clustering, and traffic shaping.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      badge: 'Engineering',
    },
    {
      name: 'Kevin Omondi',
      role: 'Head of Operations & Field Installations',
      bio: 'Directs structured cabling, solar backup integrations, and long-range wireless Point-to-Point (PtP) links across retail plazas and campuses.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      badge: 'Operations',
    },
    {
      name: 'Amina Hassan',
      role: 'Fintech & Customer Experience Lead',
      bio: 'Oversees Safaricom Daraja M-Pesa automated callback reconciliation, instant voucher disbursement systems, and 24/7 technical desk.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      badge: 'Product',
    },
  ];

  return (
    <div className="min-h-screen text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header Breadcrumb & Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold rounded-full">
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span>ABOUT BRISK SMART CONNECT</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Connecting Communities, Empowering Network Operators
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            Smart WiFi. Smart Host. Smarter You. We bridge high-speed fiber internet, hardware routers,
            and Safaricom M-Pesa to deliver affordable broadband across Kenya.
          </p>
        </div>

        {/* 1. Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 hover:border-sky-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Our Mission</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              To eradicate the digital divide by democratizing wireless hotspot management. We turn every
              neighborhood router, retail shop, and apartment complex into a high-performance, profitable
              public WiFi hotspot with instant 1-click M-Pesa connectivity and automated speed control.
            </p>
            <div className="pt-2 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>100% locally engineered for Kenyan community infrastructure</span>
            </div>
          </div>

          <div className="p-8 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 hover:border-amber-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Our Vision</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              A future where every home, market stall, and student hostel in Kenya has access to reliable,
              uncapped high-speed internet starting from as little as KES 20. Simultaneously, we enable
              independent router owners to build sustainable digital telecom businesses.
            </p>
            <div className="pt-2 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Over 1,200 active customers connected daily across our network</span>
            </div>
          </div>
        </div>

        {/* 2. Brief Company History */}
        <div className="p-8 sm:p-10 bg-slate-900 border border-slate-800 rounded-3xl space-y-8">
          <div className="space-y-2">
            <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">OUR JOURNEY</div>
            <h2 className="text-3xl font-extrabold text-white">A Brief History of BRISK Smart Connect</h2>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              BRISK Smart Connect was founded to solve a concrete real-world problem: small business owners
              and community cyber cafes wanted to sell WiFi access, but were held back by complex manual
              tickets, unreliable billing scripts, and lack of integration with M-Pesa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800/80">
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-amber-400">PHASE 1 · 2024</div>
              <h3 className="text-base font-bold text-white">The First Hotspot in Kiambu</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deployed the first MikroTik RB4011 gateway at Kiambu Central Market with an automated
                Safaricom STK push listener, replacing slow manual voucher sales with instant PIN payments.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-sky-400">PHASE 2 · 2025</div>
              <h3 className="text-base font-bold text-white">Router Owner Multi-Tenancy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Expanded into a complete multi-tenant operating system. Independent router owners in Ndumberi,
                Tinganga, and Roysambu joined, benefiting from 14-day free trials and custom M-Pesa Till routing.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-emerald-400">PHASE 3 · 2026 & BEYOND</div>
              <h3 className="text-base font-bold text-white">BRISK WiFi Host Program</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Launched the WiFi Host initiative, allowing building owners and fiber subscribers to earn 10%
                commissions on nearby sales, backed by certified professional wired and wireless field technicians.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Team Member Profiles */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">LEADERSHIP & TALENT</div>
            <h2 className="text-3xl font-extrabold text-white">Meet the BRISK Engineering Team</h2>
            <p className="text-sm text-slate-400">
              Experienced network engineers, telecom professionals, and software developers behind the platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, i) => (
              <div
                key={i}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div>
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-950 mb-4 border border-slate-800">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-slate-950/80 text-[10px] font-bold text-amber-400 rounded border border-slate-700">
                      {member.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{member.name}</h3>
                  <div className="text-xs text-sky-400 font-medium mt-0.5">{member.role}</div>
                  <p className="mt-3 text-xs text-slate-400 leading-relaxed">{member.bio}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>BRISK Smart Connect</span>
                  <span className="text-emerald-400 font-semibold">● Verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Bottom CTA */}
        <div className="p-8 bg-gradient-to-r from-sky-950/70 via-slate-900 to-amber-950/50 border border-slate-800 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-white">Have questions about our network or hardware?</h3>
            <p className="text-xs text-slate-300">
              Speak with our engineering support team or check our affordable daily and monthly packages.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onGoContact}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-md"
            >
              Contact Us
            </button>
            <button
              onClick={onExplorePackages}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              View Packages
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
