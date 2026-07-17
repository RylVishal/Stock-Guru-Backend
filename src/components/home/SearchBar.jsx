import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/auth'; // Uses your centralized axios config instance

export default function NavbarSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Close the search dropdown if user clicks completely outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live query search tracking loop using a simple debounce delay layer
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get('/market/search', {
          params: { q: query.trim() }
        });

        const content = response.data?.data?.content || response.data?.content || response.data || [];
        const stockContent = Array.isArray(content)
          ? content.filter((item) => {
              const type = String(item?.entity_type || '').toLowerCase();
              return type.includes('stock') || Boolean(item?.symbol);
            })
          : [];

        setResults(stockContent);
        setIsOpen(stockContent.length > 0);
      } catch (err) {
        console.error('Search query fetch failure:', err);
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms delay window to prevent flooding your server port

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelectStock = (searchId) => {
    setQuery('');
    setIsOpen(false);
    // Bounces the user straight to your dynamic StockDetailsPage route path
    navigate(`/market/stock/${encodeURIComponent(searchId)}`);
  };

  return (
    <div className="relative w-full max-w-xs sm:max-w-sm" ref={dropdownRef}>
      {/* Search Input Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search stocks (e.g. Infosys)..."
          className="w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-600 pl-9 pr-4 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
        />
        <div className="absolute left-3 top-2.5 text-gray-600 font-bold text-xs select-none">
          🔍
        </div>
        {isLoading && (
          <div className="absolute right-3 top-2.5 animate-spin text-[10px] text-gray-600 font-mono">
            ⏳
          </div>
        )}
      </div>

      {/* Floating Dynamic Search Results Dropdown Dropdown Card */}
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-50 p-2">
          {results.map((stock) => (
            <div
              key={stock.id}
              onClick={() => handleSelectStock(stock.search_id)}
              className="flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group"
            >
              <div>
                <span className="text-xs font-bold text-gray-800 group-hover:text-blue-900 block">
                  {stock.title || stock.company_short_name}
                </span>
                <span className="text-[10px] font-mono font-medium text-gray-600">
                  NSE: {stock.nse_scrip_code || "N/A"} · BSE: {stock.bse_scrip_code || "N/A"}
                </span>
              </div>
              <span className="text-[9px] font-mono bg-gray-100 text-gray-500 border border-gray-200 px-1.5 py-0.5 rounded-md font-bold shrink-0">
                {stock.isin ? "EQUITY" : "STOCK"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Edge Case fallback context card */}
      {isOpen && results.length === 0 && query.trim().length >= 2 && !isLoading && (
        <div className="absolute left-0 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl p-4 text-center text-xs text-gray-600 z-50">
          No matching simulated stock vectors found.
        </div>
      )}
    </div>
  );
}
