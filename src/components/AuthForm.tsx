import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ToastContainer';
import { Wallet, Eye, EyeOff, Mail, Lock, User, Briefcase, DollarSign, Loader2 } from 'lucide-react';

const AuthForm: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const { showToast } = useToast();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    occupation: '',
    monthlyIncome: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields',
      });
      return;
    }

    if (!isLogin && (!formData.name || !formData.occupation || !formData.monthlyIncome)) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields',
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        
        if (error) {
          let errorMessage = error.message;
          
          // Provide more user-friendly error messages
          if (error.message === 'Invalid login credentials') {
            errorMessage = 'Invalid email or password. Please double-check your credentials or sign up if you don\'t have an account.';
          } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Please check your email and click the confirmation link before signing in.';
          } else if (error.message.includes('Too many requests')) {
            errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
          }
          
          showToast({
            type: 'error',
            title: 'Login Failed',
            message: errorMessage,
          });
        } else {
          showToast({
            type: 'success',
            title: 'Welcome back!',
            message: 'You have been logged in successfully',
          });
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, {
          name: formData.name,
          occupation: formData.occupation,
          monthlyIncome: parseFloat(formData.monthlyIncome),
        });
        
        if (error) {
          let errorMessage = error.message;
          
          // Provide more user-friendly error messages for sign up
          if (error.message.includes('User already registered')) {
            errorMessage = 'An account with this email already exists. Please try logging in instead.';
          } else if (error.message.includes('Password should be at least')) {
            errorMessage = 'Password must be at least 6 characters long.';
          } else if (error.message.includes('Invalid email')) {
            errorMessage = 'Please enter a valid email address.';
          }
          
          showToast({
            type: 'error',
            title: 'Sign Up Failed',
            message: errorMessage,
          });
        } else {
          showToast({
            type: 'success',
            title: 'Account Created!',
            message: 'Please check your email to verify your account',
          });
        }
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Authentication Error',
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    
    try {
      const { error } = await signIn('demo@duitcerdik.com', 'demo123');
      
      if (error) {
        showToast({
          type: 'error',
          title: 'Demo Login Failed',
          message: 'Demo account is not available. Please create your own account.',
        });
      } else {
        showToast({
          type: 'success',
          title: 'Welcome to the Demo!',
          message: 'You are now logged in with the demo account',
        });
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Demo Login Error',
        message: 'Demo account is not available. Please create your own account.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-teal-700 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <Wallet size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">DuitCerdik</h1>
          <p className="text-white/80">Smart Personal Finance for Malaysian Youth</p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex bg-white/10 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                isLogin ? 'bg-white/20 text-white' : 'text-white/70'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                !isLogin ? 'bg-white/20 text-white' : 'text-white/70'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    <User size={16} className="inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required={!isLogin}
                    placeholder="Enter your full name"
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    <Briefcase size={16} className="inline mr-2" />
                    Occupation
                  </label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    required={!isLogin}
                    placeholder="e.g., Student, Software Developer"
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    <DollarSign size={16} className="inline mr-2" />
                    Monthly Income (RM)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.monthlyIncome}
                    onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                    required={!isLogin}
                    placeholder="3500.00"
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors backdrop-blur-sm"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Mail size={16} className="inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                placeholder="your.email@example.com"
                className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors backdrop-blur-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Lock size={16} className="inline mr-2" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors backdrop-blur-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 backdrop-blur-sm border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                isLogin ? 'Login to DuitCerdik' : 'Create Account'
              )}
            </button>
          </form>

          {isLogin && (
            <div className="mt-4 text-center">
              <button className="text-white/70 hover:text-white text-sm transition-colors">
                Forgot your password?
              </button>
            </div>
          )}
        </div>

        {/* Demo Account */}
        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm mb-3">Try the demo account:</p>
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login with Demo Account'}
          </button>
          <p className="text-white/50 text-xs mt-2">Email: demo@duitcerdik.com | Password: demo123</p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;