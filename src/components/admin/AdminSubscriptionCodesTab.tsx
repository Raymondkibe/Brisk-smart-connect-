import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  Users,
  Search,
  Check,
  AlertCircle,
  RefreshCw,
  CreditCard,
  Zap,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Phone,
  Calendar,
  XCircle,
  Copy,
  Receipt,
  Radio,
} from 'lucide-react';
import type { ManualSubscriptionRequest, SubscriptionPlan, User } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface AdminSubscriptionCodesTabProps {
  subscriptionPlans: SubscriptionPlan[];
  users: User[];
}

export const AdminSubscriptionCodesTab: React.FC<AdminSubscriptionCodesTabProps> = ({
  subscriptionPlans,
  users,
}) => {
  const [manualRequests, setManualRequests] = useState<ManualSubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Direct Auto-Activation state for admin
  const [directOwnerId, setDirectOwnerId] = useState<string>('');
  const [directRef, setDirectRef] = useState<string>('');
  const [directDays, setDirectDays] = useState<number>(30);
  const [directPlanId, setDirectPlanId] = useState<string>(subscriptionPlans[2]?.id || 'sub-plan-pro');
  const [directAmount, setDirectAmount] = useState<number>(1500);
  const [directActivating, setDirectActivating] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  const routerOwners = users.filter((u) => u.role === 'ROUTER_OWNER');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminSubscriptionRequests();
      if (res && res.requests) {
        setManualRequests(res.requests);
      }
    } catch (err: any) {
      console.warn('Could not fetch subscription requests:', err);
      // Fallback seed demo requests
      setManualRequests([
        {
          id: 'req-sub-01',
          ownerId: 'usr-owner-01',
          ownerName: 'Raymond Kamau',
          businessName: 'Kiambu Smart WiFi Networks',
          phone: '0722000111',
          planId: 'sub-plan-pro',
          planName: 'BRISK Pro Host (30 Days)',
          amountKes: 1500,
          transactionReference: 'QKR49X2PLA',
          status: 'PENDING_APPROVAL',
          submittedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          adminNotes: 'Transition code QKR49X2PLA submitted via PayBill 222111 Acct 5414200. Awaiting 1-click auto-activation.',
        },
        {
          id: 'req-sub-02',
          ownerId: 'usr-owner-02',
          ownerName: 'David Mwangi',
          businessName: 'Ruiru FastNet Hotspots',
          phone: '0712883849',
          planId: 'sub-plan-ent',
          planName: 'ISP Enterprise (60 Days)',
          amountKes: 2800,
          transactionReference: 'TK88291X0Z',
          status: 'PENDING_APPROVAL',
          submittedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          adminNotes: 'M-Pesa payment received for 2-month renewal. Awaiting admin approval.',
        },
        {
          id: 'req-sub-03',
          ownerId: 'usr-owner-03',
          ownerName: 'Grace Wanjiku',
          businessName: 'Thika Metro Connect',
          phone: '0799123456',
          planId: 'sub-plan-pro',
          planName: 'BRISK Pro Host (30 Days)',
          amountKes: 1500,
          transactionReference: 'SKL920148M',
          status: 'APPROVED',
          submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          approvedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
          adminNotes: 'Approved by Super Admin. Automatically activated.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApproveAndAutoActivate = async (request: ManualSubscriptionRequest, customDays = 30) => {
    setApprovingId(request.id);
    setActionSuccess(null);
    try {
      const res = await api.approveManualSubscriptionPayment({
        requestId: request.id,
        durationDays: customDays,
      });

      // Update local state immediately
      setManualRequests((prev) =>
        prev.map((r) =>
          r.id === request.id
            ? {
                ...r,
                status: 'APPROVED',
                approvedAt: new Date().toISOString(),
                adminNotes: `Approved and automatically activated by Super Admin (+${customDays} days).`,
              }
            : r
        )
      );

      setActionSuccess(
        `✓ Transition Code "${request.transactionReference}" approved! ${request.ownerName}'s subscription has been automatically activated for +${customDays} days.`
      );
      setTimeout(() => setActionSuccess(null), 8000);
    } catch (err: any) {
      alert(err.message || 'Failed to approve transition code.');
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectPayment = async (request: ManualSubscriptionRequest) => {
    const reason = prompt(
      `Please provide a reason for rejecting transition code "${request.transactionReference}":`,
      'M-Pesa code not found on statement'
    );
    if (!reason) return;

    setRejectingId(request.id);
    try {
      await api.rejectManualSubscriptionPayment({
        requestId: request.id,
        reason,
      });

      setManualRequests((prev) =>
        prev.map((r) =>
          r.id === request.id
            ? { ...r, status: 'REJECTED', adminNotes: `Rejected: ${reason}` }
            : r
        )
      );
      setActionSuccess(`Payment reference "${request.transactionReference}" marked as rejected.`);
      setTimeout(() => setActionSuccess(null), 6000);
    } catch (err: any) {
      alert(err.message || 'Failed to reject payment.');
    } finally {
      setRejectingId(null);
    }
  };

  const handleDirectAutoActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directOwnerId) {
      alert('Please select a router owner to activate.');
      return;
    }
    if (!directRef.trim()) {
      alert('Please enter an M-Pesa or Cash transaction code.');
      return;
    }

    setDirectActivating(true);
    setActionSuccess(null);
    const targetOwner = routerOwners.find((o) => o.id === directOwnerId);

    try {
      // 1. Submit manual payment
      const subRes = await api.submitManualSubscriptionPayment({
        ownerId: directOwnerId,
        ownerName: targetOwner?.name || 'Router Owner',
        phone: targetOwner?.phone || '0712000000',
        planId: directPlanId,
        planName: subscriptionPlans.find((p) => p.id === directPlanId)?.name || 'BRISK Pro Host',
        amountKes: Number(directAmount),
        transactionReference: directRef.trim().toUpperCase(),
      });

      // 2. Immediately approve & auto-activate
      if (subRes && subRes.request) {
        await api.approveManualSubscriptionPayment({
          requestId: subRes.request.id,
          durationDays: directDays,
        });

        const newReq: ManualSubscriptionRequest = {
          ...subRes.request,
          status: 'APPROVED',
          approvedAt: new Date().toISOString(),
          adminNotes: `Directly approved & auto-activated by Admin (+${directDays} days).`,
        };

        setManualRequests((prev) => [newReq, ...prev]);
        setActionSuccess(
          `✓ Success! ${targetOwner?.name}'s account has been automatically activated for +${directDays} days under transition code "${directRef.trim().toUpperCase()}".`
        );
        setDirectRef('');
        setTimeout(() => setActionSuccess(null), 8000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to auto-activate owner.');
    } finally {
      setDirectActivating(false);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  const filteredRequests = manualRequests.filter((r) => {
    const matchesSearch =
      r.transactionReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.planName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') return r.status === 'PENDING_APPROVAL';
    if (statusFilter === 'APPROVED') return r.status === 'APPROVED';
    if (statusFilter === 'REJECTED') return r.status === 'REJECTED';
    return true;
  });

  const pendingRequests = manualRequests.filter((r) => r.status === 'PENDING_APPROVAL');
  const approvedRequests = manualRequests.filter((r) => r.status === 'APPROVED');
  const totalApprovedKes = approvedRequests.reduce((sum, r) => sum + (r.amountKes || 0), 0);

  return (
    <div className="space-y-6">
      {/* BRISK Sleek Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a1224] border border-blue-900/30 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Subscription Approvals & Transition Codes
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Review M-Pesa transition codes submitted by router owners for Paybill <strong className="text-cyan-400 font-mono">222111</strong> Acc <strong className="text-cyan-400 font-mono">5414200</strong>. When you click <strong className="text-emerald-400">Approve & Auto-Activate</strong>, the owner's subscription automatically activates immediately—no activation codes required!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchRequests}
            disabled={loading}
            className="px-4 py-2 bg-[#131f38] hover:bg-[#1a2b4d] text-slate-200 border border-slate-700/80 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
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
        {/* KPI 1: Pending Approvals */}
        <div className="bg-[#0b1426] border border-slate-800/90 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Pending Transition Codes
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2 font-mono">
            {pendingRequests.length}
          </div>
          <span className="text-[10px] text-amber-400/90 font-semibold mt-1 inline-block">
            {pendingRequests.length > 0 ? 'Action required: 1-click auto-activation' : 'All transition codes approved'}
          </span>
        </div>

        {/* KPI 2: Auto-Activated Accounts */}
        <div className="bg-[#0b1426] border border-slate-800/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Auto-Activated Accounts
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">
            {approvedRequests.length}
          </div>
          <span className="text-[10px] text-emerald-400/90 font-semibold mt-1 inline-block">
            Directly extended & unlocked
          </span>
        </div>

        {/* KPI 3: Total Subscription Revenue */}
        <div className="bg-[#0b1426] border border-slate-800/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              SaaS License Takings
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-cyan-400 mt-2 font-mono">
            KES {totalApprovedKes.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">
            Platform SaaS revenue verified
          </span>
        </div>

        {/* KPI 4: Active Router Owners */}
        <div className="bg-[#0b1426] border border-slate-800/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Registered Operators
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            {routerOwners.length}
          </div>
          <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">
            Hotspot host accounts
          </span>
        </div>
      </div>

      {/* Main Grid: Pending Transition Codes Queue & Direct Activation Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Transition Codes Queue (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0b1426] border border-slate-800/90 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Pending Transition Codes Queue</h3>
                <span className="text-[10px] text-slate-400">
                  Owners awaiting M-Pesa approval and automatic activation
                </span>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {pendingRequests.length} Pending
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="p-8 text-center bg-[#080e1b] rounded-xl border border-slate-800/80">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-white">All transition codes approved!</p>
              <p className="text-[11px] text-slate-400 mt-1">
                When router owners make payment and enter their M-Pesa transition code, it will appear here for 1-click automatic activation.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-[#0e1933] border border-amber-500/30 hover:border-amber-500/60 transition-all space-y-3 shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">{req.ownerName}</span>
                        <span className="text-[11px] text-slate-400 font-mono">({req.phone})</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                          PENDING APPROVAL
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 mt-1">
                        Business: <strong className="text-white">{req.businessName || 'Hotspot Operator'}</strong>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-amber-400 font-mono">
                        KES {req.amountKes.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-400 block">{req.planName}</span>
                    </div>
                  </div>

                  {/* Transition Code Card */}
                  <div className="p-3 bg-[#080d1a] rounded-xl border border-blue-900/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-cyan-400" />
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          M-Pesa Transition Code
                        </span>
                        <span className="font-mono text-base font-black text-cyan-300 tracking-wider">
                          {req.transactionReference}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyCode(req.transactionReference, req.id)}
                        className="p-1.5 bg-[#131f38] hover:bg-[#1a2b4d] text-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        title="Copy Transition Code"
                      >
                        {copiedCodeId === req.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 1-Click Action Buttons */}
                  <div className="flex items-center justify-between pt-1 gap-2">
                    <span className="text-[10px] text-slate-400">
                      Submitted: {new Date(req.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={rejectingId === req.id}
                        onClick={() => handleRejectPayment(req)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>

                      <button
                        type="button"
                        disabled={approvingId === req.id}
                        onClick={() => handleApproveAndAutoActivate(req, 30)}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        {approvingId === req.id ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Auto-Activating...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 text-white" />
                            <span>Approve & Auto-Activate (+30d)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Direct Auto-Activation Tool for Cash/Bank (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0b1426] border border-slate-800/90 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>
              <h3 className="text-sm font-bold text-white">Direct Auto-Activation Tool</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-cyan-400 border border-blue-500/20">
              Admin Direct
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Did an owner pay via cash, direct bank deposit, or call with an M-Pesa message? Select the owner and enter their transition code to activate their account immediately.
          </p>

          <form onSubmit={handleDirectAutoActivate} className="space-y-4 text-xs">
            {/* Target Owner */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Select Router Owner</label>
              <select
                value={directOwnerId}
                onChange={(e) => setDirectOwnerId(e.target.value)}
                className="w-full px-3 py-2 bg-[#080d1a] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                required
              >
                <option value="">-- Choose Router Owner --</option>
                {routerOwners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Transition / Reference Code */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                M-Pesa / Bank Transition Code
              </label>
              <input
                type="text"
                value={directRef}
                onChange={(e) => setDirectRef(e.target.value.toUpperCase())}
                placeholder="e.g. QKR49X2PLA or BANK-TX-8492"
                className="w-full px-3 py-2 bg-[#080d1a] border border-slate-800 rounded-xl text-white font-mono uppercase tracking-wider focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
                required
              />
            </div>

            {/* Extension Duration */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1.5">
                Activation Extension Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { days: 30, label: '30 Days (1 Mo)' },
                  { days: 60, label: '60 Days (2 Mo)' },
                  { days: 90, label: '90 Days (3 Mo)' },
                ].map((item) => (
                  <button
                    key={item.days}
                    type="button"
                    onClick={() => setDirectDays(item.days)}
                    className={`py-2 px-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                      directDays === item.days
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-[#080d1a] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    +{item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Amount (KES)</label>
                <input
                  type="number"
                  value={directAmount}
                  onChange={(e) => setDirectAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#080d1a] border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target Plan</label>
                <select
                  value={directPlanId}
                  onChange={(e) => setDirectPlanId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#080d1a] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {subscriptionPlans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={directActivating}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {directActivating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Activating Subscription...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white text-white" />
                  Instant Auto-Activate (+{directDays} Days)
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Approved Transition Codes & Activation Ledger Table */}
      <div className="bg-[#0b1426] border border-slate-800/90 rounded-2xl overflow-hidden shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-cyan-400" />
              Transition Codes & Auto-Activation Ledger
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              History of all M-Pesa transition codes, verification states, and automatically activated subscriptions.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transition code, owner..."
                className="pl-8 pr-3 py-1.5 bg-[#080d1a] border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 w-48 sm:w-60"
              />
            </div>

            <div className="flex bg-[#080d1a] border border-slate-800 rounded-xl p-0.5 text-xs">
              {(['ALL', 'PENDING', 'APPROVED'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080d1a] border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Transition Code</th>
                <th className="p-3">Router Owner</th>
                <th className="p-3">Plan Requested</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Submitted At</th>
                <th className="p-3">Admin Notes / Outcome</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500 text-xs">
                    No transition codes match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((item) => {
                  const isApproved = item.status === 'APPROVED';
                  const isPending = item.status === 'PENDING_APPROVAL';

                  return (
                    <tr key={item.id} className="hover:bg-[#0e1933]/50 transition-colors">
                      {/* Transition Code */}
                      <td className="p-3 font-mono font-black text-cyan-300 text-sm tracking-wide">
                        {item.transactionReference}
                      </td>

                      {/* Owner */}
                      <td className="p-3">
                        <div className="font-bold text-white">{item.ownerName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.phone}</div>
                      </td>

                      {/* Plan */}
                      <td className="p-3 text-slate-200">
                        {item.planName}
                      </td>

                      {/* Amount */}
                      <td className="p-3 font-mono font-bold text-amber-400">
                        KES {item.amountKes.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isApproved
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isPending
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isApproved ? 'AUTO-ACTIVATED' : item.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Submitted At */}
                      <td className="p-3 text-slate-400 text-[11px]">
                        {new Date(item.submittedAt).toLocaleDateString()}{' '}
                        {new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Admin Notes */}
                      <td className="p-3 text-slate-300 text-[11px] max-w-xs truncate">
                        {item.adminNotes || '—'}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        {isPending ? (
                          <button
                            type="button"
                            onClick={() => handleApproveAndAutoActivate(item, 30)}
                            disabled={approvingId === item.id}
                            className="px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap"
                          >
                            Approve
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active
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
