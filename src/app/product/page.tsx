"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { FiMinus, FiPlus, FiArrowLeft, FiShoppingCart, FiAlertTriangle } from 'react-icons/fi';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import { addToCart } from '../../lib/cart';

function ProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  interface Category { id: string; name: string }
  interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    discountPrice?: number;
    stock?: number;
    images?: string[];
    details?: { brand?: string };
    categories?: Category[];
  }

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState<string | null>(null);
  const [showStockModal, setShowStockModal] = useState(false);

  // Swipe support
  const touchStartX = useRef<number | null>(null);
  const images = product?.images ?? [];

  useEffect(() => {
    if (!id) {
      setError('Produit introuvable');
      setLoading(false);
      return;
    }
    const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.kasi.market';
    const baseUrl = rawBase.replace(/\/$/, '');

    const fetchById = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try /api/products/:id
        let res = await fetch(`${baseUrl}/api/products/${id}`);
        if (!res.ok) {
          // fallback: list then find by id
          res = await fetch(`${baseUrl}/api/products`);
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const list = await res.json();
          const found = (list.products ?? []).find((p: Product) => p.id === id);
          if (!found) throw new Error('Produit non trouvé');
          setProduct(found);
        } else {
          const data = await res.json();
          setProduct(data.product ?? data);
        }
      } catch {
        setError('Impossible de charger le produit.');
      } finally {
        setLoading(false);
      }
    };
    fetchById();
  }, [id]);

  const hasDiscount = useMemo(() => {
    if (!product) return false;
    return !!product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price;
  }, [product]);

  const discountPercent = useMemo(() => {
    if (!product || !hasDiscount) return null;
    const pct = Math.round((1 - (product.discountPrice! / product.price)) * 100);
    return pct > 0 ? `-${pct}%` : null;
  }, [product, hasDiscount]);

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const prevImage = () => setCurrentIndex((idx) => (idx - 1 + images.length) % images.length);
  const nextImage = () => setCurrentIndex((idx) => (idx + 1) % images.length);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX > 0) prevImage(); else nextImage();
    }
    touchStartX.current = null;
  };

  return (
    <>
      <Header defaultLanguage="FR" />
      <div className="pt-16 bg-[#fbf0ef] h-screen overflow-hidden flex flex-col">
        {/* Product Image / Slider */}
        <div className="relative w-full aspect-square mb-0" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="absolute top-4 left-4 right-4 z-10 flex justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium shadow-sm text-black"
            >
              <FiArrowLeft className="mr-2" /> Retour
            </button>
            <button 
              onClick={() => router.push('/cart')} 
              className="flex items-center bg-black text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-sm"
            >
              <FiShoppingCart className="mr-2" /> Panier
            </button>
          </div>

          {/* Image area */}
          <div className="w-full h-full relative bg-[#fdf6e9]">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-gray-600">Chargement...</div>
            ) : error ? (
              <div className="w-full h-full flex items-center justify-center text-red-600">{error}</div>
            ) : images.length > 0 ? (
              <>
                <Image
                  key={images[currentIndex]}
                  src={images[currentIndex]}
                  alt={product?.name || 'Produit'}
                  fill
                  className="object-contain"
                />
                {/* Nav arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      aria-label="Précédente"
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow"
                      onClick={prevImage}
                    >
                      ‹
                    </button>
                    <button
                      aria-label="Suivante"
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow"
                      onClick={nextImage}
                    >
                      ›
                    </button>
                    {/* Dots */}
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          className={`w-2 h-2 rounded-full ${i === currentIndex ? 'bg-black' : 'bg-gray-400'}`}
                          onClick={() => setCurrentIndex(i)}
                          aria-label={`Image ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">Aucune image</div>
            )}
          </div>
        </div>

        {/* Product Details Card */}
        <div className="bg-white rounded-t-3xl px-5 pt-6 pb-32 -mt-2 relative z-10 flex-1 flex flex-col">
          {/* Discount Badge */}
          {hasDiscount && discountPercent && (
            <div className="flex justify-center mb-4">
              <div className="bg-black text-white text-sm font-semibold px-5 py-3 rounded-full">
                {discountPercent}
              </div>
            </div>
          )}

          <div className="mb-4">
            <h1 className="text-2xl font-bold text-black">{product?.name || '—'}</h1>
            <p className="text-sm text-gray-600 mb-1">{product?.details?.brand || product?.categories?.[0]?.name || ''}</p>
            {product && (
              <div className="flex items-baseline gap-3">
                <p className="text-2xl font-bold text-black">
                  {((product.discountPrice && product.discountPrice > 0) ? product.discountPrice : product.price).toLocaleString('fr-FR')} FCFA
                </p>
                {hasDiscount && (
                  <p className="text-gray-400 line-through">
                    {product.price.toLocaleString('fr-FR')} FCFA
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Product Description - Fixed height scrollable area */}
          <div className="h-32 mb-4 relative overflow-hidden">
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2">
              <p className="text-gray-700 whitespace-pre-line pb-4">
                {product?.description || '—'}
              </p>
            </div>
            {product?.description && product.description.length > 200 && (
              <div className="absolute bottom-0 right-0 bg-gradient-to-l from-white via-white to-transparent pl-8 pr-2 py-1">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 13l3 3 7-7"/>
                    <path d="M7 6l3 3 7-7"/>
                  </svg>
                  Faites défiler pour voir plus
                </span>
              </div>
            )}
          </div>

        </div>
        
        {/* Fixed CTA Section */}
        <div className="fixed bottom-0 left-0 right-0 bg-white px-5 py-4 z-20">
          <div className="space-y-3">
            {/* Quantity and Add to Cart */}
            <div className="flex flex-row gap-3 justify-between items-center">
              <div className="flex items-center justify-center px-4 sm:px-6 py-2 border-2 border-black text-black rounded-full">
                <button className="px-3 sm:px-4 text-black" onClick={decreaseQuantity}>
                  <FiMinus />
                </button>
                <span className="px-3 sm:px-4 text-black min-w-[2rem] text-center">{quantity}</span>
                <button className="px-3 sm:px-4 text-black" onClick={increaseQuantity}>
                  <FiPlus />
                </button>
              </div>
              <button
                disabled={!product || adding}
                onClick={async () => {
                  if (!product) return;
                  
                  // Vérifier le stock avant d'ajouter au panier
                  if (product.stock !== undefined && product.stock < quantity) {
                    setShowStockModal(true);
                    return;
                  }
                  
                  setAdding(true);
                  setAddMsg(null);
                  const priceNow = (product.discountPrice && product.discountPrice > 0) ? product.discountPrice : product.price;
                  const res = await addToCart(product.id, quantity, priceNow);
                  setAdding(false);
                  setAddMsg(res.ok ? 'Ajouté au panier' : (res.message || 'Erreur'));
                  if (res.ok) {
                    setTimeout(() => setAddMsg(null), 2000);
                  }
                }}
                className={`rounded-full px-3 sm:px-4 py-3 flex items-center justify-center gap-1 text-xs sm:text-sm ${adding ? 'bg-gray-400 text-white' : 'bg-black text-white'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0"><g fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"><circle cx="9.549" cy="19.049" r="1.701"/><circle cx="16.96" cy="19.049" r="1.701"/><path d="m5.606 5.555l2.01 6.364c.309.978.463 1.467.76 1.829c.26.32.599.567.982.72c.435.173.947.173 1.973.173h3.855c1.026 0 1.538 0 1.972-.173c.384-.153.722-.4.983-.72c.296-.362.45-.851.76-1.829l.409-1.296l.24-.766l.331-1.05a2.5 2.5 0 0 0-2.384-3.252zm0 0l-.011-.037a7 7 0 0 0-.14-.42a2.92 2.92 0  0 0-2.512-1.84C2.84 3.25 2.727 3.25 2.5 3.25"/></g></svg>
                <span className="whitespace-nowrap">{adding ? 'Ajout...' : 'Ajouter au panier'}</span>
              </button>
            </div>
            
            {/* Voir le panier button */}
            <button
              onClick={() => router.push('/cart')}
              className="w-full py-3 px-4 border-2 border-black text-black rounded-full flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0">
                <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                  <circle cx="9.549" cy="19.049" r="1.701"/>
                  <circle cx="16.96" cy="19.049" r="1.701"/>
                  <path d="m5.606 5.555l2.01 6.364c.309.978.463 1.467.76 1.829c.26.32.599.567.982.72c.435.173.947.173 1.973.173h3.855c1.026 0 1.538 0 1.972-.173c.384-.153.722-.4.983-.72c.296-.362.45-.851.76-1.829l.409-1.296l.24-.766l.331-1.05a2.5 2.5 0 0 0-2.384-3.252zm0 0l-.011-.037a7 7 0 0 0-.14-.42a2.92 2.92 0  0 0-2.512-1.84C2.84 3.25 2.727 3.25 2.5 3.25"/>
                </g>
              </svg>
              <span>Voir le panier</span>
            </button>
            
            {addMsg && (
              <div className="mt-2 text-center text-sm text-gray-700">{addMsg}</div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de stock insuffisant */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-auto">
            <div className="mb-6 text-center">
              <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FiAlertTriangle size={30} className="text-red-500" />
              </div>
              <p className="text-black font-semibold mb-2">Stock insuffisant</p>
              <p className="text-sm text-gray-500">
                Seulement {product?.stock || 0} article{(product?.stock || 0) > 1 ? 's' : ''} disponible{(product?.stock || 0) > 1 ? 's' : ''} en stock.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Vous avez sélectionné {quantity} article{quantity > 1 ? 's' : ''}.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowStockModal(false)}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (product?.stock && product.stock > 0) {
                    setQuantity(product.stock);
                  }
                  setShowStockModal(false);
                }}
                disabled={!product?.stock || product.stock === 0}
                className="flex-1 py-3 px-4 bg-black text-white rounded-full hover:bg-gray-800 transition-colors duration-200 disabled:bg-gray-400"
              >
                Ajuster ({product?.stock || 0})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ProductPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-16 bg-[#fbf0ef] min-h-screen flex items-center justify-center text-gray-600">
          Chargement...
        </div>
      }
    >
      <ProductContent />
    </Suspense>
  );
}