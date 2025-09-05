"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiShoppingCart } from 'react-icons/fi';
import Header from '../../components/Header';


export default function CategoriesPage() {
  const router = useRouter();

  interface Category {
    id: string;
    name: string;
    description?: string;
    slug?: string;
    image?: string;
    productCount?: number;
  }

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.kasi.market';
    const baseUrl = rawBase.replace(/\/$/, '');
    const url = `${baseUrl}/api/categories`;
    const fetchCategories = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setCategories(data.categories ?? []);
      } catch {
        setError('Impossible de charger les catégories.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Navigation vers la page produits avec la catégorie en paramètre
  const navigateToCategory = (cat: Category) => {
    const q = cat.slug ?? cat.name;
    router.push(`/products?category=${encodeURIComponent(q ?? '')}`);
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
            <h1 className="text-2xl font-bold text-black">Catégories</h1>
          </div>
          <button 
            onClick={() => router.push('/cart')} 
            className="flex items-center bg-black text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-sm"
          >
            <FiShoppingCart className="mr-2" /> Panier
          </button>
        </div>

        {/* Titre principal */}
        <h2 className="text-xl font-bold mb-4">Nos catégories de produits</h2>

        {loading && (
          <p className="text-gray-600 mb-8">Chargement des catégories...</p>
        )}
        {error && (
          <p className="text-red-600 mb-8">{error}</p>
        )}

        {/* Grille des catégories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {categories.map((category) => (
            <div 
              key={category.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm" 
            >
              <div className="relative h-40 cursor-pointer" onClick={() => navigateToCategory(category)}>
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-end" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <div className="p-4 text-white">
                    <h2 className="text-xl font-bold">{category.name}</h2>
                    <p className="text-sm text-white/80">{category.productCount ?? 0} produits</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                {category.description && (
                  <p className="text-gray-600 text-sm">{category.description}</p>
                )}
                <div className="flex justify-between items-center mt-3">
                  <button 
                    className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium"
                    onClick={() => navigateToCategory(category)}
                  >
                    Découvrir
                  </button>
                  {/* Bouton sous-catégories retiré (données non fournies par l'API) */}
                </div>
                
                {/* Sous-catégories supprimées */}
              </div>
            </div>
          ))}
        </div>
        
        {/* Section des tendances */}
        {/* <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Tendances du moment</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-gray-100 rounded-xl p-3 text-center">
              <p className="font-medium">Parfums d'été</p>
            </div>
            <div className="bg-gray-100 rounded-xl p-3 text-center">
              <p className="font-medium">Nouveautés</p>
            </div>
            <div className="bg-gray-100 rounded-xl p-3 text-center">
              <p className="font-medium">Promotions</p>
            </div>
            <div className="bg-gray-100 rounded-xl p-3 text-center">
              <p className="font-medium">Collections</p>
            </div>
            <div className="bg-gray-100 rounded-xl p-3 text-center">
              <p className="font-medium">Coffrets</p>
            </div>
            <div className="bg-gray-100 rounded-xl p-3 text-center">
              <p className="font-medium">Éditions limitées</p>
            </div>
          </div>
        </div> */}
      </div>
    </>
  );
}
