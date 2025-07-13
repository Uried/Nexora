"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiShoppingCart } from 'react-icons/fi';
import { BsHeart, BsHeartFill } from 'react-icons/bs';
import Header from '../../components/Header';
import { addToCart } from '../../lib/cart';

// Import des images de produits (utilisez les mêmes que dans home.tsx pour la cohérence)
import Popular1 from '../../assets/images/popular1 (1).jpg';
import Popular2 from '../../assets/images/popular1 (2).jpg';
import Popular3 from '../../assets/images/popular1 (3).jpg';
import Popular4 from '../../assets/images/popular1 (4).jpg';
import Popular5 from '../../assets/images/popular1 (5).jpg';
import Menbag from '../../assets/images/menbag.jpg';

export default function LikedProductsPage() {
  const router = useRouter();
  
  // Simulation de produits likés (dans une application réelle, cela viendrait d'un état global ou d'une API)
  const [likedProducts, setLikedProducts] = useState([
    {
      id: 1,
      name: 'Black Opium',
      brand: 'Yves Saint Laurent',
      price: '65 000 FCFA',
      image: Popular1,
      liked: true
    },
    {
      id: 3,
      name: 'Coco Mademoiselle',
      brand: 'Chanel',
      price: '39 000 FCFA',
      image: Popular3,
      liked: true
    }
  ]);

  // Fonction pour retirer un produit des favoris
  const toggleLike = (productId: number) => {
    setLikedProducts(prev => prev.filter(product => product.id !== productId));
  };

  const parsePriceToNumber = (priceLabel: string): number => {
    // Ex: "65 000 FCFA" -> 65000 ; handles commas as decimal separator as well
    const cleaned = priceLabel
      .replace(/[^0-9,\.\s]/g, '') // keep digits, comma, dot, spaces
      .replace(/\s+/g, '');
    const normalized = cleaned.replace(/,(?=\d{2}$)/, '.');
    const num = parseFloat(normalized.replace(/[^0-9.]/g, ''));
    return Number.isFinite(num) ? num : 0;
  };

  return (
    <>
      <Header defaultLanguage="FR" />
      <div className="pt-16 pb-20 bg-[#fbf0ef] min-h-screen px-4">
        {/* Header avec titre et bouton retour */}
        <div className="flex items-center justify-between mb-6 mt-6">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium shadow-sm mr-4"
            >
              <FiArrowLeft className="mr-2" /> Retour
            </Link>
            <h1 className="text-2xl font-bold">Articles favoris</h1>
          </div>
          <button 
            onClick={() => router.push('/cart')} 
            className="flex items-center bg-black text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-sm"
          >
            <FiShoppingCart className="mr-2" /> Panier
          </button>
        </div>

        {/* Liste des produits likés */}
        {likedProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {likedProducts.map((product) => (
              <div 
                key={product.id}
                className="bg-white rounded-2xl p-2 relative shadow-sm cursor-pointer" 
                onClick={() => router.push(`/product?id=${product.id}`)}
              >
                <div className="relative w-full aspect-square mb-3 flex items-center justify-center overflow-hidden rounded-xl">
                  <Image
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-full h-full"
                    width={150}
                    height={150}
                  />
                  <button
                    className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(product.id);
                    }}
                  >
                    <BsHeartFill size={16} color="red" />
                  </button>
                </div>
                <div className="font-semibold">
                  <h4 className="text-sm">{product.brand}</h4>
                  <p className="text-xs mb-1">{product.name}</p>
                  <p className="text-gray-500 text-xs mb-2">{product.price}</p>
                </div>
                <button 
                  className="absolute bottom-4 right-4 bg-black text-white rounded-full p-2 shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Ajouter au panier
                    const priceAtAdd = parsePriceToNumber(product.price);
                    addToCart(String(product.id), 1, priceAtAdd);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                      <path d="M3.977 9.84A2 2 0 0 1 5.971 8h12.058a2 2 0 0 1 1.994 1.84l.803 10A2 2 0 0 1 18.833 22H5.167a2 2 0 0 1-1.993-2.16z" />
                      <path d="M16 11V6a4 4 0 0 0-4-4v0a4 4 0 0 0-4 4v5" />
                    </g>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-white p-4 rounded-full mb-4">
              <BsHeart size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Aucun article favori</h2>
            <p className="text-gray-500 mb-6">Vous n'avez pas encore ajouté d'articles à vos favoris</p>
            <Link 
              href="/products" 
              className="bg-black text-white px-6 py-3 rounded-full font-medium"
            >
              Découvrir des produits
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
