import React from 'react';

export default function TradingSlipContainer({ 
  tradeForm, 
  setTradeForm, 
  actionLoading, 
  feedback, 
  onTradeComplete 
}) {
  const isBuy = tradeForm.orderType === 'BUY';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTradeForm(prev => ({ ...prev, [name]: value }));
  };

  const localSubmit = (e) => {
    e.preventDefault();
    onTradeComplete(tradeForm);
  };

  return (
    <div className="w-full bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden">
      
      {/* Upper Mode Toggle Switch */}
      <div className="flex border-b border-slate-100 bg-slate-50">
        <button
          type="button"
          onClick={() => setTradeForm(prev => ({ ...prev, orderType: 'BUY' }))}
          className={`flex-1 py-4 text-xs font-black tracking-widest uppercase transition-all border-b-2 ${
            isBuy
              ? 'bg-white text-emerald-600 border-emerald-500 font-extrabold'
              : 'text-slate-600 border-transparent hover:text-slate-600'
          }`}
        >
          Buy Order
        </button>
        <button
          type="button"
          onClick={() => setTradeForm(prev => ({ ...prev, orderType: 'SELL' }))}
          className={`flex-1 py-4 text-xs font-black tracking-widest uppercase transition-all border-b-2 ${
            !isBuy
              ? 'bg-white text-rose-600 border-rose-500 font-extrabold'
              : 'text-slate-600 border-transparent hover:text-slate-600'
          }`}
        >
          Sell Order
        </button>
      </div>

      <form onSubmit={localSubmit} className="p-6 space-y-5">
        {/* Symbol */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold tracking-wider text-slate-600 uppercase">Asset Symbol</label>
          <input
            type="text"
            name="symbol"
            value={tradeForm.symbol}
            onChange={handleInputChange}
            className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 outline-none uppercase focus:border-slate-300"
            required
          />
        </div>

        {/* Quantities & Pricing Input Split Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold tracking-wider text-slate-600 uppercase">Shares Quantity</label>
            <input
              type="number"
              name="quantity"
              value={tradeForm.quantity}
              onChange={handleInputChange}
              min="1"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 outline-none focus:border-slate-600 transition-colors"
              required
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold tracking-wider text-slate-600 uppercase">Limit Price (INR)</label>
            <input
              type="number"
              name="price"
              value={tradeForm.price}
              onChange={handleInputChange}
              min="0"
              step="0.05"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 outline-none focus:border-slate-600 transition-colors"
              required
            />
          </div>
        </div>

        {/* Total Cost Margin Calculation Preview */}
        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex justify-between items-center text-xs font-mono">
          <span className="text-slate-600 font-medium">{isBuy ? 'Margin Outflow:' : 'Margin Inflow:'}</span>
          <span className={`font-extrabold ${isBuy ? 'text-emerald-600' : 'text-rose-600'}`}>
            ₹{(Number(tradeForm.quantity || 0) * Number(tradeForm.price || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* System Error & Success Status Feedback Alerts */}
        {feedback.message && (
          <div className={`p-3.5 rounded-xl border text-xs font-mono ${
            feedback.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
          }`}>
            {feedback.message}
          </div>
        )}

        {/* Loading Spinner Indicator */}
        {actionLoading && (
          <div className="p-3.5 rounded-xl border text-xs font-mono bg-blue-50 border-blue-100 text-blue-700 animate-pulse">
            Broadcasting order parameters to exchange ledger...
          </div>
        )}

        {/* Action Trigger Buttons */}
        <button
          type="submit"
          disabled={actionLoading}
          className={`w-full py-3.5 text-xs font-black tracking-widest text-white rounded-xl uppercase transition-all cursor-pointer disabled:bg-slate-200 disabled:text-slate-600 disabled:cursor-not-allowed ${
            isBuy ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
          }`}
        >
          {isBuy ? 'Execute Buy Order' : 'Execute Sell Order'}
        </button>
      </form>
    </div>
  );
}

