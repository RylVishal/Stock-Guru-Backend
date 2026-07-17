import React from 'react';

export default function PortfolioMetrics({ analytics }) {
  if (!analytics) return null;

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val || 0);
  };

  return (
    /* UPGRADED: Fluid responsive columns prevent clipping layout breakages */
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      
      {/* Total Valuation Card */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-blue-200 transition-colors w-full min-w-0">
        <span className="text-[10px] text-slate-600 font-mono tracking-wider block uppercase font-bold truncate">Total Valuation</span>
        {/* IMPROVED: text-lg on mobile, scales to text-xl on tablets+ */}
        <p className="text-lg sm:text-xl font-mono font-bold text-slate-800 mt-1 break-words">{formatINR(analytics.totalAccountValue)}</p>
      </div>

      {/* Invested Capital Card */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-blue-200 transition-colors w-full min-w-0">
        <span className="text-[10px] text-slate-600 font-mono tracking-wider block uppercase font-bold truncate">Invested Capital</span>
        <p className="text-lg sm:text-xl font-mono font-bold text-slate-600 mt-1 break-words">{formatINR(analytics.investedValue)}</p>
      </div>

      {/* Unrealized P&L Card */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-blue-200 transition-colors w-full min-w-0">
        <span className="text-[10px] text-slate-600 font-mono tracking-wider block uppercase font-bold truncate">Unrealized P&L</span>
        <div className={`text-lg sm:text-xl font-mono font-bold mt-1 break-words ${analytics.unrealizedPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {analytics.unrealizedPnL >= 0 ? '+' : ''}{formatINR(analytics.unrealizedPnL)} 
          {/* IMPROVED: Flex block keeps percentage aligned clearly on all breakpoints */}
          <span className="text-xs block font-sans font-semibold mt-0.5">
            ({analytics.returnPercentage?.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Liquid Cash Card */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-blue-200 transition-colors w-full min-w-0">
        <span className="text-[10px] text-slate-600 font-mono tracking-wider block uppercase font-bold truncate">Liquid Cash</span>
        <p className="text-lg sm:text-xl font-mono font-bold text-blue-600 mt-1 break-words">{formatINR(analytics.cashBalance)}</p>
      </div>
    </div>
  );
}


