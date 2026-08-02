"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { FaStar } from "react-icons/fa";
import { FiPlus, FiMinus, FiShoppingCart } from "react-icons/fi";
import { addToCart, updateCartItemQuantity, removeCartItem, getCartFull } from "@/lib/cart";
import { useLanguage } from "@/contexts/LanguageContext";

export interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  category: string;
  image: string;
}

export interface ProductCardProps {
  product: Product;
  liked?: boolean;
  onToggleLike?: (id: string) => void;
  onCartUpdate?: () => void;
}

export default function ProductCard({
  product,
  liked = false,
  onToggleLike,
  onCartUpdate,
}: ProductCardProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(0);
  const [cartItemId, setCartItemId] = useState<string | null>(null);
  const [showQuantityControls, setShowQuantityControls] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Charger la quantité actuelle depuis le panier
  useEffect(() => {
    const loadQuantity = async () => {
      try {
        const data = await getCartFull();
        if (data?.cart?.items) {
          const item = data.cart.items.find((i) => i.productId.id === product.id);
          setQuantity(item ? item.quantity : 0);
          setCartItemId(item ? item._id : null);
          setShowQuantityControls(!!item);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la quantité:', error);
      }
    };
    loadQuantity();
  }, [product.id]);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLike?.(product.id);
  };

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await addToCart(product.id, 1, product.price);
    if (result.ok) {
      setQuantity(1);
      setShowQuantityControls(true);
      // Recharger le panier pour obtenir l'ID de l'item
      try {
        const data = await getCartFull();
        if (data?.cart?.items) {
          const item = data.cart.items.find((i) => i.productId.id === product.id);
          setCartItemId(item ? item._id : null);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'ID item:', error);
      }
      onCartUpdate?.();
    }
  };

  const handleIncrement = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartItemId) {
      const result = await updateCartItemQuantity(cartItemId, quantity + 1);
      if (result.ok) {
        setQuantity((prev) => prev + 1);
        onCartUpdate?.();
      }
    } else {
      const result = await addToCart(product.id, 1, product.price);
      if (result.ok) {
        setQuantity((prev) => prev + 1);
        onCartUpdate?.();
      }
    }
  };

  const handleDecrement = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > 1 && cartItemId) {
      const result = await updateCartItemQuantity(cartItemId, quantity - 1);
      if (result.ok) {
        setQuantity((prev) => prev - 1);
        onCartUpdate?.();
      }
    } else if (quantity === 1 && cartItemId) {
      const result = await removeCartItem(cartItemId);
      if (result.ok) {
        setQuantity(0);
        setCartItemId(null);
        setShowQuantityControls(false);
        onCartUpdate?.();
      }
    }
  };

  const handleCardClick = () => {
    router.push(`/product?id=${product.id}`);
  };

  const placeholder = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect fill="%23f5f5f5" width="400" height="400"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="20" fill="%23aaaaaa" text-anchor="middle" dy=".3em">${product.name}</text></svg>`
  )}`;

  return (
    <div
      className="group relative bg-[#f5f5f5] rounded-3xl p-6 flex flex-col h-[460px] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12)] overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Rating */}
      <div className="flex items-center gap-1.5 text-sm noyh-medium font-semibold text-black z-10">
        <FaStar className="text-yellow-400 w-4 h-4" />
        <span>{product.rating.toFixed(1)}</span>
      </div>

      {/* Heart */}
      <button
        onClick={handleLike}
        className="absolute top-6 right-6 w-9 h-9 rounded-full flex items-center justify-center text-black transition-all duration-200 hover:bg-white hover:scale-110 active:scale-90 z-10"
        aria-label="Toggle like"
      >
        {liked ? (
          <BsHeartFill className="w-5 h-5 text-black" />
        ) : (
          <BsHeart className="w-5 h-5" />
        )}
      </button>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center py-6">
        <Image
          src={imageError ? placeholder : product.image}
          alt={product.name}
          width={320}
          height={320}
          unoptimized
          className="max-h-[240px] w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md"
          onError={() => setImageError(true)}
        />
      </div>

      {/* Info */}
      <div className="mt-auto relative pr-12 z-10">
        <h3 className="text-black noyh-medium font-medium text-base leading-snug">
          {product.name}
        </h3>
        <p className="text-gray-500 noyh-light font-light text-sm mt-1">
          {product.price.toLocaleString('fr-FR')} FCFA
        </p>
      </div>

      {/* Cart button */}
      {!showQuantityControls ? (
        <button
          onClick={handleAdd}
          className="absolute bottom-6 right-6 w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 active:scale-95 z-10 bg-white text-black"
          aria-label={t('product.addToCart')}
        >
          <FiShoppingCart className="w-5 h-5" />
        </button>
      ) : (
        <div className="absolute bottom-6 right-6 flex items-center gap-1 z-10">
          <button
            onClick={handleDecrement}
            className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 active:scale-95 bg-white text-black"
            aria-label={t('product.decreaseQuantity')}
          >
            <FiMinus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center text-sm font-medium noyh-medium">{quantity}</span>
          <button
            onClick={handleIncrement}
            className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 active:scale-95 bg-white text-black"
            aria-label={t('product.increaseQuantity')}
          >
            <FiPlus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
