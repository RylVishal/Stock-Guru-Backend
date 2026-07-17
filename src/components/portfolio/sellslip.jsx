import React, { useState } from 'react';

export default function SellSlip({ 
  initialSymbol = 'RELIANCE',
  onOrderExecuted 
}) {
  // Core Interactive Input Values Form Object Struct
  const [tradeForm, setTradeForm] = useState({
    symbol: initialSymbol,
    quantity: '',
    price: ''
  });

  // Interface API Broadcast Response Loading States
  const [actionLoading, setActionLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState({
    message: '',
    success: false
  });

  // Form Value Change Interceptor
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTradeForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit Processing Orchestration Handler
  const handleOrderSubmission = async (e) => {
    e.preventDefault();
    if (!tradeForm.quantity || !tradeForm.price) {
      setOrderStatus({ message: 'Please enter valid Quantity and Price parameters.', success: false });
      return;
    }

    setActionLoading(true);
    setOrderStatus({ message: '', success: false });

    // Mock Backend Network Roundtrip Latency Call simulation 
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setOrderStatus({
        message: 'Liquidation transaction settled successfully onto market ledger accounts.',
        success: true
      });
      if (onOrderExecuted) onOrderExecuted(tradeForm);
      
      // Reset form after successful transaction
      setTradeForm({
        symbol: initialSymbol,
        quantity: '',
        price: ''
      });
    } catch (err) {
      setOrderStatus({ message: 'Network handshake timeout failure. Trade execution rejected.', success: false });
    } finally {
      setActionLoading(false);
    }
  };

  // Quantity field validation - only allow numbers
  const handleQuantityChange = (e) => {
    const value = e.target.value;
    // Allow only numeric input
    if (value === '' || /^\d+$/.test(value)) {
      setTradeForm(prev => ({ ...prev, quantity: value }));
    }
  };

  // Price field validation - only allow numbers and decimals
  const handlePriceChange = (e) => {
    const value = e.target.value;
    // Allow only numeric input with optional decimal
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setTradeForm(prev => ({ ...prev, price: value }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-4 bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden">
      
      {/* Upper Context Header Matrix */}
      <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
        <h3 className="text-xs font-black tracking-widest text-rose-600 uppercase">
          Sell Order Slip
        </h3>
      </div>

      {/* Main Framework Processing Lifecycle Execution Form */}
      <form onSubmit={handleOrderSubmission} className="p-6 space-y-5">
        
        {/* Row Grid: Dynamic Active Workspace Meta Indicator Layout */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold tracking-wider text-slate-600 uppercase">Instrument Asset Symbol</label>
          <input
            type="text"
            name="symbol"
            value={tradeForm.symbol}
            onChange={handleInputChange}
            className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 outline-none uppercase focus:border-slate-300"
            placeholder="E.G. INFY"
            required
          />
        </div>

        {/* Input Parameters Numeric Specification Form Fields Row Split */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold tracking-wider text-slate-600 uppercase">Shares Quantity</label>
            <input
              type="number"
              name="quantity"
              value={tradeForm.quantity}
              onChange={handleQuantityChange}
              min="1"
              step="1"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 outline-none focus:border-slate-600 transition-colors"
              placeholder="0"
              required
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold tracking-wider text-slate-600 uppercase">Limit Price (INR)</label>
            <input
              type="number"
              name="price"
              value={tradeForm.price}
              onChange={handlePriceChange}
              min="0.05"
              step="0.05"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 outline-none focus:border-slate-600 transition-colors"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Calculated Total Position Margin Estimation Card Row */}
        {tradeForm.symbol && (
          <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex justify-between items-center text-xs font-mono">
            <span className="text-slate-600 font-medium">Margin Inflow:</span>
            <span className="font-extrabold text-rose-600">
              ₹{(Number(tradeForm.quantity || 0) * Number(tradeForm.price || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {/* Dynamic Status Alerts Banner Panel Row */}
        {(orderStatus.message || actionLoading) && (
          <div className={`p-3.5 rounded-xl border text-xs font-mono transition-all ${
            actionLoading 
              ? 'bg-blue-50 border-blue-100 text-blue-700 animate-pulse' 
              : orderStatus.success 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                : 'bg-rose-50 border-rose-100 text-rose-700'
          }`}>
            {actionLoading ? "Broadcasting liquidation order..." : orderStatus.message}
          </div>
        )}

        {/* Main Operational Execution Trigger Buttons */}
        <button
          type="submit"
          disabled={actionLoading}
          className="w-full py-3.5 text-xs font-black tracking-widest text-white rounded-xl uppercase transition-all bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-100 cursor-pointer disabled:bg-slate-200 disabled:text-slate-600 disabled:cursor-not-allowed"
        >
          Execute Sell Order
        </button>

      </form>
    </div>
  );
}
