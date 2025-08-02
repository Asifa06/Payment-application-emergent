import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AlertCircle, Lock, Mail, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (!result.success) {
        setError(result.message);
      }
      // If successful, the AuthContext will handle the redirect
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  const demoCredentials = [
    { label: 'Admin User', email: 'admin@payinsight.com', password: 'admin123' },
    { label: 'Payment Analyst', email: 'analyst@payinsight.com', password: 'analyst123' }
  ];

  const fillDemoCredentials = (email, password) => {
    setFormData({ email, password });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center mb-6">
          <div className="bg-blue-600 p-3 rounded-lg">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-center text-3xl font-bold text-gray-900 mb-2">
          PayInsight
        </h1>
        <p className="text-center text-lg text-gray-600 mb-8">
          Smart Payment Intelligence Dashboard
        </p>
      </div>

      {/* Login Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="bg-white py-8 px-6 shadow-lg border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                  <div className="text-sm text-red-800">{error}</div>
                </div>
              </div>
            )}

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-sm font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in to PayInsight'
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Demo Credentials */}
        <div className="mt-8">
          <Card className="bg-blue-50 border-blue-200 p-4">
            <div className="text-center mb-3">
              <h3 className="text-sm font-medium text-blue-900 mb-1">Demo Credentials</h3>
              <p className="text-xs text-blue-600">Click to auto-fill login form</p>
            </div>
            <div className="space-y-2">
              {demoCredentials.map((cred, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => fillDemoCredentials(cred.email, cred.password)}
                  className="w-full text-left p-2 bg-white border border-blue-200 rounded text-xs hover:bg-blue-100 transition-colors duration-200 disabled:opacity-50"
                  disabled={isLoading}
                >
                  <div className="font-medium text-blue-900">{cred.label}</div>
                  <div className="text-blue-600">{cred.email}</div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Professional Payment Intelligence Platform</p>
          <p className="mt-1">Built for enterprise payment processing simulation</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;