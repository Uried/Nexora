"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { BsHeart, BsHeartFill } from 'react-icons/bs';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';

// Import des images
import Popular1 from '../../assets/images/popular1 (1).jpg';
import Popular2 from '../../assets/images/popular1 (2).jpg';
import Popular3 from '../../assets/images/popular1 (3).jpg';
import Popular4 from '../../assets/images/popular1 (4).jpg';
import Popular5 from '../../assets/images/popular1 (5).jpg';
import Popular6 from '../../assets/images/popular1 (6).jpg';
import Popular7 from '../../assets/images/popular1 (7).jpg';
import Popular8 from '../../assets/images/popular1 (8).jpg';
import Menbag from '../../assets/images/menbag.jpg';
import Bag1 from '../../assets/images/bag1.png';
import Bag2 from '../../assets/images/bag2.png';

export default function ProductsPage() {
  const [likedProducts, setLikedProducts] = useState<{ [key: string]: boolean }>({
    'Black Opium': true,
    'Coco Mademoiselle': false,
    'J\'adore': false
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Toutes les collections']);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [productsPerPage] = useState<number>(10);
  const router = useRouter();

  // Données des produits
  const products = [
    { id: 1, name: 'Black Opium', brand: 'Yves Saint Laurent', price: '65 000 FCFA', image: Popular1, category: 'Floral' },
    { id: 2, name: 'Coco Mademoiselle', brand: 'Chanel', price: '72 000 FCFA', image: Popular2, category: 'Oriental' },
    { id: 3, name: 'Loui Martin', brand: 'Louis Vuitton', price: '39 000 FCFA', image: Popular3, category: 'Woody' },
    { id: 4, name: 'J\'adore', brand: 'Dior', price: '36 000 FCFA', image: Menbag, category: 'Fresh' },
    { id: 5, name: 'La Vie Est Belle', brand: 'Lancôme', price: '45 000 FCFA', image: Popular4, category: 'Floral' },
    { id: 6, name: 'Acqua di Gio', brand: 'Giorgio Armani', price: '58 000 FCFA', image: Popular5, category: 'Fresh' },
    { id: 7, name: 'Bleu de Chanel', brand: 'Chanel', price: '68 000 FCFA', image: Popular6, category: 'Woody' },
    { id: 8, name: 'Sac à main', brand: 'Gucci', price: '120 000 FCFA', image: Bag1, category: 'Accessoire' },
    { id: 9, name: 'Sac bandoulière', brand: 'Prada', price: '95 000 FCFA', image: Bag2, category: 'Accessoire' },
    { id: 10, name: 'Opium Gold', brand: 'Yves Saint Laurent', price: '78 000 FCFA', image: Popular7, category: 'Oriental' },
    { id: 11, name: 'Sauvage', brand: 'Dior', price: '62 000 FCFA', image: Popular8, category: 'Woody' },
  ];

  // Catégories disponibles
  const categories = ['Toutes les collections', 'Floral', 'Woody', 'Fresh', 'Oriental', 'Accessoire'];

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

  // Filtrer les produits en fonction des catégories sélectionnées et de la recherche
  const filteredProducts = products.filter(product => {
    // Filtre par catégorie
    const categoryMatch = selectedCategories.includes('Toutes les collections') || 
                         selectedCategories.includes(product.category);
    
    // Filtre par recherche
    const searchMatch = searchQuery === '' || 
                       product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && searchMatch;
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
          <h1 className="text-2xl font-bold mb-2">Tous nos produits</h1>
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
            {categories.map((category) => (
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
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {currentProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-2 relative shadow-sm cursor-pointer"
                onClick={() => router.push('/product')}
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
                    onClick={(e) => toggleLike(product.name, e)}
                  >
                    {likedProducts[product.name] ? (
                      <BsHeartFill size={16} color="red" />
                    ) : (
                      <BsHeart size={16} color="black" />
                    )}
                  </button>
                  
                  {/* Badge de catégorie */}
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                    {product.category}
                  </div>
                </div>
                <div className="font-semibold">
                  <h4 className="text-sm">{product.brand}</h4>
                  <p className="text-xs text-gray-700">{product.name}</p>
                  <p className="text-gray-500 text-xs mb-2">{product.price}</p>
                </div>
                <button
                  className="absolute bottom-2 right-2 bg-black text-white rounded-full p-2 shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/product');
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
              <p className="text-xl font-semibold mb-2">Aucun produit trouvé</p>
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