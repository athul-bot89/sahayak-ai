import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

const Header = () => {
  const { t } = useTranslation();

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
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;