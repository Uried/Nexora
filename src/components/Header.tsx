"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { FiMenu, FiUser } from 'react-icons/fi';
import Logo from '../assets/images/logo.png';

interface HeaderProps {
  defaultLanguage?: 'FR' | 'EN';
}

const Header: React.FC<HeaderProps> = ({ defaultLanguage = 'FR' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState<'FR' | 'EN'>(defaultLanguage);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'FR' ? 'EN' : 'FR');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const headerContent = (
    <header 
      className="lg:hidden text-black shadow-sm mobile-header-fixed"
      style={{ 
        backgroundColor: 'white',
        height: '60px'
      }}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Menu hamburger */}
          <button 
            onClick={toggleMenu}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Menu"
          >
            <FiMenu size={24} />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image 
              src={Logo} 
              alt="Nexora" 
              width={120} 
              height={40} 
              className="h-8 w-auto object-contain" 
            />
          </Link>

          {/* Icons */}
          <div className="flex items-center space-x-3">
            <button 
              className="px-2 py-1 rounded-full bg-black text-white text-xs font-medium hover:bg-gray-800" 
              onClick={toggleLanguage}
              aria-label="Change language"
            >
              {language}
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100" aria-label="Account">
              <FiUser size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );

  const menuContent = isMenuOpen ? (
    <div className="mobile-menu-overlay">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black">Menu</h2>
          <button 
            onClick={toggleMenu}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        <nav>
          <ul className="space-y-4">
            <li>
              <Link href="/" className="block py-2 text-lg" onClick={toggleMenu}>
                Accueil
              </Link>
            </li>
            <li>
              <Link href="/categories" className="block py-2 text-lg" onClick={toggleMenu}>
                Catégories
              </Link>
            </li>
            {/* <li>
              <Link href="/nouveautes" className="block py-2 text-lg" onClick={toggleMenu}>
                Nouveautés
              </Link>
            </li> */}
            {/* <li>
              <Link href="/promotions" className="block py-2 text-lg" onClick={toggleMenu}>
                Promotions
              </Link>
            </li> */}
            {/* <li>
              <Link href="/account" className="block py-2 text-lg" onClick={toggleMenu}>
                Mon compte
              </Link>
            </li> */}
          </ul>
        </nav>
      </div>
    </div>
  ) : null;

  if (!mounted) return null;

  return typeof window !== 'undefined' ? (
    <>
      {createPortal(headerContent, document.body)}
      {menuContent && createPortal(menuContent, document.body)}
    </>
  ) : null;
};

export default Header;