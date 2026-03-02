import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, teacherName, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold hover:text-blue-200 transition-colors">
              {t('header.title')}
            </Link>
          </div>
          
          <div className="flex items-center space-x-8">
            <ul className="flex items-center space-x-8">
              <li>
                <Link 
                  to="/" 
                  className="hover:text-blue-200 transition-colors font-medium"
                >
                  {t('header.home')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/library" 
                  className="hover:text-blue-200 transition-colors font-medium"
                >
                  {t('header.library')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="hover:text-blue-200 transition-colors font-medium"
                >
                  {t('header.about')}
                </Link>
              </li>
            </ul>
            <LanguageSelector />
            
            {/* Authentication UI */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-blue-500">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <span className="text-sm font-medium text-blue-100">
                    {t('header.welcome', 'Welcome')}, {teacherName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  <span>{t('header.logout', 'Logout')}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="ml-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                <span>{t('header.login', 'Teacher Login')}</span>
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;