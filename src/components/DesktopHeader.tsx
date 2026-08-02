"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiSearch, FiShoppingCart } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Logo from '../assets/images/logo.png';
import { useSearch } from '@/contexts/SearchContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface DesktopHeaderProps {
  cartItemCount?: number;
}

export default function DesktopHeader({ cartItemCount = 0 }: DesktopHeaderProps) {
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useSearch();
  const { language, setLanguage, t } = useLanguage();

  console.log('DesktopHeader rendered with language:', language);

  const toggleLanguage = () => {
    const newLanguage = language === 'FR' ? 'EN' : 'FR';
    console.log('ToggleLanguage called - current:', language, 'new:', newLanguage);
    setLanguage(newLanguage);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="hidden lg:block bg-white border-b fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center cursor-pointer">
              <Image 
                src={Logo} 
                alt="kasi Logo" 
                width={120} 
                height={40} 
                className="h-16 w-auto"
              />
            </Link>
            <form onSubmit={handleSearch} className="flex items-center space-x-6">
              <div className="flex items-center bg-gray-50 border border-black rounded-lg px-4 py-2 w-96">
                <FiSearch className="text-gray-400 mr-2" size={18} />
                <input
                  type="text"
                  placeholder={t('header.searchPlaceholder')}
                  className="bg-transparent border-none outline-none flex-grow text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>
          <div className="flex items-center space-x-4">
            {/* <button className="text-sm text-gray-600 hover:text-black cursor-pointer">À propos de Kasi</button> */}
            {/* <button className="text-sm bg-black text-white px-4 py-2 rounded-full cursor-pointer hover:bg-gray-800">S&apos;inscrire</button> */}
            {/* <button className="text-sm border-2 border-black text-black px-4 py-2 rounded-full cursor-pointer hover:bg-black hover:text-white transition-colors">Connexion</button> */}
            <button
              className="px-3 py-1.5 rounded-full bg-black text-white text-xs font-medium hover:bg-gray-800 relative z-50"
              onClick={(e) => {
                console.log('Button clicked!');
                e.preventDefault();
                e.stopPropagation();
                toggleLanguage();
              }}
              aria-label="Change language"
            >
              {language}
            </button>
            <div className="relative cursor-pointer" onClick={() => router.push('/cart')}>
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-black">
                <FiShoppingCart size={20} />
              </button>
              {cartItemCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {cartItemCount}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
