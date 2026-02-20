import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold hover:text-blue-200 transition-colors">
              Sahayak AI
            </Link>
          </div>
          
          <ul className="flex items-center space-x-8">
            <li>
              <Link 
                to="/" 
                className="hover:text-blue-200 transition-colors font-medium"
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/library" 
                className="hover:text-blue-200 transition-colors font-medium"
              >
                Library
              </Link>
            </li>
            <li>
              <Link 
                to="/about" 
                className="hover:text-blue-200 transition-colors font-medium"
              >
                About Us
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;