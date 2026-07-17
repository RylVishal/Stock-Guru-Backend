import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/auth';
import background from '../../assets/image.png'; // Verify your exact path layout

export default function RealKYCVerification() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');

  // Swagger Schema Form Fields States
  const [fullName, setFullName] = useState("");
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');

  // Bootstrap Validation State Markers
  const [validatedStep1, setValidatedStep1] = useState(false);
  const [validatedStep2, setValidatedStep2] = useState(false);
  const [validatedStep3, setValidatedStep3] = useState(false);

  // Application Dynamic State Trackers
  const [kycStatus, setKycStatus] = useState('none'); // 'pending', 'approved', 'rejected', 'none'
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Inline validation errors
  const [fieldErrors, setFieldErrors] = useState({});

  // 1. SYSTEM HYDRATION LOOKUP
  const fetchKycStatus = async () => {
    try {
      setError('');
      const response = await apiClient.get("/kyc/status");
      const data = response.data || {};
      const statusValue = data.status || data.kyc?.status || data.data?.status;

      if (statusValue) {
        setKycStatus(statusValue);
        setRemarks(data.remarks || data.message || "Under compliance audit review.");
        setStep(4); 
      } else {
        setKycStatus('none');
        setStep(1);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setKycStatus('none');
        setRemarks('');
        setError(''); 
        setStep(1);
      } else {
        setError(err.response?.data?.message || 'Handshake failed with compliance status network.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKycStatus();
  }, []);

  // 2. BACKGROUND RE-POLLING HOOK
  useEffect(() => {
    if (kycStatus !== "pending") return;

    const interval = setInterval(async () => {
      try {
        const response = await apiClient.get("/kyc/status");
        const data = response.data || {};
        const statusValue = data.status || data.kyc?.status || data.data?.status;

        if (statusValue) {
          setKycStatus(statusValue);
          setRemarks(data.remarks || "");
          if (statusValue === 'approved') {
            navigate('/market/explore'); 
          }
        }
      } catch (err) {
        console.error("Polling error caught:", err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [kycStatus, navigate]);

  // Validation Rules
  const validateEmail = (value) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!value) return 'Email is required';
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return '';
  };

  const validateFullName = (value) => {
    if (!value.trim()) return 'Full legal name is required';
    return '';
  };

  const validatePAN = (value) => {
    const cleanPAN = value.trim().toUpperCase();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!value) return 'PAN number is required';
    if (!panRegex.test(cleanPAN)) return 'Invalid PAN format (e.g., ABCDP1234F)';
    return '';
  };

  const validateAadhaar = (value) => {
    const aadhaarRegex = /^[0-9]{12}$/;
    if (!value) return 'Aadhaar number is required';
    if (!aadhaarRegex.test(value.trim())) return 'Must be exactly 12 digits';
    return '';
  };

  const validateAddress = (value) => {
    if (!value || !value.trim()) return 'Address is required';
    if (value.trim().length < 10) return 'Address must be at least 10 characters long';
    return '';
  };

  const validateDob = (value) => {
    if (!value) return 'Please insert your date of birth';
    return '';
  };

  // Real-time tracking hook for fields
  useEffect(() => {
    const errors = {};
    if (validatedStep1) errors.email = validateEmail(email);
    if (validatedStep2) {
      errors.fullName = validateFullName(fullName);
      errors.pan = validatePAN(panNumber);
    }
    if (validatedStep3) {
      errors.aadhaar = validateAadhaar(aadhaarNumber);
      errors.address = validateAddress(address);
      errors.dob = validateDob(dob);
    }
    setFieldErrors(errors);
  }, [email, fullName, panNumber, aadhaarNumber, address, dob, validatedStep1, validatedStep2, validatedStep3]);

  // Form Submission Step Controllers
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setValidatedStep1(true);
    const emailError = validateEmail(email);
    if (emailError) return;
    setStep(2);
  };

  const handlePANSubmit = (e) => {
    e.preventDefault();
    setValidatedStep2(true);
    const nameError = validateFullName(fullName);
    const panError = validatePAN(panNumber);
    if (nameError || panError) return;
    setStep(3);
  };

  // Helper function to format user-friendly error messages
  const formatErrorMessage = (error) => {
    const errorData = error?.response?.data || error;
    
    // Handle validation errors with field-specific errors object
    if (errorData?.errors && typeof errorData.errors === 'object') {
      const fieldErrors = [];
      
      // Extract field-specific errors
      for (const [field, fieldError] of Object.entries(errorData.errors)) {
        const errorMessage = fieldError?.message || fieldError?.error || '';
        
        if (errorMessage) {
          // Convert field names to user-friendly labels
          const fieldLabels = {
            'email': 'Email',
            'pan': 'PAN Card',
            'aadhaar': 'Aadhaar Number',
            'address': 'Address',
            'fullName': 'Full Name',
            'dob': 'Date of Birth',
            'symbol': 'Stock Symbol',
            'quantity': 'Quantity',
            'price': 'Price'
          };
          
          const fieldLabel = fieldLabels[field] || field;
          
          // Clean up technical error messages
          let cleanMessage = errorMessage
            .replace(/Path `[^`]+` is required\./g, 'is required')
            .replace(/Path `[^`]+`/g, fieldLabel)
            .replace(/`/g, '')
            .trim();
          
          // If message is just "is required", make it more descriptive
          if (cleanMessage === 'is required') {
            cleanMessage = 'is required';
          }
          
          fieldErrors.push(`${fieldLabel} ${cleanMessage}`);
        }
      }
      
      if (fieldErrors.length > 0) {
        return fieldErrors.join('. ') + '.';
      }
    }
    
    // Handle simple message-based errors
    const message = errorData?.message || errorData?.error || 'Something went wrong. Please try again.';
    
    // Map common backend errors to user-friendly messages
    const errorMap = {
      'PAN already exists': 'This PAN card is already registered with another account.',
      'Aadhaar already exists': 'This Aadhaar number is already registered.',
      'Email already exists': 'This email is already registered. Please use a different email.',
      'Invalid PAN': 'Invalid PAN format. Please check and try again.',
      'Invalid Aadhaar': 'Invalid Aadhaar number. Please enter a valid 12-digit number.',
      'Address too short': 'Address must be at least 10 characters long.',
      'Network error': 'Network connection issue. Please check your internet and try again.',
      'Server error': 'Our servers are experiencing issues. Please try again in a few moments.'
    };

    // Check if the error message contains any known error patterns
    for (const [key, value] of Object.entries(errorMap)) {
      if (message.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    return message;
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setValidatedStep3(true);
    setError('');

    const aadhaarError = validateAadhaar(aadhaarNumber);
    const addressError = validateAddress(address);
    const dobError = validateDob(dob);
    
    if (aadhaarError || addressError || dobError) return;

    setIsLoading(true);
    const payload = {
      fullName: fullName.trim(),
      panNumber: panNumber.trim().toUpperCase(),
      aadhaarNumber: aadhaarNumber.trim(),
      address: address.trim(),
      dob: dob
    };

    try {
      const response = await apiClient.post('/kyc/submit', payload);
      const data = response.data || {};
      const statusValue = data.status || data.data?.status || 'pending';

      setKycStatus(statusValue);
      setRemarks(data.remarks || data.message || 'KYC submitted successfully.');
      setStep(4);
    } catch (err) {
      const userFriendlyMessage = formatErrorMessage(err);
      setError(userFriendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper helper to return bootstrap ring classes dynamically
  const getInputValidationClass = (isValidated, errorExist) => {
    if (!isValidated) return 'border-slate-200 focus:outline-blue-600 focus:ring-2 focus:ring-blue-100';
    return errorExist 
      ? 'border-rose-500 focus:outline-rose-600 focus:ring-4 focus:ring-rose-100 bg-rose-50/20' 
      : 'border-emerald-500 focus:outline-emerald-600 focus:ring-4 focus:ring-emerald-100 bg-emerald-50/20';
  };

  if (isLoading && kycStatus === 'none') {
    return (
      <div className="min-h-screen w-full flex justify-center items-center bg-slate-900 text-white font-mono text-xs tracking-widest uppercase">
        ⚡ ESTABLISHING SECURE ACCOUNT ROUTING TIER...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex justify-center items-center overflow-hidden bg-slate-900 font-sans antialiased box-border">
      <img 
        src={background} 
        alt="Stock Background" 
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-40"
      />
      <div className="relative z-10 w-[420px] bg-white border border-slate-200 p-8 rounded-2xl shadow-2xl box-border">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4 select-none">
          <h2 className="text-xl font-bold text-slate-800 m-0">KYC Verification</h2>
          <span className="text-xs font-mono font-bold px-2 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded">
            Stage {step} of 4
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-lg font-medium text-left">
            ⚠️ {error}
          </div>
        )}

        {/* STEP 1: Email */}
        {kycStatus === 'none' && step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-4" noValidate>
            <p className="text-xs text-slate-600 font-bold mb-1 uppercase font-mono text-left m-0">Step 1: Contact Verification</p>
            <div className="text-left">
              <input
                type="email" 
                required 
                placeholder="example@email.com"
                className={`w-full border p-3 rounded-lg text-sm box-border transition-all duration-200 ${getInputValidationClass(validatedStep1, fieldErrors.email)}`}
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
              />
              {validatedStep1 && (
                fieldErrors.email 
                  ? <div className="text-xs text-rose-600 font-medium mt-1.5 flex items-center">❌ {fieldErrors.email}</div>
                  : <div className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center">✓ Valid email address</div>
              )}
            </div>
            <button type="submit" className="w-full py-3 text-sm font-semibold text-white bg-blue-800 hover:bg-blue-700 rounded-lg shadow-md border-none cursor-pointer transition">
              Verify Email Address
            </button>
          </form>
        )}

        {/* STEP 2: Name & PAN */}
        {kycStatus === 'none' && step === 2 && (
          <form onSubmit={handlePANSubmit} className="space-y-4" noValidate>
            <p className="text-xs text-slate-600 font-bold mb-1 uppercase font-mono text-left m-0">Step 2: Legal Identity</p>
            
            <div className="text-left">
              <input
                type="text" required placeholder="Full Name"
                className={`w-full border p-3 rounded-lg text-sm box-border transition-all duration-200 ${getInputValidationClass(validatedStep2, fieldErrors.fullName)}`}
                value={fullName} onChange={(e) => setFullName(e.target.value)}
              />
              {validatedStep2 && (
                fieldErrors.fullName 
                  ? <div className="text-xs text-rose-600 font-medium mt-1.5 flex items-center">❌ {fieldErrors.fullName}</div>
                  : <div className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center">Valid full name</div>
              )}
            </div>

            <div className="text-left">
              <input
                type="text" 
                required 
                maxLength={10} 
                placeholder="ABCDE1234F"
                className={`w-full border p-3 rounded-lg tracking-widest uppercase font-mono text-sm box-border transition-all duration-200 ${getInputValidationClass(validatedStep2, fieldErrors.pan)}`}
                value={panNumber} 
                onChange={(e) => setPanNumber(e.target.value)}
              />
              {validatedStep2 && (
                fieldErrors.pan 
                  ? <div className="text-xs text-rose-600 font-medium mt-1.5 flex items-center">❌ {fieldErrors.pan}</div>
                  : <div className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center">✓ Valid PAN Number</div>
              )}
            </div>
            <button type="submit" className="w-full py-3 text-sm font-semibold text-white bg-blue-800 hover:bg-blue-700 rounded-lg shadow-md border-none cursor-pointer transition">
              Validate Identity Credentials
            </button>
          </form>
        )}

        {/* STEP 3: Aadhaar, Address & DoB */}
        {kycStatus === 'none' && step === 3 && (
          <form onSubmit={handleFinalSubmit} className="space-y-4" noValidate>
            <p className="text-xs text-slate-600 font-bold mb-1 uppercase font-mono text-left m-0">Step 3: Residency Verification</p>
            
            <div className="text-left">
              <input
                type="text" 
                required 
                maxLength={12} 
                placeholder="123456789012"
                className={`w-full border p-3 rounded-lg tracking-widest font-mono text-sm box-border transition-all duration-200 ${getInputValidationClass(validatedStep3, fieldErrors.aadhaar)}`}
                value={aadhaarNumber} 
                onChange={(e) => setAadhaarNumber(e.target.value)}
              />
              {validatedStep3 && (
                fieldErrors.aadhaar 
                  ? <div className="text-xs text-rose-600 font-medium mt-1.5 flex items-center">❌ {fieldErrors.aadhaar}</div>
                  : <div className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center">✓ valid aadhaar number</div>
              )}
            </div>

            <div className="text-left">
              <input
                type="text" 
                required 
                placeholder="123, Main Street, City, State - 123456"
                className={`w-full border p-3 rounded-lg text-sm box-border transition-all duration-200 ${getInputValidationClass(validatedStep3, fieldErrors.address)}`}
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
              />
              {validatedStep3 && (
                fieldErrors.address 
                  ? <div className="text-xs text-rose-600 font-medium mt-1.5 flex items-center">❌ {fieldErrors.address}</div>
                  : <div className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center">✓valid address</div>
              )}
            </div>

            <div className="text-left">
              <input
                type="date" 
                required
                className={`w-full border p-3 rounded-lg font-mono text-sm box-border transition-all duration-200 ${getInputValidationClass(validatedStep3, fieldErrors.dob)}`}
                value={dob} 
                onChange={(e) => setDob(e.target.value)}
              />
              {validatedStep3 && (
                fieldErrors.dob 
                  ? <div className="text-xs text-rose-600 font-medium mt-1.5 flex items-center">❌ {fieldErrors.dob}</div>
                  : <div className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center">✓ Valid Date of birth</div>
              )}
            </div>

            <button type="submit" className="w-full py-3 text-sm font-semibold text-white bg-blue-800 hover:bg-blue-600 rounded-lg shadow-md border-none cursor-pointer transition">
              Submit KYC 
            </button>
          </form>
        )}

        {/* STEP 4: Status Monitor Dashboard */}
        {step === 4 && (
          <div className="space-y-5 text-center select-none">
            <p className="text-xs text-slate-600 font-bold mb-1 uppercase font-mono text-left m-0">Step 4: Audit Diagnostics</p>
            
            <div className="py-4 px-2 rounded-xl border flex flex-col items-center justify-center space-y-2">
              {kycStatus === 'pending' && (
                <>
                  <div className="text-3xl animate-bounce">⏳</div>
                  <h4 className="text-amber-600 font-bold m-0 text-sm uppercase font-mono">Verification Pending</h4>
                </>
              )}
              {kycStatus === 'approved' && (
                <>
                  <div className="text-3xl text-emerald-500">✅</div>
                  <h4 className="text-emerald-600 font-bold m-0 text-sm uppercase font-mono">Verification Approved</h4>
                </>
              )}
              {kycStatus === 'rejected' && (
                <>
                  <div className="text-3xl text-rose-500">❌</div>
                  <h4 className="text-rose-600 font-bold m-0 text-sm uppercase font-mono">Verification Rejected</h4>
                </>
              )}
              <p className="text-xs text-slate-500 max-w-[280px] font-sans font-medium leading-relaxed mt-2 m-0 text-center">
                {remarks || "Your profile data packets are under evaluation by compliance audits."}
              </p>
            </div>

            <button 
              type="button"
              onClick={() => navigate('/market/explore')}
              className="w-full py-3 text-sm font-bold text-white bg-blue-800 hover:bg-blue-600 rounded-lg shadow-md border-none cursor-pointer transition uppercase font-mono tracking-wider"
            >
              ↩ Return To Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
}