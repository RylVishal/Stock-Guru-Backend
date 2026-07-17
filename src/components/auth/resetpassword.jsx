import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import StockBackground from '../../pages/background';
import api from '../../services/api';
import background from '../../assets/image.png';
import { Eye, EyeOff} from 'lucide-react';
export default function ResetPassword() {
  const navigate = useNavigate();

  // Multi-step phase tracker: 'verify' or 'reset'
  const [step, setStep] = useState('verify'); 

  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState({
    email: false,
    otp: false,
    password: false,
    confirmPassword: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Step-aware real-time validation checks
  const checkErrors = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Phase 1: Identity & OTP Input Validation
    if (!formData.email) {
      errors.email = "Email address is required.";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!formData.otp) {
      errors.otp = "Verification code is required.";
    }

    // Phase 2: Password Structure Validation (Checked only when revealed)
    if (step === 'reset') {
      if (!formData.password) {
        errors.password = "New password is required.";
      } else if (formData.password.length < 6) {
        errors.password = "Password must be at least 6 characters.";
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = "Please confirm your password.";
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match.";
      }
    }

    return errors;
  };

  const validationErrors = checkErrors();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  // State-driven styling configuration for form input blocks
  const getInputClass = (fieldName) => {
    const baseClass = "w-full border p-3 rounded-lg focus:outline-none transition duration-200 bg-white ";
    if (!touched[fieldName]) {
      return `${baseClass} border-gray-300 focus:ring-2 focus:ring-blue-500`;
    }
    return validationErrors[fieldName]
      ? `${baseClass} border-red-500 bg-red-50/30 focus:ring-2 focus:ring-red-500`
      : `${baseClass} border-green-500 bg-green-50/30 focus:ring-2 focus:ring-green-500`;
  };

  // Step 1: Submits Email & OTP parameters to live backend server
  const handleVerifyOTP = async () => {
    setTouched({ email: true, otp: true });
    setServerError('');

    if (!validationErrors.email && !validationErrors.otp) {
      setLoading(true);
      try {
        // Dispatches verification payload matching backend parameter rules
        const response = await api.post('/auth/verify-otp', {
          email: formData.email,
          otp: formData.otp
        });
        
        console.log('OTP Verified successfully:', response.data);
        setStep('reset'); // Switch views to reveal hidden password sub-fields
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Invalid code or profile mismatch.';
        setServerError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  // Step 2: Saves the newly declared profile credentials
  const handleResetPassword = async () => {
    setTouched({ password: true, confirmPassword: true });
    setServerError('');

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        const response = await api.post('/auth/reset-password', {
          email: formData.email,
          otp: formData.otp,
          newpassword: formData.password
        });
        
        console.log('Password Reset Successful:', response.data);
        setIsSuccess(true);
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to complete password reset update configuration.';
        setServerError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 'verify') {
      handleVerifyOTP();
    } else {
      handleResetPassword();
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
        
        {!isSuccess ? (
          <>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-center text-blue-800">
                {step === 'verify' ? 'Verify Identity' : 'Set New Password'}
              </h1>
              <p className="mt-2 text-sm text-gray-600 font-medium">
                {step === 'verify' 
                  ? 'Enter your account details and OTP verification string code.' 
                  : 'Your details are verified! Create your secure new login password below.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Always visible inputs: Email frame layout */}
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className={getInputClass('email')}
                  disabled={loading || step === 'reset'}
                />
                {touched.email && validationErrors.email && (
                  <p className="text-red-500 text-xs mt-1 px-1 font-medium">{validationErrors.email}</p>
                )}
              </div>

              {/* Always visible inputs: OTP frame layout */}
              <div>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  placeholder="Verification Code (OTP)"
                  className={getInputClass('otp')}
                  disabled={loading || step === 'reset'}
                />
                {touched.otp && validationErrors.otp && (
                  <p className="text-red-500 text-xs mt-1 px-1 font-medium">{validationErrors.otp}</p>
                )}
              </div>

              {/* REVEALED UI STEP: Appends password selection right below fields */}
              {step === 'reset' && (
                <div className="space-y-4 pt-4 border-t border-gray-200 animate-fadeIn">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="New Password"
                      className={getInputClass('password')}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-sm font-semibold text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer"
                    >
                      {showPassword ? <Eye /> : <EyeOff />}
                    </button>
                    {touched.password && validationErrors.password && (
                      <p className="text-red-500 text-xs mt-1 px-1 font-medium">{validationErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm New Password"
                      className={getInputClass('confirmPassword')}
                      disabled={loading}
                    />
                     <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-3.5 text-gray-600 hover:text-gray-700 text-sm font-semibold select-none"
                    >
                      {showConfirmPassword ? <Eye/> : <EyeOff/>}
                    </button>
                    {touched.confirmPassword && validationErrors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1 px-1 font-medium">{validationErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              )}

              {serverError && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {serverError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm font-semibold text-white bg-blue-800 hover:bg-blue-600 rounded-lg transition-all duration-200 shadow-md disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {loading 
                  ? 'Processing...' 
                  : step === 'verify' ? 'Verify OTP Code' : 'Update Credentials'}
              </button>
            </form>
          </>
        ) : (
          /* Profile updated view dashboard breakout transition */
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 bg-green-50 text-green-500 border border-green-500 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <h3 className="text-xl font-bold text-blue-700">Password Updated!</h3>
            <button onClick={() => navigate('/auth/login')}className="text-sm font-semibold text-blue-800 hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer">← Back to Log In</button>
            </div>
        )
      }
          </div>
          </div>
  )}
        


