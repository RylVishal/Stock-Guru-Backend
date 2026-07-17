import React, { useEffect, useState, useRef } from 'react';

function useFlashEffect(value) {
  const [flashClass, setFlashClass] = useState('');
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current === undefined) { prevValueRef.current = value; return; }
    if (value > prevValueRef.current) {
      setFlashClass('bg-emerald-100 text-emerald-900 transition-none');
      const timer = setTimeout(() => setFlashClass('transition duration-1000 ease-out'), 50);
      return () => clearTimeout(timer);
    } else if (value < prevValueRef.current) {
      setFlashClass('bg-rose-100 text-rose-900 transition-none');
      const timer = setTimeout(() => setFlashClass('transition duration-1000 ease-out'), 50);
      return () => clearTimeout(timer);
    }
    prevValueRef.current = value;
  }, [value]);

  return flashClass;
}

export default function StockTableRow({ item, onClick }) {
  const companyInfo = item?.company || {};
  const statsInfo = item?.stats || {};
  const currentLtp = statsInfo?.ltp ?? null;
  const dayChange = statsInfo?.dayChange ?? null;
  const pctChange = statsInfo?.dayChangePerc ?? null;
  const isPositive = dayChange !== null && dayChange >= 0;
  const isOffline = currentLtp === null;

  const priceFlashClass = useFlashEffect(currentLtp || 0);

  return (
    <tr onClick={onClick} className="hover:bg-slate-50/80 transition duration-150 cursor-pointer active:bg-slate-100/40">
      <td className="px-6 py-4 flex items-center gap-3">
        {companyInfo?.imageUrl && (
          <img src={companyInfo.imageUrl} alt="" className="w-8 h-8 rounded-full object-contain bg-white border border-gray-200 p-0.5 shrink-0" />
        )}
        <div>
          <div className="text-gray-800 font-bold">{companyInfo?.companyName}</div>
          <div className="mt-1">
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-blue-900 border border-slate-200">
              {companyInfo?.nseScriptCode || companyInfo?.bseScriptCode}
            </span>
          </div>
        </div>
      </td>
      <td className={`px-6 py-4 text-right font-bold font-mono rounded-lg ${isOffline ? 'text-slate-400' : `text-gray-900 ${priceFlashClass}`}`}>
        {isOffline ? 'Offline' : `₹${currentLtp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
      </td>
      <td className={`px-6 py-4 text-right font-bold font-mono ${isPositive ? 'text-emerald-600' : isOffline ? 'text-slate-400' : 'text-rose-600'}`}>
        {isOffline ? (
          <div className="text-slate-400">—</div>
        ) : (
          <>
            <div>{isPositive ? '+' : ''}{dayChange.toFixed(2)}</div>
            <div className={`text-[11px] font-semibold inline-block px-1.5 py-0.2 rounded mt-0.5 ${isPositive ? 'bg-emerald-50' : 'bg-rose-50'}`}>
              {isPositive ? '+' : ''}{pctChange.toFixed(2)}%
            </div>
          </>
        )}
      </td>
      <td className="px-6 py-4 text-right font-mono text-xs text-gray-600">
        {isOffline ? (
          <div className="text-slate-400">—</div>
        ) : (
          <div className="flex justify-end items-center gap-2">
            <span className="text-rose-500 font-medium">₹{(statsInfo?.low ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            <span className="text-gray-300">|</span>
            <span className="text-emerald-600 font-medium">₹{(statsInfo?.high ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        )}
      </td>
    </tr>
  );
}
