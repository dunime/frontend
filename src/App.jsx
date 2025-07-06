import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import HomePage from './pages/HomePage';
import FilterResultsPage from './pages/FilterResultsPage';



function App() {
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
     // Potential global event listeners or setup
    const handleBeforeUnload = () => {
      // Add any necessary cleanup or saving logic before page unload
      // For example:
      // if (someDataIsUnsaved) {
      //   return "Are you sure you want to leave? Your changes may not be saved.";
      // }
    };
      window.addEventListener('beforeunload', handleBeforeUnload);
       return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  return (
    <Router>
           {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />}/>
        <Route path= "/register" element={<RegisterPage />}/>
        <Route path="/home" element={<HomePage />}/>
         <Route path="/filter" element={<FilterResultsPage />} /> 
        
     </Routes>
    </Router>
  );
}

export default App;
