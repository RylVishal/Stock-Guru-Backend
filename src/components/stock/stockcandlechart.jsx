import React, { useState, useEffect, useCallback } from 'react';
import Chart from 'react-apexcharts';
import { apiClient } from '../../services/auth';

export default function StockCandleChart({ symbol }) {
    const [candleSeries, setCandleSeries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [timeframe, setTimeframe] = useState("1D");

    // Live state tracking for the top-right metric panel
    const [ohlc, setOhlc] = useState({ open: "-", high: "-", low: "-", close: "-" });

    const TIMEFRAMES = ["1D", "1W", "1M", "3M", "6M", "1Y", "3Y", "5Y", "All"];

    const fetchCandleData = useCallback(async (silent = false) => {
        if (!symbol) return;
        if (!silent) setIsLoading(true);
        if (!silent) setError(""); 
        try {
            const response = await apiClient.get(`/market/chart/${encodeURIComponent(String(symbol).toUpperCase())}`, {
                params: { 
                    range: timeframe === "All" ? "ALL" : timeframe, 
                    type: 'candlestick' 
                }
            });
            
            const candlePayload = response.data?.candles || response.data?.data?.candles || response.data;
            const rawData = Array.isArray(candlePayload) ? candlePayload : [];
            
            if (rawData.length > 0) {
                const formattedCandles = rawData.map((row) => {
                    let timestamp, open, high, low, close;

                    if (Array.isArray(row)) {
                        timestamp = row[0];
                        open = row[1];
                        high = row[2];
                        low = row[3];
                        close = row[4];
                    } else if (row && typeof row === 'object') {
                        timestamp = row.timestamp || row.time || row.date;
                        open = row.open || row.o;
                        high = row.high || row.h;
                        low = row.low || row.l;
                        close = row.close || row.c;
                    }

                    const numericTimestamp = Number(timestamp);
                    const dateValue = Number.isFinite(numericTimestamp) ? numericTimestamp * 1000 : Date.parse(timestamp);
                    
                    return {
                        x: new Date(dateValue).getTime(),
                        y: [
                            parseFloat(open ?? 0),
                            parseFloat(high ?? open ?? 0),
                            parseFloat(low ?? open ?? 0),
                            parseFloat(close ?? open ?? 0)
                        ]
                    };
                });

                formattedCandles.sort((a, b) => a.x - b.x);
                setCandleSeries([{ name: symbol.toUpperCase(), data: formattedCandles }]);

                if (formattedCandles.length > 0) {
                    const latestCandle = formattedCandles[formattedCandles.length - 1].y;
                    setOhlc({
                        open: latestCandle[0].toFixed(2),
                        high: latestCandle[1].toFixed(2),
                        low: latestCandle[2].toFixed(2),
                        close: latestCandle[3].toFixed(2)
                    });
                }
            } else {
                if (!silent) setError("No candle data returned from server.");
            }
        } catch (err) {
            console.error("Candlestick stream crash:", err);
            if (!silent) setError(err.response?.data?.message || "Failed to sync chart assets.");
        } finally {
            if (!silent) setIsLoading(false);
        }
    }, [symbol, timeframe]);

    // Initial load + 15s live polling for 1D view
    useEffect(() => {
        fetchCandleData(false);
        if (timeframe !== '1D') return;
        const interval = setInterval(() => fetchCandleData(true), 15000);
        return () => clearInterval(interval);
    }, [fetchCandleData, timeframe]);


    const chartOptions = {
    chart: {
        type: 'candlestick',
        toolbar: { show: false },
        sparkline: { enabled: false },
        animations: { enabled: true, easing: 'easeinout', speed: 500 },
        events: {
            mouseMove: function (event, chartContext, config) {
                const seriesIndex = config.seriesIndex;
                const dataPointIndex = config.dataPointIndex;
                if (seriesIndex === 0 && dataPointIndex !== -1) {
                    const candleData = config.config.series[seriesIndex].data[dataPointIndex].y;
                    setOhlc({
                        open: candleData[0].toFixed(2),
                        high: candleData[1].toFixed(2),
                        low: candleData[2].toFixed(2),
                        close: candleData[3].toFixed(2)
                    });
                }
            }
        }
    },
    grid: { show: true, borderColor: '#E2E8F0', strokeDashArray: 3 },
    yaxis: {
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
            style: { colors: '#64748B', fontSize: '10px' },
            formatter: (value) => `₹${Number(value).toFixed(2)}`
        }
    },
    legend: { show: false },
    
    // 👇 UPDATE THIS SECTION TO FIX THE THIN LINES
    plotOptions: {
        candlestick: {
            colors: { 
                upward: '#16A34A',   // Solid green body
                downward: '#DC2626'  // Solid red body
            },
            wick: { useFillColor: true },
            borderRadius: 0,
            barHeight: '100%'        // Tells ApexCharts to maximize candle vertical height scale
        }
    },
    
    // 👇 FIX: Change outline colors to match body colors instead of a heavy dark outline
    stroke: { 
        show: true,
        colors: ['#16A34A', '#DC2626'], // Matches the stroke outline cleanly with the up/down colors
        width: 1 
    },
    
    fill: { opacity: 1 },
    tooltip: {
        enabled: true,
        theme: 'dark',
        position: 'bottom',
        offsetY: 0,
        x: { format: 'dd MMM yyyy' },
        y: {
            formatter: (value) => `₹${parseFloat(value).toFixed(2)}`
        }
    },
    
    // Remove gaps for absent days (weekends/holidays)
    xaxis: {
        type: 'datetime',
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { 
            style: { colors: '#64748B', fontSize: '10px' },
            datetimeUTC: false
        },
        tooltip: { enabled: false },
        range: undefined,
        min: undefined,
        max: undefined
    },
    
    // Ensure continuous data without gaps
    dataGrouping: {
        enabled: false
    }
};


    if (isLoading) return <div className="h-72 flex items-center justify-center text-xs text-slate-600 font-mono">⚡ Hydrating Canvas...</div>;
    if (error) return <div className="h-72 flex items-center justify-center text-xs text-rose-400 font-mono">⚠️ {error}</div>;

    return (
        <div className="w-full bg-white rounded-2xl p-4 space-y-4 font-sans select-none">

            {/* 1. TOP LIVE OHLC HEADER METRIC TRAY */}
            <div className="flex justify-between items-center px-2 flex-wrap gap-2">
                <span className="text-[11px] font-bold text-slate-600 font-mono tracking-wider">LIVE MARKET INDEX ENGINE</span>
                <div className="flex items-center space-x-3 text-xs font-mono font-bold">
                    <span className="text-slate-500">O <span className="text-emerald-600 font-extrabold">{ohlc.open}</span></span>
                    <span className="text-slate-500">H <span className="text-emerald-600 font-extrabold">{ohlc.high}</span></span>
                    <span className="text-slate-500">L <span className="text-rose-600 font-extrabold">{ohlc.low}</span></span>
                    <span className="text-slate-500">C <span className="text-emerald-600 font-extrabold">{ohlc.close}</span></span>
                </div>
            </div>

            {/* 2. THE FLOATING CANDLESTICK CANVAS */}
            <div className="h-[250px] w-full">
                <Chart options={chartOptions} series={candleSeries} type="candlestick" height="100%" />
            </div>

            {/* 3. TIMEFRAME PILL CONTROL BAR */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <div className="flex items-center space-x-1 sm:justify-end overflow-x-auto bg-slate-50 border border-slate-200/60 p-1 rounded-full shadow-inner">
                    {TIMEFRAMES.map((tf) => (
                        <button
                            key={tf}
                            type="button"
                            onClick={() => setTimeframe(tf)}
                            className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full transition-all cursor-pointer border-none ${
                                timeframe === tf
                                    ? "bg-slate-800 text-white shadow-sm"
                                    : "text-slate-600 hover:text-slate-700 bg-transparent"
                            }`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
}



