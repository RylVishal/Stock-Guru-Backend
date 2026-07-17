import React from 'react';
import { useNavigate } from 'react-router-dom';
import StockTableRow from '../stock/StockTableRow';

export default function MostBought({ data }) {
  const navigate = useNavigate();
  const companies = data?.exploreCompanies?.POPULAR_STOCKS_MOST_BOUGHT || [];

  if (companies.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-600 shadow-xs">
        <p className="font-semibold text-slate-500 m-0">No live stock data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs w-full">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <h2 className="text-base font-bold text-blue-900 flex items-center gap-2 m-0">Most Bought on StockGuru</h2>
        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-md">Top 3</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/30 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100">
              <th className="px-6 py-3.5">Asset / Symbol</th>
              <th className="px-6 py-3.5 text-right">LTP (₹)</th>
              <th className="px-6 py-3.5 text-right">Day Change</th>
              <th className="px-6 py-3.5 text-right">Today's Range (Low / High)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {companies.slice(0, 3).map((item, index) => (
              <StockTableRow 
                key={item?.company?.searchId || item?.company?.isin || index}  
                item={item}
                onClick={() => navigate(`/market/stock/${encodeURIComponent(String(item?.company?.searchId || item?.company?.isin).toLowerCase())}`)}
              />
            ))}
          </tbody>
        </table>
      </div>
      {companies.length > 3 && (
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
          <button onClick={() => navigate('/market/most-bought')} className="text-xs font-bold text-blue-500 hover:text-blue-600 bg-transparent border-none cursor-pointer transition-colors">
            See More Most Bought Stocks →
          </button>
        </div>
      )}
    </div>
  );
}


