import React, { useState } from 'react';
import {
  Wifi,
  Smartphone,
  Ticket,
  Clock,
  Laptop,
  Receipt,
  Users,
  DollarSign,
  Headphones,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Share2,
  ExternalLink,
  ChevronRight,
  Shield,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import type {
  User,
  CustomerProfile,
  WifiPackage,
  Transaction,
  WifiSession,
  ReferralCommission,
  WithdrawalRequest,
  SupportTicket,
  InstallationRequest,
} from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface CustomerDashboardProps {
  currentUser: User;
  profile?: CustomerProfile;
  packages: WifiPackage[];
  sessions: WifiSession[];
  transactions: Transaction[];
  commissions: ReferralCommission[];
  withdrawals: WithdrawalRequest[];
  tickets: SupportTicket[];
  installations: InstallationRequest[];
  onBuyPackage: (pkg: WifiPackage) => void;
  onOpenVoucher: () => void;
  onViewReceipt: (tx: Transaction) => void;
  onRefreshState: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  currentUser,
  profile,
  packages,
  sessions,
  transactions,
  commissions,
  withdrawals,
  tickets,
  installations,
  onBuyPackage,
  onOpenVoucher,
  onViewReceipt,
  onRefreshState,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'OVERVIEW'
    | 'PACKAGES'
    | 'DEVICES'
    | 'TRANSACTIONS'
    | 'REFERRALS'
    | 'INSTALLATION'
    | 'NOTIFICATIONS'
    | 'SUPPORT'
    | 'PROFILE_SETTINGS'
  >('OVERVIEW');

  // Withdrawal form state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPhone, setWithdrawPhone] = useState(currentUser.phone);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  // Installation form state
  const [instType, setInstType] = useState<'WIRED' | 'WIRELESS'>('WIRED');
  const [instLocation, setInstLocation] = useState('');
  const [instDate, setInstDate] = useState('');
  const [instTime, setInstTime] = useState('10:00 AM');
  const [instNotes, setInstNotes] = useState('');
  const [instLoading, setInstLoading] = useState(false);
  const [instSuccess, setInstSuccess] = useState('');

  // Support ticket form state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('WIFI');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState('');

  // Copy referral feedback
  const [copiedLink, setCopiedLink] = useState(false);

  const referralCode = profile?.referralCode || 'RAYMOND123';
  const referralLink = `https://wifi.brisk.co.ke/join?ref=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawLoading(true);
    setWithdrawError('');
    setWithdrawSuccess('');

    try {
      await api.requestWithdrawal({
        userId: currentUser.id,
        amount: Number(withdrawAmount),
        phone: withdrawPhone,
      });
      setWithdrawSuccess(`Withdrawal of KES ${withdrawAmount} submitted to ${withdrawPhone}!`);
      setWithdrawAmount('');
      onRefreshState();
    } catch (err: any) {
      setWithdrawError(err.message || 'Failed to submit withdrawal request.');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleInstallationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInstLoading(true);
    setInstSuccess('');

    try {
      await api.requestInstallation({
        userId: currentUser.id,
        type: instType,
        location: instLocation,
        preferredDate: instDate || '2026-10-05',
        preferredTime: instTime,
        phone: currentUser.phone,
        notes: instNotes,
      });
      setInstSuccess('Installation request received! A technician will call to verify coordinates.');
      setInstLocation('');
      setInstNotes('');
      onRefreshState();
    } catch (err: any) {
      alert(err.message || 'Failed to submit installation request');
    } finally {
      setInstLoading(false);
    }
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketLoading(true);
    setTicketSuccess('');

    try {
      await api.submitTicket({
        userId: currentUser.id,
        category: ticketCategory,
        subject: ticketSubject,
        description: ticketDescription,
      });
      setTicketSuccess('Support ticket opened! Our technical desk will respond promptly.');
      setTicketSubject('');
      setTicketDescription('');
      onRefreshState();
    } catch (err: any) {
      alert(err.message || 'Failed to submit ticket');
    } finally {
      setTicketLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span>CUSTOMER PORTAL</span>
              <span>·</span>
              <span className="text-emerald-400 font-mono">ACCOUNT #{currentUser.id}</span>
            </div>
            <h1 className="text-2xl font-black text-white">Welcome, {currentUser.name}</h1>
            <p className="text-xs text-slate-400">
              Manage your active WiFi session, bandwidth, M-Pesa purchases, and referral earnings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('PACKAGES')}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-md shadow-amber-400/20 transition-colors flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>BUY PACKAGE</span>
            </button>
            <button
              onClick={onOpenVoucher}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Ticket className="w-3.5 h-3.5 text-amber-400" />
              <span>ENTER VOUCHER</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-1 p-1 bg-slate-900/80 border border-slate-800 rounded-xl scrollbar-none">
          {(
            [
              { id: 'OVERVIEW', label: '1. Overview' },
              { id: 'PACKAGES', label: '2. Buy WiFi' },
              { id: 'DEVICES', label: '3. Devices & Sessions' },
              { id: 'TRANSACTIONS', label: '4. Transactions & Receipts' },
              { id: 'REFERRALS', label: '5. Referrals (10%)' },
              { id: 'INSTALLATION', label: '6. Installations' },
              { id: 'NOTIFICATIONS', label: '7. Notifications' },
              { id: 'SUPPORT', label: '8. Help & Support' },
              { id: 'PROFILE_SETTINGS', label: '9. Profile & Settings' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* Status & Active Package Highlight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Internet Status */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                <div className="text-xs text-slate-400 font-medium">Internet Status</div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-lg font-bold text-emerald-400">● Connected</span>
                </div>
                <div className="text-xs text-slate-400">
                  Network: <span className="text-white font-medium">{profile?.currentNetwork || 'BRISK Kiambu'}</span>
                </div>
              </div>

              {/* Current Package */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                <div className="text-xs text-slate-400 font-medium">Current Package</div>
                <div className="text-lg font-black text-amber-400">
                  {profile?.currentPackage?.packageName || '3 Days Free'}
                </div>
                <div className="text-xs text-slate-400">
                  Speed: <span className="text-sky-400 font-medium">{profile?.currentSpeed || '10 Mbps'}</span>
                </div>
              </div>

              {/* Remaining Time */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                <div className="text-xs text-slate-400 font-medium">Remaining Time</div>
                <div className="text-lg font-bold text-white font-mono flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>2d 14h 32m</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Expires:{' '}
                  <span className="text-slate-300">
                    {profile?.currentPackage?.expiresAt
                      ? new Date(profile.currentPackage.expiresAt).toLocaleDateString('en-KE', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '01 Oct, 04:56'}
                  </span>
                </div>
              </div>

              {/* Referral Balance */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                <div className="text-xs text-slate-400 font-medium">Available Commission</div>
                <div className="text-lg font-extrabold text-emerald-400 font-mono">
                  KES {(profile?.availableCommission ?? 1200).toLocaleString()}
                </div>
                <button
                  onClick={() => setActiveTab('REFERRALS')}
                  className="text-xs text-sky-400 hover:text-sky-300 font-medium inline-flex items-center gap-1"
                >
                  <span>Request M-Pesa Payout</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Free Package Announcement if active */}
            {profile?.currentPackage?.isFreeWelcomePackage && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Welcome Gift: 3-Day Free Package Activated!
                    </h3>
                    <p className="text-xs text-slate-300">
                      Enjoy unlimited 10 Mbps broadband. No credit card or prepayment required.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('PACKAGES')}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
                >
                  Extend With M-Pesa
                </button>
              </div>
            )}

            {/* Quick Actions & Recent Transactions Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Connected Devices in Session */}
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-sky-400" />
                    <h3 className="text-sm font-bold text-white">Active Device Session</h3>
                  </div>
                  <span className="text-xs text-slate-400">1 of 3 Devices Active</span>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Device Name:</span>
                    <span className="font-semibold text-white">Chrome on Linux (Current)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned IP Address:</span>
                    <span className="font-mono text-sky-400">192.168.88.142</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Device MAC:</span>
                    <span className="font-mono text-slate-300">DC:A6:32:89:BC:11</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hotspot Access Point:</span>
                    <span className="text-white">AP 01 Kiambu Market</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Data Transferred:</span>
                    <span className="font-mono text-emerald-400 font-semibold">1,240 MB</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('DEVICES')}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
                >
                  Manage Sessions & Devices
                </button>
              </div>

              {/* Recent Transactions */}
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">Recent Transactions</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('TRANSACTIONS')}
                    className="text-xs text-sky-400 hover:text-sky-300"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-2">
                  {transactions.slice(0, 3).map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">{tx.packageName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {tx.receiptNumber} · {tx.paymentMethod}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-amber-400 font-mono">
                          KES {tx.amountKes.toLocaleString()}
                        </div>
                        <button
                          onClick={() => onViewReceipt(tx)}
                          className="text-[11px] text-sky-400 hover:underline"
                        >
                          View Receipt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BUY PACKAGES */}
        {activeTab === 'PACKAGES' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Official WiFi Packages</h2>
              <p className="text-xs text-slate-400">
                Select a package to pay via Safaricom M-Pesa. Your connection will renew automatically.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-400/60 transition-colors"
                >
                  <div>
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-base font-bold text-white">{pkg.name}</h3>
                      <span className="text-xs text-sky-400 font-semibold">{pkg.speedLabel}</span>
                    </div>

                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-xs font-semibold text-slate-400">KES</span>
                      <span className="text-2xl font-black text-amber-400">
                        {pkg.priceKes.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500">/ {pkg.durationLabel}</span>
                    </div>

                    <p className="mt-2 text-xs text-slate-400">{pkg.description}</p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => onBuyPackage(pkg)}
                      className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-md shadow-sky-600/20 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>PAY KES {pkg.priceKes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DEVICES & SESSIONS */}
        {activeTab === 'DEVICES' && (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Your Connected Devices & Sessions</h2>
              <p className="text-xs text-slate-400">
                Real-time MikroTik hotspot sessions tied to your account.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Device / Name</th>
                    <th className="p-3">IP Address</th>
                    <th className="p-3">MAC Address</th>
                    <th className="p-3">Access Point</th>
                    <th className="p-3">Current Package</th>
                    <th className="p-3">Data Used</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white">{s.customerName}</td>
                      <td className="p-3 font-mono text-sky-400">{s.ipAddress}</td>
                      <td className="p-3 font-mono text-slate-400">{s.macAddress}</td>
                      <td className="p-3">{s.apName}</td>
                      <td className="p-3 text-amber-300">{s.packageName}</td>
                      <td className="p-3 font-mono">{s.usageMb} MB</td>
                      <td className="p-3">
                        <span className="text-emerald-400 font-bold">● Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: TRANSACTIONS & RECEIPTS */}
        {activeTab === 'TRANSACTIONS' && (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Payment Transactions & Receipts</h2>
              <p className="text-xs text-slate-400">
                Download or print cryptographically verified receipts for all your WiFi purchases.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Receipt #</th>
                    <th className="p-3">Package</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-white">{t.receiptNumber}</td>
                      <td className="p-3 font-semibold text-sky-300">{t.packageName}</td>
                      <td className="p-3 font-mono font-bold text-amber-400">
                        KES {t.amountKes.toLocaleString()}
                      </td>
                      <td className="p-3">{t.paymentMethod}</td>
                      <td className="p-3 font-mono text-slate-400">{t.reference}</td>
                      <td className="p-3">
                        {new Date(t.createdAt).toLocaleDateString('en-KE', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => onViewReceipt(t)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: REFERRALS & EARNINGS */}
        {activeTab === 'REFERRALS' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="text-xs text-slate-400 font-medium">Total Friends Referred</div>
                <div className="text-2xl font-black text-white mt-1">23</div>
                <div className="text-[11px] text-slate-400 mt-1">17 made eligible purchases</div>
              </div>
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="text-xs text-slate-400 font-medium">Commission Rate</div>
                <div className="text-2xl font-black text-amber-400 mt-1">10%</div>
                <div className="text-[11px] text-slate-400 mt-1">On all WiFi package sales</div>
              </div>
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="text-xs text-slate-400 font-medium">Total Commission Earned</div>
                <div className="text-2xl font-black text-sky-400 mt-1 font-mono">KES 1,850</div>
                <div className="text-[11px] text-slate-400 mt-1">Lifetime rewards</div>
              </div>
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="text-xs text-slate-400 font-medium">Available to Withdraw</div>
                <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                  KES {(profile?.availableCommission ?? 1200).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Min withdrawal: KES 100</div>
              </div>
            </div>

            {/* Referral Link Card */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white">Your Unique Referral Link</h3>
              <p className="text-xs text-slate-400">
                Share this link or your code with friends. When they buy any WiFi package, you earn a 10% cash
                commission sent straight to your M-Pesa balance.
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm text-amber-400 flex items-center justify-between">
                  <span>{referralLink}</span>
                  <span className="text-xs font-bold text-slate-400">CODE: {referralCode}</span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedLink ? 'COPIED!' : 'COPY LINK'}</span>
                </button>
              </div>
            </div>

            {/* Request Withdrawal Form */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white">Request M-Pesa Withdrawal</h3>
              <form onSubmit={handleWithdrawalSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Amount (KES)</label>
                  <input
                    type="number"
                    min="100"
                    max={profile?.availableCommission ?? 1200}
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">M-Pesa Phone</label>
                  <input
                    type="tel"
                    required
                    value={withdrawPhone}
                    onChange={(e) => setWithdrawPhone(e.target.value)}
                    placeholder="07XXXXXXXX"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={withdrawLoading || !withdrawAmount}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-colors"
                  >
                    {withdrawLoading ? 'Submitting...' : 'DISBURSE VIA M-PESA'}
                  </button>
                </div>
              </form>

              {withdrawSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{withdrawSuccess}</span>
                </div>
              )}
              {withdrawError && (
                <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span>{withdrawError}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: INSTALLATION BOOKING */}
        {activeTab === 'INSTALLATION' && (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Technician Installation Booking</h2>
              <p className="text-xs text-slate-400">
                Book a certified BRISK telecom technician for structured outdoor cabling or point-to-point wireless.
              </p>
            </div>

            <form onSubmit={handleInstallationSubmit} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Installation Service Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setInstType('WIRED')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      instType === 'WIRED'
                        ? 'bg-sky-950/60 border-sky-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">Wired Hotspot Setup</div>
                    <div className="text-lg font-black text-amber-400 mt-1">KES 2,999</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Cat6 STP, PoE injectors & mounting</div>
                  </div>

                  <div
                    onClick={() => setInstType('WIRELESS')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      instType === 'WIRELESS'
                        ? 'bg-sky-950/60 border-sky-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">Wireless PtP Link</div>
                    <div className="text-lg font-black text-amber-400 mt-1">KES 8,499</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Long-distance dish & rooftop mast</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Physical Installation Address / Building
                </label>
                <input
                  type="text"
                  required
                  value={instLocation}
                  onChange={(e) => setInstLocation(e.target.value)}
                  placeholder="e.g. Kiambu Central Market, Floor 2, Shop 42"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={instDate}
                    onChange={(e) => setInstDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Preferred Time</label>
                  <select
                    value={instTime}
                    onChange={(e) => setInstTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-400"
                  >
                    <option>09:00 AM</option>
                    <option>11:00 AM</option>
                    <option>02:00 PM</option>
                    <option>04:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={instNotes}
                  onChange={(e) => setInstNotes(e.target.value)}
                  placeholder="Any access notes or power outlet details"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              {instSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-xs text-emerald-300">
                  {instSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={instLoading}
                className="py-3 px-6 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-md"
              >
                {instLoading ? 'Booking Technician...' : 'SUBMIT INSTALLATION REQUEST'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 7: SUPPORT */}
        {activeTab === 'SUPPORT' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold text-white">Open a Support Ticket</h2>
              <form onSubmit={handleTicketSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Issue Category</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                  >
                    <option value="WIFI">WiFi Signal / Connection</option>
                    <option value="PAYMENT">M-Pesa Payment Not Reflected</option>
                    <option value="VOUCHER">Voucher Card Issue</option>
                    <option value="INSTALLATION">Installation Inquiry</option>
                    <option value="OTHER">Other Query</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Brief description of issue"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={3}
                    required
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    placeholder="Provide details such as location or reference code"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                  />
                </div>

                {ticketSuccess && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-xs text-emerald-300">
                    {ticketSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={ticketLoading}
                  className="py-2.5 px-5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-colors"
                >
                  {ticketLoading ? 'Submitting...' : 'Submit Support Ticket'}
                </button>
              </form>
            </div>

            {/* Active Tickets List */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold text-white">Your Tickets History</h2>
              <div className="space-y-3">
                {tickets.map((t) => (
                  <div key={t.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-sky-400 font-mono">#{t.id}</span>
                        <h4 className="text-xs font-bold text-white">{t.subject}</h4>
                      </div>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{t.description}</p>
                    {t.replies.map((r) => (
                      <div
                        key={r.id}
                        className="mt-2 p-2.5 bg-slate-900 border-l-2 border-sky-500 rounded-r-lg text-xs"
                      >
                        <div className="font-semibold text-sky-300">{r.senderName}</div>
                        <div className="text-slate-300 text-[11px] mt-0.5">{r.message}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: NOTIFICATIONS */}
        {activeTab === 'NOTIFICATIONS' && (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white">Your Notifications & Activity</h2>
              <p className="text-xs text-slate-400">Real-time alerts regarding your packages, payments, and sessions.</p>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Welcome Gift Active: 3-Day Free Package (10 Mbps)</span>
                  </div>
                  <div className="text-slate-400 mt-0.5">High-speed hotspot access active across BRISK Kiambu.</div>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">Today</span>
              </div>
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Package Expiry Reminder</span>
                  </div>
                  <div className="text-slate-400 mt-0.5">Your free package has 2 days remaining. Renew with M-Pesa anytime.</div>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">2h ago</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: PROFILE & SETTINGS */}
        {activeTab === 'PROFILE_SETTINGS' && (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6 max-w-2xl">
            <div>
              <h2 className="text-xl font-bold text-white">Customer Account & Settings</h2>
              <p className="text-xs text-slate-400">Update your account credentials, M-Pesa payout number, and communication preferences.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue={currentUser.name}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    defaultValue={currentUser.email}
                    disabled
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Registered M-Pesa Phone Number</label>
                <input
                  type="tel"
                  defaultValue={currentUser.phone}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="font-semibold text-white">Alert Preferences</span>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input type="checkbox" defaultChecked className="rounded accent-sky-500" />
                  <span>Send SMS payment receipt when buying WiFi packages</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input type="checkbox" defaultChecked className="rounded accent-sky-500" />
                  <span>Send reminder 3 hours before my WiFi package expires</span>
                </label>
              </div>

              <button
                type="button"
                onClick={() => alert('Account settings saved.')}
                className="py-2.5 px-6 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                SAVE ACCOUNT SETTINGS
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
