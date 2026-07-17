import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/auth';
import { toast } from 'react-toastify';
import Navbar from '../components/home/Navbar';


export default function WatchList() {
  // Feedback bar is not implemented here; keep pricing UI stable.

  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  // Confirm delete modal state
  const [confirmDelete, setConfirmDelete] = useState(null);


  // Inline Search & Dropdown States for Adding Assets
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef(null);

  const normalizeSymbol = (value = '') => String(value || '').trim();
  const normalizeSearchId = (value = '') => String(value || '').trim();

  // 1. Fetch live watchlist data from server on mount
  const fetchWatchlist = async () => {
    try {
      const response = await apiClient.get('/watchlist/');
      const payload = response.data;
      const watchlistPayload = Array.isArray(payload)
        ? payload
        : payload?.watchlist || payload?.data?.watchlist || payload?.data || payload?.items || [];
      setWatchlist(Array.isArray(watchlistPayload) ? watchlistPayload : []);
    } catch (err) {
      console.error('Failed to sync watchlist telemetry:', err);
      toast.error(err.response?.data?.message || 'Failed to sync your tracked companies.');
    } finally {
      setIsLoading(false);
    }

  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  // Close dropdown overlay when clicking anywhere outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Debounced search hook to find new stocks to add
  useEffect(() => {
    if (!searchQuery.trim()) {
      setRecommendations([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await apiClient.get(`/market/search?q=${searchQuery.trim()}`);
        const payload = response.data;
        const resultsArray = Array.isArray(payload)
          ? payload
          : payload?.content || payload?.data?.content || payload?.data || [];

        if (Array.isArray(resultsArray)) {
          const equitiesOnly = resultsArray.filter((item) => item?.entity_type === 'Stocks' || item?.symbol);
          setRecommendations(equitiesOnly);
          setShowDropdown(equitiesOnly.length > 0);
        } else {
          setRecommendations([]);
          setShowDropdown(false);
        }
      } catch (err) {
        console.error("Watchlist additions search breakdown:", err);
        setRecommendations([]);
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // 3. Add stock item from dropdown select trigger
  const handleAddToWatchlist = async (stock) => {
    const itemSymbol = normalizeSymbol(stock.nse_scrip_code || stock.bse_scrip_code || stock.symbol || 'UNKNOWN');
    const itemTitle = stock.title || stock.company_short_name || stock.companyName || itemSymbol;
    const itemSlug = normalizeSearchId(stock.search_id || stock.searchId || stock.id || itemSymbol);

    const isDuplicate = watchlist.some(item => {
      const existingSymbol = normalizeSymbol(item.symbol);
      const existingSlug = normalizeSearchId(item.searchId || item.search_id || '');

      return existingSymbol === itemSymbol || (itemSlug !== '' && existingSlug === itemSlug);
    });

    if (isDuplicate) {
      toast.error(`${itemTitle} (${itemSymbol}) is already in your watchlist.`);
      setSearchQuery('');
      setShowDropdown(false);
      return;
    }

    try {
      const response = await apiClient.post('/watchlist/add', {
        searchId: itemSlug || itemSymbol,
        symbol: itemSymbol,
        companyName: itemTitle
      });

      if (response.data?.success || response.data?.data) {
        toast.success(`${itemSymbol} added to watchlist!`);
        setSearchQuery('');
        setShowDropdown(false);
        await fetchWatchlist();
      } else {
        toast.error(response.data?.message || 'Failed to pin target stock.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to pin target stock.');
    }
  };
  const handleStockRedirect = (identifier) => {
    if (!identifier) return;
    navigate(`/market/stock/${encodeURIComponent(identifier.toLowerCase())}`);
  };


  const handleRemoveFromWatchlist = async (symbol) => {
    const targetSymbol = normalizeSymbol(symbol);
    setConfirmDelete(null);
    setActionId(targetSymbol);
    try {
      const response = await apiClient.delete(`/watchlist/${encodeURIComponent(targetSymbol)}`);
      if (response.data?.success || response.data?.message) {
        toast.success(`${targetSymbol} removed from watchlist.`);
        setWatchlist(prev => prev.filter(item => normalizeSymbol(item.symbol) !== targetSymbol));
      } else {
        toast.error(response.data?.message || 'Failed to remove from watchlist.');
      }
    } catch (err) {
      console.error('Watchlist item deletion failed:', err);
      toast.error(err.response?.data?.message || 'Failed to remove from watchlist.');
    } finally {
      setActionId(null);
    }
  };


  // Trigger confirmation modal instead of deleting directly
  const requestDeleteConfirmation = (e, asset) => {
    e.stopPropagation();
    setConfirmDelete({ symbol: asset.symbol, companyName: asset.companyName || asset.symbol });
  };

  const formatINR = (val) => {
    if (val == null || val === '' || Number.isNaN(Number(val))) return '—';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(val));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">

      {/* DELETE CONFIRMATION MODAL */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 text-xl font-bold">🗑️</div>
              <h3 className="text-sm font-bold text-slate-800 m-0">Delete from Watchlist?</h3>
              <p className="text-xs text-slate-600 font-medium m-0">
                Are you sure you want to delete <span className="font-bold text-slate-800">{confirmDelete.companyName}</span>{' '}
                (<span className="font-mono text-rose-600 font-bold">{confirmDelete.symbol}</span>) from your watchlist?
              </p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 text-xs font-mono font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl border-none cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveFromWatchlist(confirmDelete.symbol)}
                disabled={actionId === confirmDelete.symbol}
                className="flex-1 py-2.5 text-xs font-mono font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl border-none cursor-pointer transition-all"
              >
                {actionId === confirmDelete.symbol ? 'Deleting...' : 'Yes,Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Banner Headers Title Layout */}
        <header className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-blue-800 m-0">My Watchlist</h1>
            <p className="text-xs text-slate-800 mt-1 m-0 font-medium">Monitor live pricing tickers for preferred equity targets before initiating trades</p>
          </div>

          {/* Search Bar Input Container */}
          <div ref={dropdownRef} className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Add stock (e.g., Tata, Reliance)"
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm transition-all"
            />
            {isSearching && (
              <span className="absolute right-3 top-3 text-[10px] text-slate-600 font-mono animate-pulse">Scanning...</span>
            )}

            {/* Dropdown Results */}
            {showDropdown && recommendations.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl max-h-48 overflow-y-auto z-50 shadow-lg divide-y divide-slate-100">
                {recommendations.map((stock, i) => {
                  const itemSymbol = (stock.nse_scrip_code || stock.bse_scrip_code || "STK").toUpperCase();
                  const itemTitle = stock.title || stock.company_short_name || itemSymbol;
                  const itemSlug = stock.search_id || stock.id || "";

                  return (
                    <div
                      key={itemSlug + i}
                      onClick={() => handleAddToWatchlist(stock)}
                      className="p-2.5 text-xs font-mono flex justify-between items-center hover:bg-blue-50 cursor-pointer transition-colors text-slate-700"
                    >
                      <div className="truncate max-w-[70%]">
                        <span className="text-slate-800 font-bold block truncate">{itemTitle}</span>
                        <span className="text-[9px] text-slate-600 block truncate">{itemSlug}</span>
                      </div>
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">{itemSymbol}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </header>



        {/* --- MAIN ASSET REPOSITORY CONTENT DISPLAY --- */}
        {isLoading ? (
          /* RESPONSIVE SHIMMER UI LOADING COMPONENT */
          <div className="space-y-4 animate-pulse">
            {/* Desktop Table View Shimmer Skeleton Loader */}
            <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-100 h-10 w-full border-b border-slate-200"></div>
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex justify-between items-center py-2">
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/6"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/6"></div>
                    <div className="h-6 bg-slate-200 rounded w-12"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Stack View Shimmer Cards */}
            <div className="block md:hidden space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-6 bg-slate-200 rounded w-10"></div>
                  </div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        ) : watchlist.length === 0 ? (
          /* EMPTY MONITORING STATE MAPPER */
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm">
            <p className="text-3xl m-0">📋</p>
            <h3 className="text-base font-bold text-slate-700 mt-3 m-0">Your watchlist is empty</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto mb-0 leading-relaxed">
              Use the search bar above to look up instruments and pin them here for persistent ledger tracking.
            </p>
          </div>
        ) : (
          /* RESPONSIVE WATCHLIST VIEWER GRID */
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">

            {/* Desktop Structured Viewport Wrapper */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Company</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ticker Symbol</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Monitored Base Price</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {watchlist.map((asset) => (
                    <tr key={asset.id || asset.symbol} onClick={() => handleStockRedirect(asset.searchId || asset.symbol)} className="hover:bg-slate-50/70 transition-colors cursor-pointer">
                      <td className="p-4 text-xs font-bold text-slate-800 font-mono truncate max-w-[240px]">
                        {asset.companyName || "Equity Asset"}
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider font-mono">
                          {asset.symbol}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-bold text-slate-700 font-mono text-right">
                        {asset.livePrice == null ? '—' : formatINR(asset.livePrice ?? asset.price)}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={(e) => requestDeleteConfirmation(e, asset)}
                          disabled={actionId === asset.symbol}
                          className="text-xs font-bold text-red-600 hover:text-red-800 bg-transparent border-none cursor-pointer disabled:opacity-40 transition-colors"
                        >
                          {actionId === asset.symbol ? 'Removing...' : 'DELETE'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards Layout (Flawless Vertical Stack) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {watchlist.map((asset) => (
                <div
                  key={asset.id || asset.symbol}
                  onClick={() => handleStockRedirect(asset.searchId || asset.symbol)}
                  className="p-4 flex flex-col space-y-2 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="truncate pr-4">
                      <h4 className="text-xs font-bold text-slate-800 font-mono m-0 truncate">{asset.companyName || "Equity Asset"}</h4>
                      <span className="inline-block bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider font-mono mt-1">
                        {asset.symbol}
                      </span>
                    </div>
                    <button
                      onClick={(e) => requestDeleteConfirmation(e, asset)}
                      disabled={actionId === asset.symbol}
                      className="text-xs font-bold text-red-600 bg-transparent border-none cursor-pointer disabled:opacity-40"
                    >
                      {actionId === asset.symbol ? '...' : 'delete'}
                    </button>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] text-slate-600 font-medium">Tracking Price</span>
<span className="text-xs font-bold text-slate-700 font-mono">
                      {asset.livePrice == null ? '—' : formatINR(asset.livePrice ?? asset.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>

    </div>
  )
}
