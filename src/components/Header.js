import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, teacherName, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass-light shadow-warm-lg' : 'bg-gradient-to-r from-burgundy-700 via-burgundy-600 to-amber-700'
    }`}>
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between py-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            {/* Academic Emblem */}
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72L5.18 9L12 5.28L18.82 9zM17 15.99l-5 2.73l-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
              </svg>
            </div>
            <Link 
              to="/" 
              className={`text-2xl font-heading font-bold transition-colors ${
                scrolled ? 'text-burgundy-700 hover:text-burgundy-800' : 'text-white hover:text-amber-200'
              }`}
            >
              <span className={scrolled ? 'gradient-warm' : ''}>{t('header.title')}</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <ul className="flex items-center space-x-8">
              <li>
                <Link 
                  to="/" 
                  className={`font-medium transition-all duration-300 relative ${
                    scrolled 
                      ? isActive('/') 
                        ? 'text-burgundy-700' 
                        : 'text-navy-700 hover:text-burgundy-600'
                      : isActive('/')
                        ? 'text-amber-200'
                        : 'text-white/90 hover:text-white'
                  }`}
                >
                  {t('header.home')}
                  {isActive('/') && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-current transform origin-left transition-transform duration-300"></span>
                  )}
                </Link>
              </li>
              <li>
                <Link 
                  to="/library" 
                  className={`font-medium transition-all duration-300 relative ${
                    scrolled 
                      ? isActive('/library') 
                        ? 'text-burgundy-700' 
                        : 'text-navy-700 hover:text-burgundy-600'
                      : isActive('/library')
                        ? 'text-amber-200'
                        : 'text-white/90 hover:text-white'
                  }`}
                >
                  {t('header.library')}
                  {isActive('/library') && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-current transform origin-left transition-transform duration-300"></span>
                  )}
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className={`font-medium transition-all duration-300 relative ${
                    scrolled 
                      ? isActive('/about') 
                        ? 'text-burgundy-700' 
                        : 'text-navy-700 hover:text-burgundy-600'
                      : isActive('/about')
                        ? 'text-amber-200'
                        : 'text-white/90 hover:text-white'
                  }`}
                >
                  {t('header.about')}
                  {isActive('/about') && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-current transform origin-left transition-transform duration-300"></span>
                  )}
                </Link>
              </li>
            </ul>
            
            <LanguageSelector scrolled={scrolled} />
            
            {/* Authentication UI */}
            {isAuthenticated ? (
              <div className={`flex items-center space-x-4 ml-4 pl-4 border-l ${
                scrolled ? 'border-cream-300' : 'border-white/30'
              }`}>
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    scrolled ? 'bg-amber-100' : 'bg-white/20'
                  }`}>
                    <svg className={`w-5 h-5 ${scrolled ? 'text-amber-700' : 'text-white'}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <span className={`text-sm font-medium ${
                    scrolled ? 'text-navy-700' : 'text-white/90'
                  }`}>
                    {teacherName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-1 ${
                    scrolled 
                      ? 'bg-burgundy-100 hover:bg-burgundy-200 text-burgundy-700'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
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
                className={`ml-4 px-5 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                  scrolled 
                    ? 'btn-warm text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                <span>{t('header.login', 'Teacher Login')}</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              scrolled ? 'text-burgundy-700 hover:bg-cream-100' : 'text-white hover:bg-white/10'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 animate-fadeIn">
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg transition-colors ${
                    isActive('/') 
                      ? 'bg-burgundy-100 text-burgundy-700' 
                      : scrolled 
                        ? 'text-navy-700 hover:bg-cream-100' 
                        : 'text-white hover:bg-white/10'
                  }`}
                >
                  {t('header.home')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/library" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg transition-colors ${
                    isActive('/library') 
                      ? 'bg-burgundy-100 text-burgundy-700' 
                      : scrolled 
                        ? 'text-navy-700 hover:bg-cream-100' 
                        : 'text-white hover:bg-white/10'
                  }`}
                >
                  {t('header.library')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg transition-colors ${
                    isActive('/about') 
                      ? 'bg-burgundy-100 text-burgundy-700' 
                      : scrolled 
                        ? 'text-navy-700 hover:bg-cream-100' 
                        : 'text-white hover:bg-white/10'
                  }`}
                >
                  {t('header.about')}
                </Link>
              </li>
            </ul>
            <div className="mt-4 px-4">
              <LanguageSelector scrolled={scrolled} />
            </div>
            {!isAuthenticated && (
              <div className="mt-4 px-4">
                <button
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full btn-warm text-white px-4 py-2 rounded-lg font-medium"
                >
                  {t('header.login', 'Teacher Login')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;