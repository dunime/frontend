import React from 'react';
import { useNavigate } from 'react-router-dom';


// Logo component
const Logo = () => (
  <div className="text-center mb-8">
    <h1 className="text-5xl font-bold text-white drop-shadow-lg">
      <span className="text-purple-400">Du</span>
      <span className="text-pink-400">nime</span>
    </h1>
    <p className="text-white text-lg mt-2">Discover Your Next Anime Adventure</p>
  </div>
);

// Button component
const Button = ({ onClick, primary, children }) => (
  <button 
    onClick={onClick}
    className={`
      px-8 py-3 rounded-full font-medium transition-all duration-300
      ${primary 
        ? "bg-purple-600 text-white hover:bg-purple-700" 
        : "bg-white text-purple-800 hover:bg-gray-100"
      }
      transform hover:scale-105 shadow-lg
    `}
  >
    {children}
  </button>
);

// Main Welcome Page component
const WelcomePage = () => {
    const navigate = useNavigate()

  const handleLogin = () => {
    navigate('/login')
};

const handleRegister = () => {
      navigate('/register')
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative overflow-hidden"
         style={{ backgroundImage: "url('https://images.unsplash.com/photo-1613376023733-0a73315d9b06?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}>
      
      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black opacity-50"></div>
      
      {/* Content */}
      <div className="z-10 text-center px-4">
        <Logo />
        
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Button onClick={handleLogin} primary>Login</Button>
          <Button onClick={handleRegister}>Register</Button>
        </div>
        
        <div className="mt-12 text-white opacity-80">
          <p>Your gateway to the best anime recommendations</p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-4 right-4 text-white text-xs opacity-70">
        © 2025 Dunime - All rights reserved
      </div>
    </div>
  );
};

export default WelcomePage;