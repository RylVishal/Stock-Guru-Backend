import React from 'react';
import { Link } from 'react-router-dom';

export default function MarketNews({ data }) {
  // Targets the array path matching your live API payload layout structure
  const articles = data?.feed || [];

  if (articles.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-600 shadow-sm max-w-4xl mx-auto font-sans">
        <p className="font-semibold text-slate-700">No market news stories available right now.</p>
        <p className="text-xs text-slate-600 mt-1">Listening for real-time editorial wire updates...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans select-none">
      
      {/* Header Context Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h2 className="text-base font-bold text-blue-900 flex items-center gap-2 m-0">
          📰 Live Market News Desk
        </h2>
        <span className="text-xs font-semibold bg-blue-50 text-blue-900 border border-blue-100 px-2.5 py-1 rounded-xl font-mono">
          {articles.length} Updates Available
        </span>
      </div>

      {/* Main Articles List Stack */}
      <div className="space-y-4">
        {articles.map((item) => {
          const newsData = item?.data || {};
          const ctaBlock = newsData?.cta?.[0] || {};
          
          // 1. EXTRACT THE READABLE SEARCH SLUG DIRECTLY FROM GROWW CTA URL CONTRACT
          let dynamicSearchId = "";
          if (ctaBlock?.ctaUrl) {
            const urlParts = ctaBlock.ctaUrl.split('/');
            dynamicSearchId = urlParts[urlParts.length - 1]; 
          }

          // Fallback parsing strategy to secure any potential short-term scripts parameter anchors
          const finalSearchId = dynamicSearchId || ctaBlock?.meta?.nseScriptCode || ctaBlock?.meta?.bseScriptCode || "";

          // Safe formatting for nested linebreaks within the editorial feed body string
          const formattedBody = newsData?.body 
            ? newsData.body.split('\n').map((str, index) => (
                <p key={index} className="mt-2 text-sm text-slate-500 leading-relaxed m-0 font-medium">
                  {str}
                </p>
              ))
            : null;

          return (
            <article 
              key={item?.postId || Math.random()} 
              className="bg-white border border-slate-100 rounded-2xl p-6 hover:bg-slate-50/60 transition shadow-sm flex flex-col md:flex-row gap-5 items-start justify-between border-solid"
            >
              {/* Left Column Section: News Metadata Editorial text blocks */}
              <div className="flex-1 min-w-0 text-left">
                <h3 className="text-base md:text-lg font-bold text-slate-800 leading-snug tracking-tight m-0">
                  {newsData?.title || 'Breaking Equity Update'}
                </h3>
                
                <div className="mt-1">{formattedBody}</div>
                
                <div className="flex items-center gap-2.5 text-xs text-slate-600 mt-4 border-t border-slate-100 pt-3 font-mono font-medium">
                  <span className="font-bold text-blue-600 uppercase tracking-wider">
                    {item?.publisher || 'Market Wire'}
                  </span>
                  <span className="text-slate-200">•</span>
                  <time>
                    {item?.publishedAt 
                      ? new Date(item.publishedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : 'Just now'}
                  </time>
                </div>
              </div>

              {/* Right Column Section: Actionable Ticker Card Button Link Container */}
              {ctaBlock?.ctaText && finalSearchId && (
                <Link 
                  to={`/market/stock/${encodeURIComponent(finalSearchId)}`} 
                  className="w-full md:w-48 bg-slate-50/50 hover:bg-white border border-slate-200/80 hover:border-blue-900/50 p-3 rounded-xl flex items-center gap-3 shrink-0 self-center md:self-start transition no-underline shadow-xs cursor-pointer group border-solid box-border"
                >
                  {ctaBlock?.logoUrl && (
                    <img 
                      src={ctaBlock.logoUrl} 
                      alt={ctaBlock.ctaText} 
                      className="w-8 h-8 rounded-full bg-white object-contain p-0.5 border border-slate-200 shadow-xs shrink-0" 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  
                  <div className="min-w-0 flex-1 text-left">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-600 leading-none group-hover:text-blue-600 transition-colors">
                      View Asset
                    </div>
                    <div className="text-sm font-bold text-blue-900 truncate mt-1 leading-tight group-hover:underline">
                      {ctaBlock.ctaText}
                    </div>
                    
                    {/* Optional Stock Exchange Script Badges */}
                    <div className="flex gap-1 flex-wrap mt-1.5">
                      {ctaBlock?.meta?.nseScriptCode && (
                        <span className="text-[8px] font-mono font-bold bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded text-blue-600">
                          NSE: {ctaBlock.meta.nseScriptCode}
                        </span>
                      )}
                      {ctaBlock?.meta?.bseScriptCode && (
                        <span className="text-[8px] font-mono font-bold bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                          BSE: {ctaBlock.meta.bseScriptCode}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}


