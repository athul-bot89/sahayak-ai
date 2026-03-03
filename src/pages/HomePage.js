import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
// Temporarily using placeholder - replace with professional academic image
import heroImage from '../utils/Gemini_Generated_Image_yx6lcmyx6lcmyx6l.png';

const HomePage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  useEffect(() => {
    // Check if this is the user's first visit
    const hasVisited = localStorage.getItem('hasVisited');
    const preferredLanguage = localStorage.getItem('preferredLanguage');
    
    if (!hasVisited && !preferredLanguage) {
      setShowLanguageModal(true);
      localStorage.setItem('hasVisited', 'true');
    }
  }, []);

  const handleLanguageSelect = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('preferredLanguage', langCode);
    setShowLanguageModal(false);
  };

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

  return (
    <div className="flex-grow">
      {/* Language Selection Modal - Enhanced */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-navy-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="glass-warm rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-warm-2xl animate-slideIn">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
                </svg>
              </div>
              <h2 className="text-3xl font-heading font-bold mb-2 gradient-warm">
                {t('hero.selectLanguage')}
              </h2>
              <p className="text-navy-600 font-body">
                Choose your preferred language / अपनी पसंदीदा भाषा चुनें
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className="group p-4 bg-paper border-2 border-cream-300 rounded-xl hover:border-amber-400 hover:shadow-warm-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="text-2xl mb-2 transform group-hover:scale-110 transition-transform">{lang.flag}</div>
                  <div className="font-semibold text-navy-800 font-heading">{lang.nativeName}</div>
                  <div className="text-sm text-navy-500">{lang.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section - Warm Academic Design */}
      <section className="relative bg-gradient-to-br from-parchment via-cream-100 to-amber-50 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-burgundy-400 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-400 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 lg:py-28 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            {/* Text Content - Enhanced Typography */}
            <div className="flex-1 text-center lg:text-left animate-fadeIn">
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold tracking-wide uppercase">
                  Empowering Education
                </span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-heading font-extrabold mb-6 text-navy-900 leading-tight">
                <span className="gradient-warm">{t('hero.title')}</span>
              </h1>
              <p className="text-2xl mb-4 font-heading font-semibold text-burgundy-700">
                {t('hero.subtitle')}
              </p>
              <p className="text-lg lg:text-xl mb-10 max-w-2xl text-navy-700 leading-relaxed font-body">
                {t('hero.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => navigate('/library')}
                  className="group px-8 py-4 bg-gradient-to-r from-burgundy-600 to-burgundy-700 text-white rounded-xl font-semibold hover:from-burgundy-700 hover:to-burgundy-800 transition-all duration-300 transform hover:-translate-y-1 shadow-warm-xl hover:shadow-warm-2xl flex items-center justify-center space-x-2"
                >
                  <span>{t('hero.exploreButton')}</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                </button>
                <button 
                  onClick={() => navigate('/about')}
                  className="px-8 py-4 bg-transparent border-2 border-burgundy-600 text-burgundy-700 rounded-xl font-semibold hover:bg-burgundy-50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-warm-lg"
                >
                  {t('hero.learnMoreButton')}
                </button>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-12 flex items-center gap-8 text-navy-600 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span className="font-medium">Trusted by Educators</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                  </svg>
                  <span className="font-medium">Quality Content</span>
                </div>
              </div>
            </div>
            
            {/* Hero Image with Overlay */}
            <div className="flex-1 max-w-lg relative">
              {/* Book Stack Decoration */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-amber-200 to-amber-400 rounded-full opacity-20 blur-2xl"></div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-burgundy-600 to-amber-600 rounded-2xl transform rotate-3 group-hover:rotate-6 transition-transform duration-500"></div>
                <img 
                  src={heroImage} 
                  alt="Sahayak AI - Education Platform" 
                  className="relative w-full h-auto rounded-2xl shadow-warm-2xl transform group-hover:scale-[1.02] transition-all duration-500 border-4 border-white"
                  style={{
                    maxHeight: '500px',
                    objectFit: 'cover'
                  }}
                />
                {/* Overlay Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
                  <span className="text-sm font-semibold gradient-warm">AI Powered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-burgundy-600 via-burgundy-700 to-amber-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">
                10+
              </div>
              <div className="text-warm-100 font-body">
                {t('stats.books', 'Digital Books')}
              </div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">
                9
              </div>
              <div className="text-warm-100 font-body">
                {t('stats.languages', 'Languages Supported')}
              </div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">
                5+
              </div>
              <div className="text-warm-100 font-body">
                {t('stats.users', 'Test Users')}
              </div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">
                Beta
              </div>
              <div className="text-warm-100 font-body">
                {t('stats.satisfaction', 'Project Phase')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Asymmetric Layout */}
      <section className="py-20 bg-paper relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(205, 35, 70, 0.1) 35px, rgba(205, 35, 70, 0.1) 70px)'
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fadeIn">
            <h2 className="text-4xl font-heading font-bold mb-4 text-navy-900">
              {t('features.title')}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-burgundy-600 to-amber-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Feature 1 - Larger Card */}
            <div className="lg:col-span-2 lg:row-span-2 group">
              <div className="h-full bg-gradient-to-br from-burgundy-50 to-amber-50 p-8 rounded-2xl shadow-warm-lg hover:shadow-warm-xl transition-all duration-300 border border-cream-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-burgundy-400 to-amber-400 opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-burgundy-500 to-burgundy-700 rounded-xl flex items-center justify-center mb-6 shadow-lg transform group-hover:rotate-6 transition-transform duration-300">
                    <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-4 text-navy-900">{t('features.aiPowered.title')}</h3>
                  <p className="text-navy-700 leading-relaxed text-lg font-body">
                    {t('features.aiPowered.description')}
                  </p>
                  <div className="mt-6 flex items-center text-burgundy-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    <span>Learn More</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="group">
              <div className="h-full card-academic p-6 hover-lift">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center mb-4 shadow-md transform group-hover:rotate-6 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-heading font-semibold mb-3 text-navy-900">{t('features.vastLibrary.title')}</h3>
                <p className="text-navy-600 text-sm leading-relaxed">
                  {t('features.vastLibrary.description')}
                </p>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="group">
              <div className="h-full card-academic p-6 hover-lift">
                <div className="w-14 h-14 bg-gradient-to-br from-burgundy-500 to-amber-500 rounded-xl flex items-center justify-center mb-4 shadow-md transform group-hover:rotate-6 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-heading font-semibold mb-3 text-navy-900">{t('features.interactive.title')}</h3>
                <p className="text-navy-600 text-sm leading-relaxed">
                  {t('features.interactive.description')}
                </p>
              </div>
            </div>

            {/* Feature 4 - Spans 2 columns */}
            <div className="lg:col-span-2 group">
              <div className="h-full card-academic p-6 hover-lift">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-burgundy-500 rounded-xl flex items-center justify-center mb-4 shadow-md transform group-hover:rotate-6 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-heading font-semibold mb-3 text-navy-900">{t('features.personalized.title')}</h3>
                <p className="text-navy-600 text-sm leading-relaxed">
                  {t('features.personalized.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-burgundy-600 to-amber-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-4xl font-bold text-white mb-6">
            {t('cta.title', 'Start Your Learning Journey Today')}
          </h2>
          <p className="font-body text-xl text-warm-100 mb-8 max-w-2xl mx-auto">
            {t('cta.subtitle', 'Join thousands of learners discovering the power of AI-enhanced education')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/library')}
              className="btn-primary bg-white text-burgundy-700 hover:bg-warm-50 px-8 py-4 text-lg font-semibold transition-all transform hover:scale-105"
            >
              {t('cta.exploreLibrary', 'Explore Library')}
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="btn-secondary border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold transition-all"
            >
              {t('cta.getStarted', 'Get Started Free')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;