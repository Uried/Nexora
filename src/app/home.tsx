"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Profile_pic from '../../src/assets/images/profile-pic.jpg';
import Banner1 from '../../src/assets/images/banner1.png';
import Banner2 from '../../src/assets/images/banner2.png';
import Popular1 from '../../src/assets/images/popular1 (1).jpg';
import Popular3 from '../../src/assets/images/popular1 (3).jpg';
import Popular5 from '../../src/assets/images/popular1 (5).jpg';
import Menbag from '../../src/assets/images/menbag.jpg';
import Link from 'next/link';
import { FiSearch, FiShoppingCart } from 'react-icons/fi';
import { BsHeart, BsHeartFill } from 'react-icons/bs';
import { useRouter } from "next/navigation";

export default function HomePage() {
  // État pour gérer les catégories sélectionnées
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Toutes les collections']);
  // État pour gérer les produits aimés
  const [likedProducts, setLikedProducts] = useState<{ [key: string]: boolean }>({ 'Black Opium': true });
  // État pour gérer le nombre d'articles dans le panier
  const [cartItemCount] = useState<number>(3);
  const router = useRouter();

  // États pour le carrousel de bannières
  const [currentBanner, setCurrentBanner] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  
  // Données des bannières (texte et image)
  const bannerData = [
    {
      title: "Votre style, votre beauté",
      description: "Découvrez la meilleure collection. Trouvez votre parfum signature aujourd'hui.",
      buttonText: "Commandez maintenant",
      image: Banner1
    },
    {
      title: "Sacs à tomber!",
      description: "Craque pour nos nouveaux sacs trop stylés! Parfaits pour compléter ton look et faire tourner les têtes.",
      buttonText: "Je veux voir ça!",
      image: Banner2
    }
  ];
  
  // Effet pour changer de bannière toutes les 3 secondes avec effet de fondu
  useEffect(() => {
    const changeBanner = () => {
      // Démarrer l'animation de fondu
      setIsAnimating(true);
      
      // Attendre que l'animation de sortie soit terminée avant de changer la bannière
      setTimeout(() => {
        setCurrentBanner(prev => (prev + 1) % bannerData.length);
        
        // Attendre un court instant puis démarrer l'animation d'entrée
        setTimeout(() => {
          setIsAnimating(false);
        }, 50);
      }, 500);
    };
    
    const interval = setInterval(changeBanner, 5000);
    return () => clearInterval(interval);
  }, [bannerData.length]);

  // Fonction pour gérer les likes des produits
  const toggleLike = (productName: string) => {
    setLikedProducts(prev => ({
      ...prev,
      [productName]: !prev[productName]
    }));
  };

  // Fonction pour gérer la sélection/désélection des catégories
  const toggleCategory = (category: string) => {
    if (category === 'Toutes les collections') {
      // Si on clique sur "Toutes les collections", on désélectionne tout le reste
      setSelectedCategories(['Toutes les collections']);
      return;
    }

    // Si une catégorie spécifique est sélectionnée, on retire "Toutes les collections"
    const newSelection = selectedCategories.filter(cat => cat !== 'Toutes les collections');

    // Toggle de la catégorie cliquée
    if (newSelection.includes(category)) {
      // Si la catégorie est déjà sélectionnée, on la retire
      // Mais si c'est la dernière, on revient à "Toutes les collections"
      const filteredSelection = newSelection.filter(cat => cat !== category);
      setSelectedCategories(filteredSelection.length === 0 ? ['Toutes les collections'] : filteredSelection);
    } else {
      // Sinon on l'ajoute
      setSelectedCategories([...newSelection, category]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 bg-[#fbf0ef] min-h-screen">
      {/* Welcome section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-200 flex items-center justify-center">
            {/* Placeholder pour l'avatar */}
            <Image src={Profile_pic} alt="Profile" width={40} height={40} />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Salut, Mina!</h2>
            <p className="text-gray-500 text-base">Bon retour</p>
          </div>
        </div>
        <div className="relative">
          <button className="p-3 rounded-full bg-white shadow-sm">
            <FiShoppingCart size={18} />
          </button>
          {cartItemCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartItemCount}
            </div>
          )}
        </div>
      </div>

      {/* Search bar */}

      <div className="relative flex items-center w-full space-x-2 mb-6">
        <div className="flex items-center bg-white rounded-full px-4 py-3 shadow-sm w-full">
          <FiSearch className="text-gray-500 mr-2" size={18} />
          <input
            type="text"
            placeholder="Trouvez votre article"
            className="bg-transparent border-none outline-none flex-grow text-sm"
          />
        </div>
        <button className="bg-black text-white rounded-full p-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" fillRule="evenodd" d="M5.722 6.8c-.923 1.176-1.256 2.281-1.22 3.31c.038 1.045.458 2.068 1.136 3.06c1.367 1.996 3.694 3.737 5.609 5.09c.452.32 1.05.32 1.502 0c1.93-1.36 4.256-3.1 5.62-5.095c.676-.99 1.093-2.012 1.129-3.055c.034-1.029-.3-2.134-1.225-3.31c-1.62-1.711-3.953-1.66-5.541-.278a1.125 1.125 0 0 1-1.468 0c-1.589-1.381-3.92-1.433-5.542.279m-.743-.669c2.016-2.145 4.97-2.077 6.941-.363a.12.12 0 0 0 .078.027q.05-.002.077-.027c1.97-1.714 4.928-1.783 6.942.364l.015.015l.013.017c1.059 1.34 1.496 2.677 1.452 3.98c-.043 1.292-.558 2.495-1.303 3.585c-1.48 2.164-3.953 3.998-5.868 5.349a2.3 2.3 0 0 1-2.657-.001c-1.9-1.344-4.374-3.178-5.856-5.343c-.746-1.09-1.264-2.295-1.31-3.588c-.046-1.304.389-2.641 1.448-3.982l.013-.017z" clipRule="evenodd" /></svg>
        </button>
      </div>


      {/* Featured Collection - Carousel */}
      <div className="bg-black text-white rounded-3xl p-3 mb-6 overflow-hidden">
        <div className="flex justify-between items-center">
          <div className="w-2/3">
            <div className={`transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
              <h3 className="text-xl noyh-regular font-semibold mb-1">{bannerData[currentBanner].title}</h3>
              <p className="text-gray-300 mb-4">{bannerData[currentBanner].description}</p>
              <button className="bg-white noyh-light text-black px-5 py-1.5 rounded-full text-sm font-semibold">
                {bannerData[currentBanner].buttonText}
              </button>
            </div>
          </div>
          <div className="w-2/5">
            <div className="w-full aspect-square relative flex items-center justify-center overflow-visible">
              <div className={`transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                <Image 
                  src={bannerData[currentBanner].image} 
                  alt={`Banner ${currentBanner + 1}`} 
                  className="w-full h-auto scale-100" 
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Category Pills */}
      <div className="flex space-x-3 mb-6 overflow-x-auto pb-2">
        {[
          'Toutes les collections',
          'Florale',
          'Orientale',
          'Boisée',
          'Fougère',
          'Chyprée',
          'Hespéridée',
          'Aromatique',
          'Gourmande',
          'Aquatique',
          'Eau de Cologne'
        ].map((category) => (
          <button
            key={category}
            onClick={() => toggleCategory(category)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors duration-200 ${selectedCategories.includes(category) ? 'bg-black text-white' : 'bg-white text-gray-700'}`}
          >
            {category}
          </button>
        ))}

      </div>

      {/* Popular Perfumes */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Articles populaires</h3>
          <Link href="/" className="text-gray-500 text-sm">
            Voir tout
          </Link>
        </div>


        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Product 1 */}
          <div 
            className="bg-white rounded-2xl p-2 relative shadow-sm cursor-pointer" 
            onClick={() => router.push('/product')}
          >
            <div className="relative w-full aspect-square mb-3 flex items-center justify-center overflow-hidden rounded-xl">
              <Image
                src={Popular1}
                alt="La Nuit Tresor"
                className="object-cover w-full h-full"
                width={150}
                height={150}
              />
              <button
                className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike('La Nuit Tresor');
                }}
              >
                {likedProducts['La Nuit Tresor'] ?
                  <BsHeartFill size={16} color="red" /> :
                  <BsHeart size={16} color="black" />
                }
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className='font-semibold'>
                <h4 className="text-sm">Jumeirah</h4>
                <p className="text-gray-500 text-xs mb-2">32 500 FCFA</p>
              </div>
              <button 
                className="bg-black text-white rounded-full p-2 shadow-sm"
                onClick={() => router.push('/product')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M3.977 9.84A2 2 0 0 1 5.971 8h12.058a2 2 0 0 1 1.994 1.84l.803 10A2 2 0 0 1 18.833 22H5.167a2 2 0 0 1-1.993-2.16z" /><path d="M16 11V6a4 4 0 0 0-4-4v0a4 4 0 0 0-4 4v5" /></g></svg>
              </button>
            </div>
          </div>

          {/* Product 2 */}
          <div 
            className="bg-white rounded-2xl p-2 relative shadow-sm cursor-pointer" 
            onClick={() => router.push('/product')}
          >
            <div className="relative w-full aspect-square mb-3 flex items-center justify-center overflow-hidden rounded-xl">
              <Image
                src={Popular5}
                alt="Black Opium"
                className="object-cover w-full h-full"
                width={150}
                height={150}
              />
              <button
                className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike('Black Opium');
                }}
              >
                {likedProducts['Black Opium'] ?
                  <BsHeartFill size={16} color="red" /> :
                  <BsHeart size={16} color="black" />
                }
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className='font-semibold'>
                <h4 className="text-sm">Loui Martin Arthur</h4>
                <div className="flex items-baseline gap-3">
                  <p className="text-gray-500 text-xs mb-2">32 500 FCFA</p>
                </div>
              </div>
              <button 
                className="bg-black text-white rounded-full p-2 shadow-sm"
                onClick={() => router.push('/product')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M3.977 9.84A2 2 0 0 1 5.971 8h12.058a2 2 0 0 1 1.994 1.84l.803 10A2 2 0 0 1 18.833 22H5.167a2 2 0 0 1-1.993-2.16z" /><path d="M16 11V6a4 4 0 0 0-4-4v0a4 4 0 0 0-4 4v5" /></g></svg>
              </button>
            </div>
          </div>

          {/* Product 3 */}
          <div 
            className="bg-white rounded-2xl p-2 relative shadow-sm cursor-pointer" 
            onClick={() => router.push('/product')}
          >
            <div className="relative w-full aspect-square mb-3 flex items-center justify-center overflow-hidden rounded-xl">
              <Image
                src={Popular3}
                alt="Coco Mademoiselle"
                className="object-cover w-full h-full"
                width={150}
                height={150}
              />
              <button
                className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike('Coco Mademoiselle');
                }}
              >
                {likedProducts['Coco Mademoiselle'] ?
                  <BsHeartFill size={16} color="red" /> :
                  <BsHeart size={16} color="black" />
                }
              </button>
            </div>
           <div className='font-semibold'>
           <h4 className="text-sm">Loui Martin</h4>
           <p className="text-gray-500 text-xs mb-2">39 000 FCFA</p>
           </div>
            <button onClick={() => router.push('/product')} className="absolute bottom-4 right-4 bg-black text-white rounded-full p-2 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M3.977 9.84A2 2 0 0 1 5.971 8h12.058a2 2 0 0 1 1.994 1.84l.803 10A2 2 0 0 1 18.833 22H5.167a2 2 0 0 1-1.993-2.16z" /><path d="M16 11V6a4 4 0 0 0-4-4v0a4 4 0 0 0-4 4v5" /></g></svg>
            </button>
          </div>

          {/* Product 4 */}
          <div 
            className="bg-white rounded-2xl p-2 relative shadow-sm cursor-pointer" 
            onClick={() => router.push('/product')}
          >
            <div className="relative w-full aspect-square mb-3 flex items-center justify-center overflow-hidden rounded-xl">
              <Image
                src={Menbag}
                alt="J'adore"
                className="object-cover w-full h-full"
                width={150}
                height={150}
              />
              <button
                className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike('J\'adore');
                }}
              >
                {likedProducts['J\'adore'] ?
                  <BsHeartFill size={16} color="red" /> :
                  <BsHeart size={16} color="black" />
                }
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className='font-semibold '>
                <h4 className="text-sm capitalize">Louis Vuitton</h4>
                <p className="text-gray-500 text-xs mb-2">36 000 FCFA</p>
              </div>
              <button 
                className="bg-black text-white rounded-full p-2 shadow-sm"
                onClick={() => router.push('/product')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M3.977 9.84A2 2 0 0 1 5.971 8h12.058a2 2 0 0 1 1.994 1.84l.803 10A2 2 0 0 1 18.833 22H5.167a2 2 0 0 1-1.993-2.16z" /><path d="M16 11V6a4 4 0 0 0-4-4v0a4 4 0 0 0-4 4v5" /></g></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}