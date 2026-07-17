import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
    const navigate=useNavigate();

  return (
    <div className="min-h-screen bg-slate-650 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      
      <div className="text-center max-w-md mx-auto">
        {/* Simple 404 Heading */}
        <h1 className="text-9xl font-black text-slate-600 tracking-tighter select-none">
          404
        </h1>
        
        {/* Your Exact Requested Text */}
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-600">
          Page Not Found
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Sorry, we couldn’t find the page you’re looking for.
        </p>

        {/* Home Navigation Button */}
        <div className="mt-8 flex justify-center">
          <button 
            onClick={()=>navigate('/home')}
            className="px-6 py-3 text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-all duration-200 shadow-lg"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
