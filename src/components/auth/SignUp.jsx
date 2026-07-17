import { useNavigate } from "react-router-dom";
//import StockBackground from "../../pages/background";
import logo from '../../assets/logo.png';
import api from "../../services/api";
import { useState } from "react";
import background from '../../assets/image.png';
import { Eye, EyeOff } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  // const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

  const checkErrors = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Full Name is required.";
    } else if (/[0-9]/.test(formData.fullName)) {
      errors.fullName = "Names cannot contain numbers.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = "Email address is required.";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }

    const hasLower = /[a-z]/.test(formData.password);
    const hasUpper = /[A-Z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);

    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      errors.password = "Must be at least 8 characters long.";
    } else if (!hasLower) {
      errors.password = "Requires at least 1 lowercase letter.";
    } else if (!hasUpper) {
      errors.password = "Requires at least 1 uppercase letter.";
    } else if (!hasNumber) {
      errors.password = "Requires at least 1 number.";
    } else if (!hasSpecial) {
      errors.password = "Requires at least 1 special character.";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = "Passwords do not match.";
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
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true });
    setServerError("");

    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await api.post("/auth/register", {
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
        });

        console.log("Registration successful:", response.data);
        navigate("/auth/login");
      } catch (error) {
        console.error("Registration failed", error);
        setServerError(error.response?.data?.message || "Unable to register. Please try again.");
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
      <div className="relative z-10 w-[450px] bg-gray-100 border border-gray-200 p-5 rounded-2xl shadow-2xl transition-all duration-300 ease-in-out hover:shadow-3xl hover:shadow-green-600/10">
        
        <div className="flex flex-col items-center justify-center mb-6">
          <img src={logo} alt="StockGuru Logo" className="w-20 h-20 object-contain mb-2 mix-blend-multiply" />
          <h1 className="text-4xl font-black text-center text-blue-800">STOCKGURU</h1>
          <p className="text-center text-gray-800 font-medium mt-1">Create Your Trading Account</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} className={getInputClass("fullName")} />
            {touched.fullName && validationErrors.fullName && <p className="text-red-500 text-xs mt-1 px-1 font-medium">{validationErrors.fullName}</p>}
          </div>

          <div className="mb-4">
            <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className={getInputClass("email")} />
            {touched.email && validationErrors.email && <p className="text-red-500 text-xs mt-1 px-1 font-medium">{validationErrors.email}</p>}
          </div>

          <div className="mb-4 relative">
            <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={formData.password} onChange={handleChange} className={getInputClass("password")} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-600 hover:text-gray-700 text-sm font-semibold select-none">
              {showPassword ? "HIDE" : "SHOW"}
            </button>
            {touched.password && validationErrors.password && <p className="text-red-500 text-xs mt-1 px-1 font-medium">{validationErrors.password}</p>}
          </div>

          <div className="mb-5 relative">
            <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} className={getInputClass("confirmPassword")} />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-3.5 text-gray-600 hover:text-gray-700 text-sm font-semibold select-none">
              {showConfirmPassword ? <Eye/> : <EyeOff/>}
            </button>
            {touched.confirmPassword && validationErrors.confirmPassword && <p className="text-red-500 text-xs mt-1 px-1 font-medium">{validationErrors.confirmPassword}</p>}
          </div>

          <button type="submit" className="w-full bg-blue-800 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">
            Create Account
          </button>

          {serverError && <p className="text-red-500 text-sm mt-4 text-center">{serverError}</p>}
          
          <p className="text-center mt-5 text-gray-500 text-sm">
            Already have an account?
            <span onClick={() => navigate("/auth/login")} className="text-blue-800 ml-1 cursor-pointer hover:underline font-bold">Login</span>
          </p>
        </form>
      </div>
    </div>
  );
}
