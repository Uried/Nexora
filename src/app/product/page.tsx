"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiMinus, FiPlus, FiArrowLeft } from 'react-icons/fi';
import Header from '../../components/Header';
import Popular1 from '../../assets/images/popular1 (1).jpg';

export default function ProductPage() {
  const [quantity, setQuantity] = useState(1);
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
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
            className="object-contain bg-[#fdf6e9]"
          />
        </div>

        {/* Product Details Card */}
        <div className="bg-white rounded-t-3xl px-5 pt-6 pb-20 -mt-10 relative z-10">
          {/* Discount Badge */}
          <div className="flex justify-center mb-4">
            <div className="bg-black text-white text-sm font-semibold px-5 py-3 rounded-full">
              -20%
            </div>
          </div>

          {/* Product Specs */}
          <div className="flex justify-between mb-6">
            <div className="bg-[#f8e8e8] w-20 h-20 rounded-xl px-4 py-3 text-center">
              <p className="font-bold text-lg">150</p>
              <p className="text-xs text-gray-600">ml</p>
            </div>
            <div className="bg-[#f8e8e8] w-20 h-20 rounded-xl px-4 py-3 text-center">
              <p className="font-bold text-lg">100%</p>
              <p className="text-xs text-gray-600">pur</p>
            </div>
            <div className="bg-[#f8e8e8] w-20 h-20 rounded-xl px-4 py-3 text-center">
              <p className="font-bold text-lg">4.8</p>
              <p className="text-xs text-gray-600">note</p>
            </div>
            <div className="bg-[#f8e8e8] w-20 h-20 rounded-xl px-4 py-3 text-center">
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
            d&apos;agrumes épicés pour créer un parfum idéal au quotidien
          </p>

          {/* Quantity and Add to Cart */}
          <div className="flex justify-between items-center">
            <div className="flex items-center px-6 py-3 border-2 border-gray-200 rounded-full">
              <button 
                className="px-4"
                onClick={decreaseQuantity}
              >
                <FiMinus />
              </button>
              <span className="px-4">{quantity}</span>
              <button 
                className="px-4"
                onClick={increaseQuantity}
              >
                <FiPlus />
              </button>
            </div>
            <button className="bg-black text-white rounded-full px-6 py-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"><circle cx="9.549" cy="19.049" r="1.701"/><circle cx="16.96" cy="19.049" r="1.701"/><path d="m5.606 5.555l2.01 6.364c.309.978.463 1.467.76 1.829c.26.32.599.567.982.72c.435.173.947.173 1.973.173h3.855c1.026 0 1.538 0 1.972-.173c.384-.153.722-.4.983-.72c.296-.362.45-.851.76-1.829l.409-1.296l.24-.766l.331-1.05a2.5 2.5 0 0 0-2.384-3.252zm0 0l-.011-.037a7 7 0 0 0-.14-.42a2.92 2.92 0 0 0-2.512-1.84C2.84 3.25 2.727 3.25 2.5 3.25"/></g></svg>
              Ajouter au panier
            </button>
          </div>

        </div>
      </div>
    </>
  );
}