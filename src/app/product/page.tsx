"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiMinus, FiPlus, FiArrowLeft } from 'react-icons/fi';
import { BsHeart, BsHeartFill } from 'react-icons/bs';
import Header from '../../components/Header';
import Popular1 from '../../assets/images/popular1 (1).jpg';

export default function ProductPage() {
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  return (
    <>
      <Header defaultLanguage="FR" />
      <div className="pt-16 bg-[#fbf0ef] min-h-screen">
        {/* Product Image */}
        <div className="relative w-full aspect-square mb-0">
          <Link 
            href="/" 
            className="absolute top-4 left-4 z-10 flex items-center bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium shadow-sm"
          >
            <FiArrowLeft className="mr-2" /> Retour
          </Link>
          <Image 
            src={Popular1} 
            alt="Black Opium Perfume" 
            fill
            className="object-contain bg-[#fdf0e4]"
          />
        </div>

        {/* Product Details Card */}
        <div className="bg-white rounded-t-[30px] px-5 pt-6 pb-20 -mt-5">
          {/* Discount Badge */}
          <div className="flex justify-center -mt-8 mb-4 relative z-10">
            <div className="bg-black text-white text-xs font-semibold px-5 py-2 rounded-full">
              -20%
            </div>
          </div>

          {/* Product Specs */}
          <div className="flex justify-between gap-2 mb-6 mt-4 mx-1">
            <div className="bg-[#f8e8e8] rounded-[15px] px-3 py-3 text-center w-[22%]">
              <p className="font-bold text-lg">150</p>
              <p className="text-xs text-gray-600">ml</p>
            </div>
            <div className="bg-[#f8e8e8] rounded-[15px] px-3 py-3 text-center w-[22%]">
              <p className="font-bold text-lg">100%</p>
              <p className="text-xs text-gray-600">pur</p>
            </div>
            <div className="bg-[#f8e8e8] rounded-[15px] px-3 py-3 text-center w-[22%]">
              <p className="font-bold text-lg">4.8</p>
              <p className="text-xs text-gray-600">note</p>
            </div>
            <div className="bg-[#f8e8e8] rounded-[15px] px-3 py-3 text-center w-[22%]">
              <p className="font-bold text-lg">CBC</p>
              <p className="text-xs text-gray-600">marque</p>
            </div>
          </div>

          {/* Product Title and Price */}
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold">Parfum Black Opium</h1>
            <p className="text-2xl font-bold">65 000 FCFA</p>
          </div>

          {/* Product Description */}
          <p className="text-gray-500 mb-8">
            Lancé récemment en 2025, le parfum Black Opium de Versace offre un équilibre délicat
            d'agrumes épicés pour créer un parfum idéal au quotidien
          </p>

          {/* Quantity and Add to Cart */}
          <div className="flex justify-between items-center">
            <div className="flex items-center border-2 border-gray-200 rounded-full">
              <button 
                className="px-4 py-2"
                onClick={decreaseQuantity}
              >
                <FiMinus />
              </button>
              <span className="px-4">{quantity}</span>
              <button 
                className="px-4 py-2"
                onClick={increaseQuantity}
              >
                <FiPlus />
              </button>
            </div>
            <button className="bg-black text-white rounded-full px-6 py-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="mr-2">
                <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                  <path d="M3.977 9.84A2 2 0 0 1 5.971 8h12.058a2 2 0 0 1 1.994 1.84l.803 10A2 2 0 0 1 18.833 22H5.167a2 2 0 0 1-1.993-2.16z" />
                  <path d="M16 11V6a4 4 0 0 0-4-4v0a4 4 0 0 0-4 4v5" />
                </g>
              </svg>
              Ajouter au panier
            </button>
          </div>

        </div>
      </div>
    </>
  );
}