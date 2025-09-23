"use client";

import React, { useState, useEffect } from 'react';

import Image from 'next/image';
import Profile_pic from '../../src/assets/images/profile-pic.jpg';
// import Banner1 from '../../src/assets/images/banner1.png';
// import Banner2 from '../../src/assets/images/banner2.png';
import PerfumBanner from '../../src/assets/images/kasi_perfum.jpg';
import Link from 'next/link';
import { FiSearch, FiShoppingCart } from 'react-icons/fi';
import DesktopHeader from '../components/DesktopHeader';
import { BsHeart, BsHeartFill } from 'react-icons/bs';
import { useRouter } from "next/navigation";

export default function HomePage() {
  // État pour gérer les catégories sélectionnées
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Toutes les collections']);
  // État pour les catégories récupérées depuis l'API
  interface Category { id: string; name: string; slug?: string }
  const [apiCategories, setApiCategories] = useState<Category[]>([]);

  // Produits (API)
  interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    discountPrice?: number;
    images?: string[];
    isTrending?: boolean;
  }
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [productsPerPage] = useState<number>(6);
  // États pour la pagination desktop
  const [currentDesktopPage, setCurrentDesktopPage] = useState<number>(1);
  const [desktopProductsPerPage] = useState<number>(12);

  // État pour la recherche en temps réel
  const [searchQuery, setSearchQuery] = useState<string>('');

  // État pour gérer les produits aimés
  const [likedProducts, setLikedProducts] = useState<{ [key: string]: boolean }>({ 'Black Opium': true });
  // État pour gérer le nombre d'articles dans le panier
  const [cartItemCount] = useState<number>(3);
  const router = useRouter();

  // États pour le carrousel de bannières (commentés car non utilisés actuellement)
  // const [currentBanner, setCurrentBanner] = useState<number>(0);
  // const [isAnimating, setIsAnimating] = useState<boolean>(false);
  
  // Données des bannières (texte et image) - commentées car non utilisées actuellement
  // const bannerData = [
  //   {
  //     title: "Votre style, votre beauté",
  //     description: "Découvrez la meilleure collection. Trouvez votre parfum signature aujourd'hui.",
  //     buttonText: "Commandez maintenant",
  //     image: Banner1
  //   },
  //   {
  //     title: "Sacs à tomber!",
  //     description: "Craque pour nos nouveaux sacs trop stylés! Parfaits pour compléter ton look et faire tourner les têtes.",
  //     buttonText: "Je veux voir ça!",
  //     image: Banner2
  //   }
  // ];
  
  // Effet pour changer de bannière toutes les 3 secondes avec effet de fondu - commenté car non utilisé actuellement
  // useEffect(() => {
  //   const changeBanner = () => {
  //     // Démarrer l'animation de fondu
  //     setIsAnimating(true);
  //     
  //     // Attendre que l'animation de sortie soit terminée avant de changer la bannière
  //     setTimeout(() => {
  //       setCurrentBanner(prev => (prev + 1) % bannerData.length);
  //       
  //       // Attendre un court instant puis démarrer l'animation d'entrée
  //       setTimeout(() => {
  //         setIsAnimating(false);
  //       }, 50);
  //     }, 500);
  //   };
  //   
  //   const interval = setInterval(changeBanner, 5000);
  //   return () => clearInterval(interval);
  // }, [bannerData.length]);

  // Charger les catégories depuis l'API
  useEffect(() => {
    const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.kasi.market';
    const baseUrl = rawBase.replace(/\/$/, '');
    const url = `${baseUrl}/api/categories`;
    const load = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setApiCategories(data.categories ?? []);
      } catch {
        // silencieux côté UI; on garde la liste statique minimale
      }
    };
    load();
  }, []);

  // Charger les produits depuis l'API (tous ou par catégorie)
  useEffect(() => {
    const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.kasi.market';
    const baseUrl = rawBase.replace(/\/$/, '');
    const url = currentCategoryId
      ? `${baseUrl}/api/products/category/${currentCategoryId}`
      : `${baseUrl}/api/products`;
    const load = async () => {
      setLoadingProducts(true);
      setErrorProducts(null);
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProducts(data.products ?? []);
      } catch {
        setErrorProducts("Impossible de charger les produits.");
      } finally {
        setLoadingProducts(false);
      }
    };
    load();
  }, [currentCategoryId]);

  // Réinitialiser la pagination quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
    setCurrentDesktopPage(1);
  }, [selectedCategories, currentCategoryId, searchQuery]);

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
      setCurrentCategoryId(null); // revient à tous les produits
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
      if (filteredSelection.length === 0) {
        setCurrentCategoryId(null);
      } else {
        // Choisir la première catégorie restante pour filtrer
        const first = filteredSelection[0];
        const catObj = apiCategories.find(c => c.name === first);
        setCurrentCategoryId(catObj ? catObj.id : null);
      }
    } else {
      // Sinon on l'ajoute
      const updated = [...newSelection, category];
      setSelectedCategories(updated);
      // Utiliser la catégorie nouvellement cliquée pour filtrer
      const catObj = apiCategories.find(c => c.name === category);
      setCurrentCategoryId(catObj ? catObj.id : null);
    }
  };

  // Fonction pour filtrer les produits par recherche
  const filterProductsBySearch = (products: Product[]) => {
    if (!searchQuery.trim()) return products;
    
    return products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  return (
    <div className="bg-[#fbf0ef] min-h-screen">
      {/* Desktop Header - Hidden on mobile */}
      <DesktopHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Desktop Main Banner - Hidden on mobile */}
      <div className="hidden lg:block relative h-96 overflow-hidden mt-20">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image 
            src={PerfumBanner} 
            alt="Perfume Collection" 
            className="w-full h-full object-cover" 
            width={1200}
            height={400}
            priority
          />
          {/* Overlay gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20"></div>
        </div>
        
        {/* Content overlay */}
        <div className="relative z-10 container mx-auto px-6 py-16 h-full flex items-center">
          <div className="w-1/2">
            <div className="flex space-x-2 mb-8">
              <div className="w-3 h-3 bg-white rounded-full"></div>
              <div className="w-3 h-3 bg-white/50 rounded-full"></div>
              <div className="w-3 h-3 bg-white/50 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Category Icons - Hidden on mobile */}
      <div className="hidden lg:block bg-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex justify-center space-x-12">
            {['Toutes les collections', ...apiCategories.map(c => c.name)].map((categoryName, index) => {
              const isSelected = selectedCategories.includes(categoryName);
              return (
                <div 
                  key={index} 
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => toggleCategory(categoryName)}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2 transition-colors ${
                    isSelected ? 'bg-black text-white' : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    {categoryName === 'Toutes les collections' ? '📱' : '🏷️'}
                  </div>
                  <span className={`text-sm transition-colors ${
                    isSelected ? 'text-black font-medium' : 'text-gray-700 group-hover:text-black'
                  }`}>{categoryName}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Layout - Hidden on desktop */}
      <div className="lg:hidden container mx-auto px-4 py-6">
      {/* Welcome section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/account')}>
          <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-200 flex items-center justify-center">
            {/* Placeholder pour l'avatar */}
            <Image src={Profile_pic} alt="Profile" width={40} height={40} onClick={() => router.push('/account')} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-black">Salut!</h2>
            <p className="text-gray-500 text-base">Bon retour</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          
          <div className="relative" onClick={() => router.push('/cart')}>
            <button className="p-3 rounded-full bg-white text-black shadow-sm">
              <FiShoppingCart size={18} />
            </button>
            {cartItemCount > 0 && (
              <div className="absolute hidden -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </div>
            )}
          </div>
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          className="bg-black text-white rounded-full p-3"
          // onClick={() => router.push('/liked')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" fillRule="evenodd" d="M5.722 6.8c-.923 1.176-1.256 2.281-1.22 3.31c.038 1.045.458 2.068 1.136 3.06c1.367 1.996 3.694 3.737 5.609 5.09c.452.32 1.05.32 1.502 0c1.93-1.36 4.256-3.1 5.62-5.095c.676-.99 1.093-2.012 1.129-3.055c.034-1.029-.3-2.134-1.225-3.31c-1.62-1.711-3.953-1.66-5.541-.278a1.125 1.125 0 0 1-1.468 0c-1.589-1.381-3.92-1.433-5.542.279m-.743-.669c2.016-2.145 4.97-2.077 6.941-.363a.12.12 0 0 0 .078.027q.05-.002.077-.027c1.97-1.714 4.928-1.783 6.942.364l.015.015l.013.017c1.059 1.34 1.496 2.677 1.452 3.98c-.043 1.292-.558 2.495-1.303 3.585c-1.48 2.164-3.953 3.998-5.868 5.349a2.3 2.3 0 0 1-2.657-.001c-1.9-1.344-4.374-3.178-5.856-5.343c-.746-1.09-1.264-2.295-1.31-3.588c-.046-1.304.389-2.641 1.448-3.982l.013-.017z" clipRule="evenodd" /></svg>
        </button>
      </div>


      {/* Featured Collection - Carousel */}
      {/* <div className="bg-black text-white rounded-3xl p-3 mb-6 overflow-hidden">
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

      </div> */}

        <div className="rounded-3xl p-3 mb-6 overflow-hidden relative group">
          <div 
            className="relative overflow-hidden rounded-md"
            style={{
              animation: 'bannerFloat 4s ease-in-out infinite'
            }}
          >
            {/* Effet shimmer sur la bannière */}
            <div className="absolute inset-0 pointer-events-none z-10">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/3 h-full"
                style={{
                  animation: 'bannerShimmer 5s ease-in-out infinite',
                }}
              />
            </div>
            <Image 
              src={PerfumBanner} 
              alt="Perfume Banner" 
              className="w-full h-auto rounded-md transition-transform duration-300 group-hover:scale-105" 
            />
          </div>
        </div>

      {/* Category Pills */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-black">Catégories</h3>
        <Link href="/categories" className="text-gray-500 text-sm bg-white px-2 py-1 rounded-full">
          Voir tout
        </Link>
      </div>
      <div className="flex space-x-3 mb-6 overflow-x-auto pb-2">
        {['Toutes les collections', ...apiCategories.map(c => c.name)].map((category) => (
          <button
            key={category}
            onClick={() => toggleCategory(category)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors duration-200 ${selectedCategories.includes(category) ? 'bg-black text-white' : 'bg-white text-gray-700'}`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Popular Perfumes / Produits tendance */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-black">Produits tendance</h3>
          <Link href="/products" className="text-gray-500 text-sm bg-white px-2 py-1 rounded-full">
            Voir tout
          </Link>
        </div>
        {loadingProducts && (
          <p className="text-gray-600">Chargement des produits...</p>
        )}
        {errorProducts && (
          <p className="text-red-600">{errorProducts}</p>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(() => {
            // Filtrer les produits selon la catégorie et la recherche
            let filteredProducts = currentCategoryId ? products : products;
            filteredProducts = filterProductsBySearch(filteredProducts);
            
            // Pagination
            const indexOfLastProduct = currentPage * productsPerPage;
            const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
            const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
            
            return currentProducts.map((p) => {
              const img = (p.images && p.images.length > 0) ? p.images[0] : null;
              return (
                <div 
                  key={p.id}
                  className="bg-white rounded-2xl p-2 relative shadow-sm cursor-pointer group overflow-hidden"
                  onClick={() => router.push(`/product?id=${p.id}`)}
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #ffffff 100%)',
                    position: 'relative'
                  }}
                >
                  <div className="relative w-full aspect-square mb-3 flex items-center justify-center overflow-hidden rounded-xl">
                    {/* Effet shimmer sur l'image */}
                    <div className="absolute inset-0 pointer-events-none z-10">
                      <div 
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        style={{
                          animation: 'shimmer 6s ease-in-out infinite',
                        }}
                      />
                    </div>
                    {img ? (
                      <Image src={img} alt={p.name} className="object-cover w-full h-full" width={150} height={150} />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                    <button
                      className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-sm hover:shadow-md transition-shadow"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(p.name);
                      }}
                    >
                      {likedProducts[p.name] ?
                        <BsHeartFill size={16} color="red" /> :
                        <BsHeart size={16} color="black" />
                      }
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className='font-semibold'>
                      <h4 className="text-sm line-clamp-1 text-black">{p.name}</h4>
                      <p className="text-gray-600 text-sm">
                        {p.discountPrice && p.discountPrice > 0 ? (
                          <>
                            <span className="line-through mr-2">{p.price.toLocaleString()} FCFA</span>
                            <span className="text-red-600 font-bold">{p.discountPrice.toLocaleString()} FCFA</span>
                          </>
                        ) : (
                          <span>{p.price.toLocaleString()} FCFA</span>
                        )}
                      </p>
                    </div>
                    <button 
                      className="bg-black text-white rounded-full p-2 shadow-sm hover:bg-gray-800 transition-colors"
                      onClick={() => router.push(`/product?id=${p.id}`)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M3.977 9.84A2 2 0 0 1 5.971 8h12.058a2 2 0 0 1 1.994 1.84l.803 10A2 2 0 0 1 18.833 22H5.167a2 2 0 0 1-1.993-2.16z" /><path d="M16 11V6a4 4 0 0 0-4-4v0a4 4 0 0 0-4 4v5" /></g></svg>
                    </button>
                  </div>
                </div>
              );
            });
          })()}
        </div>
        
        {/* Pagination */}
        {(() => {
          let filteredProducts = currentCategoryId ? products : products;
          filteredProducts = filterProductsBySearch(filteredProducts);
          const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
          
          // Fonction pour changer de page
          const paginate = (pageNumber: number) => {
            setCurrentPage(pageNumber);
            // Remonter en haut de la section produits
            const productsSection = document.querySelector('.grid.grid-cols-2');
            if (productsSection) {
              productsSection.scrollIntoView({ behavior: 'smooth' });
            }
          };
          
          // Afficher la pagination seulement s'il y a plus d'une page
          if (filteredProducts.length > 0 && totalPages > 1) {
            return (
              <div className="mt-6 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-full transition-colors ${currentPage === 1 ? 'bg-gray-200 text-gray-500' : 'bg-white text-black hover:bg-gray-100'}`}
                  >
                    &lt;
                  </button>
                  
                  {/* Afficher les numéros de page */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${currentPage === number ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                    >
                      {number}
                    </button>
                  ))}
                  
                  <button 
                    onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-full transition-colors ${currentPage === totalPages ? 'bg-gray-200 text-gray-500' : 'bg-white text-black hover:bg-gray-100'}`}
                  >
                    &gt;
                  </button>
                </div>
              </div>
            );
          }
          return null;
        })()}
      </div>
      </div>

      {/* Desktop Trending Products Section - Hidden on mobile */}
      <div className="hidden lg:block bg-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Produits tendance</h2>
             
            </div>
            <div className="flex space-x-2">
              <button 
                className="w-10 h-10 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-gray-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => {
                  if (currentDesktopPage > 1) {
                    setCurrentDesktopPage(currentDesktopPage - 1);
                    const productsSection = document.querySelector('.grid.grid-cols-6');
                    if (productsSection) {
                      productsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
                disabled={currentDesktopPage === 1}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button 
                className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => {
                  let filteredProducts = currentCategoryId ? products : products;
                  filteredProducts = filterProductsBySearch(filteredProducts);
                  const totalPages = Math.ceil(filteredProducts.length / desktopProductsPerPage);
                  
                  if (currentDesktopPage < totalPages) {
                    setCurrentDesktopPage(currentDesktopPage + 1);
                    const productsSection = document.querySelector('.grid.grid-cols-6');
                    if (productsSection) {
                      productsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
                disabled={(() => {
                  let filteredProducts = currentCategoryId ? products : products;
                  filteredProducts = filterProductsBySearch(filteredProducts);
                  const totalPages = Math.ceil(filteredProducts.length / desktopProductsPerPage);
                  return currentDesktopPage >= totalPages;
                })()}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          {loadingProducts && (
            <div className="grid grid-cols-6 gap-4">
              {[...Array(12)].map((_, index) => (
                <div key={index} className="bg-white border rounded-lg overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="flex space-x-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!loadingProducts && !errorProducts && products.length > 0 && (
            <>
              <div className="grid grid-cols-6 gap-4">
                {(() => {
                  // Filtrer les produits selon la catégorie et la recherche
                  let filteredProducts = currentCategoryId ? products : products;
                  filteredProducts = filterProductsBySearch(filteredProducts);
                  
                  // Pagination desktop
                  const indexOfLastProduct = currentDesktopPage * desktopProductsPerPage;
                  const indexOfFirstProduct = indexOfLastProduct - desktopProductsPerPage;
                  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
                  
                  return currentProducts.map((product) => {
                    const img = (product.images && product.images.length > 0) ? product.images[0] : null;
                    const displayPrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;
                    
                    return (
                      <div 
                        key={product.id} 
                        className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                        onClick={() => router.push(`/product?id=${product.id}`)}
                      >
                        <div className="relative">
                          <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                            {/* Effet shimmer sur l'image */}
                            <div className="absolute inset-0 pointer-events-none z-10">
                              <div 
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                style={{
                                  animation: 'shimmer 6s ease-in-out infinite',
                                }}
                              />
                            </div>
                            {img ? (
                              <Image 
                                src={img} 
                                alt={product.name} 
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform" 
                                width={200} 
                                height={200} 
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400 text-sm">Pas d&apos;image</span>
                              </div>
                            )}
                          </div>
                          <button 
                            className="absolute top-2 right-2 w-6 h-6 cursor-pointer bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLike(product.name);
                            }}
                          >
                            {likedProducts[product.name] ? (
                              <BsHeartFill size={12} className="text-red-500" />
                            ) : (
                              <BsHeart size={12} className="text-gray-600" />
                            )}
                          </button>
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 text-sm">{product.name}</h3>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-bold text-gray-900">{displayPrice.toLocaleString('fr-FR')} FCFA</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-4 h-4 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="text-xs text-gray-500 ml-1">Tendance</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
              
              {/* Desktop Pagination */}
              {(() => {
                let filteredProducts = currentCategoryId ? products : products;
                filteredProducts = filterProductsBySearch(filteredProducts);
                const totalPages = Math.ceil(filteredProducts.length / desktopProductsPerPage);
                
                // Fonction pour changer de page desktop
                const paginateDesktop = (pageNumber: number) => {
                  setCurrentDesktopPage(pageNumber);
                  // Remonter en haut de la section produits
                  const productsSection = document.querySelector('.grid.grid-cols-6');
                  if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                };
                
                // Afficher la pagination seulement s'il y a plus d'une page
                if (filteredProducts.length > 0 && totalPages > 1) {
                  return (
                    <div className="mt-8 flex justify-center">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => currentDesktopPage > 1 && paginateDesktop(currentDesktopPage - 1)}
                          disabled={currentDesktopPage === 1}
                          className={`px-4 py-2 rounded-full transition-colors ${currentDesktopPage === 1 ? 'bg-gray-200 text-gray-500' : 'bg-white text-black hover:bg-gray-100'}`}
                        >
                          Précédent
                        </button>
                        
                        {/* Afficher les numéros de page */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                          <button
                            key={number}
                            onClick={() => paginateDesktop(number)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${currentDesktopPage === number ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                          >
                            {number}
                          </button>
                        ))}
                        
                        <button 
                          onClick={() => currentDesktopPage < totalPages && paginateDesktop(currentDesktopPage + 1)}
                          disabled={currentDesktopPage === totalPages}
                          className={`px-4 py-2 rounded-full transition-colors ${currentDesktopPage === totalPages ? 'bg-gray-200 text-gray-500' : 'bg-white text-black hover:bg-gray-100'}`}
                        >
                          Suivant
                        </button>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </>
          )}
          
          {errorProducts && (
            <div className="text-center py-8">
              <p className="text-red-600">{errorProducts}</p>
            </div>
          )}
          
          {!loadingProducts && !errorProducts && products.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">Aucun produit disponible pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}