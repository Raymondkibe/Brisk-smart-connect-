import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Users,
  Smartphone,
  CreditCard,
  Receipt,
  Radio,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import type { Transaction, User, WifiPackage, SubscriptionPlan } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface AdminPendingTransactionsTabProps {
  users?: User[];
  wifiPackages?: WifiPackage[];
  subscriptionPlans?: SubscriptionPlan[];
  onRefreshParentState?: () => void;
}

export const AdminPendingTransactionsTab: React.FC<AdminPendingTransactionsTabProps> = ({
  users = [],
  wifiPackages = [],
  subscriptionPlans = [],
  onRefreshParentState,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CUSTOMER_WIFI' | 'ROUTER_OWNER_SUBSCRIPTION'>('ALL');
  const [statusTab, setStatusTab] = useState<'PENDING' | 'ALL'>('PENDING');

  // Quick Direct Validation Box
  const [directRef, setDirectRef] = useState('');
  const [directValidating, setDirectValidating] = useState(false);

  const fetchTransactions = async () => {
    try {
      const res = await api.getPendingTransactions();
      if (res && res.transactions) {
        setTransactions(res.transactions);
      }
    } catch (err: any) {
      console.warn('Could not fetch pending transactions from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // Poll every 5 seconds to catch live payments submitted by customers or owners
    const interval = setInterval(fetchTransactions, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleValidateAndActivate = async (tx: Transaction) => {
    setValidatingId(tx.id);
    setActionSuccess(null);
    try {
      const res = await api.validateAndActivateTransaction({
        transactionId: tx.id,
        reference: tx.reference,
      });

      // Update local state
      setTransactions((prev) =>
        prev.map((t) => (t.id === tx.id ? { ...t, status: 'SUCCESS' as const } : t))
      );

      setActionSuccess(
        `✓ Transaction "${tx.reference}" validated! Account for ${tx.userName} (${tx.packageName}) has been automatically activated.`
      );
      if (onRefreshParentState) onRefreshParentState();
      setTimeout(() => setActionSuccess(null), 8000);
    } catch (err: any) {
      alert(err.message || 'Failed to validate and activate transaction.');
    } finally {
      setValidatingId(null);
    }
  };

  const handleReject = async (tx: Transaction) => {
    const reason = prompt(
      `Please provide reason for rejecting transaction "${tx.reference}":`,
      'M-Pesa reference not found on statement'
    );
    if (!reason) return;

    setRejectingId(tx.id);
    try {
      await api.rejectTransaction({
        transactionId: tx.id,
        reason,
      });

      setTransactions((prev) =>
        prev.map((t) => (t.id === tx.id ? { ...t, status: 'FAILED' as const } : t))
      );

      setActionSuccess(`Transaction "${tx.reference}" marked as rejected.`);
      setTimeout(() => setActionSuccess(null), 6000);
    } catch (err: any) {
      alert(err.message || 'Failed to reject transaction.');
    } finally {
      setRejectingId(null);
    }
  };

  const handleDirectValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRef = directRef.trim().toUpperCase();
    if (!cleanRef) {
      alert('Please enter an M-Pesa transaction reference code.');
      return;
    }

    setDirectValidating(true);
    setActionSuccess(null);
    try {
      const res = await api.validateAndActivateTransaction({
        reference: cleanRef,
      });
      setActionSuccess(res.message);
      setDirectRef('');
      fetchTransactions();
      if (onRefreshParentState) onRefreshParentState();
      setTimeout(() => setActionSuccess(null), 8000);
    } catch (err: any) {
      alert(err.message || 'Failed to validate direct reference.');
    } finally {
      setDirectValidating(false);
    }
  };

  // Filtered transactions
  const pendingOnly = transactions.filter(
    (t) => t.status === 'WAITING' || (t.status as string) === 'PENDING' || t.status === 'PROCESSING'
  );

  const displayedList = (statusTab === 'PENDING' ? pendingOnly : transactions).filter((t) => {
    const matchesSearch =
      t.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.mpesaPhone && t.mpesaPhone.includes(searchQuery)) ||
      (t.packageName && t.packageName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (typeFilter === 'CUSTOMER_WIFI') return t.type === 'CUSTOMER_WIFI' || t.type === 'CUSTOMER_PPPOE';
    if (typeFilter === 'ROUTER_OWNER_SUBSCRIPTION') return t.type === 'ROUTER_OWNER_SUBSCRIPTION';
    return true;
  });

  const pendingCustomerCount = pendingOnly.filter(
    (t) => t.type === 'CUSTOMER_WIFI' || t.type === 'CUSTOMER_PPPOE'
  ).length;
  const pendingOwnerCount = pendingOnly.filter((t) => t.type === 'ROUTER_OWNER_SUBSCRIPTION').length;
  const totalPendingKes = pendingOnly.reduce((sum, t) => sum + (t.amountKes || 0), 0);

  return (
    <div className="space-y-6 font-sans">
      {/* BRISK Sleek Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a1224] border border-blue-900/30 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Pending Transactions & Manual Account Activation
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Live stream of M-Pesa payment transition codes submitted by hotspot customers and router owners. When verified, click <strong className="text-emerald-400">Validate & Activate Account</strong> to immediately unlock customer internet access or extend router owner licenses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTransactions}
            disabled={loading}
            className="px-4 py-2 bg-[#131f38] hover:bg-[#1a2b4d] text-slate-200 border border-slate-700/80 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync Transactions
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-950/70 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-3 animate-fade-in shadow-lg shadow-emerald-950/40">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* BRISK KPI Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Pending Transactions */}
        <div className="bg-[#0b1426] border border-slate-800/90 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Pending Verification
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2 font-mono">
            {pendingOnly.length}
          </div>
          <span className="text-[10px] text-amber-400/90 font-semibold mt-1 inline-block">
            {pendingOnly.length > 0 ? 'Awaiting Super Admin activation' : 'Queue cleared'}
          </span>
        </div>

        {/* KPI 2: Total Pending Amount */}
        <div className="bg-[#0b1426] border border-slate-800/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Pending M-Pesa Total
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-cyan-400 mt-2 font-mono">
            KES {totalPendingKes.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">
            Unverified incoming payments
          </span>
        </div>

        {/* KPI 3: Customer WiFi Packages Pending */}
        <div className="bg-[#0b1426] border border-slate-800/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Customer WiFi Passes
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            {pendingCustomerCount}
          </div>
          <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">
            Hotspot guest accounts
          </span>
        </div>

        {/* KPI 4: Router Owner Licenses Pending */}
        <div className="bg-[#0b1426] border border-slate-800/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Owner Subscriptions
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">
            {pendingOwnerCount}
          </div>
          <span className="text-[10px] text-emerald-400/90 font-semibold mt-1 inline-block">
            ISP host renewals
          </span>
        </div>
      </div>

      {/* Quick Direct Validation Form Bar */}
      <div className="p-4 bg-[#0a1224] border border-blue-900/40 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white">Instant Code Validator</h4>
            <span className="text-[11px] text-slate-400">
              Validate any customer M-Pesa transaction reference and activate their account immediately
            </span>
          </div>
        </div>

        <form onSubmit={handleDirectValidate} className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-md">
          <input
            type="text"
            value={directRef}
            onChange={(e) => setDirectRef(e.target.value.toUpperCase())}
            placeholder="Enter code e.g. QKR839210P"
            className="flex-1 px-3 py-2 bg-[#080d1a] border border-slate-800 rounded-xl text-xs text-white font-mono uppercase tracking-wider focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
          />
          <button
            type="submit"
            disabled={directValidating || !directRef.trim()}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-60 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
          >
            {directValidating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>Validate & Activate</span>
          </button>
        </form>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#0b1426] border border-slate-800/90 rounded-2xl overflow-hidden shadow-sm p-5 space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex bg-[#080d1a] border border-slate-800 rounded-xl p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setStatusTab('PENDING')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusTab === 'PENDING'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Pending ({pendingOnly.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusTab('ALL')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  statusTab === 'ALL'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All History ({transactions.length})
              </button>
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e: any) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#080d1a] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="CUSTOMER_WIFI">Customer WiFi Purchases</option>
              <option value="ROUTER_OWNER_SUBSCRIPTION">Router Owner Subscriptions</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code, customer, phone..."
              className="pl-8 pr-3 py-1.5 bg-[#080d1a] border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 w-56 sm:w-64"
            />
          </div>
        </div>

        {/* Table of Transactions */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080d1a] border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">M-Pesa Reference</th>
                <th className="p-3">Account / User</th>
                <th className="p-3">Type</th>
                <th className="p-3">Requested Package / Plan</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Submitted</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayedList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                    <p className="font-semibold text-white">No pending transactions found.</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Customer WiFi payments and router owner renewal transition codes will appear here automatically for manual validation.
                    </p>
                  </td>
                </tr>
              ) : (
                displayedList.map((tx) => {
                  const isPending = tx.status === 'WAITING' || (tx.status as string) === 'PENDING' || tx.status === 'PROCESSING';
                  const isSuccess = tx.status === 'SUCCESS';
                  const isCustomer = tx.type === 'CUSTOMER_WIFI' || tx.type === 'CUSTOMER_PPPOE';

                  return (
                    <tr
                      key={tx.id}
                      className={`transition-colors ${
                        isPending ? 'bg-[#0e1933]/50 hover:bg-[#0e1933]' : 'hover:bg-[#080e1b]/50'
                      }`}
                    >
                      {/* Reference Code */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-cyan-300 text-sm tracking-wider">
                            {tx.reference}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(tx.reference, tx.id)}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                            title="Copy Transaction Code"
                          >
                            {copiedId === tx.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* User Info */}
                      <td className="p-3">
                        <div className="font-bold text-white">{tx.userName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {tx.mpesaPhone || 'No phone recorded'}
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCustomer
                              ? 'bg-blue-500/20 text-cyan-300 border border-blue-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {isCustomer ? 'HOTSPOT GUEST' : 'ROUTER OWNER'}
                        </span>
                      </td>

                      {/* Package Name */}
                      <td className="p-3 font-medium text-slate-200">
                        {tx.packageName || 'Standard Pass'}
                      </td>

                      {/* Amount */}
                      <td className="p-3 font-mono font-black text-amber-400 text-sm">
                        KES {tx.amountKes.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isSuccess
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isPending
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isPending ? 'PENDING VALIDATION' : tx.status}
                        </span>
                      </td>

                      {/* Submitted At */}
                      <td className="p-3 text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString()}{' '}
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleReject(tx)}
                              disabled={rejectingId === tx.id}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              type="button"
                              onClick={() => handleValidateAndActivate(tx)}
                              disabled={validatingId === tx.id}
                              className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-[11px] font-black rounded-lg shadow-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                            >
                              {validatingId === tx.id ? (
                                <>
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                  <span>Activating...</span>
                                </>
                              ) : (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Validate & Activate</span>
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-400 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Account Activated
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
