import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Radio,
  Wifi,
  DollarSign,
  Ticket,
  AlertTriangle,
  Receipt,
  CheckCircle2,
  XCircle,
  Wrench,
  Activity,
  Search,
  Lock,
  Edit2,
  Save,
  Clock,
  UserCheck,
  UserX,
  Share2,
} from 'lucide-react';
import type {
  User,
  RouterDevice,
  AccessPoint,
  WifiPackage,
  SubscriptionPlan,
  Transaction,
  Voucher,
  WithdrawalRequest,
  InstallationRequest,
  NetworkIncident,
  AuditLog,
  HostApplication,
} from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface AdminDashboardProps {
  currentUser: User;
  users: User[];
  routers: RouterDevice[];
  accessPoints: AccessPoint[];
  packages: WifiPackage[];
  subscriptionPlans: SubscriptionPlan[];
  transactions: Transaction[];
  vouchers: Voucher[];
  withdrawals: WithdrawalRequest[];
  installations: InstallationRequest[];
  incidents: NetworkIncident[];
  auditLogs: AuditLog[];
  hostApplications: HostApplication[];
  onRefreshState: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  users,
  routers,
  accessPoints,
  packages,
  subscriptionPlans,
  transactions,
  vouchers,
  withdrawals,
  installations,
  incidents,
  auditLogs,
  hostApplications,
  onRefreshState,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'OVERVIEW'
    | 'USERS'
    | 'ROUTERS'
    | 'PACKAGES'
    | 'SUBSCRIPTIONS'
    | 'PAYMENTS'
    | 'WITHDRAWALS'
    | 'INSTALLATIONS'
    | 'HOSTS'
    | 'AUDIT_LOGS'
  >('OVERVIEW');

  // Withdrawal action state
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // User search/filter
  const [userSearch, setUserSearch] = useState('');

  const handleWithdrawalAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    setActionLoading(true);
    setActionSuccess('');
    try {
      await api.adminWithdrawalAction({
        withdrawalId: id,
        action,
        notes: action === 'APPROVE' ? 'Approved & Disbursed via M-Pesa B2C' : 'Rejected by Admin',
      });
      setActionSuccess(`Withdrawal #${id} has been ${action === 'APPROVE' ? 'approved' : 'rejected'}.`);
      setTimeout(() => setActionSuccess(''), 4000);
      onRefreshState();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.toggleUserStatus(userId, newStatus as any);
      onRefreshState();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle user status');
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!userSearch) return true;
    return (
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.includes(userSearch)
    );
  });

  const totalRev = transactions.reduce((acc, t) => acc + (t.status === 'SUCCESS' ? t.amountKes : 0), 0);
  const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>SINGLE SUPER ADMIN CONTROLLER</span>
            </div>
            <h1 className="text-2xl font-black text-white">BRISK Platform Administration</h1>
            <p className="text-xs text-slate-400">
              Global authority across all customers, router owners, network nodes, and Safaricom settlements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Operator: {currentUser.name}</span>
          </div>
        </div>

        {/* Action success message */}
        {actionSuccess && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl scrollbar-none">
          {(
            [
              { id: 'OVERVIEW', label: 'Platform Overview' },
              { id: 'USERS', label: `Users (${users.length})` },
              { id: 'ROUTERS', label: `Routers & APs (${routers.length + accessPoints.length})` },
              { id: 'PACKAGES', label: 'WiFi Packages (17)' },
              { id: 'SUBSCRIPTIONS', label: 'Router Owner Plans (5)' },
              { id: 'PAYMENTS', label: `M-Pesa Ledger (${transactions.length})` },
              { id: 'WITHDRAWALS', label: `Withdrawals (${pendingWithdrawalsCount} Pending)` },
              { id: 'INSTALLATIONS', label: `Installations (${installations.length})` },
              { id: 'HOSTS', label: `WiFi Host Apps (${hostApplications.length})` },
              { id: 'AUDIT_LOGS', label: 'Audit Logs' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
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
            {/* KPI Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="text-[11px] text-slate-400">Total Customers</div>
                <div className="text-2xl font-black text-white mt-1">1,245</div>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="text-[11px] text-slate-400">Router Owners</div>
                <div className="text-2xl font-black text-amber-400 mt-1">84</div>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="text-[11px] text-slate-400">Active Routers</div>
                <div className="text-2xl font-black text-sky-400 mt-1">{routers.length}</div>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="text-[11px] text-slate-400">Total AP Nodes</div>
                <div className="text-2xl font-black text-white mt-1">{accessPoints.length}</div>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="text-[11px] text-slate-400">Total Revenue Recorded</div>
                <div className="text-sm font-extrabold text-emerald-400 font-mono mt-1">
                  KES {totalRev.toLocaleString()}
                </div>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="text-[11px] text-slate-400">Pending Withdrawals</div>
                <div className="text-2xl font-black text-amber-400 mt-1">{pendingWithdrawalsCount}</div>
              </div>
            </div>

            {/* Quick Overview Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent System Audit Logs */}
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white">Platform Audit Stream</h3>
                  <button
                    onClick={() => setActiveTab('AUDIT_LOGS')}
                    className="text-xs text-sky-400 hover:text-sky-300"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-2">
                  {auditLogs.slice(0, 4).map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs space-y-1"
                    >
                      <div className="flex justify-between">
                        <span className="font-mono text-sky-400 font-bold">{log.action}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-slate-300">{log.details}</div>
                      <div className="text-[11px] text-slate-500">
                        By {log.userName} ({log.userRole}) · IP: {log.ipAddress}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Withdrawals Queue */}
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white">Pending M-Pesa Withdrawals</h3>
                  <button
                    onClick={() => setActiveTab('WITHDRAWALS')}
                    className="text-xs text-sky-400 hover:text-sky-300"
                  >
                    Review Queue
                  </button>
                </div>

                <div className="space-y-2">
                  {withdrawals.slice(0, 3).map((w) => (
                    <div
                      key={w.id}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">{w.userName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {w.phone} · KES {w.amountKes.toLocaleString()}
                        </div>
                      </div>

                      {w.status === 'PENDING' ? (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleWithdrawalAction(w.id, 'APPROVE')}
                            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleWithdrawalAction(w.id, 'REJECT')}
                            className="px-2.5 py-1 bg-red-950 text-red-400 text-xs font-semibold rounded-lg border border-red-800/50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-emerald-400 font-bold">{w.status}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS */}
        {activeTab === 'USERS' && (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">User Accounts & Roles</h2>
                <p className="text-xs text-slate-400">
                  Manage Customers, Router Owners, and Technicians across the platform.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user by name, email, phone..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Registered</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-white">{u.name}</td>
                      <td className="p-3 text-slate-400">{u.email}</td>
                      <td className="p-3 font-mono text-slate-300">{u.phone}</td>
                      <td className="p-3 font-semibold text-amber-300">{u.role}</td>
                      <td className="p-3 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                            u.status === 'ACTIVE'
                              ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/50'
                              : 'text-red-400 bg-red-950/60 border border-red-800/50'
                          }`}
                        >
                          ● {u.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {u.role !== 'SUPER_ADMIN' && (
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.status)}
                            className="text-[11px] text-sky-400 hover:underline font-semibold"
                          >
                            {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ROUTERS & APs */}
        {activeTab === 'ROUTERS' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <h2 className="text-xl font-bold text-white">All Platform Routers</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Router Name</th>
                      <th className="p-3">Owner</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Model</th>
                      <th className="p-3">IP Address</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Active Users</th>
                      <th className="p-3">Traffic</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {routers.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-white">{r.name}</td>
                        <td className="p-3 text-amber-300">{r.ownerName}</td>
                        <td className="p-3 text-slate-400">{r.location}</td>
                        <td className="p-3">{r.model}</td>
                        <td className="p-3 font-mono text-sky-400">{r.ipAddress}</td>
                        <td className="p-3">
                          <span className="text-emerald-400 font-bold">● {r.status}</span>
                        </td>
                        <td className="p-3 font-bold text-white">{r.activeUsers}</td>
                        <td className="p-3 font-mono text-emerald-400">
                          {r.downloadTrafficMbps}M / {r.uploadTrafficMbps}M
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PACKAGES */}
        {activeTab === 'PACKAGES' && (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Customer WiFi Packages Catalog</h2>
              <p className="text-xs text-slate-400">
                Official packages configured across all public hotspots.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Package Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Price (KES)</th>
                    <th className="p-3">Bandwidth Speed</th>
                    <th className="p-3">Device Limit</th>
                    <th className="p-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-white">{pkg.name}</td>
                      <td className="p-3 font-mono text-slate-400 text-[11px]">{pkg.category}</td>
                      <td className="p-3">{pkg.durationLabel}</td>
                      <td className="p-3 font-mono font-bold text-amber-400">
                        KES {pkg.priceKes.toLocaleString()}
                      </td>
                      <td className="p-3 text-sky-400 font-mono font-semibold">{pkg.speedLabel}</td>
                      <td className="p-3 font-mono">{pkg.deviceLimit} Devices</td>
                      <td className="p-3 text-slate-400 text-[11px]">{pkg.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: SUBSCRIPTIONS */}
        {activeTab === 'SUBSCRIPTIONS' && (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Router Owner 30-Day Subscription Plans</h2>
              <p className="text-xs text-slate-400">
                Hardware limits and pricing tiers available to independent hotspot operators.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {subscriptionPlans.map((sp) => (
                <div key={sp.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white">{sp.name}</h3>
                  <div className="text-lg font-black text-amber-400 font-mono">
                    KES {sp.priceKes.toLocaleString()}
                  </div>
                  <div className="text-xs space-y-1.5 text-slate-300">
                    <div>Max Routers: <strong>{sp.maxRouters}</strong></div>
                    <div>Max APs: <strong>{sp.maxAccessPoints}</strong></div>
                    <div>Max Customers: <strong>{sp.maxCustomers.toLocaleString()}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: PAYMENTS */}
        {activeTab === 'PAYMENTS' && (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Global M-Pesa & Payment Ledger</h2>
              <p className="text-xs text-slate-400">
                Every transaction processed through Safaricom Daraja STK push and voucher redemption.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Receipt #</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Service</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-white">{tx.receiptNumber}</td>
                      <td className="p-3 font-semibold text-slate-200">{tx.userName}</td>
                      <td className="p-3 text-sky-300">{tx.packageName}</td>
                      <td className="p-3 font-mono font-bold text-amber-400">
                        KES {tx.amountKes.toLocaleString()}
                      </td>
                      <td className="p-3">{tx.paymentMethod}</td>
                      <td className="p-3 font-mono text-slate-400">{tx.reference}</td>
                      <td className="p-3 font-mono text-slate-400">{tx.mpesaPhone || '—'}</td>
                      <td className="p-3">
                        {new Date(tx.createdAt).toLocaleDateString('en-KE', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: WITHDRAWALS */}
        {activeTab === 'WITHDRAWALS' && (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Disbursement Approval Queue</h2>
              <p className="text-xs text-slate-400">
                Approve or reject customer and host commission payouts.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Withdrawal ID</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">M-Pesa Phone</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Requested At</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-white">{w.id}</td>
                      <td className="p-3 font-semibold text-slate-200">{w.userName}</td>
                      <td className="p-3 text-slate-400">{w.userRole}</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">
                        KES {w.amountKes.toLocaleString()}
                      </td>
                      <td className="p-3 font-mono text-slate-300">{w.phone}</td>
                      <td className="p-3">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                            w.status === 'COMPLETED'
                              ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/50'
                              : w.status === 'PENDING'
                              ? 'text-amber-400 bg-amber-950/60 border border-amber-800/50'
                              : 'text-red-400 bg-red-950/60'
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{new Date(w.requestedAt).toLocaleDateString()}</td>
                      <td className="p-3">
                        {w.status === 'PENDING' ? (
                          <div className="flex gap-2">
                            <button
                              disabled={actionLoading}
                              onClick={() => handleWithdrawalAction(w.id, 'APPROVE')}
                              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleWithdrawalAction(w.id, 'REJECT')}
                              className="px-2.5 py-1 bg-red-950 hover:bg-red-900 text-red-400 text-xs font-semibold rounded-lg border border-red-800/40 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs">Closed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 8: INSTALLATIONS */}
        {activeTab === 'INSTALLATIONS' && (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Technician Field Installations</h2>
              <p className="text-xs text-slate-400">
                Wired (KES 2,999) and Wireless PtP (KES 8,499) jobs dispatched to technicians.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Job ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Address</th>
                    <th className="p-3">Assigned Tech</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {installations.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-white">{inst.id}</td>
                      <td className="p-3 font-semibold text-slate-200">
                        {inst.userName} ({inst.phone})
                      </td>
                      <td className="p-3 text-sky-400 font-semibold">{inst.type}</td>
                      <td className="p-3 font-mono font-bold text-amber-400">KES {inst.priceKes}</td>
                      <td className="p-3 text-slate-400">{inst.location}</td>
                      <td className="p-3 text-slate-300">
                        {inst.assignedTechnicianName || 'Unassigned'}
                      </td>
                      <td className="p-3">
                        <span className="text-emerald-400 font-bold">● {inst.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 9: HOST APPLICATIONS */}
        {activeTab === 'HOSTS' && (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">BRISK WiFi Host Applications</h2>
              <p className="text-xs text-slate-400">
                Evaluate building and business owners offering fiber connections to expand BRISK hotspots.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Applicant Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Physical Location</th>
                    <th className="p-3">ISP Provider</th>
                    <th className="p-3">Current Speed</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {hostApplications.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-white">{h.fullName}</td>
                      <td className="p-3 font-mono text-slate-300">{h.phone}</td>
                      <td className="p-3 text-slate-400">{h.location}</td>
                      <td className="p-3 text-sky-300">{h.internetProvider}</td>
                      <td className="p-3 font-mono">{h.speedMbps} Mbps</td>
                      <td className="p-3">
                        <span className="text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded text-[10px]">
                          {h.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => alert(`Approved host application for ${h.fullName}`)}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg"
                        >
                          Approve Host
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 10: AUDIT LOGS */}
        {activeTab === 'AUDIT_LOGS' && (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Immutable Platform Audit Ledger</h2>
              <p className="text-xs text-slate-400">
                Chronological record of system events, payments, user authentications, and router actions.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Resource</th>
                    <th className="p-3">Actor</th>
                    <th className="p-3">IP Address</th>
                    <th className="p-3">Result</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {auditLogs.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono text-slate-400 text-[11px]">
                        {new Date(l.timestamp).toLocaleString('en-KE')}
                      </td>
                      <td className="p-3 font-mono font-bold text-sky-400">{l.action}</td>
                      <td className="p-3 text-slate-300">{l.resource}</td>
                      <td className="p-3 text-white">
                        {l.userName} ({l.userRole})
                      </td>
                      <td className="p-3 font-mono text-slate-400">{l.ipAddress}</td>
                      <td className="p-3">
                        <span className="text-emerald-400 font-bold">● {l.result}</span>
                      </td>
                      <td className="p-3 text-slate-300">{l.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
