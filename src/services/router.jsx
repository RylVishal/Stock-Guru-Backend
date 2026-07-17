import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import React from 'react';

// Components Imports
import Login from '../components/auth/Login';
import Signup from '../components/auth/SignUp';
import ForgotPassword from '../components/auth/forgotpassword';
import ResetPassword from '../components/auth/resetpassword';
import AdminKycPortal from '../components/admin/Adminkyc';
import AdminVerify from '../components/admin/AdminVerify';
import StockDetailsPage from '../components/stock/StockDetails';
import WatchList from '../pages/watchlist';
import FullMostBoughtPage from '../components/explore/FullMostBoughtPage';
import StockChart from '../components/stock/StockChart';
import StockCandleChart from '../components/stock/stockcandlechart';
import Profile from '../pages/Profile';
import MarketDashboard from '../pages/maindashboard';
import KYCVerification from '../components/home/kycverification';
import Portfolio from '../pages/portfolio';
import NotFoundPage from '../pages/Notfound';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminProtectedRoute from '../components/admin/AdminProtectedRoute';
import Navbar from '../components/home/Navbar';
import StockMovers from '../components/explore/StockMovers';
import Home from '../pages/Home';
import StockPro from '../components/stock/Stockpro';
import AdminLayout from '../components/admin/adminlayout';
import AdminDashboard from '../components/admin/admindashboard';


// Layout wrapper to inject the global application header navbar across private portals smoothly
function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet /> {/* This is where nested children elements dynamically mount */}
      </main>
    </div>
  );
}

const router = createBrowserRouter([
    {
    path: '/',
    // Automatically routes any root URL hits directly onto your /home page layout
    element: <Navigate to="/home" replace /> 
  },

  { path: '/home', element: <Home /> },
  { 
    path: '/chart/:searchId', 
    element: (
      <ProtectedRoute>
        <StockPro />
      </ProtectedRoute>
    ) 
  },

  // ADMIN SEGMENT
  {
    path: '/admin',
    children: [
      // Keeping /admin/login route but it won't be required for redirection.
      {
        path: '',
        element: (
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        ),
        children: [
          // { path: 'dashboard', element: <AdminDashboard /> },
          // { path: 'kyc', element: <AdminKycPortal /> },
          { path: 'verify', element: <AdminVerify /> },
          // { path: 'users', element: <AdminUsers /> },
          { path: '', element: <Navigate to="/admin/verify" replace /> }
        ]
      }
    ]
  },

  // 1. AUTH SEGMENT (Matches: /auth/* backend design schemas)
  {
    path: '/auth',
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Signup /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'reset-password', element: <ProtectedRoute><ResetPassword /></ProtectedRoute> }
    ]
  },

  {
    path: '/market',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { path: 'explore', element: <MarketDashboard /> },
      { path: 'stock/:searchId', element: <StockDetailsPage /> },
      { path: 'most-bought', element: <FullMostBoughtPage /> },
      { path: 'stock-mover', element: <StockMovers /> },
      { path: 'chart/:symbol', element: <StockChart /> },
      { path: 'candles/:symbol', element: <StockCandleChart /> }
    ]
  },

  {
    path: '/portfolio',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { path: '', element: <Portfolio /> }
    ]
  },

  {
    path: '/watchlist',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { path: '', element: <WatchList /> }
    ]
  },

  {
    path: '/kyc',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { path: '', element: <KYCVerification /> }
    ]
  },

  {
    path: '/',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { path: 'profile', element: <Profile /> }
    ]
  },

  { path: '/*', element: <NotFoundPage /> }
]);

export default router;

