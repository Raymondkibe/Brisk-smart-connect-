import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar.tsx';
import { LandingPage } from './components/public/LandingPage.tsx';
import { ExpiredPortal } from './components/public/ExpiredPortal.tsx';
import { HotspotPortal } from './components/public/HotspotPortal.tsx';
import { CaptivePortalPage } from './components/public/CaptivePortalPage.tsx';
import { PppoeCaptivePortal } from './components/public/PppoeCaptivePortal.tsx';
import { CustomerDashboard } from './components/customer/CustomerDashboard.tsx';
import { OwnerDashboard } from './components/owner/OwnerDashboard.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { AboutPage } from './components/public/AboutPage.tsx';
import { ContactPage } from './components/public/ContactPage.tsx';
import { PricingPage } from './components/public/PricingPage.tsx';
import { LoginPage } from './components/auth/LoginPage.tsx';
import { RegisterPage } from './components/auth/RegisterPage.tsx';
import { PaymentModal } from './components/common/PaymentModal.tsx';
import { ReceiptModal } from './components/common/ReceiptModal.tsx';
import { VoucherModal } from './components/common/VoucherModal.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { HostModal } from './components/common/HostModal.tsx';
import { DashboardSkeleton } from './components/common/DashboardSkeleton.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { Wifi, Radio, ShieldCheck } from 'lucide-react';
import { api, type AppState } from './services/api.ts';
import type {
  User,
  CustomerProfile,
  RouterOwnerProfile,
  WifiPackage,
  SubscriptionPlan,
  Transaction,
} from './types/index.ts';

import type { OwnerPage } from './components/owner/OwnerDashboard.tsx';

export type AppView =
  | 'LANDING'
  | 'PRICING'
  | 'ABOUT'
  | 'CONTACT'
  | 'CUSTOMER'
  | 'OWNER'
  | 'ADMIN'
  | 'EXPIRED'
  | 'HOTSPOT_PORTAL'
  | 'PPPOE_PORTAL'
  | 'LOGIN'
  | 'REGISTER';

// Detect URL route for dedicated standalone pages and tabs
const getInitialView = (): AppView => {
  if (typeof window === 'undefined') return 'LANDING';
  const path = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();

  if (path === '/login' || path === '/signin' || path === '/account') return 'LOGIN';
  if (path === '/register' || path === '/signup') return 'REGISTER';
  if (path === '/pricing' || path === '/plans' || path === '/packages') return 'PRICING';

  if (
    path === '/pppoe-portal' ||
    path === '/pppoe-client' ||
    path === '/fiber' ||
    (path === '/pppoe' && !search.includes('owner') && !search.includes('tab='))
  ) {
    return 'PPPOE_PORTAL';
  }

  if (
    path === '/portal' ||
    path === '/hotspot' ||
    path === '/captive' ||
    path === '/wifi' ||
    search.includes('portal') ||
    search.includes('hotspot') ||
    search.includes('mac=')
  ) {
    return 'HOTSPOT_PORTAL';
  }

  if (path === '/about') return 'ABOUT';
  if (path === '/contact') return 'CONTACT';
  if (
    path === '/customer' ||
    path === '/devices' ||
    path === '/my-devices' ||
    path === '/support' ||
    path === '/referrals' ||
    path === '/transactions'
  ) {
    return 'CUSTOMER';
  }

  if (
    path === '/owner' ||
    path === '/dashboard' ||
    path === '/connect-router' ||
    path === '/setup-scripts' ||
    path === '/router-setup-scripts' ||
    path === '/my-routers' ||
    path === '/payment-methods' ||
    path === '/network-management' ||
    path === '/integrations' ||
    path === '/pppoe' ||
    path === '/vouchers' ||
    path === '/withdrawals' ||
    path === '/captive-portal' ||
    path === '/portal-builder'
  ) {
    return 'OWNER';
  }

  if (
    path === '/admin' ||
    path === '/admin-dashboard' ||
    path === '/admin-users' ||
    path === '/admin-routers' ||
    path === '/audit' ||
    path === '/audit-logs'
  ) {
    return 'ADMIN';
  }

  if (path === '/expired') return 'EXPIRED';
  return 'LANDING';
};

// Parse initial tab for Router Owner workspace
const getInitialOwnerTab = (): OwnerPage => {
  if (typeof window === 'undefined') return 'DASHBOARD';
  const path = window.location.pathname.toLowerCase();
  if (path === '/setup-scripts' || path === '/router-setup-scripts') return 'SETUP_SCRIPTS';
  if (path === '/connect-router' || path === '/easy-connect') return 'EASY_CONNECT';
  if (path === '/my-routers' || path === '/network-management' || path === '/network') return 'ROUTERS';
  if (path === '/payment-methods') return 'PAYMENT_METHODS';
  if (path === '/integrations') return 'INTEGRATIONS';
  if (path === '/pppoe') return 'PPPOE';
  if (path === '/vouchers') return 'VOUCHERS';
  if (path === '/captive-portal' || path === '/portal-builder') return 'CAPTIVE_PORTAL';
  if (path === '/withdrawals') return 'WITHDRAWALS';
  return 'DASHBOARD';
};

const AuthGateCard: React.FC<{
  title: string;
  description: string;
  onLogin: () => void;
  onRegister: () => void;
  icon: React.ReactNode;
}> = ({ title, description, onLogin, onRegister, icon }) => (
  <div className="max-w-md mx-auto my-16 px-4">
    <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 shadow-2xl">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
      <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
        <button
          onClick={onLogin}
          className="flex-1 py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          Sign In
        </button>
        <button
          onClick={onRegister}
          className="flex-1 py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl transition-all cursor-pointer"
        >
          Create Account
        </button>
      </div>
    </div>
  </div>
);

function MainApp() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);

  // Active view: Standalone Captive Portal has its own dedicated page at /portal, Author at /author
  const [currentView, setCurrentView] = useState<AppView>(getInitialView);
  const [ownerInitialTab, setOwnerInitialTab] = useState<OwnerPage>(getInitialOwnerTab);

  // Active User session (defaults to Customer or Router Owner for quick preview)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | undefined>();
  const [ownerProfile, setOwnerProfile] = useState<RouterOwnerProfile | undefined>();

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<{
    type: 'CUSTOMER_WIFI' | 'ROUTER_OWNER_SUBSCRIPTION' | 'INSTALLATION';
    id: string;
    name: string;
    priceKes: number;
    durationLabel?: string;
    speedLabel?: string;
  } | null>(null);

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);

  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [hostModalOpen, setHostModalOpen] = useState(false);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const onPopState = () => {
      setCurrentView(getInitialView());
      setOwnerInitialTab(getInitialOwnerTab());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Fetch initial system state from backend
  const loadState = async () => {
    try {
      const data = await api.fetchState();
      setAppState(data);

      // Refresh profiles if a user is currently logged in
      if (currentUser) {
        const freshUser = data.users.find((u) => u.id === currentUser.id);
        if (freshUser) setCurrentUser(freshUser);

        const cpEntry = data.customerProfiles.find(([uid]) => uid === currentUser.id);
        if (cpEntry) setCustomerProfile(cpEntry[1]);

        const opEntry = data.routerOwnerProfiles.find(([uid]) => uid === currentUser.id);
        if (opEntry) setOwnerProfile(opEntry[1]);
      }
    } catch (err) {
      console.warn('Backend sync note:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadState();
  }, []);

  // When switching views, update URL and state cleanly
  const handleViewChange = (view: AppView, ownerTab?: OwnerPage) => {
    setCurrentView(view);
    if (ownerTab) {
      setOwnerInitialTab(ownerTab);
    }

    // Update browser URL cleanly
    if (typeof window !== 'undefined') {
      let targetPath = `/${view.toLowerCase()}`;
      if (view === 'HOTSPOT_PORTAL') targetPath = '/portal';
      else if (view === 'PPPOE_PORTAL') targetPath = '/pppoe';
      else if (view === 'LOGIN') targetPath = '/login';
      else if (view === 'REGISTER') targetPath = '/register';
      else if (view === 'LANDING') targetPath = '/';
      else if (view === 'OWNER') {
        if (ownerTab === 'SETUP_SCRIPTS') targetPath = '/setup-scripts';
        else if (ownerTab === 'EASY_CONNECT') targetPath = '/connect-router';
        else if (ownerTab === 'PAYMENT_METHODS') targetPath = '/payment-methods';
        else if (ownerTab === 'ROUTERS') targetPath = '/my-routers';
        else if (ownerTab === 'INTEGRATIONS') targetPath = '/integrations';
        else targetPath = '/owner';
      }

      if (window.location.pathname !== targetPath) {
        window.history.pushState({ view, ownerTab }, '', targetPath);
      }
    }
  };

  const handleOpenAuth = (mode: 'LOGIN' | 'REGISTER') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (data: { user: User; customerProfile?: any; ownerProfile?: any } | User) => {
    const user = 'user' in data ? data.user : data;
    const cp = 'customerProfile' in data ? data.customerProfile : undefined;
    const op = 'ownerProfile' in data ? data.ownerProfile : undefined;

    setCurrentUser(user);
    if (cp) setCustomerProfile(cp);
    if (op) setOwnerProfile(op);

    // Route automatically to user's dashboard
    if (user.role === 'CUSTOMER') setCurrentView('CUSTOMER');
    else if (user.role === 'ROUTER_OWNER') setCurrentView('OWNER');
    else if (user.role === 'SUPER_ADMIN') setCurrentView('ADMIN');
    loadState();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCustomerProfile(undefined);
    setOwnerProfile(undefined);
    setCurrentView('LANDING');
  };

  const handleSelectPackage = (pkg: WifiPackage) => {
    setPaymentTarget({
      type: 'CUSTOMER_WIFI',
      id: pkg.id,
      name: pkg.name,
      priceKes: pkg.priceKes,
      durationLabel: pkg.durationLabel,
      speedLabel: pkg.speedLabel,
    });
    setPaymentModalOpen(true);
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setPaymentTarget({
      type: 'ROUTER_OWNER_SUBSCRIPTION',
      id: plan.id,
      name: `${plan.name} (30 Days)`,
      priceKes: plan.priceKes,
      durationLabel: '30 Days',
    });
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (tx: Transaction) => {
    loadState();
  };

  const handleViewReceipt = (tx: Transaction) => {
    setSelectedReceipt(tx);
    setReceiptModalOpen(true);
  };

  if (loading && !appState) {
    return (
      <DashboardSkeleton
        type={currentView === 'ADMIN' ? 'ADMIN' : currentView === 'CUSTOMER' ? 'CUSTOMER' : 'OWNER'}
      />
    );
  }

  const packages = appState?.wifiPackages || [];
  const subscriptionPlans = appState?.subscriptionPlans || [];
  const routers = appState?.routers || [];
  const accessPoints = appState?.accessPoints || [];
  const sessions = appState?.wifiSessions || [];
  const pppoeUsers = appState?.pppoeUsers || [];
  const vouchers = appState?.vouchers || [];
  const transactions = appState?.transactions || [];
  const commissions = appState?.commissions || [];
  const withdrawals = appState?.withdrawals || [];
  const installations = appState?.installations || [];
  const incidents = appState?.incidents || [];
  const tickets = appState?.tickets || [];
  const auditLogs = appState?.auditLogs || [];
  const hostApplications = appState?.hostApplications || [];
  const bpEntry = appState?.businessProfiles.find(([uid]) => uid === currentUser?.id);
  const businessProfile = bpEntry ? bpEntry[1] : undefined;

  // DEDICATED CAPTIVE PORTAL PAGE (Clean Standalone Hotspot Experience with No General Navbar)
  if (currentView === 'HOTSPOT_PORTAL') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <CaptivePortalPage
          packages={packages}
          vouchers={vouchers}
          onReturnHome={() => handleViewChange('LANDING')}
          onOpenReceipt={handleViewReceipt}
          onViewCustomerDashboard={() => handleViewChange('CUSTOMER')}
        />

        <ReceiptModal
          isOpen={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          transaction={selectedReceipt}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onViewChange={handleViewChange}
        currentUser={currentUser}
        customerProfile={customerProfile}
        ownerProfile={ownerProfile}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onOpenVoucher={() => setVoucherModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'LANDING' && (
          <LandingPage
            packages={packages}
            subscriptionPlans={subscriptionPlans}
            onSelectPackage={handleSelectPackage}
            onSelectPlan={handleSelectPlan}
            onOpenAuth={handleOpenAuth}
            onOpenHostModal={() => setHostModalOpen(true)}
            onOpenVoucher={() => setVoucherModalOpen(true)}
            onGoToPortal={handleViewChange}
            onGoToAbout={() => setCurrentView('ABOUT')}
            onGoToContact={() => setCurrentView('CONTACT')}
          />
        )}

        {currentView === 'ABOUT' && (
          <AboutPage
            onGoHome={() => setCurrentView('LANDING')}
            onGoContact={() => setCurrentView('CONTACT')}
            onExplorePackages={() => {
              setCurrentView('LANDING');
              setTimeout(() => {
                document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          />
        )}

        {currentView === 'CONTACT' && (
          <ContactPage
            onGoHome={() => setCurrentView('LANDING')}
            onExplorePackages={() => {
              setCurrentView('LANDING');
              setTimeout(() => {
                document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          />
        )}

        {currentView === 'LOGIN' && (
          <LoginPage
            onLoginSuccess={handleAuthSuccess}
            onNavigateToRegister={() => handleViewChange('REGISTER')}
            onBackToHome={() => handleViewChange('LANDING')}
            onNavigateToPortal={() => handleViewChange('HOTSPOT_PORTAL')}
          />
        )}

        {currentView === 'REGISTER' && (
          <RegisterPage
            onRegisterSuccess={handleAuthSuccess}
            onNavigateToLogin={() => handleViewChange('LOGIN')}
            onBackToHome={() => handleViewChange('LANDING')}
            onNavigateToPortal={() => handleViewChange('HOTSPOT_PORTAL')}
          />
        )}

        {currentView === 'PRICING' && (
          <PricingPage
            subscriptionPlans={subscriptionPlans}
            onSelectPlan={handleSelectPlan}
            onGoToRegister={() => handleViewChange('REGISTER')}
            onGoToLogin={() => handleViewChange('LOGIN')}
            onReturnHome={() => handleViewChange('LANDING')}
            onGoToPortal={() => handleViewChange('HOTSPOT_PORTAL')}
            currentPlanId={ownerProfile?.subscriptionPlanId}
          />
        )}

        {currentView === 'EXPIRED' && (
          <ExpiredPortal
            packages={packages}
            onSelectPackage={handleSelectPackage}
            onOpenVoucher={() => setVoucherModalOpen(true)}
            onReturnHome={() => setCurrentView('LANDING')}
          />
        )}

        {currentView === 'PPPOE_PORTAL' && (
          <PppoeCaptivePortal
            onBackToHome={() => handleViewChange('LANDING')}
            onNavigateToLogin={() => handleViewChange('LOGIN')}
          />
        )}

        {currentView === 'CUSTOMER' && (
          currentUser ? (
            <CustomerDashboard
              currentUser={currentUser}
              profile={customerProfile}
              packages={packages}
              sessions={sessions}
              transactions={transactions.filter((t) => t.userId === currentUser.id || t.type === 'CUSTOMER_WIFI')}
              commissions={commissions}
              withdrawals={withdrawals.filter((w) => w.userId === currentUser.id)}
              tickets={tickets}
              installations={installations}
              onBuyPackage={handleSelectPackage}
              onOpenVoucher={() => setVoucherModalOpen(true)}
              onViewReceipt={handleViewReceipt}
              onRefreshState={loadState}
            />
          ) : (
            <AuthGateCard
              title="Customer WiFi Portal"
              description="Sign in or register your customer account to view your active WiFi session, purchased passes, speed test tools, and referral earnings."
              icon={<Wifi className="w-7 h-7" />}
              onLogin={() => handleOpenAuth('LOGIN')}
              onRegister={() => handleOpenAuth('REGISTER')}
            />
          )
        )}

        {currentView === 'OWNER' && (
          currentUser ? (
            <OwnerDashboard
              currentUser={currentUser}
              profile={ownerProfile}
              subscriptionPlans={subscriptionPlans}
              routers={routers}
              accessPoints={accessPoints}
              sessions={sessions}
              pppoeUsers={pppoeUsers}
              vouchers={vouchers}
              incidents={incidents}
              businessProfile={businessProfile}
              packages={packages}
              transactions={transactions}
              withdrawals={withdrawals}
              onActivateSubscription={handleSelectPlan}
              onRefreshState={loadState}
              onGoToHotspotPortal={() => setCurrentView('HOTSPOT_PORTAL')}
              initialTab={ownerInitialTab}
            />
          ) : (
            <AuthGateCard
              title="Router Manager & ISP Hub"
              description="Sign in or register your router owner account to manage MikroTik gateways, configure captive portal themes, generate vouchers, and collect M-Pesa revenue."
              icon={<Radio className="w-7 h-7" />}
              onLogin={() => handleOpenAuth('LOGIN')}
              onRegister={() => handleOpenAuth('REGISTER')}
            />
          )
        )}

        {currentView === 'ADMIN' && (
          currentUser && currentUser.role === 'SUPER_ADMIN' ? (
            <AdminDashboard
              currentUser={currentUser}
              users={appState?.users || []}
              routers={routers}
              accessPoints={accessPoints}
              packages={packages}
              subscriptionPlans={subscriptionPlans}
              transactions={transactions}
              vouchers={vouchers}
              withdrawals={withdrawals}
              installations={installations}
              incidents={incidents}
              auditLogs={auditLogs}
              hostApplications={hostApplications}
              onRefreshState={loadState}
            />
          ) : (
            <AuthGateCard
              title="Admin Control Center"
              description="Platform super administrative console. Sign in with administrative credentials to monitor global system health, manage users, and approve transition codes."
              icon={<ShieldCheck className="w-7 h-7" />}
              onLogin={() => handleOpenAuth('LOGIN')}
              onRegister={() => handleOpenAuth('REGISTER')}
            />
          )
        )}
      </main>

      {/* Global Interactive Modals */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        targetItem={paymentTarget}
        userId={currentUser?.id || 'guest'}
        defaultPhone={currentUser?.phone || ''}
        onPaymentSuccess={handlePaymentSuccess}
        onViewReceipt={handleViewReceipt}
      />

      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        transaction={selectedReceipt}
      />

      <VoucherModal
        isOpen={voucherModalOpen}
        onClose={() => setVoucherModalOpen(false)}
        userId={currentUser?.id || 'guest'}
        onVoucherSuccess={() => loadState()}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />

      <HostModal
        isOpen={hostModalOpen}
        onClose={() => setHostModalOpen(false)}
        defaultPhone={currentUser?.phone || ''}
        defaultName={currentUser?.name || ''}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider initialUser={null}>
      <MainApp />
    </AuthProvider>
  );
}
