import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useToast } from './ToastContainer';
import { Wallet, Eye, EyeOff, Mail, Lock, User, Briefcase, DollarSign } from 'lucide-react';

const LoginForm: React.FC = () => {
  const { dispatch } = useAppContext();
  const { showToast } = useToast();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    occupation: '',
    monthlyIncome: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
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

    // Simulate authentication
    const user = {
      id: Date.now().toString(),
      name: isLogin ? 'Ahmad' : formData.name,
      email: formData.email,
      occupation: isLogin ? 'Software Developer' : formData.occupation,
      monthlyIncome: isLogin ? 3500 : parseFloat(formData.monthlyIncome),
    };

    dispatch({ type: 'LOGIN', payload: user });
    
    showToast({
      type: 'success',
      title: isLogin ? 'Welcome back!' : 'Account created successfully!',
      message: `Welcome to DuitCerdik, ${user.name}`,
    });
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
              className="w-full bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 backdrop-blur-sm border border-white/20"
            >
              {isLogin ? 'Login to DuitCerdik' : 'Create Account'}
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
          <p className="text-white/60 text-sm mb-2">Demo Account:</p>
          <p className="text-white/80 text-xs">Email: demo@duitcerdik.com | Password: demo123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;