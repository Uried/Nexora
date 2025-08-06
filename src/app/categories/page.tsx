"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiShoppingCart } from 'react-icons/fi';
import Header from '../../components/Header';

// Import des images pour les différentes catégories
import Parfums from '../../assets/images/popular1 (1).jpg';
import Accessoires from '../../assets/images/bag1.png';
import Maquillage from '../../assets/images/popular1 (2).jpg';
import SoinsPeau from '../../assets/images/popular1 (4).jpg';
import Cheveux from '../../assets/images/popular1 (5).jpg';
import Homme from '../../assets/images/popular1 (8).jpg';

export default function CategoriesPage() {
  const router = useRouter();
  
  // Liste des catégories principales avec leurs images et descriptions
  const mainCategories = [
    {
      id: 1,
      name: 'Parfums',
      description: 'Découvrez notre collection de parfums pour hommes et femmes des plus grandes marques.',
      image: Parfums,
      productCount: 86,
      subcategories: ['Floral', 'Oriental', 'Woody', 'Fresh']
    },
    {
      id: 2,
      name: 'Accessoires',
      description: 'Des sacs à main aux bijoux, trouvez l\'accessoire parfait pour compléter votre style.',
      image: Accessoires,
      productCount: 42,
      subcategories: ['Sacs', 'Bijoux', 'Montres', 'Ceintures']
    },
    {
      id: 3,
      name: 'Maquillage',
      description: 'Une large gamme de produits de maquillage pour sublimer votre beauté au quotidien.',
      image: Maquillage,
      productCount: 64,
      subcategories: ['Teint', 'Yeux', 'Lèvres', 'Ongles']
    },
    {
      id: 4,
      name: 'Soins de la peau',
      description: 'Des produits de soin adaptés à tous les types de peau pour une routine beauté complète.',
      image: SoinsPeau,
      productCount: 53,
      subcategories: ['Visage', 'Corps', 'Anti-âge', 'Solaire']
    },
    {
      id: 5,
      name: 'Cheveux',
      description: 'Tout pour prendre soin de vos cheveux, des shampooings aux outils de coiffage.',
      image: Cheveux,
      productCount: 37,
      subcategories: ['Shampooings', 'Soins', 'Coiffage', 'Coloration']
    },
    {
      id: 6,
      name: 'Homme',
      description: 'Une sélection de produits dédiés aux hommes, du parfum aux soins de la barbe.',
      image: Homme,
      productCount: 45,
      subcategories: ['Parfums', 'Soins', 'Rasage', 'Accessoires']
    }
  ];

  // Fonction pour naviguer vers la page des produits filtrés par catégorie
  const navigateToCategory = (categoryName: string) => {
    // Idéalement, on passerait la catégorie comme paramètre à la page produits
    router.push('/products');
  };
  
  // État pour suivre la catégorie sélectionnée pour afficher les sous-catégories
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  // Fonction pour afficher/masquer les sous-catégories
  const toggleSubcategories = (categoryId: number) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
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
            <h1 className="text-2xl font-bold">Catégories</h1>
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
        
        {/* Grille des catégories principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {mainCategories.map((category) => (
            <div 
              key={category.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm" 
            >
              <div className="relative h-40 cursor-pointer" onClick={() => navigateToCategory(category.name)}>
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <div className="p-4 text-white">
                    <h2 className="text-xl font-bold">{category.name}</h2>
                    <p className="text-sm text-white/80">{category.productCount} produits</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-600 text-sm">{category.description}</p>
                <div className="flex justify-between items-center mt-3">
                  <button 
                    className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium"
                    onClick={() => navigateToCategory(category.name)}
                  >
                    Découvrir
                  </button>
                  <button 
                    className={`px-3 py-2 rounded-full text-sm ${selectedCategory === category.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => toggleSubcategories(category.id)}
                  >
                    {selectedCategory === category.id ? 'Masquer' : 'Voir sous-catégories'}
                  </button>
                </div>
                
                {/* Sous-catégories */}
                {selectedCategory === category.id && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {category.subcategories.map((subcat, index) => (
                      <button
                        key={index}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm transition-colors"
                        onClick={() => navigateToCategory(subcat)}
                      >
                        {subcat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Section des tendances */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
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
        </div>
      </div>
    </>
  );
}
