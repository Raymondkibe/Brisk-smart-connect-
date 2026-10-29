import React from 'react';
import {
  Wifi,
  Radio,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Sparkles,
  Menu,
  X,
  LayoutDashboard,
} from 'lucide-react';
import type { User, CustomerProfile, RouterOwnerProfile } from '../../types/index.ts';

interface NavbarProps {
  currentView: 'LANDING' | 'PRICING' | 'ABOUT' | 'CONTACT' | 'CUSTOMER' | 'OWNER' | 'ADMIN' | 'EXPIRED' | 'HOTSPOT_PORTAL' | 'PPPOE_PORTAL' | 'LOGIN' | 'REGISTER';
  onViewChange: (view: 'LANDING' | 'PRICING' | 'ABOUT' | 'CONTACT' | 'CUSTOMER' | 'OWNER' | 'ADMIN' | 'EXPIRED' | 'HOTSPOT_PORTAL' | 'PPPOE_PORTAL' | 'LOGIN' | 'REGISTER') => void;
  currentUser: User | null;
  customerProfile?: CustomerProfile;
  ownerProfile?: RouterOwnerProfile;
  onOpenAuth: (mode: 'LOGIN' | 'REGISTER') => void;
  onLogout: () => void;
  onOpenVoucher: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  currentUser,
  customerProfile,
  ownerProfile,
  onOpenAuth,
  onLogout,
  onOpenVoucher,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Navigate to appropriate role dashboard
  const handleGoToUserDashboard = () => {
    if (!currentUser) {
      onViewChange('LOGIN');
      return;
    }
    if (currentUser.role === 'SUPER_ADMIN') {
      onViewChange('ADMIN');
    } else if (currentUser.role === 'ROUTER_OWNER') {
      onViewChange('OWNER');
    } else {
      onViewChange('CUSTOMER');
    }
  };

  const getDashboardLabel = () => {
    if (!currentUser) return 'Dashboard';
    if (currentUser.role === 'SUPER_ADMIN') return 'Admin Console';
    if (currentUser.role === 'ROUTER_OWNER') return 'Router Manager';
    return 'Customer Portal';
  };

  const isCurrentDashboardView =
    (currentUser?.role === 'SUPER_ADMIN' && currentView === 'ADMIN') ||
    (currentUser?.role === 'ROUTER_OWNER' && currentView === 'OWNER') ||
    (currentUser?.role === 'CUSTOMER' && currentView === 'CUSTOMER');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Slogan */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewChange('LANDING')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-orange-500 to-amber-500 p-0.5 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Wifi className="w-5 h-5 text-orange-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">BRISK</span>
                <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400">
                  Smart Connect
                </span>
                <span className="hidden xl:flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Cloud Live</span>
                </span>
              </div>
              <div className="text-[10px] tracking-wide text-slate-400 font-medium hidden sm:block">
                Smart WiFi. Smart Host. Smarter You.
              </div>
            </div>
          </div>

          {/* Clean Public Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800/80 rounded-xl">
            <button
              onClick={() => onViewChange('LANDING')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                currentView === 'LANDING'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onViewChange('PRICING')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                currentView === 'PRICING'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pricing
            </button>
            <button
              onClick={() => onViewChange('ABOUT')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                currentView === 'ABOUT'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              About Us
            </button>
            <button
              onClick={() => onViewChange('CONTACT')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                currentView === 'CONTACT'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Contact
            </button>

            {/* Authenticated user dashboard shortcut */}
            {currentUser && (
              <>
                <span className="h-4 w-[1px] bg-slate-800 mx-1" />
                <button
                  onClick={handleGoToUserDashboard}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    isCurrentDashboardView
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm'
                      : 'text-cyan-300 hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{getDashboardLabel()}</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Header Controls */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={onOpenVoucher}
              className="text-xs font-medium text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-900 border border-slate-800 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Redeem Voucher</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
                <button
                  onClick={handleGoToUserDashboard}
                  className="text-right cursor-pointer group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {currentUser.role.replace('_', ' ')}
                  </div>
                </button>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-900 border border-slate-800/80 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewChange('LOGIN')}
                  className="px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white rounded-xl hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onViewChange('REGISTER')}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md shadow-amber-400/20 transition-all cursor-pointer"
                >
                  Get Started Free
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 text-slate-300 hover:text-white rounded-xl bg-slate-900 border border-slate-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Clean Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-5 space-y-3 animate-fade-in">
          <div className="grid grid-cols-4 gap-2 pb-3 border-b border-slate-800/80">
            <button
              onClick={() => {
                onViewChange('LANDING');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 text-xs font-bold rounded-xl text-center cursor-pointer ${
                currentView === 'LANDING' ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-300'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                onViewChange('PRICING');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 text-xs font-bold rounded-xl text-center cursor-pointer ${
                currentView === 'PRICING' ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-300'
              }`}
            >
              Pricing
            </button>
            <button
              onClick={() => {
                onViewChange('ABOUT');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 text-xs font-bold rounded-xl text-center cursor-pointer ${
                currentView === 'ABOUT' ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-300'
              }`}
            >
              About
            </button>
            <button
              onClick={() => {
                onViewChange('CONTACT');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 text-xs font-bold rounded-xl text-center cursor-pointer ${
                currentView === 'CONTACT' ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-300'
              }`}
            >
              Contact
            </button>
          </div>

          {/* Authenticated user actions or Auth buttons */}
          {currentUser ? (
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  handleGoToUserDashboard();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to {getDashboardLabel()}</span>
              </button>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    onOpenVoucher();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 py-2 px-3 bg-slate-900 rounded-xl border border-slate-800"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Redeem Voucher</span>
                </button>

                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold text-rose-400 flex items-center gap-1.5 py-2 px-3 bg-rose-950/40 border border-rose-800/40 rounded-xl cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out ({currentUser.name.split(' ')[0]})</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onViewChange('LOGIN');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 px-3 text-xs font-bold text-slate-200 bg-slate-900 rounded-xl border border-slate-800 text-center cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onViewChange('REGISTER');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 px-3 text-xs font-black text-slate-950 bg-amber-400 rounded-xl text-center cursor-pointer"
                >
                  Get Started Free
                </button>
              </div>

              <button
                onClick={() => {
                  onOpenVoucher();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 text-xs font-semibold text-amber-400 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Redeem Physical Voucher</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
