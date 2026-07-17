import React, { useState, useEffect, useCallback } from 'react';
import MostBought from '../components/explore/MostBought';
import StockMovers from '../components/explore/StockMovers';
import TrendingSectors from '../components/explore/TrendingSectors';
import MarketNews from '../components/explore/MarketNews';
import FullMostBoughtPage from '../components/explore/FullMostBoughtPage';
import { apiClient } from '../services/auth';

// Simple inner utility for rendering Tailwind skeleton placeholders
const ShimmerElement = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

export default function MarketDashboard() {
  const [activeTab, setActiveTab] = useState('stocks');
  const [currentView, setCurrentView] = useState('dashboard');
  
  const [payloads, setPayloads] = useState({ 
    mostBought: { exploreCompanies: { POPULAR_STOCKS_MOST_BOUGHT: [] } }, 
    gainers: { data: { stocks: [] } }, 
    losers: { data: { stocks: [] } }, 
    sectors: { data: { sectors: [] } }, 
    news: { feed: [] } 
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMarketTicks = useCallback(async (isInitialMount = false) => {
    if (isInitialMount) setLoading(true);
    try {
      const [mb, gn, ls, sc, nw] = await Promise.all([
        apiClient.get('/market/most-bought').then(r => r.data),
        apiClient.get('/market/top-gainers').then(r => r.data),
        apiClient.get('/market/top-losers').then(r => r.data),
        apiClient.get('/market/trending-sectors').then(r => r.data),
        apiClient.get('/market/news').then(r => r.data),
      ]);

      setPayloads({
        mostBought: mb || { exploreCompanies: { POPULAR_STOCKS_MOST_BOUGHT: [] } },
        gainers: gn || { data: { stocks: [] } },
        losers: ls || { data: { stocks: [] } },
        sectors: sc || { data: { sectors: [] } },
        news: nw || { feed: [] }
      });
      setError(null);
    } catch (err) {
      console.error('Data stream tick loop connection failure:', err);
      if (isInitialMount) {
        setError('Failed to establish real-time connection with data hubs.');
      }
    } finally {
      if (isInitialMount) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketTicks(true);
    const liveUpdateInterval = setInterval(() => {
      fetchMarketTicks(false);
    }, 60000);

    return () => clearInterval(liveUpdateInterval);
  }, [fetchMarketTicks]);

  // SKELETON UI REPLACEMENT ROUTINE
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header Bar Skeleton */}
          <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex justify-between items-center">
            <div className="space-y-2 w-full max-w-sm">
              <ShimmerElement className="h-6 w-1/3 bg-slate-300" />
              <ShimmerElement className="h-3 w-3/4" />
            </div>
            <ShimmerElement className="h-6 w-32 rounded-xl hidden sm:block" />
          </div>

          {/* Navigation Tabs Skeleton */}
          <div className="flex space-x-6 border-b border-gray-200 pb-3">
            <ShimmerElement className="h-4 w-24" />
            <ShimmerElement className="h-4 w-20" />
            <ShimmerElement className="h-4 w-32" />
          </div>

          {/* Content Layout Skeleton (MostBought & StockMovers layout mapping) */}
          <div className="space-y-6">
            {/* Mocking MostBought Grid Panel */}
            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <ShimmerElement className="h-5 w-40" />
                <ShimmerElement className="h-4 w-16" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ShimmerElement className="h-28 w-full rounded-xl" />
                <ShimmerElement className="h-28 w-full rounded-xl" />
                <ShimmerElement className="h-28 w-full rounded-xl" />
                <ShimmerElement className="h-28 w-full rounded-xl" />
              </div>
            </div>

            {/* Mocking StockMovers Split Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-3">
                <ShimmerElement className="h-5 w-32" />
                <div className="space-y-2">
                  <ShimmerElement className="h-12 w-full rounded-xl" />
                  <ShimmerElement className="h-12 w-full rounded-xl" />
                  <ShimmerElement className="h-12 w-full rounded-xl" />
                </div>
              </div>
              <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-3">
                <ShimmerElement className="h-5 w-32" />
                <div className="space-y-2">
                  <ShimmerElement className="h-12 w-full rounded-xl" />
                  <ShimmerElement className="h-12 w-full rounded-xl" />
                  <ShimmerElement className="h-12 w-full rounded-xl" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-md mx-auto my-12">
        <div className="bg-white border border-gray-200 p-6 rounded-2xl text-center shadow-sm">
          <div className="w-12 h-12 bg-red-50 text-red-600 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">⚠️</div>
          <h3 className="text-gray-900 font-bold text-base mb-1">Sync Interrupted</h3>
          <p className="text-gray-500 text-xs mb-4">{error}</p>
          <button 
            onClick={() => fetchMarketTicks(true)} 
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2 rounded-xl text-sm transition shadow-sm cursor-pointer"
          >
            Retry Sync Stream
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8 select-none">
      <div className="max-w-7xl mx-auto">
        
        {/* Dashboard Title Ribbon Header */}
        <header className="mb-6 bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-blue-900 m-0">
              Markets Hub
            </h1>
            <p className="text-xs text-gray-600 font-medium mt-1 m-0">
              Real-time domestic equity data vectors, trade volumes, and news wires.
            </p>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 text-xs font-bold text-green-700 rounded-xl shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live Feed Connected
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-gray-200 mb-6 overflow-x-auto scrollbar-none">
          {[
            { id: 'stocks', label: 'Market Tracker' },
            { id: 'sectors', label: 'Sector Map' },
            { id: 'news', label: 'Financial News Desk' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-4 text-sm font-semibold border-b-2 transition duration-200 whitespace-nowrap outline-none bg-transparent cursor-pointer ${
                  isActive 
                    ? 'border-blue-900 text-blue-900 font-bold' 
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Render Mount Area */}
        <main className="space-y-6">
          {activeTab === 'stocks' && (
            <div className="space-y-6">
              <MostBought 
                data={payloads.mostBought} 
                onSeeMoreClick={() => setCurrentView('all-most-bought')} 
              />
              <StockMovers gainersData={payloads.gainers} losersData={payloads.losers} />
            </div>
          )}
          
          {activeTab === 'sectors' && (
            <TrendingSectors data={payloads.sectors} />
          )}
          
          {activeTab === 'news' && (
            <MarketNews data={payloads.news} />
          )}
        </main>
      </div>
    </div>
  );
}



