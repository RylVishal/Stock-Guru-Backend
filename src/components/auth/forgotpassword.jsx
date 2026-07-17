import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import StockBackground from '../../pages/background';
import api from '../../services/api';
import background from '../../assets/image.png';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Live structural regex check matching your system's parameters
  const checkEmailError = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Email address is required.";
    } else if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }
    return null;
  };

  const validationError = checkEmailError();

  const handleChange = (e) => {
    setEmail(e.target.value);
    setTouched(true); // Mark as active once typing begins
  };

  // Dynamic conditional style mapping matching the login configuration flow
  const getInputClass = () => {
    const baseClass = "w-full border p-3 rounded-lg focus:outline-none transition duration-200 bg-white ";
    
    // State 1: Input untouched
    if (!touched) {
      return `${baseClass} border-gray-300 focus:ring-2 focus:ring-blue-500`;
    }
    
    // State 2: Input has structural validation errors
    if (validationError) {
      return `${baseClass} border-red-500 bg-red-50/30 focus:ring-2 focus:ring-red-500`;
    }
    
    // State 3: Input is valid
    return `${baseClass} border-green-500 bg-green-50/30 focus:ring-2 focus:ring-green-500`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    setError('');

    if (!validationError) {
      setLoading(true);
      try {
        // FIXED: Changed payload from { email } to { emailId: email } to match backend requirements
        const response = await api.post('/auth/forgot-password', { email: email });
        console.log('API Response:', response.data);
        setIsSubmitted(true);
      } catch (err) {
        // Captures clean error payloads from server or network layers
        const errorMessage = err.response?.data?.message || err.message || 'Failed to send reset link. Please try again.';
        setError(errorMessage);
        console.error('Forgot password error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full flex justify-center items-center overflow-hidden">
      {/* <StockBackground /> */}
      <img 
              src={background} 
              alt="Stock Background" 
              className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />
      <div className="relative z-10 w-[400px] bg-gray-100 border border-gray-200 p-8 rounded-2xl shadow-2xl transition-all duration-300 ease-in-out hover:shadow-3xl hover:shadow-blue-600/10">
        
        {!isSubmitted ? (
          <>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-center text-blue-800">Reset Password</h1>
              <p className="mt-2 text-sm text-gray-600 font-medium">
                Enter your registered email address to receive a password reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <input
                  type="text"
                  id="email"
                  value={email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className={getInputClass()}
                  disabled={loading}
                />
                {/* Real-time textual feedback positioning underneath input element */}
                {touched && validationError && (
                  <p className="text-red-500 text-xs mt-1 px-1 font-medium">{validationError}</p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !!validationError}
                className={`w-full py-3 text-sm font-semibold text-white rounded-lg transition-all duration-200 shadow-md disabled:cursor-not-allowed  ${
                  loading || validationError
                    ? 'bg-blue-800 cursor-not-allowed'
                    : 'bg-blue-800 hover:bg-blue-600'
                }`}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          /* Success Notification Layout View */
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 bg-green-50 text-green-500 border border-green-500 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <h3 className="text-xl font-bold text-blue-700">Check Your Inbox</h3>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              We have dispatched a password reset link to <span className="text-blue-600 font-bold">{email}</span>.
            </p>
            
            {/* Added dynamic redirection route step utility to transition into the Reset Password screen */}
            <button
              onClick={() => navigate('/auth/reset-password')}
              className="w-full mt-2 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 shadow-md"
            >
              Enter Verification Code
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <button 
            onClick={() => navigate('/auth/login')} 
            className="text-sm font-semibold text-blue-800 hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer"
          >
            ← Back to Log In
          </button>
        </div>

      </div>
    </div>
  );
}

