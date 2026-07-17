
import React, { useState, useEffect } from 'react';
import PieChart from '../stock/PieChart';
import BarChart from '../stock/BarChart';
import { apiClient } from '../../services/auth';

export default function HoldingsList({ holdings, activeTab, setActiveTab, history, analyticsData }) {
  const [holdingsWithPrices, setHoldingsWithPrices] = useState([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);

  // Fetch live prices for holdings that don't have currentPrice
  useEffect(() => {
    const fetchLivePrices = async () => {
      if (!holdings || holdings.length === 0) {
        setHoldingsWithPrices([]);
        return;
      }

      // Check if all holdings already have currentPrice
      const hasMissingPrices = holdings.some(stock => !stock.currentPrice || stock.currentPrice === 0);
      
      if (!hasMissingPrices) {
        setHoldingsWithPrices(holdings);
        return;
      }

      setIsLoadingPrices(true);
      try {
        // Fetch live prices for all holdings in parallel
        const holdingsWithLiveData = await Promise.all(
          holdings.map(async (stock) => {
            if (stock.currentPrice && stock.currentPrice > 0) {
              return stock; // Already has live price
            }

            // Fetch live price from market API
            try {
              const response = await apiClient.get(`/market/live-price/${stock.symbol}`);
              const freshPrice = response.data?.livePrice;
              
              // Only update if the API returned a valid number, preserve existing price otherwise
              const currentPrice = (freshPrice !== null && freshPrice !== undefined && Number.isFinite(Number(freshPrice)) && Number(freshPrice) > 0)
                ? Number(freshPrice)
                : (stock.currentPrice && Number.isFinite(Number(stock.currentPrice)) && Number(stock.currentPrice) > 0)
                  ? stock.currentPrice
                  : null;
              
              const quantity = Number(stock.quantity ?? 0);
              const avgPrice = Number(stock.avgPrice ?? 0);
              const investedValue = quantity * avgPrice;
              const currentValue = currentPrice !== null ? quantity * currentPrice : null;
              const pnl = currentValue !== null ? currentValue - investedValue : null;
              const returnPercent = investedValue > 0 && pnl !== null ? (pnl / investedValue) * 100 : null;

              return {
                ...stock,
                currentPrice: currentPrice,
                investedValue: investedValue,
                currentValue: currentValue,
                pnl: pnl,
                returnPercent: returnPercent,
                isOffline: currentPrice === null
              };
            } catch (error) {
              console.error(`Failed to fetch price for ${stock.symbol}:`, error);
              return stock; // Return original stock if price fetch fails
            }
          })
        );

        setHoldingsWithPrices(holdingsWithLiveData);
      } catch (error) {
        console.error('Error fetching live prices:', error);
        setHoldingsWithPrices(holdings);
      } finally {
        setIsLoadingPrices(false);
      }
    };

    fetchLivePrices();
  }, [holdings]);

  const sortedHoldings = [...(holdingsWithPrices.length > 0 ? holdingsWithPrices : holdings || [])]
    .map(stock => {
      const pnl = Number(stock.pnl ?? 0);
      const invested = Number(stock.investedValue ?? (Number(stock.quantity ?? 0) * Number(stock.avgPrice ?? 0)));
      const pct = invested > 0 ? (pnl / invested) * 100 : Number(stock.returnPercent ?? 0);
      return { ...stock, calculatedPct: pct };
    })
    .sort((a, b) => b.calculatedPct - a.calculatedPct);

  // Safely choose extremes based on performance thresholds
  const topWinner = sortedHoldings.length > 0 && sortedHoldings[0].calculatedPct > 0 ? sortedHoldings[0] : null;
  const topLoser = sortedHoldings.length > 1 && sortedHoldings[sortedHoldings.length - 1].calculatedPct < 0 ? sortedHoldings[sortedHoldings.length - 1] : (sortedHoldings.length === 1 && sortedHoldings[0].calculatedPct < 0 ? sortedHoldings[0] : null);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6 text-left select-none w-full box-border">

      {/* 1. SECTION TABS CONTROL HEADERS */}
      <div className="flex items-center space-x-6 border-b border-slate-100 pb-3 mb-5">
        <button
          type="button"
          onClick={() => setActiveTab('holdings')}
          className={`text-xs font-bold tracking-wider uppercase border-none bg-transparent cursor-pointer pb-2 transition-all ${activeTab === 'holdings'
            ? 'text-blue-600 border-b-2 border-blue-600 font-extrabold'
            : 'text-slate-600 hover:text-slate-600'
            }`}
        >
          Active Holdings
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`text-xs font-bold tracking-wider uppercase border-none bg-transparent cursor-pointer pb-2 transition-all ${activeTab === 'history'
            ? 'text-blue-600 border-b-2 border-blue-600 font-extrabold'
            : 'text-slate-600 hover:text-slate-600'
            }`}
        >
          Transaction History
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`text-xs font-bold tracking-wider uppercase border-none bg-transparent cursor-pointer pb-2 transition-all ${activeTab === 'analytics'
            ? 'text-blue-600 border-b-2 border-blue-600 font-extrabold'
            : 'text-slate-600 hover:text-slate-600'
            }`}
        >
          Analytics
        </button>
      </div>

      {/* 2. DYNAMIC CONTENT SWITCH ROUTER */}
      {activeTab === 'holdings' && (
        <div className="space-y-6">
          {/* INDIVIDUAL STOCK CARDS COLUMN CONTAINER */}
          <div className="space-y-4">
            {(holdingsWithPrices.length > 0 ? holdingsWithPrices : holdings).length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm">
            <p className="text-3xl m-0">📋</p>
            <h3 className="text-base font-bold text-slate-700 mt-3 m-0">Your Holding is empty</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto mb-0 leading-relaxed">
              Use the search bar above to look up instruments and pin them here for persistent ledger tracking.
            </p>
          </div>
            ) : (
              (holdingsWithPrices.length > 0 ? holdingsWithPrices : holdings).map((stock) => {
                const quantity = Number(stock.quantity ?? 0);
                const avgPrice = Number(stock.avgPrice ?? 0);
                const currentPrice = stock.currentPrice && Number.isFinite(Number(stock.currentPrice)) && Number(stock.currentPrice) > 0 
                  ? Number(stock.currentPrice) 
                  : null;
                const isOffline = stock.isOffline || currentPrice === null;
                
                // Calculate invested value and current value if not provided
                const investedValue = Number(stock.investedValue ?? (quantity * avgPrice));
                const currentValue = currentPrice !== null ? Number(stock.currentValue ?? (quantity * currentPrice)) : null;
                const pnl = currentValue !== null ? Number(stock.pnl ?? (currentValue - investedValue)) : null;
                const returnPercent = investedValue > 0 && pnl !== null ? Number(stock.returnPercent ?? (pnl / investedValue) * 100) : null;
                const isLoss = pnl !== null && pnl < 0;

                return (
                  <div
                    key={stock.id || stock.symbol} onClick={() => handleStockRedirect(stock.searchId || stock.symbol)}
                    className="border border-slate-100 bg-white hover:border-slate-200 p-4 rounded-xl flex items-center justify-between transition-all w-full box-border gap-3 shadow-sm"
                  >
                    {/* Left Column: Asset Identity & Cost Metadata */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-800">{stock.companyName || stock.symbol}</span>
                        <span className="text-[9px] bg-slate-100 text-slate-500 font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                          {stock.symbol}
                        </span>
                      </div>

                      {/* Investment Details Row */}
                      <div className="text-[11px] text-slate-600 font-medium font-mono">
                        Vol: <span className="text-slate-700 font-bold">{quantity}</span>
                        <span className="mx-1.5">•</span>
                        Avg Price: <span className="text-slate-700 font-bold">₹{avgPrice.toFixed(2)}</span>
                        <span className="mx-1.5">•</span>
                        Invested: <span className="text-slate-700 font-bold">₹{investedValue.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Right Column Displaying Live Market Prices, Valuation, and Real P&L */}
                    <div className="flex items-center gap-4 shrink-0 text-left">
                      <div className="text-right space-y-0.5">
                        {/* Live Market Price Per Unit (LTP) */}
                        <div className="text-[11px] text-slate-600 font-mono font-medium">
                          LTP: {isOffline ? (
                            <span className="text-slate-400 font-bold">Offline</span>
                          ) : (
                            <span className="text-slate-600 font-bold">₹{currentPrice.toFixed(2)}</span>
                          )}
                        </div>

                        {/* Total Current Valuation of Position */}
                        <div className="text-sm font-black text-slate-800 font-mono">
                          {currentValue !== null ? (
                            `₹${currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </div>

                        {/* Color-Coded Dynamic Profit / Loss Return Badge */}
                        {pnl !== null && returnPercent !== null ? (
                          <div className={`text-[10px] font-mono font-bold flex items-center justify-end gap-1 ${isLoss ? 'text-rose-600' : pnl > 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                            <span>{isLoss ? '▼' : pnl > 0 ? '▲' : '•'}</span>
                            <span>₹{Math.abs(pnl).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            <span>({returnPercent.toFixed(2)}%)</span>
                          </div>
                        ) : (
                          <div className="text-[10px] font-mono font-bold text-slate-400">
                            Market Closed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 3. DYNAMIC CONTENT SWITCH ROUTER - TRANSACTION HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {!history || history.length === 0 ? (
            <p className="text-center py-10 text-xl font-mono text-slate-600">📃
            <p className="text-lg text-slate-600 font-sans italic text-center py-6">No historical records logged yet.</p>
            </p>
          ) : (
            history.map((log) => (
              <div
                key={log._id || log.id} onClick={() => handleStockRedirect(log.searchId || log.symbol)}
                className="bg-slate-50 p-4 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-xs font-mono"
              >
                {/* Log Header Row */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${log.type === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>{log.type}</span>
                    <span className="font-bold text-slate-700">{log.symbol ? log.symbol.toUpperCase() : '—'}</span>
                  </div>
                  <span className="text-[10px] text-slate-600 block mt-1 break-words">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString('en-IN') : 'Date Unknown'}
                  </span>
                </div>

                {/* Log Metadata Calculations */}
                <div className="text-left sm:text-right border-t border-slate-100 pt-2 sm:border-none sm:pt-0">
                  <span className="font-bold text-slate-700 block">
                    {log.quantity} Share(s) @ ₹{Number(log.price ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                    Total: ₹{Number(log.amount || (Number(log.quantity ?? 0) * Number(log.price ?? 0))).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 4. ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {!analyticsData ? (
            <div className="text-center text-lg text-slate-600">📃
             <div className="text-center py-10 text-lg font-sans text-slate-600"> No analytics data available.
            </div> 
            </div>
          ) : (
            <div className="space-y-5">
              {/* Summary Metrics */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 m-0">Portfolio Analytics</h3>
                <p className="text-[10px] text-slate-600 font-medium m-0 mt-0.5 font-mono uppercase tracking-wider">Performance Overview</p>
              </div>

              {/* Summary metric grid squares */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl text-left shadow-sm">
                  <span className="text-[10px] font-bold text-slate-600 font-mono uppercase tracking-wider block">Portfolio Value</span>
                  <span className="text-base font-black text-slate-800 font-mono mt-1 block">
                    ₹{Number(analyticsData?.analytics?.portfolioValue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl text-left shadow-sm">
                  <span className="text-[10px] font-bold text-slate-600 font-mono uppercase tracking-wider block">Invested Value</span>
                  <span className="text-base font-black text-slate-800 font-mono mt-1 block">
                    ₹{Number(analyticsData?.analytics?.investedValue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl text-left shadow-sm">
                  <span className="text-[10px] font-bold text-slate-600 font-mono uppercase tracking-wider block">Unrealized P&L</span>
                  <span className={`text-base font-black font-mono mt-1 block ${Number(analyticsData?.analytics?.unrealizedPnL ?? 0) < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {Number(analyticsData?.analytics?.unrealizedPnL ?? 0) < 0 ? '' : '+'}₹{Number(analyticsData?.analytics?.unrealizedPnL ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    <span className="text-xs ml-1 font-bold">({Number(analyticsData?.analytics?.returnPercentage ?? 0).toFixed(2)}%)</span>
                  </span>
                </div>
              </div>

              {/* Winner and Loser Badges Row Container */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {analyticsData?.topWinner && (
                  <div className="border border-emerald-100 bg-emerald-50/40 p-3 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-mono uppercase">Top Winner</span>
                      <div className="text-xs font-bold text-slate-800 font-mono mt-1.5">{analyticsData.topWinner.symbol}</div>
                      <div className="text-[10px] text-slate-600 truncate max-w-[160px] font-medium mt-0.5">{analyticsData.topWinner.companyName}</div>
                    </div>
                    <div className="text-right font-mono font-black text-emerald-600 text-sm shrink-0">
                      +{Number(analyticsData.topWinner.returnPercent ?? 0).toFixed(2)}%
                    </div>
                  </div>
                )}

                {analyticsData?.topLoser && (
                  <div className="border border-rose-100 bg-rose-50/40 p-3 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded font-mono uppercase">Top Loser</span>
                      <div className="text-xs font-bold text-slate-800 font-mono mt-1.5">{analyticsData.topLoser.symbol}</div>
                      <div className="text-[10px] text-slate-600 truncate max-w-[160px] font-medium mt-0.5">{analyticsData.topLoser.companyName}</div>
                    </div>
                    <div className="text-right font-mono font-black text-rose-600 text-sm shrink-0">
                      {Number(analyticsData.topLoser.returnPercent ?? 0).toFixed(2)}%
                    </div>
                  </div>
                )}
              </div>

              {/* Charts Side by Side */}
              {analyticsData?.holdings && analyticsData.holdings.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Holdings Distribution Pie Chart */}
                  <PieChart
                    data={analyticsData.holdings.map(h => ({
                      label: h.symbol,
                      value: h.currentValue || 0
                    }))}
                    title="Holdings Distribution"
                    colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316']}
                  />

                  {/* P&L Bar Chart */}
                  <BarChart
                    data={analyticsData.holdings.map(h => ({
                      label: h.symbol,
                      value: h.pnl || 0
                    }))}
                    title="Profit & Loss by Stock"
                    color="#10B981"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

