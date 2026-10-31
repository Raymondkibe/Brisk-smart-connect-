import React from 'react';

export const DashboardSkeleton: React.FC<{ type?: 'ADMIN' | 'OWNER' | 'CUSTOMER' }> = ({ type = 'OWNER' }) => {
  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0b132b] p-5 rounded-2xl border border-slate-800">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-800 rounded-lg"></div>
          <div className="h-3 w-72 bg-slate-800/60 rounded-md"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-slate-800 rounded-xl"></div>
          <div className="h-9 w-32 bg-slate-800 rounded-xl"></div>
        </div>
      </div>

      {/* Metric Cards Skeleton Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 bg-[#0b132b] border border-slate-800 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-slate-800 rounded"></div>
              <div className="h-5 w-5 bg-slate-800 rounded-full"></div>
            </div>
            <div className="h-8 w-28 bg-slate-800 rounded-lg"></div>
            <div className="h-2.5 w-20 bg-slate-800/50 rounded"></div>
          </div>
        ))}
      </div>

      {/* Main Content Split Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 bg-[#0b132b] border border-slate-800 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 w-40 bg-slate-800 rounded"></div>
            <div className="h-4 w-20 bg-slate-800 rounded"></div>
          </div>
          <div className="h-56 bg-slate-900/80 rounded-xl border border-slate-800/60 flex items-center justify-center">
            <div className="h-2 w-3/4 bg-slate-800/40 rounded-full"></div>
          </div>
        </div>

        <div className="lg:col-span-4 p-6 bg-[#0b132b] border border-slate-800 rounded-2xl space-y-4">
          <div className="h-5 w-32 bg-slate-800 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800/40">
                <div className="w-8 h-8 rounded-full bg-slate-800 shrink-0"></div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 w-3/4 bg-slate-800 rounded"></div>
                  <div className="h-2 w-1/2 bg-slate-800/60 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
