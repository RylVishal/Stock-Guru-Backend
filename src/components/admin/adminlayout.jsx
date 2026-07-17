import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import logo from '../../assets/logo.png';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationLinks = [
    { name: 'KYC Verification', path: '/admin/verify', icon: '🛡️' }
  ];

  return (
    <div className="min-h-screen bg-[#f0f4f9] text-slate-800 font-sans flex antialiased select-none h-screen overflow-hidden">
      
      {/* GLOBAL SYSTEM SIDEBAR PANEL */}
      <aside className="w-64 bg-white border-r border-sky-100 flex flex-col shrink-0 h-full">
        {/* Brand System Logo Slot */}
        <div className="p-5 border-b border-sky-50 flex items-center gap-3">
          <img src={logo} onClick={()=>navigate('/home')}alt="StockGuru Logo" className="w-9 h-9 object-contain mix-blend-multiply" />
          <div className="text-left">
            <h1 className="text-base font-black tracking-tight text-blue-900 m-0">StockGuru</h1>
            <span className="text-[9px] font-mono font-bold tracking-widest text-gray-600 uppercase">Admin Executive</span>
          </div>
        </div>

        {/* Dynamic Sidebar Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navigationLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <button
                type="button"
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 border-none cursor-pointer transition ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-transparent text-slate-600 hover:bg-sky-50/60'}`}
              >
                <span className="text-sm">{link.icon}</span>
                <span>{link.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Disconnect Terminal Switch Footer */}
        <div className="p-3 border-t border-sky-50 bg-slate-50/50">
          <button
            type="button"
            onClick={() => {
              // Clear admin session
              localStorage.removeItem('adminToken');
              localStorage.removeItem('adminLoginTime');
              navigate('/auth/login');
            }}
            className="w-full bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-100 text-slate-500 hover:text-rose-600 font-mono text-[10px] font-bold py-2 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5"
          >
            🔒 Logout Admin
          </button>
        </div>
      </aside>

      {/* RIGHT WORKSPACE CONTEXT RENDERING ENGINE */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        <header className="bg-white border-b border-sky-100 px-6 py-3.5 flex justify-between items-center bg-gradient-to-r from-white to-sky-50/10">
          <div className="text-left">
            <span className="text-[10px] font-mono font-extrabold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 uppercase tracking-wide">Workstation Terminal</span>
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
