import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/auth';
import PieChart from '../stock/PieChart';
import BarChart from '../stock/BarChart';

export default function PortfolioAnalytics({ analyticsData }) {
  const [analytics, setAnalytics] = useState(analyticsData);
  const [isLoading, setIsLoading] = useState(!analyticsData);
  const [error, setError] = useState('');

  useEffect(() => {
    if (analyticsData) {
      setAnalytics(analyticsData);
      setIsLoading(false);
      return;
    }

    fetchPortfolioAnalytics();
  }, [analyticsData]);

  const fetchPortfolioAnalytics = async () => {
    try {
      const response = await apiClient.get('/portfolio/analytics');
      if (response.data?.success) {
        setAnalytics(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch portfolio analytics:', err);
      setError('Unable to load portfolio analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="h-5 bg-slate-200 rounded w-1/3 animate-pulse"></div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <p className="text-xs text-slate-600 text-center font-mono">{error || 'No analytics available'}</p>
      </div>
    );
  }

  const { analytics: data, topWinner, topLoser, holdings } = analytics;

  // Prepare holdings distribution data for pie chart
  const holdingsDistribution = holdings?.map(holding => ({
    label: holding.symbol,
    value: holding.currentValue || 0
  })) || [];

  // Prepare P&L data for bar chart
  const pnlData = holdings?.map(holding => ({
    label: holding.symbol,
    value: holding.pnl || 0
  })) || [];

  const formatCurrency = (value) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(2)}K`;
    }
    return `₹${value.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Overview Cards */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 m-0">Portfolio Overview</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
            <span className="text-[10px] text-slate-600 font-mono block uppercase">Portfolio Value</span>
            <span className="text-sm font-bold text-slate-700 font-mono block mt-1">{formatCurrency(data.portfolioValue)}</span>
          </div>
          
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
            <span className="text-[10px] text-slate-600 font-mono block uppercase">Invested Value</span>
            <span className="text-sm font-bold text-slate-700 font-mono block mt-1">{formatCurrency(data.investedValue)}</span>
          </div>
          
          <div className={`bg-slate-50 border border-slate-100 p-3 rounded-xl ${data.unrealizedPnL >= 0 ? 'border-emerald-200' : 'border-rose-200'}`}>
            <span className="text-[10px] text-slate-600 font-mono block uppercase">Unrealized P&L</span>
            <span className={`text-sm font-bold font-mono block mt-1 ${data.unrealizedPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {data.unrealizedPnL >= 0 ? '+' : ''}{formatCurrency(data.unrealizedPnL)}
            </span>
          </div>
          
          <div className={`bg-slate-50 border border-slate-100 p-3 rounded-xl ${data.returnPercentage >= 0 ? 'border-emerald-200' : 'border-rose-200'}`}>
            <span className="text-[10px] text-slate-600 font-mono block uppercase">Return %</span>
            <span className={`text-sm font-bold font-mono block mt-1 ${data.returnPercentage >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {data.returnPercentage >= 0 ? '+' : ''}{data.returnPercentage.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl">
            <span className="text-[10px] text-blue-600 font-mono block uppercase">Cash Balance</span>
            <span className="text-sm font-bold text-blue-700 font-mono block mt-1">{formatCurrency(data.cashBalance)}</span>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl">
            <span className="text-[10px] text-blue-600 font-mono block uppercase">Total Account</span>
            <span className="text-sm font-bold text-blue-700 font-mono block mt-1">{formatCurrency(data.totalAccountValue)}</span>
          </div>
        </div>
      </div>

      {/* Top Winner & Loser */}
      {(topWinner || topLoser) && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 m-0">Top Performers</h3>
          
          <div className="space-y-2">
            {topWinner && (
              <div className="flex justify-between items-center p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div>
                  <span className="text-[10px] text-emerald-600 font-mono block uppercase">🏆 Top Winner</span>
                  <span className="text-xs font-bold text-slate-700 block">{topWinner.symbol}</span>
                  <span className="text-[10px] text-slate-500 block">{topWinner.companyName}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-600 font-mono block">
                    +{topWinner.returnPercent.toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    +{formatCurrency(topWinner.pnl)}
                  </span>
                </div>
              </div>
            )}
            
            {topLoser && (
              <div className="flex justify-between items-center p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <div>
                  <span className="text-[10px] text-rose-600 font-mono block uppercase">📉 Top Loser</span>
                  <span className="text-xs font-bold text-slate-700 block">{topLoser.symbol}</span>
                  <span className="text-[10px] text-slate-500 block">{topLoser.companyName}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-rose-600 font-mono block">
                    {topLoser.returnPercent.toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {formatCurrency(topLoser.pnl)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Holdings Distribution Pie Chart */}
      {holdingsDistribution.length > 0 && (
        <PieChart
          data={holdingsDistribution}
          title="Holdings Distribution"
          colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316']}
        />
      )}

      {/* P&L Bar Chart */}
      {pnlData.length > 0 && (
        <BarChart
          data={pnlData}
          title="Profit & Loss by Stock"
          color="#10B981"
        />
      )}
    </div>
  );
}