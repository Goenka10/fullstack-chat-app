import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, User, Settings, LogOut, Menu, X, Loader } from 'lucide-react';

const Navbar = () => {
  const { logout, authUser, isLoggingOut } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      // Close the mobile menu if open
      setIsMenuOpen(false);
      
      // Navigate to login page
      navigate('/login');
    }
    // No need to handle error as toast messages are shown by the store
  };

  // Different navbar for authenticated and non-authenticated users
  if (!authUser) {
    // Non-authenticated navbar (for signup/login pages)
    const isLoginPage = location.pathname === '/login';
    const isSignupPage = location.pathname === '/signup';

    return (
      <header className="bg-indigo-700 text-white shadow-lg border-b border-indigo-600">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <Link to="/" className="flex items-center space-x-3">
              <MessageCircle className="h-8 w-8 text-white" />
              <span className="font-bold text-2xl text-white">Chatty</span>
            </Link>
            
            {/* Navigation Links for non-authenticated users */}
            <nav className="flex items-center space-x-5">
              <Link 
                to="/settings" 
                className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-indigo-600 transition duration-200 text-lg"
              >
                <Settings className="h-5 w-5" />
                <span className="hidden sm:inline">Settings</span>
              </Link>
              
              {isSignupPage ? (
                <Link 
                  to="/login" 
                  className="flex items-center space-x-2 bg-white text-indigo-700 hover:bg-gray-100 px-6 py-2 rounded-md transition duration-200 font-medium text-lg"
                >
                  <span>Login</span>
                </Link>
              ) : isLoginPage ? (
                <Link 
                  to="/signup" 
                  className="flex items-center space-x-2 bg-white text-indigo-700 hover:bg-gray-100 px-6 py-2 rounded-md transition duration-200 font-medium text-lg"
                >
                  <span>Sign Up</span>
                </Link>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="flex items-center space-x-2 bg-white text-indigo-700 hover:bg-gray-100 px-6 py-2 rounded-md transition duration-200 font-medium text-lg"
                  >
                    <span>Login</span>
                  </Link>
                  <Link 
                    to="/signup" 
                    className="flex items-center space-x-2 bg-indigo-500 text-white hover:bg-indigo-600 px-6 py-2 rounded-md transition duration-200 font-medium text-lg"
                  >
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
    );
  }

  // Authenticated user navbar
  return (
    <header className="bg-indigo-700 text-white shadow-lg border-b border-indigo-600">
      <div className="container mx-auto px-6 py-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center space-x-3">
            <MessageCircle className="h-8 w-8 text-white" />
            <span className="font-bold text-2xl text-white">Chatty</span>
          </Link>
          
          {/* User info */}
          <div className="flex items-center">
            <div className="mr-3 text-sm opacity-90">
              <span>Hello, </span>
              <span className="font-semibold">{authUser.fullName || authUser.username}</span>
            </div>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex items-center space-x-6">
            <Link 
              to="/chat" 
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition duration-200 text-lg ${
                isActive('/chat') 
                  ? 'bg-indigo-500 text-white font-medium' 
                  : 'hover:bg-indigo-600'
              }`}
            >
              <MessageCircle className="h-5 w-5" />
              <span>Chats</span>
            </Link>
            <Link 
              to="/profile" 
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition duration-200 text-lg ${
                isActive('/profile') 
                  ? 'bg-indigo-500 text-white font-medium' 
                  : 'hover:bg-indigo-600'
              }`}
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </Link>
            <Link 
              to="/settings" 
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition duration-200 text-lg ${
                isActive('/settings') 
                  ? 'bg-indigo-500 text-white font-medium' 
                  : 'hover:bg-indigo-600'
              }`}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 px-6 py-2 rounded-md transition duration-200 ml-4 text-lg font-medium disabled:bg-red-400 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </>
              )}
            </button>
          </nav>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center justify-between">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <MessageCircle className="h-7 w-7 text-white" />
            <span className="font-bold text-xl text-white">Chatty</span>
          </Link>
          
          {/* Username on mobile */}
          <div className="text-sm opacity-90 mx-auto">
            <span className="font-semibold">{authUser.fullName || authUser.username}</span>
          </div>
          
          {/* Menu Button */}
          <button 
            onClick={toggleMenu}
            className="p-2 rounded-md hover:bg-indigo-600 transition duration-200"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2 space-y-3">
            <Link 
              to="/chat" 
              className={`flex items-center space-x-3 px-3 py-2 rounded-md transition duration-200 text-lg ${
                isActive('/chat') 
                  ? 'bg-indigo-500 text-white font-medium' 
                  : 'hover:bg-indigo-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <MessageCircle className="h-5 w-5" />
              <span>Chats</span>
            </Link>
            <Link 
              to="/profile" 
              className={`flex items-center space-x-3 px-3 py-2 rounded-md transition duration-200 text-lg ${
                isActive('/profile') 
                  ? 'bg-indigo-500 text-white font-medium' 
                  : 'hover:bg-indigo-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </Link>
            <Link 
              to="/settings" 
              className={`flex items-center space-x-3 px-3 py-2 rounded-md transition duration-200 text-lg ${
                isActive('/settings') 
                  ? 'bg-indigo-500 text-white font-medium' 
                  : 'hover:bg-indigo-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center space-x-3 bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md transition duration-200 text-lg font-medium disabled:bg-red-400 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;