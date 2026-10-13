import React from 'react';
import {
  Wifi,
  Radio,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Sparkles,
  Layers,
  AlertTriangle,
  Menu,
  X,
} from 'lucide-react';
import type { User, CustomerProfile, RouterOwnerProfile } from '../../types/index.ts';

interface NavbarProps {
  currentView: 'LANDING' | 'ABOUT' | 'CONTACT' | 'CUSTOMER' | 'OWNER' | 'ADMIN' | 'EXPIRED';
  onViewChange: (view: 'LANDING' | 'ABOUT' | 'CONTACT' | 'CUSTOMER' | 'OWNER' | 'ADMIN' | 'EXPIRED') => void;
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewChange('LANDING')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-amber-500 p-0.5 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Wifi className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white">BRISK</span>
                <span className="text-lg font-semibold text-sky-400">Smart Connect</span>
              </div>
              <div className="text-[10px] tracking-wide text-amber-400/90 font-medium hidden sm:block">
                Smart WiFi. Smart Host. Smarter You.
              </div>
            </div>
          </div>

          {/* Navigation Links: Home, About Us, Contact, and Portals */}
          <div className="hidden md:flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => onViewChange('LANDING')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                currentView === 'LANDING'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onViewChange('ABOUT')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                currentView === 'ABOUT'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              About Us
            </button>
            <button
              onClick={() => onViewChange('CONTACT')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                currentView === 'CONTACT'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Contact
            </button>

            <span className="h-4 w-[1px] bg-slate-800 mx-1" />

            <button
              onClick={() => onViewChange('CUSTOMER')}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                currentView === 'CUSTOMER'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              Customer
            </button>
            <button
              onClick={() => onViewChange('OWNER')}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                currentView === 'OWNER'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              Router Owner
            </button>
            <button
              onClick={() => onViewChange('ADMIN')}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                currentView === 'ADMIN'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Super Admin
            </button>
            <button
              onClick={() => onViewChange('EXPIRED')}
              title="Test MikroTik Expired Redirection Portal"
              className={`flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                currentView === 'EXPIRED'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Expired Portal
            </button>
          </div>

          {/* Right Header Controls */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={onOpenVoucher}
              className="text-xs font-medium text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-slate-900 border border-slate-800"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Redeem Voucher
            </button>

            {currentUser ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
                <div className="text-right">
                  <div className="text-xs font-semibold text-white leading-tight">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-400 capitalize">
                    {currentUser.role.replace('_', ' ').toLowerCase()}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-900 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('LOGIN')}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth('REGISTER')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-4 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Navigation
          </div>
          <div className="grid grid-cols-3 gap-2 pb-2 border-b border-slate-800">
            <button
              onClick={() => {
                onViewChange('LANDING');
                setMobileMenuOpen(false);
              }}
              className={`p-2 text-xs font-medium rounded-lg text-center ${
                currentView === 'LANDING' ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-300'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                onViewChange('ABOUT');
                setMobileMenuOpen(false);
              }}
              className={`p-2 text-xs font-medium rounded-lg text-center ${
                currentView === 'ABOUT' ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-300'
              }`}
            >
              About Us
            </button>
            <button
              onClick={() => {
                onViewChange('CONTACT');
                setMobileMenuOpen(false);
              }}
              className={`p-2 text-xs font-medium rounded-lg text-center ${
                currentView === 'CONTACT' ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-300'
              }`}
            >
              Contact
            </button>
          </div>

          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-2 mb-1">
            Portal Modes
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onViewChange('CUSTOMER');
                setMobileMenuOpen(false);
              }}
              className={`p-2 text-xs font-medium rounded-lg text-left ${
                currentView === 'CUSTOMER' ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-300'
              }`}
            >
              Customer Portal
            </button>
            <button
              onClick={() => {
                onViewChange('OWNER');
                setMobileMenuOpen(false);
              }}
              className={`p-2 text-xs font-medium rounded-lg text-left ${
                currentView === 'OWNER' ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-300'
              }`}
            >
              Router Owner
            </button>
            <button
              onClick={() => {
                onViewChange('ADMIN');
                setMobileMenuOpen(false);
              }}
              className={`p-2 text-xs font-medium rounded-lg text-left ${
                currentView === 'ADMIN' ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-300'
              }`}
            >
              Super Admin
            </button>
            <button
              onClick={() => {
                onViewChange('EXPIRED');
                setMobileMenuOpen(false);
              }}
              className={`p-2 text-xs font-medium rounded-lg text-left ${
                currentView === 'EXPIRED' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-amber-400'
              }`}
            >
              Expired Portal
            </button>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                onOpenVoucher();
                setMobileMenuOpen(false);
              }}
              className="text-xs font-medium text-amber-400 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Redeem Voucher
            </button>

            {currentUser ? (
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-red-400 flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out ({currentUser.name.split(' ')[0]})
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onOpenAuth('LOGIN');
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs text-slate-200 bg-slate-900 rounded-md"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    onOpenAuth('REGISTER');
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 rounded-md"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
