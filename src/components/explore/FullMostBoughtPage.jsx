import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StockTableRow from '../stock/StockTableRow';
import { apiClient } from '../../services/auth';

export default function FullMostBoughtPage({ data }) {
  const navigate = useNavigate();
  const [localData, setLocalData] = useState(data || null);
  const [loading, setLoading] = useState(!data);

  const fetchMostBought = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const res = await apiClient.get('/market/most-bought');
      setLocalData(res.data);
    } catch (err) {
      console.error('Failed to sync most-bought data:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    if (!data) fetchMostBought(true);
    const revalidateInterval = setInterval(() => { fetchMostBought(false); }, 5 * 60 * 1000);
    return () => clearInterval(revalidateInterval);
  }, [data]);

  const dataToUse = data || localData;
  const companies = dataToUse?.exploreCompanies?.POPULAR_STOCKS_MOST_BOUGHT || [];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 select-none">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/market/explore")} className="px-4 py-2 text-xs font-bold text-blue-900 bg-white hover:bg-slate-50 border border-gray-200 rounded-xl shadow-xs cursor-pointer transition">
              ← Back to Dashboard
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-blue-900 m-0">Most Bought Stocks</h1>
              <p className="text-xs text-gray-600 font-medium m-0 mt-0.5">Comprehensive review on Stockguru</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Tracking Live
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-600 border-b border-gray-100">
                  <th className="px-6 py-4">Asset / Symbol</th>
                  <th className="px-6 py-4 text-right">LTP (₹)</th>
                  <th className="px-6 py-4 text-right">Day Change</th>
                  <th className="px-6 py-4 text-right">Today's Range (Low / High)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {companies.map((item, index) => (
                  <StockTableRow 
                    key={item?.company?.searchId || item?.company?.isin || index} 
                    item={item} 
                    onClick={() => navigate(`/market/stock/${encodeURIComponent(String(item?.company?.searchId || item?.company?.isin).toLowerCase())}`)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
