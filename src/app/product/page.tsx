"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { FiMinus, FiPlus, FiArrowLeft, FiShoppingCart } from 'react-icons/fi';
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

  // Swipe support
  const touchStartX = useRef<number | null>(null);
  const images = product?.images ?? [];

  useEffect(() => {
    if (!id) {
      setError('Produit introuvable');
      setLoading(false);
      return;
    }
    const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
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
      <div className="pt-16 bg-[#fbf0ef] min-h-screen">
        {/* Product Image / Slider */}
        <div className="relative w-full aspect-square mb-0" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="absolute top-4 left-4 right-4 z-10 flex justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium shadow-sm"
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
        <div className="bg-white rounded-t-3xl px-5 pt-6 pb-20 -mt-2 relative z-10">
          {/* Discount Badge */}
          {hasDiscount && discountPercent && (
            <div className="flex justify-center mb-4">
              <div className="bg-black text-white text-sm font-semibold px-5 py-3 rounded-full">
                {discountPercent}
              </div>
            </div>
          )}

          <div className="mb-4">
            <h1 className="text-2xl font-bold">{product?.name || '—'}</h1>
            <p className="text-sm text-gray-600 mb-1">{product?.details?.brand || product?.categories?.[0]?.name || ''}</p>
            {product && (
              <div className="flex items-baseline gap-3">
                <p className="text-2xl font-bold">
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

          {/* Product Description */}
          <p className="text-gray-700 mb-8 whitespace-pre-line">
            {product?.description || '—'}
          </p>

          {/* Quantity and Add to Cart */}
          <div className="flex justify-between items-center">
            <div className="flex items-center px-6 py-3 border-2 border-gray-200 rounded-full">
              <button className="px-4" onClick={decreaseQuantity}>
                <FiMinus />
              </button>
              <span className="px-4">{quantity}</span>
              <button className="px-4" onClick={increaseQuantity}>
                <FiPlus />
              </button>
            </div>
            <button
              disabled={!product || adding}
              onClick={async () => {
                if (!product) return;
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
              className={`rounded-full px-6 py-3 flex items-center ${adding ? 'bg-gray-400 text-white' : 'bg-black text-white'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"><circle cx="9.549" cy="19.049" r="1.701"/><circle cx="16.96" cy="19.049" r="1.701"/><path d="m5.606 5.555l2.01 6.364c.309.978.463 1.467.76 1.829c.26.32.599.567.982.72c.435.173.947.173 1.973.173h3.855c1.026 0 1.538 0 1.972-.173c.384-.153.722-.4.983-.72c.296-.362.45-.851.76-1.829l.409-1.296l.24-.766l.331-1.05a2.5 2.5 0 0 0-2.384-3.252zm0 0l-.011-.037a7 7 0 0 0-.14-.42a2.92 2.92 0  0 0-2.512-1.84C2.84 3.25 2.727 3.25 2.5 3.25"/></g></svg>
              {adding ? 'Ajout...' : 'Ajouter au panier'}
            </button>
          </div>
          {addMsg && (
            <div className="mt-3 text-center text-sm text-gray-700">{addMsg}</div>
          )}
        </div>
      </div>
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