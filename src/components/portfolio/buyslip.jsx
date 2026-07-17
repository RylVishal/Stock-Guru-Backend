import React, { useState, useEffect, useRef } from 'react';

export default function BuySlip({ tradeForm, setTradeForm, onSubmit, actionLoading, defaultName = '' }) {
  const [recommendations, setRecommendations] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef(null);
  const [typedInput, setTypedInput] = useState('');
  const [orderStatus, setOrderStatus] = useState({ success: false, error: false, message: '' });

  // Handle clicking outside dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync default name on mount
  useEffect(() => {
    if (defaultName && !tradeForm.searchId && !tradeForm.symbol) {
      setTypedInput(defaultName);
    }
  }, [defaultName, tradeForm.searchId, tradeForm.symbol]);

  // Handle outside form clears
  useEffect(() => {
    if (!tradeForm.symbol && !tradeForm.searchId && !tradeForm.assetName) {
      setTypedInput('');
      setRecommendations([]);
      setShowDropdown(false);
    }
  }, [tradeForm.symbol, tradeForm.searchId, tradeForm.assetName]);

  // Dropdown Debounce Search Engine (Market API queries only)
  useEffect(() => {
    if (!typedInput.trim()) {
      setRecommendations([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await apiClient.get(`/market/search?q=${encodeURIComponent(typedInput.trim())}`);
        const resultsArray = response.data?.data?.content || response.data?.content || response.data || [];

        if (Array.isArray(resultsArray)) {
          const equitiesOnly = resultsArray.filter(item => item.entity_type === "Stocks" || item.symbol);
          setRecommendations(equitiesOnly);
          setShowDropdown(equitiesOnly.length > 0);
        } else {
          setRecommendations([]);
          setShowDropdown(false);
        }
      } catch (err) {
        console.error("Stock recommendations fetch failed:", err);
        setRecommendations([]);
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [typedInput]);

  // Window event syncing listener
  useEffect(() => {
    const handleStockNameSync = (event) => {
      const stockName = event.detail;
      if (stockName) {
        setTradeForm(prev => ({ ...prev, assetName: stockName }));
        setTypedInput(stockName);
      }
    };
    window.addEventListener("sync-active-stock-name", handleStockNameSync);
    return () => window.removeEventListener("sync-active-stock-name", handleStockNameSync);
  }, [setTradeForm]);

  // Real-Time LTP Price Polling Loop
  useEffect(() => {
    if (!tradeForm.searchId && !tradeForm.symbol) return;

    async function fetchLiveMarketValue() {
      try {
        // Use the symbol directly from tradeForm - no need for additional API call
        const targetTickerCode = tradeForm.symbol;
        
        if (!targetTickerCode) return;

        const chartRes = await apiClient.get(`/market/chart/${targetTickerCode.toUpperCase()}`);
        const candlePayload = chartRes.data?.candles || chartRes.data?.data?.candles || chartRes.data;

        if (Array.isArray(candlePayload) && candlePayload.length > 0) {
          const absoluteLatestNode = candlePayload[candlePayload.length - 1];
          const dynamicLivePrice = Array.isArray(absoluteLatestNode) ? absoluteLatestNode[4] : (absoluteLatestNode?.close || absoluteLatestNode);

          if (dynamicLivePrice && !isNaN(Number(dynamicLivePrice))) {
            setTradeForm(prev => ({ ...prev, price: Number(dynamicLivePrice) }));
          }
        }
      } catch (err) {
        console.error("Price fetch engine interrupted:", err);
      }
    }

    fetchLiveMarketValue();
    const pollerTimer = setInterval(fetchLiveMarketValue, 5000);
    return () => clearInterval(pollerTimer);
  }, [tradeForm.searchId, tradeForm.symbol, setTradeForm]);

  const handleSelectStock = (stock) => {
    const officialSymbol = (stock.nse_scrip_code || stock.bse_scrip_code || stock.symbol || "UNKNOWN").toUpperCase();
    const displayName = stock.title || stock.company_short_name || stock.companyName || officialSymbol;

    setTradeForm(prev => ({
      ...prev,
      searchId: stock.search_id || stock.id || '',
      symbol: officialSymbol,
      price: Number(stock.price || 0),
      assetName: displayName
    }));
    setTypedInput(displayName);
    setShowDropdown(false);
    
    // Clear any previous recommendations
    setRecommendations([]);
  };

  const handleInternalSubmit = async (e) => {
    e.preventDefault();
    setOrderStatus({ success: false, error: false, message: '' });

    if (!tradeForm.symbol) {
      setOrderStatus({ success: false, error: true, message: 'Please select a stock ticker first.' });
      return;
    }
    const orderQty = Number(tradeForm.quantity ?? 0);
    if (orderQty < 1) {
      setOrderStatus({ success: false, error: true, message: 'Please enter a valid quantity.' });
      return;
    }

    try {
      await onSubmit(e);
      setOrderStatus({ success: true, error: false, message: `Success! ${orderQty} share(s) of ${tradeForm.symbol.toUpperCase()} successfully BOUGHT.` });
      
      // Reset form after successful transaction
      setTypedInput('');
      setRecommendations([]);
      setTradeForm({ searchId: '', symbol: '', price: 0, quantity: '', assetName: '', orderType: 'BUY' });
    } catch (err) {
      setOrderStatus({ success: false, error: true, message: err.message || 'Order route rejected.' });
    }
  };

  // Quantity field validation - only allow numbers
  const handleQuantityChange = (e) => {
    const value = e.target.value;
    // Allow only numeric input
    if (value === '' || /^\d+$/.test(value)) {
      setTradeForm(prev => ({ ...prev, quantity: value }));
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-left max-w-md mx-auto relative">
      <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4 text-emerald-600">Buy Trading Desk</h3>
      <form onSubmit={handleInternalSubmit} className="space-y-4">
        
        {/* Search Field */}
        <div className="relative" ref={dropdownRef}>
          <label className="text-[10px] font-bold text-slate-600 font-mono uppercase tracking-wider block mb-1">Search Asset Ticker</label>
          <input
            type="text"
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            onFocus={() => typedInput.trim() && setShowDropdown(true)}
            placeholder="e.g., TATASTEEL or RELIANCE"
            className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-mono text-slate-800"
          />

          {showDropdown && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-56 overflow-y-auto divide-y divide-slate-50">
              {isSearching ? (
                <div className="p-3 text-xs font-mono text-slate-600 text-center animate-pulse">Searching exchanges...</div>
              ) : recommendations.length === 0 ? (
                <div className="p-3 text-xs font-mono text-slate-600 text-center">No assets found.</div>
              ) : (
                recommendations.map((stock, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectStock(stock)}
                    className="w-full text-left p-3 hover:bg-slate-50 flex items-center justify-between border-none cursor-pointer"
                  >
                    <div>
                      <span className="text-xs font-bold font-mono text-slate-800 block truncate">{stock.title || stock.companyName}</span>
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded font-mono uppercase mt-0.5 inline-block">{(stock.nse_scrip_code || stock.symbol).toUpperCase()}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-600 font-mono uppercase tracking-wider block mb-1">Volume Qty</label>
            <input
              type="number"
              min="1"
              value={tradeForm.quantity || ''}
              onChange={handleQuantityChange}
              placeholder="0"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-mono text-slate-700 font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-600 font-mono uppercase tracking-wider block mb-1">Estimated LTP</label>
            <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200/60 rounded-xl text-slate-600 font-mono font-bold flex items-center h-[38px]">
              ₹{Number(tradeForm.price || 0).toFixed(2)}
            </div>
          </div>
        </div>
        {/* Calculated Total Position Margin Estimation Card Row */}
        {tradeForm.symbol && (
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex justify-between items-center text-xs font-mono">
            <span className="text-slate-600 font-medium">Margin Outflow:</span>
            <span className="font-extrabold text-slate-700">
              ₹{(Number(tradeForm.quantity || 0) * Number(tradeForm.price || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {/* Dynamic Status Alerts Banner Panel Row */}
        {(orderStatus.message || actionLoading) && (
          <div className={`p-3.5 rounded-xl border text-xs font-mono ${
            actionLoading 
              ? 'bg-blue-50 border-blue-100 text-blue-700 animate-pulse' 
              : orderStatus.success 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                : 'bg-rose-50 border-rose-100 text-rose-700'
          }`}>
            {actionLoading ? "Broadcasting purchase order..." : orderStatus.message}
          </div>
        )}

        {/* Main Operational Execution Trigger Buttons */}
        <button
          type="submit"
          disabled={actionLoading}
          className="w-full py-3 text-xs font-extrabold tracking-widest text-white rounded-xl uppercase transition-all bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 cursor-pointer"
        >
          Execute Buy Order
        </button>

      </form>
    </div>
  );
}
