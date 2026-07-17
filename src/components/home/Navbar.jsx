import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/auth'; 
import { clearTokens } from '../../services/auth';
import logo from '../../assets/logo.png';
import NavbarSearch from '../home/SearchBar';

export default function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dropdownRef = useRef(null);

  const [userProfile, setUserProfile] = useState({
    name: "User Profile",
    email: "Loading...",
    initials: "U",
    isVerified: false
  });

  // Stock ticker data with search_id for navigation
  // const [tickerStocks, setTickerStocks] = useState([
  //   { symbol: "RELIANCE", search_id: "reliance-industries-ltd", price: 2450.40, change: 1.42, isGreen: true },
  //   { symbol: "TCS", search_id: "tata-consultancy-services-ltd", price: 3200.20, change: -2.15, isGreen: false },
  //   { symbol: "INFY", search_id: "infosys-ltd", price: 1475.12, change: 4.80, isGreen: true },
  //   { symbol: "HDFCBANK", search_id: "hdfc-bank-ltd", price: 1650.15, change: -0.45, isGreen: false },
  //   { symbol: "SBIN", search_id: "state-bank-of-india", price: 765.30, change: 3.10, isGreen: true },
  // ]);

  // Fetch live prices for ticker stocks
  // useEffect(() => {
  //   const fetchTickerPrices = async () => {
  //     try {
  //       const updatedStocks = await Promise.all(
  //         tickerStocks.map(async (stock) => {
  //           try {
  //             const response = await apiClient.get(`/market/stock/${stock.search_id}`);
  //             const priceData = response.data?.data || response.data;
  //             const currentPrice = priceData?.price || stock.price;
  //             const change = priceData?.change || stock.change;
              
  //             return {
  //               ...stock,
  //               price: currentPrice,
  //               change: change,
  //               isGreen: change >= 0
  //             };
  //           } catch (error) {
  //             return stock;
  //           }
  //         })
  //       );
  //       setTickerStocks(updatedStocks);
  //     } catch (error) {
  //       console.error('Error fetching ticker prices:', error);
  //     }
  //   };

  //   fetchTickerPrices();
  //   const interval = setInterval(fetchTickerPrices, 30000);
  //   return () => clearInterval(interval);
  // }, []);

  // const handleStockClick = (searchId) => {
  //   navigate(`/market/stock/${searchId}`);
  // };

  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('accessToken='));

    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    setIsLoggedIn(true);
    const initialsStr = 'PS';

    setUserProfile((prev) => ({
      ...prev,
      name: 'User',
      email: 'Signed in',
      initials: initialsStr,
      isVerified: false,
    }));
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setShowProfileMenu(false);
    setIsOpen(false);
    setIsLoggedIn(false);

    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error('Logout request failed:', err);
    }

    clearTokens();

    clearTokens();
    navigate('/auth/login', { replace: true });
  };

  return (
    <nav className="w-full bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50 transition-all duration-300">
      {/* Main Top Header Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Left: Branding & Core Links */}
          <div className="flex items-center gap-8">
            <Link to="/home" className="flex items-center gap-3 no-underline">
              <img src={logo} alt="StockGuru" className="h-15 w-15 lg:h-20 lg:w-20 object-contain" />
            </Link>
            <NavbarSearch />
            
            {/* Desktop Navigation Links - 👇 Only rendered if user is logged in */}
            {isLoggedIn && (
              <div className="hidden md:flex items-center gap-12">
                <Link to="/market/explore" className="text-gray-600 hover:text-blue-800 font-semibold no-underline transition">Explore</Link>
                <Link to="/portfolio" className="text-gray-600 hover:text-blue-800 font-semibold no-underline transition">Portfolio</Link>
                <Link to="/watchlist" className="text-gray-600 hover:text-blue-800 font-semibold no-underline transition">Watchlist</Link>
              </div>
            )}
          </div>

          {/* Right Area: Conditional Authentication Actions */}
          <div className="hidden md:flex items-center gap-6">
            
            {!isLoggedIn ? (
              // 👇 GUEST INTERFACE VIEWPORT ACTION SEGMENT
              <div className="flex items-center gap-4">
                <Link 
                  to="/auth/login" 
                  className="bg-blue-800 text-white font-semibold px-4 py-2 rounded-xl no-underline hover:bg-blue-900 transition text-sm"
                >
                  Log In
                </Link>
                <Link 
                  to="/auth/register" 
                  className="bg-blue-800 text-white font-semibold px-4 py-2 rounded-xl no-underline hover:bg-blue-900 transition text-sm shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              // 👇 SIGNED IN ACTIVE MEMBER ACCOUNT CONTAINER
              <div className="relative" ref={dropdownRef}>
                <button
                  // 👇 FIXED: Redirects directly to '/profile' endpoint layout when avatar is clicked
                  onClick={() => navigate('/profile')}
                  onMouseEnter={() => setShowProfileMenu(true)} // Optional: displays dropdown on hover instead
                  className="w-10 h-10 rounded-full bg-blue-800 text-white font-bold flex items-center justify-center border-2 border-transparent hover:border-blue-300 focus:outline-none transition select-none cursor-pointer"
                >
                  {userProfile.initials}
                </button>

                {/* Profile Card Popup Menu */}
                {showProfileMenu && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl p-4 text-left"
                    onMouseLeave={() => setShowProfileMenu(false)}
                  >
                    <div className="pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 text-sm m-0 truncate max-w-[140px]">{userProfile.name}</p>
                        {userProfile.isVerified && (
                          <span className="text-[9px] bg-green-100 text-green-700 border border-green-300 font-extrabold px-1.5 py-0.5 rounded-full uppercase shrink-0">Verified KYC</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 font-medium truncate mt-0.5 m-0">{userProfile.email}</p>
                    </div>

                    <div className="py-2 space-y-1">
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="block px-2 py-2 text-sm text-gray-600 hover:text-blue-800 hover:bg-slate-50 font-semibold no-underline rounded-lg transition"
                      >
                        My Account Settings
                      </Link>
                      <Link
                        to="/portfolio"
                        onClick={() => setShowProfileMenu(false)}
                        className="block px-2 py-2 text-sm text-gray-600 hover:text-blue-800 hover:bg-slate-50 font-semibold no-underline rounded-lg transition"
                      >
                        My Holdings Profile
                      </Link>
                      <Link
                        to="/kyc"
                        onClick={() => setShowProfileMenu(false)}
                        className="block px-2 py-2 text-sm text-gray-600 hover:text-blue-800 hover:bg-slate-50 font-semibold no-underline rounded-lg transition"
                      >
                        Verification Status
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-2 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition border-none bg-transparent cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Layout Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none font-bold text-xl px-2 cursor-pointer"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

            {/* Mobile Drawer Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-50 border-t border-gray-100 px-4 py-3 space-y-3">
          {isLoggedIn ? (
            <>
              <div 
                className="pb-2 border-b border-gray-200" 
                onClick={() => { navigate('/profile'); setIsOpen(false); }}
              >
                <p className="font-bold text-gray-900 text-sm m-0 cursor-pointer hover:text-blue-800">
                  {userProfile.name} (View Profile)
                </p>
                <p className="text-xs text-gray-600 font-medium m-0 mt-0.5">{userProfile.email}</p>
              </div>
              <Link to='/market/explore' onClick={() => setIsOpen(false)} className="block text-gray-700 font-semibold no-underline">Explore</Link>
              <Link to="/portfolio" onClick={() => setIsOpen(false)} className="block text-gray-700 font-semibold no-underline">Portfolio</Link>
              <Link to="/watchlist" onClick={() => setIsOpen(false)} className="block text-gray-700 font-semibold no-underline">Watchlist</Link>
              <div className="pt-2 border-t border-gray-200">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left py-2 text-sm font-bold text-red-600 bg-transparent border-none cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 py-2">
              <Link 
                to="/auth/login" 
                onClick={() => setIsOpen(false)} 
                className="block text-center text-gray-700 font-semibold no-underline py-2 rounded-xl bg-gray-100"
              >
                Log In
              </Link>
              <Link 
                to="/auth/register" 
                onClick={() => setIsOpen(false)} 
                className="block text-center text-white bg-blue-800 font-semibold no-underline py-2 rounded-xl"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Live Stock Ticker Bar - Like Groww */}
      {/* {isLoggedIn && (
        <div className="w-full bg-blue-50 border-b border-blue-100 py-2.5 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 overflow-x-auto scrollbar-none">
              {tickerStocks.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => handleStockClick(stock.search_id)}
                  className="flex items-center gap-2 bg-white hover:bg-blue-50 px-3 py-1.5 rounded-md transition cursor-pointer border border-blue-200 whitespace-nowrap shadow-sm"
                >
                  <span className="text-xs font-bold text-gray-700">{stock.symbol}</span>
                  <span className="text-sm font-mono font-bold text-gray-900">
                    ₹{Number(stock.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className={`text-xs font-mono font-bold ${stock.isGreen ? 'text-green-600' : 'text-red-600'}`}>
                    {stock.isGreen ? '▲' : '▼'} {Math.abs(stock.change).toFixed(2)}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )} */}
    </nav>
  );
}
