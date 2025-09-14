"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiSearch } from 'react-icons/fi';
import Logo from '../assets/images/logo.png';

interface DesktopHeaderProps {
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export default function DesktopHeader({ searchQuery = '', setSearchQuery }: DesktopHeaderProps) {
  return (
    <div className="hidden lg:block bg-white border-b fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center cursor-pointer">
              <Image 
                src={Logo} 
                alt="Nexora Logo" 
                width={120} 
                height={40} 
                className="h-16 w-auto"
              />
            </Link>
            <div className="flex items-center space-x-6">
              <div className="flex items-center bg-gray-50 border border-black rounded-lg px-4 py-2 w-96">
                <FiSearch className="text-gray-400 mr-2" size={18} />
                <input
                  type="text"
                  placeholder="Recherchez produits ou marques ici"
                  className="bg-transparent border-none outline-none flex-grow text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery?.(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-sm text-gray-600 hover:text-black cursor-pointer">À propos de Kasi</button>
            <button className="text-sm bg-black text-white px-4 py-2 rounded-full cursor-pointer hover:bg-gray-800">S&apos;inscrire</button>
            <button className="px-4 py-2 border border-black text-black rounded-full hover:bg-black hover:text-white transition-colors">À propos de Kasi</button>
          </div>
        </div>
      </div>
    </div>
  );
}
