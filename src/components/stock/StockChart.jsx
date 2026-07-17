import React, { useState, useEffect, useCallback } from 'react';
import Chart from 'react-apexcharts';
import { apiClient } from '../../services/auth'; 

export default function StockChart({ symbol }) {
  const [chartSeries, setChartSeries] = useState([]);
  const [timeframe, setTimeframe] = useState("1D"); 
  const [isPositive, setIsPositive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const TIMEFRAMES = ["1D", "1W", "1M", "3M", "6M", "1Y", "3Y", "5Y", "All"];

  const fetchChartPayload = useCallback(async (silent = false) => {
    if (!symbol) return;
    if (!silent) setIsLoading(true);
    try {
      const targetRange = timeframe === "All" ? "ALL" : timeframe;

      const response = await apiClient.get(`/market/chart/${encodeURIComponent(String(symbol).toUpperCase())}`, {
        params: { 
          range: targetRange,
          type: 'line' 
        }
      });
      
      if (!response || !response.data) {
        if (!silent) setIsLoading(false);
        return; 
      }

      const candlePayload = response.data?.candles || response.data?.data?.candles || response.data;
      const rawCandles = Array.isArray(candlePayload) ? candlePayload : [];
      
      if (rawCandles.length > 0) {
        const formattedCandles = rawCandles.map((row) => {
          const normalizedRow = Array.isArray(row) ? row : [row?.timestamp, row?.open, row?.high, row?.low, row?.close, row?.volume];
          const timestamp = Number(normalizedRow[0]);
          const executionPrice = normalizedRow.length > 2 ? parseFloat(normalizedRow[4] ?? normalizedRow[1]) : parseFloat(normalizedRow[1]);
          const dateValue = Number.isFinite(timestamp) ? timestamp * 1000 : Date.parse(normalizedRow[0]);
          
          return {
            x: new Date(dateValue).getTime(),
            y: Number.isFinite(executionPrice) ? parseFloat(executionPrice.toFixed(2)) : 0
          };
        });

        formattedCandles.sort((a, b) => a.x - b.x);
        setChartSeries([{ name: 'Price', data: formattedCandles }]);

        if (formattedCandles.length > 1) {
          const initialPrice = formattedCandles[0].y;
          const currentPrice = formattedCandles[formattedCandles.length - 1].y;
          setIsPositive(currentPrice >= initialPrice);
        }
      }
    } catch (err) {
      console.error("Failed to load timeline vector feeds:", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [symbol, timeframe]);

  // Initial fetch + 15s live polling for 1D charts
  useEffect(() => {
    fetchChartPayload(false);
    if (timeframe !== '1D') return;
    const interval = setInterval(() => fetchChartPayload(true), 15000);
    return () => clearInterval(interval);
  }, [fetchChartPayload, timeframe]);

  if (isLoading) {
    return (
      <div className="h-72 flex items-center justify-center text-xs text-slate-600 font-mono border border-slate-200 rounded-2xl bg-white shadow-sm">
        ⚡ Hydrating Canvas...
      </div>
    );
  }

  const themeColor = isPositive ? '#16A34A' : '#DC2626';
  
  // Calculate change for display
  const calculateChange = () => {
    if (chartSeries.length === 0 || chartSeries[0].data.length < 2) return { change: 0, changePercent: 0 };
    const firstPrice = chartSeries[0].data[0].y;
    const lastPrice = chartSeries[0].data[chartSeries[0].data.length - 1].y;
    const change = lastPrice - firstPrice;
    const changePercent = (change / firstPrice) * 100;
    return { change, changePercent };
  };
  
  const { change, changePercent } = calculateChange();
  const isPositiveChange = change >= 0;

  // Build discrete marker for the last data point (live pointer dot)
  const lastPoint = chartSeries.length > 0 && chartSeries[0].data.length > 0
    ? chartSeries[0].data[chartSeries[0].data.length - 1]
    : null;

  const discreteMarkers = lastPoint ? [{
    seriesIndex: 0,
    dataPointIndex: chartSeries[0].data.length - 1,
    fillColor: themeColor,
    strokeColor: '#fff',
    size: 5,
    shape: 'circle'
  }] : [];

  const chartOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      sparkline: { enabled: false },
      redrawOnParentResize: true,
      redrawOnWindowResize: true,
      animations: { enabled: true, easing: 'linear', dynamicAnimation: { speed: 800 } },
    },
    markers: {
      discrete: discreteMarkers,
      hover: { size: 6 }
    },
    
    dataLabels: {
      enabled: false
    },
    
    grid: { 
      show: true, 
      borderColor: '#E2E8F0', 
      strokeDashArray: 3,
      padding: { top: 10, right: 5, bottom: 5, left: 5 }
    },
    
    yaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { 
        show: true,
        style: { colors: '#64748B', fontSize: '10px', fontFamily: 'sans-serif' },
        formatter: (value) => `₹${Number(value).toFixed(2)}`
      }, 
      crosshairs: {
        show: true,
        stroke: { color: '#94A3B8', width: 1, dashArray: 3 }
      }
    },
    
    dataGrouping: {
      enabled: false
    },
    legend: { show: false },
    stroke: { 
      show: true,
      curve: 'smooth', 
      width: 2,
      colors: [themeColor]
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.2,
        opacityTo: 0.0,
        stops:[0,100],
        colorStops: [
          { offset: 0, color: themeColor, opacity: 0.2 },
          { offset: 100, color: themeColor, opacity: 0 }
        ]
      }
    },
    tooltip: {
      enabled: true,
      theme: 'dark',
      shared: true,
      intersect: false,
      followCursor: true,
      position: 'top',
      offsetY: -80,
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
        show: true, 
        style: { colors: '#64748B', fontSize: '10px', fontFamily: 'sans-serif' },
        datetimeUTC: false
      }, 
      crosshairs: {
        show: true,
        stroke: { color: '#94A3B8', width: 1, dashArray: 3 }
      },
      tooltip: { enabled: false },
      range: undefined,
      min: undefined,
      max: undefined
    },
    
    dataGrouping: {
      enabled: false
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl p-3 sm:p-5 space-y-4 font-sans select-none border border-slate-200 shadow-sm">
      
      {/* CUSTOM TOOLTIP HEADER - Like Groww */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-slate-800">
            ₹{chartSeries.length > 0 && chartSeries[0].data.length > 0 ? chartSeries[0].data[chartSeries[0].data.length - 1].y.toFixed(2) : '-'}
          </span>
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositiveChange ? 'text-emerald-600' : 'text-rose-600'}`}>
            <span>{isPositiveChange ? '+' : ''}{change.toFixed(2)}</span>
            <span>({isPositiveChange ? '+' : ''}{changePercent.toFixed(2)}%)</span>
            <span className="text-slate-600 font-normal">{timeframe}</span>
          </div>
        </div>
      </div>

      {/* TIMEFRAME CONTROLS */}
      <div className="flex justify-start sm:justify-end overflow-x-auto pb-1 px-1">
        <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200/60 p-1 rounded-full shadow-inner min-w-max">
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

      {/* RENDER CANVAS CONTAINER */}
      <div className="h-[240px] sm:h-[280px] w-full relative">
        <Chart 
          options={chartOptions} 
          series={chartSeries} 
          type="area" 
          height="100%" 
          width="100%"
        />
      </div>
    </div>
  );
}