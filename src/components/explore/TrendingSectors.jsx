import React from 'react';

export default function TrendingSectors({ data }) {
  // Directly targets the array key from the live Groww payload schema
  const sectors = data?.data?.sectors || [];

  if (sectors.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-600 shadow-sm">
        <p className="font-semibold text-slate-600">No live trending sectors tracked right now.</p>
        <p className="text-xs text-slate-600 mt-1">Awaiting local exchange sector index ticks...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
        📊 Market Sector Distribution Heatmap
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-2 xs:grid-cols-2 lg:grid-cols-3 gap-6">
        {sectors.map((sector) => {
          const total = sector?.totalStocks || 0;
          const advances = sector?.positiveStocks || 0;
          const declines = sector?.negativeStocks || 0;
          const dayChange = sector?.dayChangePercent || 0;
          const isPositive = dayChange >= 0;

          // Safe percentage distribution computation
          const advanceRatio = total > 0 ? ((advances / total) * 100).toFixed(0) : 0;

          return (
            <div 
              key={sector?.industryCode || sector?.sectorName} 
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-md transition-all duration-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Sector Branding Header Row */}
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {sector?.sectorLogo && (
                      <div className="w-8 h-8 rounded bg-slate-50 p-1 flex items-center justify-center border border-slate-100 shrink-0">
                        <img 
                          src={sector.sectorLogo} 
                          alt={sector.sectorName} 
                          className="w-full h-full object-contain"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                    <h3 className="font-bold text-slate-800 text-sm tracking-tight truncate">
                      {sector?.sectorName || 'Generic Sector'}
                    </h3>
                  </div>
                  
                  <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded shrink-0 ${
                    isPositive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                  }`}>
                    {isPositive ? '+' : ''}{dayChange.toFixed(2)}%
                  </span>
                </div>
                
                {/* Split Bar Display Tracker (Advances vs Declines) */}
                <div className="w-full bg-slate-100 rounded-full h-2 mb-4 flex overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all" style={{ width: `${advanceRatio}%` }}></div>
                  <div className="bg-rose-500 h-full transition-all" style={{ width: `${100 - advanceRatio}%` }}></div>
                </div>
              </div>

              {/* Aggregated Analytics Footer */}
              <div className="grid grid-cols-3 gap-1 text-center text-[11px] font-mono border-t border-slate-100 pt-3 mt-1">
                <div>
                  <div className="text-slate-600 text-[9px] font-sans font-bold uppercase tracking-wider">Total</div>
                  <div className="text-slate-700 font-bold mt-0.5">{total}</div>
                </div>
                <div>
                  <div className="text-emerald-600 text-[9px] font-sans font-bold uppercase tracking-wider">Advances</div>
                  <div className="text-emerald-600 font-bold mt-0.5">{advances}</div>
                </div>
                <div>
                  <div className="text-rose-600 text-[9px] font-sans font-bold uppercase tracking-wider">Declines</div>
                  <div className="text-rose-600 font-bold mt-0.5">{declines}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


