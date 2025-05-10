import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Eye, EyeOff, Mail, User, Lock, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const SignUpPage = () => {
  const { signup } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error('Please fill all the required fields');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signup(formData);
      // No need for extra toast.success here since it's handled in the store
      if (!result || !result.success) {
        setIsLoading(false);
      }
      // Redirect handled by protected routes in App.jsx
    } catch (error) {
      // This is a fallback in case signup function doesn't handle errors internally
      toast.error(error.message || 'Failed to create account');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel - Form */}
      <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-center bg-white">
        <div className="max-w-md mx-auto w-full">
          {/* Logo and App Name */}
          <div className="flex items-center justify-center mb-10">
            <MessageCircle className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold ml-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Chatty</h1>
          </div>

          <h2 className="text-3xl font-bold mb-3 text-gray-800">Create Account</h2>
          <p className="text-gray-600 mb-8 text-lg">Join our community and start chatting</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  style={{ color: '#000000' }}
                  className="pl-10 w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-black"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  style={{ color: '#000000' }}
                  className="pl-10 w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-black"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="At least 6 characters"
                  style={{ color: '#000000' }}
                  className="pl-10 pr-10 w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-black"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your password"
                  style={{ color: '#000000' }}
                  className="pl-10 w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-black"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            {/* Sign In Link */}
            <div className="text-center mt-4">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden md:flex md:w-1/2 bg-indigo-900 items-center justify-center relative overflow-hidden">
        <div className="absolute w-full h-full opacity-10">
          <div className="absolute top-0 left-0 w-full h-full flex flex-wrap">
            {Array(20).fill(0).map((_, i) => (
              <div 
                key={i} 
                className="bg-white rounded-lg p-4 m-2 shadow-lg opacity-10"
                style={{
                  width: `${Math.random() * 200 + 100}px`,
                  height: `${Math.random() * 100 + 50}px`,
                  transform: `rotate(${Math.random() * 10 - 5}deg)`,
                }}
              />
            ))}
          </div>
        </div>
        <div className="z-10 max-w-md text-center px-6">
          <div className="mb-8">
            <MessageCircle className="h-24 w-24 text-white mx-auto" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">Connect with friends and family</h2>
          <p className="text-white text-xl mb-10">
            Simple, reliable, private messaging. Stay connected with everyone important in your life.
          </p>
          <div className="flex flex-col items-center justify-center gap-5 mt-8">
            <div className="bg-indigo-600 bg-opacity-80 p-5 rounded-xl w-full max-w-sm">
              <p className="text-white text-lg">"Hey there! Welcome to our chat app!"</p>
            </div>
            <div className="bg-purple-600 bg-opacity-80 p-5 rounded-xl w-full max-w-sm">
              <p className="text-white text-lg">"Thanks! Excited to join the conversation."</p>
            </div>
            <div className="bg-indigo-600 bg-opacity-80 p-5 rounded-xl w-full max-w-sm">
              <p className="text-white text-lg">"Great! Let's get you set up with an account."</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage; 