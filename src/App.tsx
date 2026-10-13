import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar.tsx';
import { LandingPage } from './components/public/LandingPage.tsx';
import { ExpiredPortal } from './components/public/ExpiredPortal.tsx';
import { CustomerDashboard } from './components/customer/CustomerDashboard.tsx';
import { OwnerDashboard } from './components/owner/OwnerDashboard.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { AboutPage } from './components/public/AboutPage.tsx';
import { ContactPage } from './components/public/ContactPage.tsx';
import { PaymentModal } from './components/common/PaymentModal.tsx';
import { ReceiptModal } from './components/common/ReceiptModal.tsx';
import { VoucherModal } from './components/common/VoucherModal.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { HostModal } from './components/common/HostModal.tsx';
import { api, type AppState } from './services/api.ts';
import type {
  User,
  CustomerProfile,
  RouterOwnerProfile,
  WifiPackage,
  SubscriptionPlan,
  Transaction,
} from './types/index.ts';

export default function App() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);

  // Active view: Landing, About Us, Contact, Customer, Owner, Super Admin, or Expired Hotspot Portal
  const [currentView, setCurrentView] = useState<
    'LANDING' | 'ABOUT' | 'CONTACT' | 'CUSTOMER' | 'OWNER' | 'ADMIN' | 'EXPIRED'
  >('LANDING');

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

  // Fetch initial system state from backend
  const loadState = async () => {
    try {
      const data = await api.fetchState();
      setAppState(data);

      // Set initial user if none selected
      if (!currentUser && data.users.length > 0) {
        // Default preview user: Customer or Router Owner
        const defaultUser = data.users.find((u) => u.role === 'CUSTOMER') || data.users[1];
        setCurrentUser(defaultUser);

        // Find customer and owner profiles
        const cpEntry = data.customerProfiles.find(([uid]) => uid === defaultUser.id);
        if (cpEntry) setCustomerProfile(cpEntry[1]);

        const opEntry = data.routerOwnerProfiles.find(([uid]) => uid === defaultUser.id);
        if (opEntry) setOwnerProfile(opEntry[1]);
      } else if (currentUser) {
        // Refresh profiles for current user
        const cpEntry = data.customerProfiles.find(([uid]) => uid === currentUser.id);
        if (cpEntry) setCustomerProfile(cpEntry[1]);

        const opEntry = data.routerOwnerProfiles.find(([uid]) => uid === currentUser.id);
        if (opEntry) setOwnerProfile(opEntry[1]);
      }
    } catch (err) {
      console.warn('Backend sync in progress, running with local store:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadState();
  }, []);

  // When switching views, if the current user role doesn't match the view, adjust active persona smoothly
  const handleViewChange = (
    view: 'LANDING' | 'ABOUT' | 'CONTACT' | 'CUSTOMER' | 'OWNER' | 'ADMIN' | 'EXPIRED'
  ) => {
    setCurrentView(view);
    if (!appState) return;

    if (view === 'CUSTOMER') {
      const customer = appState.users.find((u) => u.role === 'CUSTOMER');
      if (customer) {
        setCurrentUser(customer);
        const cp = appState.customerProfiles.find(([uid]) => uid === customer.id);
        if (cp) setCustomerProfile(cp[1]);
      }
    } else if (view === 'OWNER') {
      const owner = appState.users.find((u) => u.role === 'ROUTER_OWNER');
      if (owner) {
        setCurrentUser(owner);
        const rop = appState.routerOwnerProfiles.find(([uid]) => uid === owner.id);
        if (rop) setOwnerProfile(rop[1]);
      }
    } else if (view === 'ADMIN') {
      const admin = appState.users.find((u) => u.role === 'SUPER_ADMIN');
      if (admin) setCurrentUser(admin);
    }
  };

  const handleOpenAuth = (mode: 'LOGIN' | 'REGISTER') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (data: { user: User; customerProfile?: any; ownerProfile?: any }) => {
    setCurrentUser(data.user);
    if (data.customerProfile) setCustomerProfile(data.customerProfile);
    if (data.ownerProfile) setOwnerProfile(data.ownerProfile);

    // Route automatically to user's dashboard
    if (data.user.role === 'CUSTOMER') setCurrentView('CUSTOMER');
    else if (data.user.role === 'ROUTER_OWNER') setCurrentView('OWNER');
    else if (data.user.role === 'SUPER_ADMIN') setCurrentView('ADMIN');
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-amber-400 p-0.5 animate-spin">
          <div className="w-full h-full bg-slate-950 rounded-[14px]" />
        </div>
        <div className="mt-4 text-sm font-bold tracking-wider text-slate-300">
          INITIALIZING BRISK SMART CONNECT...
        </div>
      </div>
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

        {currentView === 'EXPIRED' && (
          <ExpiredPortal
            packages={packages}
            onSelectPackage={handleSelectPackage}
            onOpenVoucher={() => setVoucherModalOpen(true)}
            onReturnHome={() => setCurrentView('LANDING')}
          />
        )}

        {currentView === 'CUSTOMER' && currentUser && (
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
        )}

        {currentView === 'OWNER' && currentUser && (
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
            onActivateSubscription={handleSelectPlan}
            onRefreshState={loadState}
          />
        )}

        {currentView === 'ADMIN' && currentUser && (
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
        )}
      </main>

      {/* Global Interactive Modals */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        targetItem={paymentTarget}
        userId={currentUser?.id || 'usr-cust-01'}
        defaultPhone={currentUser?.phone || '0799123456'}
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
        userId={currentUser?.id || 'usr-cust-01'}
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
