import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/auth'; // Ensure this points to your Axios instance
import Navbar from '../home/Navbar';
import StockChart from './StockChart';
import StockCandleChart from './stockcandlechart'
import StockDetailPage from './Stockpro';
import PieChart from './PieChart';
import BarChart from './BarChart';

export default function StockDetailsPage() {
    const { searchId } = useParams();
    // Extracts the search id from url path parameters
    const navigate = useNavigate();

    // Unified Internal Application States
    const [stockData, setStockData] = useState(null);
    const [activeQuarter, setActiveQuarter] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [chart, setChart] = useState("📈");
    const [holdings, setHoldings] = useState([]);
    // Fetch stock profile parameters on initial component load or url param change
    useEffect(() => {
        const fetchStockDetails = async () => {
            setIsLoading(true);
            setError("");
            try {
                // MATCHES BACKEND CONTRACT: GET /api/market/stock/{searchId}
                const response = await apiClient.get(`/market/stock/${encodeURIComponent(searchId)}`);

                if (response.data) {
                    const data = response.data;
                    setStockData(data);

                    // Fallback parsing strategy to pre-select the latest quarter configuration array
                    if (data.shareHoldingPattern) {
                        const quarters = Object.keys(data.shareHoldingPattern);
                        setActiveQuarter(quarters[quarters.length - 1] || "");
                    }
                }
            } catch (err) {
                console.error("Stock profile extraction loop error:", err);
                setError(err.response?.data?.message || "Failed to locate stock profile credentials.");
            } finally {
                setIsLoading(false);
            }
        };

        if (searchId) fetchStockDetails();
    }, [searchId]);

    // Handle data-feed fallback spinner sequence safely - Light Blue Adaptive Layout
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-800 font-sans animate-pulse">
                <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

                    {/* Header Shimmer */}
                    <div className="space-y-2 border-b border-slate-200 pb-4">
                        <div className="h-6 bg-slate-200 rounded w-1/4 md:w-1/6"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2 md:w-1/3"></div>
                    </div>

                    {/* Quick Metrics Cards Shimmer */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                        {[1, 2, 3, 4].map((index) => (
                            <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                <div className="h-6 bg-slate-200 rounded w-3/4 mt-1"></div>
                            </div>
                        ))}
                    </div>

                    {/* Main Content Layout Grid Shimmer */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left Box: Chart/Analytics Shimmer */}
                        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                            <div className="h-48 bg-slate-100 rounded-xl w-full"></div>
                        </div>

                        {/* Right Box: Order Placement Panel Shimmer */}
                        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                            <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                            <div className="space-y-3">
                                <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
                                <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
                            </div>
                            <div className="h-10 bg-blue-200 rounded-xl w-full mt-4"></div>
                        </div>

                    </div>

                </div>
            </div>
        );
    }


    // Handle Error or Empty response profile states - Light Blue Adaptive Layout
    if (error || !stockData || !stockData.header) {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col">
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl text-center max-w-sm w-full shadow-md">
                        <div className="w-12 h-12 bg-rose-50 text-rose-500 border border-rose-200 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">⚠️</div>
                        <h3 className="text-slate-800 font-bold text-base mb-1">Sync Fault</h3>
                        <p className="text-slate-500 text-xs mb-4">{error || "Requested equity parameters missing."}</p>
                        <button
                            type="button"
                            onClick={() => navigate('/market/explore')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl text-sm transition cursor-pointer border-none"
                        >
                            Return to Markets Hub
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Destructure validated model variables - handle both old and new API response formats
    const { header, details, fundamentals, shareHoldingPattern, fundsInvested, priceData, financialStatement } = stockData;
    
    // Create stats object from available data for backward compatibility
    const stats = {
        cappedType: "Large Cap", // Default or could be derived from market cap
        currentPrice: priceData?.nse?.yearHighPrice || priceData?.bse?.yearHighPrice || null
    };

    // Prepare shareholding data for pie chart
    const shareholdingData = shareHoldingPattern && shareHoldingPattern[activeQuarter]
        ? Object.entries(shareHoldingPattern[activeQuarter]).map(([holder, data]) => {
            const percent = typeof data === 'object' ? data.percent : data;
            return {
              label: holder.replace(/([A-Z])/g, ' $1').trim(),
              value: Number(percent || 0)
            };
          })
        : [];

    // Prepare fundamentals data for bar chart
    const fundamentalsData = fundamentals?.slice(0, 8).map((item) => ({
      label: item.shortName || item.name,
      value: parseFloat(item.value) ?? 0
    })) || [];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans select-none">

            <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

                {/* Navigation Breadcrumb Line */}
                <div className="text-xs text-slate-600 font-mono">
                    <span className="hover:text-slate-600 cursor-pointer transition-colors" onClick={() => navigate('/market/explore')}>MARKETS</span>
                    <span className="mx-2">/</span>
                    <span className="text-blue-600 font-bold uppercase">{header.shortName}</span>
                </div>

                {/* SECTION 1: TOP PROFILE RIBBON */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-4">
                        <img
                            src={header.logoUrl}
                            alt={header.displayName}
                            className="w-14 h-14 rounded-xl bg-white p-1 object-contain border border-slate-200 shadow-sm shrink-0"
                            onError={(e) => { e.target.src = "https://placehold.co"; }} // Valid dynamic placeholder fallback layout link
                        />
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800 m-0">{details.fullName}</h1>
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md shrink-0">
                                    {stats.cappedType || "Large Cap"}
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 font-mono mt-1 m-0">
                                NSE: <span className="text-slate-700 font-bold mr-3">{header.nseScriptCode}</span>
                                BSE: <span className="text-slate-700 font-bold">{header.bseScriptCode}</span>
                            </p>
                        </div>
                    </div>

                    <div className="text-left md:text-right border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 w-full md:w-auto">
                        <span className="text-[10px] text-slate-600 uppercase font-mono block tracking-wider font-bold">Industry Classification</span>
                        <span className="text-sm font-bold text-blue-600">{header.industryName}</span>
                        <span className="text-xs text-slate-600 font-mono block mt-0.5">ISIN: {header.isin}</span>
                    </div>
                </div>

                {/* TWO COLUMN INTERACTION CONTAINER */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT: BUSINESS OVERVIEW & KEY FUNDAMENTALS */}
                    <div className="lg:col-span-2 space-y-6">

                        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
                            {/* DYNAMIC SCREEN VIEWPORT SWITCH ENGINE USING EMOJIS */}
                            <div className="w-full">
                                <button
                                    type="button"
                                    onClick={() => setChart(chart === '📈' ? '📊' : '📈')}
                                    className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono font-bold cursor-pointer transition-all shadow-xs flex items-center gap-1.5 select-none mb-2"
                                >
                                    {chart === '📈' ? '📊' : '📈'}
                                </button>
                                {chart === '📈' ? (
                                    <StockCandleChart symbol={header.nseScriptCode || header.bseScriptCode || searchId} />
                                ) : (
                                    <StockChart symbol={header.nseScriptCode || header.bseScriptCode || searchId} />
                                )}
                            </div>
                        </div>
                        {/* <button
                            onClick={() => navigate(`/market/stock/${stock.searchId || stock.id}`, {
                                state: {
                                    initialOrderType: 'BUY', // Or 'SELL' based on which button they clicked
                                    initialSymbol: stock.symbol || stock.nse_scrip_code,
                                    initialPrice: stock.price || stock.currentPrice,
                                    initialName: stock.title || stock.companyName
                                }
                            })}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl border-none cursor-pointer"
                        >
                            Buy Stock
                        </button> */}

                        {/* Business Profile Summary */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 m-0">Profile Summary</h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium m-0 pt-1">
                                {details.businessSummary}
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs pt-3 border-t border-slate-100 mt-2">
                                <div>
                                    <span className="text-slate-600 block font-bold">CEO</span>
                                    <span className="font-semibold text-slate-700">{details.ceo || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-slate-600 block font-bold">Founded</span>
                                    <span className="font-semibold text-slate-700 font-mono">{details.foundedYear || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-slate-600 block font-bold">Headquarters</span>
                                    <span className="font-semibold text-slate-700">{details.headquarters}</span>
                                </div>
                            </div>
                        </div>

                        {/* Fundamentals Bar Chart */}
                        {fundamentalsData.length > 0 && (
                            <BarChart
                                data={fundamentalsData}
                                title="Key Fundamentals"
                                color="#3B82F6"
                            />
                        )}
                    </div>
                    {/* RIGHT: ANALYTICS */}
                    <div className="space-y-6">
                        {/* Shareholding Pie Chart */}
                        {shareholdingData.length > 0 && (
                            <PieChart
                                data={shareholdingData}
                                title="Shareholding Pattern"
                                colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316']}
                            />
                        )}

                        {/* Mutual Funds Invested List */}
                        {fundsInvested && fundsInvested.length > 0 && (
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 m-0">Institutional Backing</h3>
                                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                                    {fundsInvested.map((fund, idx) => (
                                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs font-mono hover:border-blue-100 hover:bg-blue-50/20 transition-colors">
                                            <div className="max-w-[70%]">
                                                <span className="font-bold text-slate-700 block truncate">{fund.name}</span>
                                                <span className="text-[10px] text-slate-600 block mt-0.5">AUM Weight: {fund.investedAumPercent?.toFixed(2)}%</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="bg-blue-50 px-2 py-0.5 rounded text-blue-600 font-bold">★ {fund.rating || 'N/A'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
};

