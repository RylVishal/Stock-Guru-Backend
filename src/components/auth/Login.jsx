import { useNavigate } from "react-router-dom";
//import StockBackground from "../../pages/background";
import logo from '../../assets/logo.png';
import { apiClient as api } from "../../services/auth";
import { setTokens, getAccessToken } from "../../services/auth";
import { useState } from "react";
import background from '../../assets/image.png';
import { Eye, EyeOff} from 'lucide-react';
export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const checkErrors = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = "Email address is required.";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!formData.password) {
      errors.password = "Password is required.";
    }
    return errors;
  };

  const validationErrors = checkErrors();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const getInputClass = (fieldName) => {
    const baseClass = "w-full border p-3 pr-12 rounded-lg focus:outline-none transition duration-200 ";
    if (!touched[fieldName]) {
      return `${baseClass} border-gray-300 focus:ring-2 focus:ring-blue-500`;
    }
    return validationErrors[fieldName]
      ? `${baseClass} border-red-500 bg-red-50/30 focus:ring-2 focus:ring-red-500`
      : `${baseClass} border-green-500 bg-green-50/30 focus:ring-2 focus:ring-green-500`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setServerError("");

    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await api.post("/auth/login", formData, {
          withCredentials: true,
        });

        const payload = response.data || {};
        
        // Extract tokens from response
        const tokenData = payload.data || payload;
        
        if (tokenData?.accessToken && tokenData?.refreshToken) {
          // Store tokens in cookies
          setTokens({
            accessToken: tokenData.accessToken,
            refreshToken: tokenData.refreshToken
          });
          
          // Verify cookies are set before navigating
          const accessToken = getAccessToken();
          if (accessToken) {
            console.log("✅ Tokens verified in cookies, navigating...");
            navigate("/market/explore", { replace: true });
          } else {
            console.error("❌ Tokens not found in cookies after setting");
            // Try navigation anyway after a short delay
            setTimeout(() => {
              navigate("/market/explore", { replace: true });
            }, 200);
          }
        } else {
          console.error("No tokens found in response:", payload);
          setServerError("Login successful but tokens not received. Please try again.");
        }
      } catch (error) {
        console.error("Login failed", error);
        setServerError(error.response?.data?.message || "Unable to login. Please try again.");
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
      {/* Solid white card container with interactive ease-in-out shadow animation transition layer */}
      <div className="relative z-10 w-[400px] bg-gray-100 border border-gray-200 p-8 rounded-2xl shadow-2xl transition-all duration-300 ease-in-out hover:shadow-3xl hover:scale-100% hover:shadow-blue-600/10">
        
        <div className="flex flex-col items-center justify-center mb-6">
          <img src={logo} alt="StockGuru Logo" className="w-20 h-20 object-contain mb-2 mix-blend-multiply" />
          <h1 className="text-4xl font-black text-center text-blue-800">STOCKGURU</h1>
          <p className="text-center text-gray-600 font-bold mt-2">Welcome Back!</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className={getInputClass("email")} />
            {touched.email && validationErrors.email && <p className="text-red-500 text-xs mt-1 px-1 font-medium">{validationErrors.email}</p>}
          </div>

          <div className="mb-4 relative">
            <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={formData.password} onChange={handleChange} className={getInputClass("password")} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-600 hover:text-gray-700 text-sm font-semibold select-none">
              {showPassword ? <Eye /> : <EyeOff />}
            </button>
            {touched.password && validationErrors.password && <p className="text-red-500 text-xs mt-1 px-1 font-medium">{validationErrors.password}</p>}
          </div>
          <button 
              type="button"
              onClick={() => navigate('/auth/forgot-password')}
              className="text-blue-800 hover:text-blue-600 transition-colors font-semibold bg-transparent border-none cursor-pointer text-sm mb-4 select-none"
            >
              Forgot Password?
            </button>
          <button type="submit" className="w-full bg-blue-800 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">
            Login
          </button>

          {serverError && <p className="text-red-500 text-sm mt-4 text-center">{serverError}</p>}

          <p className="text-center mt-5 text-gray-500 text-sm">
            Don't have an account?
            <span onClick={() => navigate("/auth/register")} className="text-blue-800 ml-1 cursor-pointer hover:underline font-bold">Sign Up</span>
          </p>
        </form>
      </div>
    </div>
  );
}