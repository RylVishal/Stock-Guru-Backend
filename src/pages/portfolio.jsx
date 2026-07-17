import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import PortfolioSummary from '../components/portfolio/portfoliosummary';
import HoldingsList from '../components/portfolio/holdinglist';
import TradeSlip from '../components/portfolio/tradingorder';
import PortfolioAnalytics from '../components/portfolio/PortfolioAnalytics';


export default function PortfolioDashboard() {
  const [analyticsRaw, setAnalyticsRaw] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('holdings');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [holdings, setHoldings] = useState([]);
  const [summary, setSummary] = useState(null);

  const [tradeForm, setTradeForm] = useState({
    searchId: '', symbol: '', quantity: 1, price: 0, orderType: 'BUY', assetName: ''
  });


  const fetchPortfolioData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [analyticsRes, historyRes, summaryRes] = await Promise.allSettled([
        api.get('/portfolio/analytics'),
        api.get('/portfolio/history'),
        api.get('/portfolio/summary')
      ]);

      const normalizeListPayload = (value) => {
        if (Array.isArray(value)) return value;
        if (!value || typeof value !== 'object') return [];
        return value.data || value.history || value.data?.history || [];
      };

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.data) {
        const rawPayload = analyticsRes.value.data?.data || analyticsRes.value.data;
        setAnalyticsRaw(rawPayload);
        setHoldings(rawPayload?.holdings || []);
      }

      const summaryPayload = summaryRes.status === 'fulfilled' ? summaryRes.value.data : null;
      const summaryData = summaryPayload?.data || summaryPayload || {};
      setSummary({
        cashBalance:     Number(summaryData.cashBalance     ?? 0),
        totalInvested:   Number(summaryData.totalInvested   ?? 0),
        totalProfitLoss: Number(summaryData.totalProfitLoss ?? 0),
        holdingsCount:   Number(summaryData.holdingsCount ?? summaryData.holdingCount ?? 0)
      });

      if (historyRes.status === 'fulfilled') {
        setHistory(normalizeListPayload(historyRes.value.data));
      }
    } catch (err) {
      if (!silent) toast.error(err.response?.data?.message || 'Data sync error.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchPortfolioData(false);
    const interval = setInterval(() => {
      fetchPortfolioData(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchPortfolioData]);

  const handleExecuteTrade = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    if (!tradeForm.symbol || !tradeForm.quantity || tradeForm.quantity < 1) {
      toast.error('Please select a stock and valid quantity.');
      return;
    }

    setActionLoading(true);
    const isBuy = tradeForm.orderType === 'BUY';
    const endpoint = isBuy ? '/portfolio/buy' : '/portfolio/sell';
    const payload = isBuy
      ? { searchId: String(tradeForm.searchId || tradeForm.symbol).trim(), quantity: Number(tradeForm.quantity) }
      : { symbol: String(tradeForm.symbol).trim(), quantity: Number(tradeForm.quantity) };

    try {
      const response = await api.post(endpoint, payload);
      if (response.data?.success) {
        toast.success(`${tradeForm.orderType} order executed successfully!`);
        setTradeForm(prev => ({ ...prev, searchId: '', symbol: '', quantity: 1, price: 0, assetName: '' }));
        fetchPortfolioData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction error.');
    } finally {
      setActionLoading(false);
    }
  };


  if (isLoading && !summary) {
    return (
      <div className="p-4 sm:p-6 space-y-6 bg-slate-50 min-h-screen animate-pulse">
        {/* Summary shimmer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
          {[1,2,3,4].map((i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="h-2.5 bg-slate-200 rounded w-1/2"></div>
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        {/* Holdings + Tradeslip shimmer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            {[1,2,3,4].map((i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-slate-100">
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-32"></div>
                  <div className="h-2.5 bg-slate-100 rounded w-20"></div>
                </div>
                <div className="space-y-2 text-right">
                  <div className="h-3 bg-slate-200 rounded w-20 ml-auto"></div>
                  <div className="h-2.5 bg-slate-100 rounded w-12 ml-auto"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
            <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
            <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
            <div className="h-12 bg-slate-200 rounded-xl w-full mt-4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 min-h-screen text-left">
      <PortfolioSummary summary={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HoldingsList 
            holdings={holdings} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            history={history} 
            analyticsData={analyticsRaw} 
          />
        </div>

        <div className="lg:col-span-1">
          <TradeSlip 
            tradeForm={tradeForm} 
            setTradeForm={setTradeForm} 
            onSubmit={handleExecuteTrade} 
            actionLoading={actionLoading} 
            holdings={holdings} 
          />
        </div>
      </div>
    </div>
  );
}



// import React, { useState, useEffect, useCallback } from 'react';
// import TradingSlipContainer from '../components/portfolio/tradeslip';
// import PortfolioSummary from '../components/portfolio/portfoliosummary';
// import HoldingsList from '../components/portfolio/holdinglist';
// import { apiClient as api } from '../services/auth';
// // Note: Replace these custom child element components with your actual absolute or relative file pathway imports
// // import PortfolioSummary from './PortfolioSummary';
// // import HoldingsList from './HoldingsList';
// // import api from '../utils/api'; 

// export default function PortfolioDashboard() {
//   // Global Data Fetch State Storage Nodes
//   const [analyticsRaw, setAnalyticsRaw] = useState(null); 
//   const [history, setHistory] = useState([]);
//   const [activeTab, setActiveTab] = useState('holdings');
//   const [isLoading, setIsLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [feedback, setFeedback] = useState({ type: '', message: '' });
//   const [holdings, setHoldings] = useState([]); 
//   const [summary, setSummary] = useState(null);

//   // Single Core State Source of Truth for the Active Slip Layout
//   const [tradeForm, setTradeForm] = useState({
//     searchId: '',
//     symbol: 'RELIANCE',
//     quantity: '',
//     price: '',
//     orderType: 'BUY',
//     assetName: ''
//   });

//   // Concurrent Asynchronous Portfolio Sync Handshake Channel Pipeline
//   const fetchPortfolioData = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const [analyticsRes, historyRes, summaryRes] = await Promise.allSettled([
//         api.get('/portfolio/analytics'),
//         api.get('/portfolio/history'),
//         api.get('/portfolio/summary')
//       ]);

//       const normalizeListPayload = (value) => {
//         if (Array.isArray(value)) return value;
//         if (!value || typeof value !== 'object') return [];
//         return value.data || value.history || value.data?.history || [];
//       };

//       // Extract Live Analytics & Matching User Holdings Datasets Simultaneously
//       if (analyticsRes.status === 'fulfilled' && analyticsRes.value.data) {
//         const rawPayload = analyticsRes.value.data?.data || analyticsRes.value.data;
//         setAnalyticsRaw(rawPayload);
//         const analyticsHoldings = rawPayload?.holdings || [];
//         setHoldings(analyticsHoldings);
//       }

//       // Extract Operational Financial Summary Snapshot Aggregations
//       const summaryPayload = summaryRes.status === 'fulfilled' ? summaryRes.value.data : null;
//       const summaryData = summaryPayload?.data || summaryPayload || {};
      
//       const cashBalance = Number(summaryData.cashBalance ?? 0);
//       const backendInvested = Number(summaryData.totalInvested ?? 0);
//       const backendPnL = Number(summaryData.totalProfitLoss ?? 0);

//       setSummary({
//         cashBalance,
//         totalInvested: backendInvested,
//         totalProfitLoss: backendPnL,
//         holdingsCount: Number(summaryData.holdingsCount ?? summaryData.holdingCount ?? 0)
//       });

//       // Extract Complete Historical Transaction Ledgers Sheet Array
//       if (historyRes.status === 'fulfilled') {
//         setHistory(normalizeListPayload(historyRes.value.data));
//       }
//     } catch (err) {
//       setFeedback({ type: 'error', message: err.response?.data?.message || 'Data sync error.' });
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   // Structural Framework Processing Cycle Mounting Event Trigger
//   useEffect(() => {
//     fetchPortfolioData();
//   }, [fetchPortfolioData]);

//   // Integrated API Submission Execution Interceptor Handler
//   const handleExecuteTrade = async (currentSlipData) => {
//     if (!currentSlipData.symbol || !currentSlipData.quantity || currentSlipData.quantity < 1) {
//       setFeedback({ type: 'error', message: 'Please select a stock and enter a valid quantity.' });
//       return;
//     }

//     setActionLoading(true);
//     setFeedback({ type: '', message: '' });

//     const isBuy = currentSlipData.orderType === 'BUY';
//     const endpoint = isBuy ? '/portfolio/buy' : '/portfolio/sell';
    
//     const payload = isBuy 
//       ? { searchId: String(currentSlipData.searchId || currentSlipData.symbol).trim(), quantity: Number(currentSlipData.quantity) }
//       : { symbol: String(currentSlipData.symbol).trim(), quantity: Number(currentSlipData.quantity) };

//     try {
//       const response = await api.post(endpoint, payload);
//       if (response.data?.success) {
//         setFeedback({ type: 'success', message: `Order executed successfully!` });
//         // Automatically fetch network states to instantly redraw tables and balances
//         fetchPortfolioData();
//       }
//     } catch (err) {
//       setFeedback({ type: 'error', message: err.response?.data?.message || 'Transaction processing failed.' });
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   if (isLoading && !summary) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-slate-50">
//         <div className="text-xs font-mono font-bold text-slate-600 tracking-widest animate-pulse uppercase">
//           Synchronizing Ledger Accounts...
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 sm:p-6 space-y-6 bg-slate-50 min-h-screen text-left">
      
//       {/* Portfolio Financial Performance Dashboard Metric Block Cards Row */}
//       <PortfolioSummary summary={summary} />

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
//         {/* Left Hand: Open Asset Asset Positions and Historical Transaction Ledgers Sheet Grid */}
//         <div className="lg:col-span-2">
//           <HoldingsList 
//             holdings={holdings} 
//             activeTab={activeTab} 
//             setActiveTab={setActiveTab} 
//             history={history} 
//             analyticsData={analyticsRaw} 
//             onAssetSelect={(clickedSymbol) => setTradeForm(prev => ({ ...prev, symbol: clickedSymbol }))}
//           />
//         </div>
        
//         {/* Right Hand: Context Aware Interactive Dynamic Unified Trading Slip Panel Box */}
//         <div className="lg:col-span-1">
//           <div className="space-y-4">
//             <h2 className="text-xs font-black text-slate-600 uppercase tracking-widest px-1">
//               Terminal Order Entry
//             </h2>
            
//             <TradingSlipContainer 
//               tradeForm={tradeForm}
//               setTradeForm={setTradeForm}
//               actionLoading={actionLoading}
//               feedback={feedback}
//               onTradeComplete={handleExecuteTrade}
//             />
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }






