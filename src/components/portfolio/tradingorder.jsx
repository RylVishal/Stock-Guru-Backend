import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function TradeSlip({
  tradeForm,
  setTradeForm,
  onSubmit,
  actionLoading,
  defaultName = '',
  holdings = [],
  currentStock = null // { symbol, name, price }
}) {
  const [typedInput, setTypedInput]         = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [showDropdown, setShowDropdown]     = useState(false);
  const [isSearching, setIsSearching]       = useState(false);
  const dropdownRef                         = useRef(null);
  const skipNextSearchRef                   = useRef(false);
  const hasInitializedRef                   = useRef(false);
  const holdingsRef                         = useRef(holdings);

  const estimatedTotal = Number(tradeForm.quantity || 0) * (tradeForm.price && tradeForm.price !== "Offline" ? Number(tradeForm.price) : 0);

  const formatINR = (amount) =>
    amount && amount !== "Offline" ? Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) : '—';

  // ── Outside click closes dropdown ────────────────────────────────────────
  useEffect(() => {
    const fn = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // ── Sync holdings ref ────────────────────────────────────────────────────
  useEffect(() => { holdingsRef.current = holdings; }, [holdings]);

  // ── Pre-fill default name once ───────────────────────────────────────────
  useEffect(() => {
    if (defaultName && !hasInitializedRef.current) {
      setTypedInput(defaultName);
      hasInitializedRef.current = true;
    }
  }, [defaultName]);

  // ── Sync typed input when assetName changes externally ───────────────────
  useEffect(() => {
    if (tradeForm.assetName && !typedInput) setTypedInput(tradeForm.assetName);
  }, [tradeForm.assetName, typedInput]);

  // ── DEBOUNCED SEARCH ─────────────────────────────────────────────────────
  useEffect(() => {
    if (skipNextSearchRef.current) { skipNextSearchRef.current = false; return; }
    if (tradeForm?.symbol && typedInput.trim().toUpperCase() === String(tradeForm.symbol).trim().toUpperCase()) return;

    const query = typedInput.trim();
    if (!query) { setRecommendations([]); setShowDropdown(false); return; }

    if (tradeForm.orderType === 'SELL') {
      const q = query.toLowerCase();
      const matched = holdingsRef.current.filter(h => {
        const s = String(h.symbol || '').toLowerCase();
        const n = String(h.companyName || h.name || h.assetName || '').toLowerCase();
        return s.includes(q) || n.includes(q);
      });
      setRecommendations(matched);
      setShowDropdown(matched.length > 0);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/market/search?q=${encodeURIComponent(query)}`);
        const arr = res.data?.data?.content || res.data?.content || res.data || [];
        if (Array.isArray(arr)) {
          const equities = arr.filter(i => i.entity_type === 'Stocks' || i.symbol);
          setRecommendations(equities);
          setShowDropdown(equities.length > 0);
        } else {
          setRecommendations([]); setShowDropdown(false);
        }
      } catch (err) {
        console.error('Search failed:', err);
        setRecommendations([]); setShowDropdown(false);
      } finally { setIsSearching(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [typedInput, tradeForm.orderType]);

  // ── LIVE PRICE POLLER ────────────────────────────────────────────────────
  const currentSymbolString = String(tradeForm.symbol || '').trim().toUpperCase();
  useEffect(() => {
    // No symbol → reset price to null (offline state) only when there's no existing price to preserve
    if (!currentSymbolString || currentSymbolString === 'UNKNOWN') {
      setTradeForm(prev => ({ ...prev, price: prev.price && prev.price !== "Offline" ? prev.price : null }));
      return;
    }

    let timer = null;
    async function poll() {
      try {
        const res = await api.get(`/market/live-price/${currentSymbolString}`);
        const freshPrice = res?.data?.livePrice;
        
        // Only update if the API returned a valid number, preserve existing price otherwise
        if (freshPrice !== null && freshPrice !== undefined && Number.isFinite(Number(freshPrice)) && Number(freshPrice) > 0) {
          const nextPrice = Number(freshPrice);
          setTradeForm(prev => {
            if (!prev.symbol) return prev;
            if (Number(prev.price) === nextPrice) return prev;
            return { ...prev, price: nextPrice };
          });
        } else if (!tradeForm.price || tradeForm.price === "Offline") {
          // If we have no valid price and API returns null, mark as offline
          setTradeForm(prev => ({ ...prev, price: "Offline" }));
        }
      } catch (err) {
        console.error('Live price poll failed:', err.message);
        // If we have no price and fetch fails, mark as offline
        if (!tradeForm.price || tradeForm.price === "Offline") {
          setTradeForm(prev => ({ ...prev, price: "Offline" }));
        }
      }
    }
    poll();
    timer = setInterval(poll, 5000);
    return () => { if (timer) clearInterval(timer); };
  }, [currentSymbolString]); // eslint-disable-line

  // ── TAB CHANGE ───────────────────────────────────────────────────────────
  const handleTabChange = (type) => {
    setTypedInput('');
    setRecommendations([]);
    setShowDropdown(false);
    if (type === 'SELL' && currentStock) {
      const basePrice = currentStock.price && currentStock.price > 0 ? currentStock.price : null;
      setTradeForm({ orderType: type, searchId: currentStock.symbol.toLowerCase(), symbol: currentStock.symbol.toUpperCase(), price: basePrice, assetName: currentStock.name, quantity: 1 });
      setTypedInput(currentStock.name);
    } else {
      setTradeForm({ orderType: type, searchId: '', symbol: '', price: null, assetName: '', quantity: 1 });
    }
  };

  // ── SELECT FROM DROPDOWN ─────────────────────────────────────────────────
  const handleSelectStock = (stock) => {
    skipNextSearchRef.current = true;
    const officialSymbol = String(stock.nseScriptCode || stock.nse_scrip_code || stock.bseScriptCode || stock.bse_scrip_code || stock.symbol || 'UNKNOWN').toUpperCase().trim();
    const displayName = stock.title || stock.company_short_name || stock.companyName || stock.name || officialSymbol;
    let slug = '';
    if (tradeForm.orderType === 'BUY') {
      const c = stock.search_id || stock.id || '';
      slug = typeof c === 'object' ? (c.slug || c._id || '') : c;
    } else {
      const c = stock.searchId || stock.search_id || officialSymbol.toLowerCase();
      slug = typeof c === 'object' ? (c.slug || c._id || '') : c;
    }
    const basePrice = stock.currentPrice && stock.currentPrice > 0 ? stock.currentPrice 
                      : stock.price && stock.price > 0 ? stock.price 
                      : stock.lastPrice && stock.lastPrice > 0 ? stock.lastPrice 
                      : stock.livePrice && stock.livePrice > 0 ? stock.livePrice 
                      : stock.close && stock.close > 0 ? stock.close 
                      : null;
    setTypedInput(displayName);
    setRecommendations([]);
    setShowDropdown(false);
    setTradeForm({ orderType: tradeForm.orderType, searchId: String(slug || ''), symbol: officialSymbol, price: basePrice, assetName: displayName, quantity: tradeForm.quantity || 1 });
  };

  // ── FORM SUBMIT ──────────────────────────────────────────────────────────
  const handleInternalSubmit = async (e) => {
    e.preventDefault();

    if (!tradeForm.symbol || tradeForm.symbol === 'UNKNOWN') {
      toast.error('Please select a valid stock first.');
      return;
    }
    if (!tradeForm.quantity || Number(tradeForm.quantity) < 1) {
      toast.error('Please enter a valid quantity (≥ 1).');
      return;
    }

    try {
      await onSubmit(e);
      //toast.success(`🎉 ${tradeForm.orderType} order placed for ${tradeForm.symbol}!`);
      setTypedInput('');
      setTradeForm({ orderType: tradeForm.orderType, searchId: '', symbol: '', price: null, assetName: '', quantity: '' });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Order failed.';
      toast.error(typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
    }
  };

  return (
    <form
      ref={dropdownRef}
      onSubmit={handleInternalSubmit}
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-4"
    >
      <h3 className="text-sm font-bold text-slate-700 tracking-wider uppercase font-mono mb-2">Order Terminal</h3>

      {/* BUY / SELL tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
        <button type="button" onClick={() => handleTabChange('BUY')}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg cursor-pointer border-none transition-all ${tradeForm.orderType === 'BUY' ? 'bg-green-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 bg-transparent'}`}>
          BUY
        </button>
        <button type="button" onClick={() => handleTabChange('SELL')}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg cursor-pointer border-none transition-all ${tradeForm.orderType === 'SELL' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 bg-transparent'}`}>
          SELL
        </button>
      </div>

      {/* Stock search */}
      <div className="space-y-1 relative">
        <label className="text-[10px] font-mono text-slate-600 uppercase tracking-wider font-bold">
          {tradeForm.orderType === 'BUY' ? 'Search Stock Company / Ticker' : 'Search Asset to Sell'}
        </label>
        <input
          type="text"
          value={typedInput}
          onChange={(e) => {
            setTypedInput(e.target.value);
            if (e.target.value === '') setTradeForm(p => ({ ...p, symbol: '', searchId: '', assetName: '' }));
          }}
          placeholder={tradeForm.orderType === 'BUY' ? 'Search (e.g., Tata, Reliance)' : 'Search holding (e.g., INFY, TCS)'}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-mono text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          required
        />
        {isSearching && <p className="text-[10px] text-slate-400 font-mono mt-1">Searching…</p>}
        {showDropdown && recommendations.length > 0 && (
          <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl max-h-48 overflow-y-auto z-50 shadow-lg divide-y divide-slate-100">
            {recommendations.map((stock, i) => {
              const sym = (stock.nse_scrip_code || stock.bse_scrip_code || stock.symbol || 'UNKNOWN').toUpperCase();
              const ttl = stock.title || stock.company_short_name || stock.companyName || sym;
              return (
                <div key={i} onMouseDown={(e) => { e.preventDefault(); handleSelectStock(stock); }}
                  className="p-3 text-xs font-mono flex justify-between items-center hover:bg-blue-50 cursor-pointer transition-colors text-slate-700">
                  <span className="font-bold">{ttl}</span>
                  <span className="text-[10px] text-slate-500 uppercase">{sym}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quantity & Price */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-slate-600 uppercase tracking-wider font-bold">Quantity</label>
          <input
            type="number" min="1"
            value={tradeForm.quantity}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '' || /^\d+$/.test(v)) setTradeForm(p => ({ ...p, quantity: v }));
            }}
            className="w-full bg-slate-50 border border-blue-200 rounded-xl p-2.5 text-sm font-mono focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-slate-600 uppercase tracking-wider font-bold">
            Market Price {currentSymbolString && <span className="ml-1 text-emerald-500 animate-pulse">●</span>}
          </label>
          <div className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-sm font-mono text-slate-600">
            {tradeForm.price && tradeForm.price !== "Offline" ? `₹${formatINR(tradeForm.price)}` : <span className="text-slate-400">Market Closed</span>}
          </div>
        </div>
      </div>

      {/* Estimated total */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-center font-mono text-xs text-slate-500">
        <span>Estimated Total:</span>
        <span className="text-sm font-bold text-slate-800">₹{formatINR(estimatedTotal)}</span>
      </div>

      <button
        type="submit"
        disabled={actionLoading || !tradeForm.symbol || tradeForm.symbol === 'UNKNOWN'}
        className={`w-full py-3 text-sm font-mono font-bold text-white rounded-xl shadow-sm tracking-wide border-none transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
          tradeForm.orderType === 'BUY' ? 'bg-green-600 hover:bg-green-500' : 'bg-rose-600 hover:bg-rose-700'
        }`}
      >
        {actionLoading ? 'PROCESSING…' : `CONFIRM ${tradeForm.orderType} TRANSACTION`}
      </button>
    </form>
  );
}
