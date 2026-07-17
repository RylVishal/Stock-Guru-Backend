import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // 💡 Added useLocation
import { apiClient } from '../../services/auth'; 
import Navbar from '../home/Navbar';
import StockCandleChart from '../stock/stockcandlechart';
import TradeSlip from '../portfolio/tradingorder';

export default function StockDetailPage() {
    const { searchId } = useParams();
    const navigate = useNavigate();
    const location = useLocation(); // 💡 Captures data passed via navigate state

    // Extract any pre-filled data sent from the redirect button safely
    const redirectedData = location.state || {};

    const [stockData, setStockData] = useState(null);
    const [activeQuarter, setActiveQuarter] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [holdings, setHoldings] = useState([]);
    const [actionLoading, setActionLoading] = useState(false);

    // 💡 FIX: Pre-fill the state parameters right on initialization!
    const [tradeForm, setTradeForm] = useState({ 
        orderType: redirectedData.initialOrderType || "BUY", 
        searchId: searchId || "", 
        symbol: redirectedData.initialSymbol || "", 
        price: redirectedData.initialPrice && Number(redirectedData.initialPrice) > 0 ? Number(redirectedData.initialPrice) : null, 
        quantity: 1 
    });

    // Core Data Sync Hook Pipeline
    useEffect(() => {
        const fetchStockDetailsAndHoldings = async () => {
            setIsLoading(true); setError("");
            try {
                const stockResponse = await apiClient.get(`/market/stock/${encodeURIComponent(searchId)}`);
                
                try {
                    const holdingsResponse = await apiClient.get('/portfolio/holdings');
                    if (holdingsResponse.data) {
                        setHoldings(Array.isArray(holdingsResponse.data) ? holdingsResponse.data : holdingsResponse.data.holdings || []);
                    }
                } catch (holdingsErr) {
                    console.warn("Failed to fetch holdings list info:", holdingsErr);
                }

                if (stockResponse.data) {
                    const receivedData = stockResponse.data;
                    setStockData(receivedData);

                    const sym = (receivedData.header?.nseScriptCode || receivedData.header?.shortName || 'STK').toUpperCase();
                    
                    let livePrice = null;
                    try {
                        const priceRes = await apiClient.get(`/market/live-price/${sym}`);
                        const freshPrice = priceRes.data?.livePrice;
                        // Only update if the API returned a valid number, or if we don't have a price yet
                        if (freshPrice !== null && freshPrice !== undefined && Number.isFinite(Number(freshPrice)) && Number(freshPrice) > 0) {
                            livePrice = Number(freshPrice);
                        } else if (!tradeForm.price || tradeForm.price === "Offline") { 
                            // If it's null AND we have no existing price, mark as offline
                            livePrice = "Offline";
                        }
                    } catch (priceErr) {
                        console.warn("Failed to fetch initial live price:", priceErr.message);
                        // If we have no price and fetch fails, mark as offline
                        if (!tradeForm.price || tradeForm.price === "Offline") {
                            livePrice = "Offline";
                        }
                    }

                    setTradeForm(prev => ({
                        ...prev,
                        searchId: searchId || '',
                        symbol: sym,
                        // Preserve last valid price if we already have one, otherwise use fresh price or mark offline
                        price: prev.price && Number.isFinite(Number(prev.price)) && Number(prev.price) > 0
                            ? prev.price
                            : (livePrice !== null ? livePrice : "Offline")
                    }));

                    if (receivedData.shareHoldingPattern) {
                        const quarters = Object.keys(receivedData.shareHoldingPattern);
                        setActiveQuarter(quarters[quarters.length - 1] || "");
                    }
                }
            } catch (err) { 
                console.error(err);
                setError(err.response?.data?.message || "Failed to locate stock profile credentials.");
            } finally { setIsLoading(false); }
        };
        if (searchId) fetchStockDetailsAndHoldings();
    }, [searchId]);

    const handleOrderExecution = async (e) => {
        try {
            const endpoint = tradeForm.orderType === "BUY" ? "/portfolio/buy" : "/portfolio/sell";
            await apiClient.post(endpoint, {
                searchId: tradeForm.searchId,
                symbol: tradeForm.symbol,
                quantity: Number(tradeForm.quantity),
                price: Number(tradeForm.price)
            });

            const refreshHoldingsRes = await apiClient.get('/portfolio/holdings');
            if (refreshHoldingsRes.data) {
                setHoldings(Array.isArray(refreshHoldingsRes.data) ? refreshHoldingsRes.data : refreshHoldingsRes.data.holdings || []);
            }
        } catch (err) { 
            throw err; 
        }
    };

    if (isLoading) {
        return <div className="min-h-screen bg-slate-50 animate-pulse p-6 max-w-7xl mx-auto space-y-6"><div className="h-10 bg-slate-200 rounded w-1/4"></div></div>;
    }

    if (error || !stockData || !stockData.header) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                <div className="bg-white border p-6 rounded-2xl text-center max-w-sm w-full shadow-md">
                    <h3 className="text-slate-800 font-bold mb-1">Sync Fault</h3>
                    <p className="text-slate-500 text-xs mb-4">{error || "Requested equity parameters missing."}</p>
                    <button onClick={() => navigate('/markets')} className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm border-none cursor-pointer">Return to Markets Hub</button>
                </div>
            </div>
        );
    }

    const { header, details, fundamentals, shareHoldingPattern, priceData } = stockData;
    
    // Derive display price from priceData — live last price preferred
    const stats = {
        cappedType: "Large Cap",
        currentPrice: priceData?.nse?.lastPrice || 
                      priceData?.bse?.lastPrice || 
                      priceData?.nse?.closePrice || 
                      priceData?.bse?.closePrice || 
                      null
    };


    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans select-none pb-12">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                
                {/* BREADCRUMB */}
                <div className="text-xs text-slate-600 font-mono">
                    <span className="hover:text-slate-600 cursor-pointer" onClick={() => navigate('/market/explore')}>MARKETS</span>
                    <span className="mx-2">/</span>
                    <span className="text-blue-600 font-bold uppercase">{header.shortName}</span>
                </div>

                {/* PROFILE HEADER RIBBON */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <img src={header.logoUrl || "https://placehold.co"} alt={header.displayName} className="w-14 h-14 rounded-xl bg-white p-1 object-contain border border-slate-200 shrink-0" onError={(e) => { e.target.src = "https://placehold.co"; }} />
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl md:text-2xl font-bold text-slate-800 m-0">{details.fullName}</h1>
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md shadow-inner">{stats.cappedType || "Large Cap"}</span>
                            </div>
                            <p className="text-xs text-slate-600 font-mono mt-1 m-0">
                                NSE: <span className="text-slate-700 font-bold mr-3">{header.nseScriptCode || "N/A"}</span>
                                BSE: <span className="text-slate-700 font-bold">{header.bseScriptCode || "N/A"}</span>
                            </p>
                        </div>
                    </div>
                    <div className="text-left md:text-right border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                        <span className="text-[10px] text-slate-600 uppercase font-mono block tracking-wider font-bold">Current Price</span>
                        <div className="text-2xl font-bold text-slate-900 font-mono">
                            {tradeForm.price === "Offline" || stats.currentPrice === null ? (
                                <span className="text-slate-400 text-xl">Market Closed</span>
                            ) : (
                                `₹${(Number(tradeForm.price || stats.currentPrice)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                            )}
                        </div>
                    </div>
                </div>

                {/* CORE SPLIT WORKSPACE GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* LEFT ANALYTICS STREAM COLUMN */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <StockCandleChart symbol={header.nseScriptCode || header.shortName} />
                        </div>
                    </div>

                    {/* RIGHT STICKY ORDER SLIP COLUMN */}
                    <div className="lg:col-span-1">
                        <TradeSlip 
                            tradeForm={tradeForm} 
                            setTradeForm={setTradeForm} 
                            onSubmit={handleOrderExecution} 
                            actionLoading={actionLoading} 
                            // 💡 Use the passed initialName string if it exists, otherwise fall back to header metadata
                            defaultName={redirectedData.initialName || details?.fullName || header?.shortName || ""} 
                            holdings={holdings} 
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}
