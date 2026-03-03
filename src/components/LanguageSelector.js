import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = ({ scrolled = false }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' }
  ];

  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('preferredLanguage', langCode);
    setCurrentLanguage(langCode);
    setIsOpen(false);
  };

  const getCurrentLanguage = () => {
    const lang = languages.find(l => l.code === currentLanguage);
    return lang || languages[0];
  };

  const currentLang = getCurrentLanguage();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
          scrolled 
            ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200' 
            : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm'
        }`}
      >
        <span className="text-lg">{currentLang.flag}</span>
        <span className="hidden sm:inline font-body">{currentLang.nativeName}</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-warm-xl bg-paper border border-cream-200 overflow-hidden z-50 animate-fadeIn">
          <div className="p-2 bg-gradient-to-r from-burgundy-50 to-amber-50">
            <p className="text-xs font-semibold text-burgundy-700 px-2">Select Language</p>
          </div>
          <div className="py-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full text-left px-4 py-3 text-sm transition-all duration-200 flex items-center space-x-3 ${
                  currentLanguage === lang.code 
                    ? 'bg-gradient-to-r from-burgundy-50 to-amber-50 text-burgundy-700 font-semibold' 
                    : 'text-navy-700 hover:bg-cream-50'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <div className="flex-1">
                  <span className="font-medium font-body block">{lang.nativeName}</span>
                  <span className="text-xs text-navy-500">{lang.name}</span>
                </div>
                {currentLanguage === lang.code && (
                  <svg className="w-5 h-5 text-burgundy-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;