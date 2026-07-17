import React from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Added routing hook import
import StockTableRow from '../stock/StockTableRow'; // 2. Added reusable row component import

function StockTable({ title, dataPayload, type }) {
  const isGainer = type === 'gainers';
  const navigate = useNavigate(); // 3. Initialized navigation driver instance
  
  // Extract stock dataset from the flat layout array safely
  const stockList = dataPayload?.data?.stocks || [];

  if (stockList.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center text-gray-600 text-xs flex-1 shadow-sm">
        No active data stream for {title}.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex-1">
      {/* Header Block Panel with Soft Colored Pill Accent */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <h3 className="text-base font-bold text-blue-900 m-0 flex items-center gap-2">
          <span>{isGainer ? '📈' : '📉'}</span> {title}
        </h3>
        <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-lg border ${
          isGainer 
            ? 'bg-green-50 text-green-700 border-green-200' 
            : 'bg-red-50 text-red-600 border-red-100'
        }`}>
          Top {Math.min(stockList.length, 5)}
        </span>
      </div>

      {/* Corporate Ledger Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-600 border-b border-gray-100">
              <th className="px-5 py-3.5">Company / Script</th>
              <th className="px-5 py-3.5 text-right">LTP (₹)</th>
              <th className="px-5 py-3.5 text-right">Net Change</th>
              <th className="px-5 py-3.5 text-right">Today's range (low/high)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
             {stockList.slice(0, 5).map((stock, index) => {
              // 4. Transform keys dynamically to match your StockTableRow prop expectations exactly
              const ltp = stock?.ltp ?? null;
              const close = stock?.close ?? null;
              
              const transformedItem = {
                company: {
                  searchId: stock?.searchId,
                  isin: stock?.isin,
                  companyName: stock?.companyShortName || stock?.companyName,
                  imageUrl: stock?.logoUrl,
                  nseScriptCode: stock?.nseScriptCode || stock?.bseScriptCode
                },
                stats: {
                  ltp: ltp,
                  dayChange: ltp !== null && close !== null ? ltp - close : null,
                  dayChangePerc: ltp !== null && close !== null && close !== 0 ? (((ltp - close) / close) * 100) : null,
                  low: stock?.low ?? (ltp !== null ? ltp * 0.98 : null),
                  high: stock?.high ?? (ltp !== null ? ltp * 1.02 : null)
                }
              };

              return (
                <StockTableRow 
                  key={stock?.searchId || stock?.isin || index} 
                  item={transformedItem} 
                  // 5. Attached string safe, escaped routing redirect handlers onto the row cells
                  onClick={() => navigate(`/market/stock/${encodeURIComponent(String(stock?.searchId || stock?.isin || '').toLowerCase())}`)}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function StockMovers({ gainersData, losersData }) {
  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full md:flex-row gap-4 w-full">
      {/* Explicitly passing data properties straight down to separate table structures */}
      <StockTable title="Top Gainers" dataPayload={gainersData} type="gainers" />
      <StockTable title="Top Losers" dataPayload={losersData} type="losers" />
    </div>
  );
}
