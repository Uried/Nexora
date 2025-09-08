"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiSearch } from 'react-icons/fi';
import { BsHeart, BsHeartFill } from 'react-icons/bs';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';

export default function ProductsPage() {
  const router = useRouter();

  // Interfaces
  interface Category { id: string; name: string; slug?: string }
  interface Product {
    id: string;
    name: string;
    price: number;
    discountPrice?: number;
    images?: string[];
    details?: { brand?: string };
    categories?: Category[];
  }

  // States
  const [likedProducts, setLikedProducts] = useState<{ [key: string]: boolean }>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Toutes les collections']);
  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [productsPerPage] = useState<number>(10);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        // pas bloquant
      }
    };
    load();
  }, []);

  // Charger les produits (tous ou par catégorie)
  useEffect(() => {
    const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.kasi.market';
    const baseUrl = rawBase.replace(/\/$/, '');
    const url = currentCategoryId
      ? `${baseUrl}/api/products/category/${currentCategoryId}`
      : `${baseUrl}/api/products`;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProducts(data.products ?? []);
      } catch {
        setError("Impossible de charger les produits.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentCategoryId]);

  // Fonction pour gérer les likes des produits
  const toggleLike = (productName: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
      setCurrentCategoryId(null);
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
        const first = filteredSelection[0];
        const catObj = apiCategories.find(c => c.name === first);
        setCurrentCategoryId(catObj ? catObj.id : null);
      }
    } else {
      // Sinon on l'ajoute
      const updated = [...newSelection, category];
      setSelectedCategories(updated);
      const catObj = apiCategories.find(c => c.name === category);
      setCurrentCategoryId(catObj ? catObj.id : null);
    }
  };

  // Filtrer côté client selon la recherche (catégorie gérée côté serveur)
  const filteredProducts = products.filter((product) => {
    if (!searchQuery) return true;
    const name = product.name?.toLowerCase() ?? '';
    const brand = product.details?.brand?.toLowerCase() ?? '';
    return name.includes(searchQuery.toLowerCase()) || brand.includes(searchQuery.toLowerCase());
  });

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Fonction pour changer de page
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Remonter en haut de la page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Réinitialiser la pagination quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, searchQuery]);

  return (
    <>
      <Header defaultLanguage="FR" />
      <div className="pt-16 bg-[#fbf0ef] min-h-screen px-4 pb-20">
        {/* En-tête de la page */}
        <div className="py-6">
          <h1 className="text-2xl font-bold text-black mb-2">Tous nos produits</h1>
          <p className="text-gray-500">Découvrez notre collection de parfums et accessoires</p>
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            className="w-full bg-white rounded-full py-3 px-5 pl-12 shadow-sm focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>

        {/* Catégories */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-3 pb-2">
            {["Toutes les collections", ...apiCategories.map(c => c.name)].map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${selectedCategories.includes(category) ? 'bg-black text-white' : 'bg-white text-black'}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Grille de produits */}
        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-600">Chargement des produits...</div>
        ) : error ? (
          <div className="flex items-center justify-center py-10 text-red-600">{error}</div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {currentProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-2 relative shadow-sm cursor-pointer group overflow-hidden"
                onClick={() => router.push(`/product?id=${product.id}`)}
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
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      className="object-cover w-full h-full"
                      width={150}
                      height={150}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                  <button
                    className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-sm"
                    onClick={(e) => toggleLike(product.name, e)}
                  >
                    {likedProducts[product.name] ? (
                      <BsHeartFill size={16} color="red" />
                    ) : (
                      <BsHeart size={16} color="black" />
                    )}
                  </button>
                  
                  {/* Badge de catégorie */}
                  {product.categories && product.categories.length > 0 && (
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      {product.categories[0].name}
                    </div>
                  )}
                </div>
                <div className="font-semibold">
                  <h4 className="text-sm">{product.details?.brand || product.categories?.[0]?.name || '—'}</h4>
                  <p className="text-xs text-gray-700">{product.name}</p>
                  <p className="text-gray-500 text-xs mb-2">
                    {((product.discountPrice && product.discountPrice > 0) ? product.discountPrice : product.price).toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                <button
                  className="absolute bottom-2 right-2 bg-black text-white rounded-full p-2 shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/product?id=${product.id}`);
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
          <div className="flex flex-col items-center justify-center py-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
              <p className="text-xl font-semibold text-black mb-2">Aucun produit trouvé</p>
              <p className="text-gray-500">Essayez de modifier vos filtres ou votre recherche</p>
            </div>
          </div>
        )}
        
        {/* Pagination - Afficher seulement s'il y a plus d'une page */}
        {filteredProducts.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-full ${currentPage === 1 ? 'bg-gray-200 text-gray-500' : 'bg-white text-black'}`}
              >
                &lt;
              </button>
              
              {/* Afficher les numéros de page */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${currentPage === number ? 'bg-black text-white' : 'bg-white text-black'}`}
                >
                  {number}
                </button>
              ))}
              
              <button 
                onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-full ${currentPage === totalPages ? 'bg-gray-200 text-gray-500' : 'bg-white text-black'}`}
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}