"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import ProductCard, { Product as DesktopProduct } from "@/components/ProductCard";
import DesktopHeader from "@/components/DesktopHeader";
import Header from "@/components/Header";
import { getCartFull } from "@/lib/cart";
import { useSearch } from "@/contexts/SearchContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchQuery, setSearchQuery } = useSearch();
  const { t } = useLanguage();

  // Récupérer le paramètre de recherche depuis l'URL
  useEffect(() => {
    if (!searchParams) return;
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams, setSearchQuery]);

  // -------------------------------------------------------------------------
  // Cart (pour DesktopHeader)
  // -------------------------------------------------------------------------
  const [cartItemCount, setCartItemCount] = useState<number>(0);

  const loadCart = async () => {
    try {
      const data = await getCartFull();
      if (data?.cart?.items) {
        const totalItems = data.cart.items.reduce((total, item) => total + item.quantity, 0);
        setCartItemCount(totalItems);
      } else {
        setCartItemCount(0);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
      setCartItemCount(0);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      loadCart();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // -------------------------------------------------------------------------
  // Mobile (design d'origine)
  // -------------------------------------------------------------------------
  interface Category {
    id: string;
    name: string;
    slug?: string;
  }
  interface Product {
    id: string;
    name: string;
    price: number;
    discountPrice?: number;
    images?: string[];
    details?: { brand?: string };
    categories?: Category[];
  }

  const [likedProducts, setLikedProducts] = useState<{ [key: string]: boolean }>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Toutes les collections']);
  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [productsPerPage] = useState<number>(10);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  const toggleLike = (productName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedProducts((prev) => ({
      ...prev,
      [productName]: !prev[productName],
    }));
  };

  const toggleCategory = (category: string) => {
    if (category === 'Toutes les collections') {
      setSelectedCategories(['Toutes les collections']);
      setCurrentCategoryId(null);
      return;
    }

    const newSelection = selectedCategories.filter((cat) => cat !== 'Toutes les collections');

    if (newSelection.includes(category)) {
      const filteredSelection = newSelection.filter((cat) => cat !== category);
      setSelectedCategories(filteredSelection.length === 0 ? ['Toutes les collections'] : filteredSelection);
      if (filteredSelection.length === 0) {
        setCurrentCategoryId(null);
      } else {
        const first = filteredSelection[0];
        const catObj = apiCategories.find((c) => c.name === first);
        setCurrentCategoryId(catObj ? catObj.id : null);
      }
    } else {
      const updated = [...newSelection, category];
      setSelectedCategories(updated);
      const catObj = apiCategories.find((c) => c.name === category);
      setCurrentCategoryId(catObj ? catObj.id : null);
    }
  };

  const filteredProducts = products.filter((product) => {
    if (!searchQuery) return true;
    const name = product.name?.toLowerCase() ?? '';
    const brand = product.details?.brand?.toLowerCase() ?? '';
    return name.includes(searchQuery.toLowerCase()) || brand.includes(searchQuery.toLowerCase());
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, searchQuery]);

  // -------------------------------------------------------------------------
  // Desktop (nouveau catalogue premium)
  // -------------------------------------------------------------------------
  const [dActiveCategory, setDActiveCategory] = useState("Tous");
  const [dLikedProducts, setDLikedProducts] = useState<Record<string, boolean>>({});
  const [dProducts, setDProducts] = useState<DesktopProduct[]>([]);
  const [dLoading, setDLoading] = useState<boolean>(true);
  const [dError, setDError] = useState<string | null>(null);

  const dToggleLike = (id: string) => {
    setDLikedProducts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const dHandleCartUpdate = () => {
    loadCart();
  };

  // Charger les produits depuis l'API pour desktop
  useEffect(() => {
    const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.kasi.market';
    const baseUrl = rawBase.replace(/\/$/, '');
    const url = `${baseUrl}/api/products`;
    const load = async () => {
      setDLoading(true);
      setDError(null);
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // Transformer les produits API en format DesktopProduct
        const transformed: DesktopProduct[] = (data.products ?? []).map((p: Product) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          rating: parseFloat((Math.random() * (5.0 - 3.5) + 3.5).toFixed(1)), // Note aléatoire entre 3.5 et 5.0
          category: p.categories?.[0]?.name || 'All',
          image: p.images?.[0] || '',
        }));
        setDProducts(transformed);
      } catch {
        setDError("Impossible de charger les produits.");
      } finally {
        setDLoading(false);
      }
    };
    load();
  }, []);

  const dFilteredProducts =
    dActiveCategory === "Tous"
      ? dProducts.filter((p) => {
          if (!searchQuery) return true;
          const name = p.name?.toLowerCase() ?? '';
          return name.includes(searchQuery.toLowerCase());
        })
      : dProducts.filter((p) => {
          const categoryMatch = p.category === dActiveCategory;
          if (!searchQuery) return categoryMatch;
          const name = p.name?.toLowerCase() ?? '';
          return categoryMatch && name.includes(searchQuery.toLowerCase());
        });

  // Catégories dynamiques pour desktop (inclut "Tous" + catégories API)
  const dCategories = ["Tous", ...apiCategories.map((c) => c.name)];

  return (
    <>
      {/* ----------------------------------------------------------------- */}
      {/* Mobile — design d'origine inchangé */}
      {/* ----------------------------------------------------------------- */}
      <div className="block lg:hidden">
        <Header />
        <div className="pt-16 bg-[#fbf0ef] min-h-screen px-4 pb-20">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-black mb-2">{t('nav.products')}</h1>
            <p className="text-gray-500">{t('products.description')}</p>
          </div>

          <div className="relative mb-6">
            <input
              type="text"
              placeholder={t('products.searchPlaceholder')}
              className="w-full bg-white rounded-full py-3 px-5 pl-12 shadow-sm focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FiSearch
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>

          <div className="mb-6 overflow-x-auto">
            <div className="flex space-x-3 pb-2">
              {[t('products.allCollections'), ...apiCategories.map((c) => c.name)].map((category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap ${
                    selectedCategories.includes(category)
                      ? 'bg-black text-white'
                      : 'bg-white text-black'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10 text-gray-600">
              Chargement des produits...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-10 text-red-600">{error}</div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                {currentProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl p-2 relative shadow-sm cursor-pointer group overflow-hidden"
                    onClick={() => router.push(`/product?id=${product.id}`)}
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #ffffff 100%)',
                      position: 'relative',
                    }}
                  >
                    <div className="relative w-full aspect-square mb-3 flex items-center justify-center overflow-hidden rounded-xl">
                      <div className="absolute inset-0 pointer-events-none z-10">
                        <div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                          style={{ animation: 'shimmer 6s ease-in-out infinite' }}
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

                      {product.categories && product.categories.length > 0 && (
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                          {product.categories[0].name}
                        </div>
                      )}
                    </div>
                    <div className="font-semibold">
                      <p className="text-xs text-gray-700 mb-1">{product.name}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-500 text-xs">
                          {((product.discountPrice && product.discountPrice > 0)
                            ? product.discountPrice
                            : product.price
                          ).toLocaleString('fr-FR')} FCFA
                        </p>
                        <button
                          className="bg-black text-white rounded-full p-2 shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/product?id=${product.id}`);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                          >
                            <g
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                            >
                              <path d="M3.977 9.84A2 2 0 0 1 5.971 8h12.058a2 2 0 0 1 1.994 1.84l.803 10A2 2 0 0 1 18.833 22H5.167a2 2 0 0 1-1.993-2.16z" />
                              <path d="M16 11V6a4 4 0 0 0-4-4v0a4 4 0 0 0-4 4v5" />
                            </g>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-full ${
                        currentPage === 1
                          ? 'bg-gray-200 text-gray-500'
                          : 'bg-white text-black'
                      }`}
                    >
                      &lt;
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          currentPage === number
                            ? 'bg-black text-white'
                            : 'bg-white text-black'
                        }`}
                      >
                        {number}
                      </button>
                    ))}

                    <button
                      onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-full ${
                        currentPage === totalPages
                          ? 'bg-gray-200 text-gray-500'
                          : 'bg-white text-black'
                      }`}
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
                <p className="text-xl font-semibold text-black mb-2">Aucun produit trouvé</p>
                <p className="text-gray-500">Essayez de modifier vos filtres ou votre recherche</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Desktop — nouveau catalogue premium */}
      {/* ----------------------------------------------------------------- */}
      <section className="hidden lg:block min-h-screen bg-white pt-24 pb-24">
        <DesktopHeader cartItemCount={cartItemCount} />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl text-black noyh-bold font-bold tracking-tight uppercase">
              {t('products.title')}
            </h1>
            <p className="mt-4 text-gray-400 noyh-light font-light text-base md:text-lg max-w-xl mx-auto">
              {t('products.subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {dCategories.map((category) => (
              <button
                key={category}
                onClick={() => setDActiveCategory(category)}
                className={`px-6 py-2.5 rounded-full text-sm noyh-medium font-medium transition-all duration-200 ${
                  dActiveCategory === category
                    ? "bg-black text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-gray-400"
                }`}
              >
                {category === 'Tous' ? t('products.all') : category}
              </button>
            ))}
          </div>

          {dLoading ? (
            <div className="flex items-center justify-center py-20 text-gray-600">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"></div>
                <p>{t('products.loading')}</p>
              </div>
            </div>
          ) : dError ? (
            <div className="flex items-center justify-center py-20">
              <div className="bg-white px-6 py-4 rounded-xl shadow-sm text-red-600">{dError}</div>
            </div>
          ) : dFilteredProducts.length > 0 ? (
            <div className="grid grid-cols-3 gap-8">
              {dFilteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  liked={!!dLikedProducts[product.id]}
                  onToggleLike={dToggleLike}
                  onCartUpdate={dHandleCartUpdate}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 noyh-light font-light mt-20">
              No products found in this category.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
