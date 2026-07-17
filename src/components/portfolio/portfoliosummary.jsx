import React from 'react';

export default function PortfolioSummary({ summary, isLoading }) {
  // Format numbers to clean Indian Rupees display
  const formatCurrency = (val) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  // --- SHIMMER UI LOADING STATE ---
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full animate-pulse">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            <div className="h-6 bg-slate-200 rounded w-3/4 mt-1"></div>
          </div>
        ))}
      </div>
    );
  }

  // --- ACTUAL DATA STATE ---
  // Destructured keys matching your backend payload exactly
  const { cashBalance = 0, totalInvested = 0, totalProfitLoss = 0, holdingsCount = 0 } = summary;
  
  // Calculate total portfolio net value
  const netAssetValue = cashBalance + totalInvested + totalProfitLoss;
  const isProfit = totalProfitLoss >= 0;

  // Calculate percentage return safely to avoid division by zero
  const pnlPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full font-sans">
      {/* Net Asset Value */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-[10px] text-slate-600 font-mono tracking-wider block uppercase font-bold">Net Asset Value</p>
        <p className="text-xl font-bold text-slate-900 mt-1 mb-0">{formatCurrency(netAssetValue)}</p>
      </div>

      {/* Total Invested */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-[10px] text-slate-600 font-mono tracking-wider block uppercase font-bold">Total Invested</p>
        <p className="text-xl font-medium text-slate-700 mt-1 mb-0">{formatCurrency(totalInvested)}</p>
      </div>

      {/* Cash Balance */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-[10px] text-slate-600 font-mono tracking-wider block uppercase font-bold">Available Balance</p>
        <p className="text-xl font-medium text-slate-700 mt-1 mb-0">{formatCurrency(cashBalance)}</p>
      </div>

      {/* Total P&L */}
      <div className={`p-4 rounded-xl border shadow-sm m-0 ${isProfit ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'}`}>
        <p className="text-[10px] text-slate-600 font-mono tracking-wider block uppercase font-bold">Total Profit / Loss</p>
        <div className="flex items-baseline space-x-2 mt-1">
          <p className={`text-xl font-bold m-0 ${isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
            {isProfit ? '▲' : '▼'} {formatCurrency(Math.abs(totalProfitLoss))}
          </p>
          <p className={`text-xs font-semibold m-0 ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
            ({isProfit ? '+' : ''}{pnlPercentage.toFixed(2)}%)
          </p>
        </div>
      </div>
    </div>
  );
}

