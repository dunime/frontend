import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Logo component
const Logo = () => (
  <div className="text-center mb-6">
    <h1 className="text-4xl font-bold">
      <span className="text-purple-600">Du</span>
      <span className="text-pink-600">nime</span>
    </h1>
    <p className="text-gray-600 text-sm mt-1">Your Anime Companion</p>
  </div>
);

const LoginPage = () => {
    const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = () => {
    console.log('Login submitted:', formData);
    navigate('/dashboard')
    // Handle login logic here
};

const navigateToRegister = () => {
    console.log('Navigate to register page');
    navigate('/register')
    // Navigation would happen here in a real app
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 bg-cover bg-center" 
         style={{ backgroundImage: "url('/api/placeholder/1920/1080')" }}>
      
      {/* Semi-transparent card */}
      <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-xl w-full max-w-md">
        <Logo />
        
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Welcome Back!</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={formData.remember}
                onChange={handleChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-gray-700">Remember me</label>
            </div>
            
            <div>
              <button type="button" className="text-purple-600 hover:text-purple-800">
                Forgot password?
              </button>
            </div>
          </div>
          
          <button
            onClick={handleSubmit}
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition duration-300 transform hover:scale-105"
          >
            Login
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button 
              onClick={navigateToRegister}
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              Register
            </button>
          </p>
        </div>
      </div>
      
      {/* Decorative anime-themed elements */}
      <div className="absolute bottom-4 left-4 text-white text-xs">
        <p>Find your next favorite anime with Dunime</p>
      </div>
    </div>
  );
};

export default LoginPage;