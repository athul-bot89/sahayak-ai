import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Create the authentication context
const AuthContext = createContext(null);

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component to wrap the app
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [teacherName, setTeacherName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const storedTeacherName = localStorage.getItem('teacherName');
      
      if (token && storedTeacherName) {
        setIsAuthenticated(true);
        setTeacherName(storedTeacherName);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function with mock authentication
  const login = async (username, password) => {
    // Mock authentication - check for specific credentials
    if (username === 'teacher' && password === 'password123') {
      // Generate a mock token
      const mockToken = btoa(`${username}:${Date.now()}`);
      
      // Store in localStorage
      localStorage.setItem('authToken', mockToken);
      localStorage.setItem('teacherName', username);
      
      // Update state
      setIsAuthenticated(true);
      setTeacherName(username);
      
      return { success: true };
    } else {
      return { 
        success: false, 
        error: 'Invalid teacher name or password' 
      };
    }
  };

  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('teacherName');
    
    // Reset state
    setIsAuthenticated(false);
    setTeacherName('');
    
    // Redirect to login page
    navigate('/login');
  };

  // Context value
  const value = {
    isAuthenticated,
    teacherName,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;