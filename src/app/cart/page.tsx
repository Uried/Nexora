"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowLeft, FiMinus, FiPlus, FiTrash2, FiX, FiAlertTriangle } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import DesktopHeader from '../../components/DesktopHeader';
import { getCartFull, clearCart as apiClearCart, removeCartItem, updateCartItemQuantity, type ServerCartItem, type ServerCartResponse } from '../../lib/cart';

export default function CartPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [serverCart, setServerCart] = useState<ServerCartResponse | null>(null);

    // États pour gérer les confirmations
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);
    const [actioningItemId, setActioningItemId] = useState<string | null>(null);
    const [clearing, setClearing] = useState(false);

    // Fonction pour formater le prix en FCFA
    const formatPrice = (price: number) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
    };

    // Charger le panier depuis l'API
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const data = await getCartFull();
                if (!mounted) return;
                setServerCart(data);
                setError(null);
            } catch (e: unknown) {
                if (!mounted) return;
                const message = e instanceof Error ? e.message : 'Erreur de chargement du panier';
                setError(message);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    // Dérivations utiles
    const items: ServerCartItem[] = useMemo(() => serverCart?.cart?.items || [], [serverCart]);
    const subtotal: number = useMemo(() => {
        if (!items.length) return 0;
        return items.reduce((acc, it) => {
            if (!it.productId) return acc;
            return acc + (typeof it.lineTotal === 'number' ? it.lineTotal! : (it.priceAtAdd ?? it.productId.discountPrice ?? it.productId.price) * it.quantity);
        }, 0);
    }, [items]);
    const shippingFee = 1000;
    const total = subtotal + (items.length ? shippingFee : 0);

    // Fonction pour demander confirmation avant de supprimer un article
    const confirmRemoveItem = (id: string) => {
        setItemToDelete(id);
    };

    // Fonction pour supprimer un article du panier après confirmation
    const removeItem = async () => {
        if (!itemToDelete) return;
        try {
            setActioningItemId(itemToDelete);
            const res = await removeCartItem(itemToDelete);
            if (!res.ok) throw new Error(res.message || 'Suppression échouée');
            const refreshed = await getCartFull();
            setServerCart(refreshed);
        } catch {
            // noop minimal handling for now
        } finally {
            setActioningItemId(null);
            setItemToDelete(null);
        }
    };

    // Fonction pour annuler la suppression
    const cancelRemove = () => {
        setItemToDelete(null);
    };

    // Handlers quantité
    const increaseQty = async (item: ServerCartItem) => {
        try {
            setActioningItemId(item._id);
            const res = await updateCartItemQuantity(item._id, item.quantity + 1);
            if (!res.ok) throw new Error(res.message);
            const refreshed = await getCartFull();
            setServerCart(refreshed);
        } finally {
            setActioningItemId(null);
        }
    };
    const decreaseQty = async (item: ServerCartItem) => {
        if (item.quantity <= 1) return;
        try {
            setActioningItemId(item._id);
            const res = await updateCartItemQuantity(item._id, item.quantity - 1);
            if (!res.ok) throw new Error(res.message);
            const refreshed = await getCartFull();
            setServerCart(refreshed);
        } finally {
            setActioningItemId(null);
        }
    };

    return (
        <>
            <Header defaultLanguage="FR" />
            <DesktopHeader />
            {/* Mobile Layout */}
            <div className="lg:hidden pt-16 bg-[#fbf0ef] min-h-screen px-4 pb-20">
                {/* En-tête de la page */}
                <div className="py-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={() => router.back()}
                            className="mr-3 bg-white p-2 rounded-full shadow-sm text-black"
                        >
                            <FiArrowLeft size={20} />
                        </button>
                        <h1 className="text-2xl font-bold text-black">Mon Panier</h1>
                    </div>
                    {items.length > 0 && (
                        <button
                            onClick={() => setShowClearCartConfirm(true)}
                            className="text-red-500 text-sm font-medium flex items-center"
                        >
                            <FiTrash2 size={16} className="mr-1" />
                            Vider le panier
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="bg-white px-6 py-4 rounded-xl shadow-sm">Chargement du panier...</div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="bg-white px-6 py-4 rounded-xl shadow-sm text-red-600">{error}</div>
                    </div>
                ) : items.length > 0 ? (
                    <>
                        {/* Liste des articles */}
                        <div className="space-y-4 mb-8">
                            {items.map(item => (
                                <div key={item._id} className="bg-white rounded-2xl px-2 py-2 space-y-2 shadow-sm">
                                    <div className="flex items-center">
                                        <div className="relative w-20 h-20 rounded-xl overflow-hidden mr-3 text-black">
                                            {item.productId?.images?.[0] ? (
                                                <Image
                                                    src={item.productId.images[0]}
                                                    alt={item.productId?.name || 'Produit'}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-black">{item.productId?.name || 'Produit indisponible'}</h3>
                                            <p className="text-gray-500 text-sm bg-white px-2 py-1 rounded-full">{item.productId?.details?.brand || ''}</p>
                                            <p className="font-semibold mt-1 text-black">{formatPrice(item.priceAtAdd ?? item.productId?.discountPrice ?? item.productId?.price ?? 0)}</p>
                                        </div>
                                        <div className="flex flex-col space-y-4 items-end">
                                            <div className="flex items-center border border-gray-200 rounded-full text-black">
                                                <button className="px-2 text-black" onClick={() => decreaseQty(item)} disabled={item.quantity <= 1 || actioningItemId === item._id}>
                                                    <FiMinus size={14} />
                                                </button>
                                                <span className="px-3 text-sm text-black">{actioningItemId === item._id ? '...' : item.quantity}</span>
                                                <button className="px-2 py-1 text-black" onClick={() => increaseQty(item)} disabled={actioningItemId === item._id}>
                                                    <FiPlus size={14} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => confirmRemoveItem(item._id)}
                                                className="text-gray-400 hover:text-red-500 mb-2 mt-2   "
                                            >
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Résumé de la commande */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
                            <h2 className="text-lg font-semibold text-black mb-4">Résumé de la commande</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Sous-total</span>
                                    <span className="text-black">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Frais de livraison</span>
                                    <span className="text-black">{formatPrice(items.length ? shippingFee : 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Note:</span>
                                    <span className="text-black"> 1000 - 5000 FCFA à négocier en fonction de la distance</span>
                                </div>
                                <div className="border-t border-gray-100 pt-3 mt-3">
                                    <div className="flex text-black justify-between font-semibold">
                                        <span>Total</span>
                                        <span className="text-black">{formatPrice(total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bouton de commande via WhatsApp */}
                        <button 
                            onClick={() => router.push('/checkout')}
                            className="w-full bg-black text-white py-4 rounded-full font-semibold shadow-md flex items-center justify-center"
                        >
                            <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01m-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23m4.52-6.16c-.25-.12-1.47-.72-1.69-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.78.97c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-1.99-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31c-.22.25-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74c.59.26 1.05.41 1.41.52c.59.19 1.13.16 1.56.1c.48-.07 1.47-.6 1.67-1.18c.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28"/></svg>
                            Commander via WhatsApp
                        </button>

                        {/* Continuer les achats */}
                        <div className="mt-4 text-center">
                            <Link href="/products" className="text-gray-600 underline text-sm">
                                Continuer mes achats
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md mx-auto">
                            <div className="text-5xl mb-4">🛒</div>
                            <h2 className="text-xl font-semibold text-black mb-2">Votre panier est vide</h2>
                            <p className="text-gray-500 mb-6">Vous n&#39;avez pas encore ajouté d&#39;articles à votre panier.</p>
                            <Link href="/products">
                                <button className="bg-black text-white py-3 px-6 rounded-full font-medium">
                                    Découvrir nos produits
                                </button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block pt-36 bg-white min-h-screen">
                <div className="container mx-auto px-6 py-8">
                    <div className="grid grid-cols-3 gap-8">
                        {/* Left: Cart Items */}
                        <div className="col-span-2">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h1 className="text-3xl font-bold text-gray-900">Mon Panier</h1>
                                {items.length > 0 && (
                                    <button
                                        onClick={() => setShowClearCartConfirm(true)}
                                        className="text-red-500 text-sm font-medium flex items-center hover:text-red-600 transition-colors"
                                    >
                                        <FiTrash2 size={16} className="mr-1" />
                                        Vider le panier
                                    </button>
                                )}
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-16">
                                    <div className="bg-gray-50 px-6 py-4 rounded-xl">Chargement du panier...</div>
                                </div>
                            ) : error ? (
                                <div className="flex items-center justify-center py-16">
                                    <div className="bg-red-50 px-6 py-4 rounded-xl text-red-600">{error}</div>
                                </div>
                            ) : items.length > 0 ? (
                                <div className="space-y-4">
                                    {items.map(item => (
                                        <div key={item._id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                                    {item.productId?.images?.[0] ? (
                                                        <Image
                                                            src={item.productId.images[0]}
                                                            alt={item.productId?.name || 'Produit'}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-100" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 text-lg">{item.productId?.name || 'Produit indisponible'}</h3>
                                                    <p className="text-gray-500 text-sm">{item.productId?.details?.brand || ''}</p>
                                                    <p className="font-semibold text-gray-900 mt-2">{formatPrice(item.priceAtAdd ?? item.productId?.discountPrice ?? item.productId?.price ?? 0)}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center border-2 border-black rounded-full">
                                                        <button 
                                                            className="px-3 py-2 text-black hover:bg-gray-50 transition-colors" 
                                                            onClick={() => decreaseQty(item)} 
                                                            disabled={item.quantity <= 1 || actioningItemId === item._id}
                                                        >
                                                            <FiMinus size={16} />
                                                        </button>
                                                        <span className="px-4 py-2 text-black min-w-[3rem] text-center">
                                                            {actioningItemId === item._id ? '...' : item.quantity}
                                                        </span>
                                                        <button 
                                                            className="px-3 py-2 text-black hover:bg-gray-50 transition-colors" 
                                                            onClick={() => increaseQty(item)} 
                                                            disabled={actioningItemId === item._id}
                                                        >
                                                            <FiPlus size={16} />
                                                        </button>
                                                    </div>
                                                    {/* Remove Button */}
                                                    <button
                                                        onClick={() => confirmRemoveItem(item._id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <FiTrash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <div className="text-center">
                                        <div className="text-6xl mb-4">🛒</div>
                                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Votre panier est vide</h2>
                                        <p className="text-gray-500 mb-6">Vous n'avez pas encore ajouté d'articles à votre panier.</p>
                                        <Link href="/">
                                            <button className="bg-black text-white py-3 px-6 rounded-full font-medium hover:bg-gray-800 transition-colors">
                                                Découvrir nos produits
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: Order Summary */}
                        <div className="col-span-1">
                            <div className="bg-gray-50 rounded-xl p-6 sticky top-40">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Résumé de la commande</h2>
                                
                                {items.length > 0 ? (
                                    <>
                                        <div className="space-y-4 mb-6">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Sous-total</span>
                                                <span className="text-gray-900 font-medium">{formatPrice(subtotal)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Frais de livraison</span>
                                                <span className="text-gray-900 font-medium">{formatPrice(items.length ? shippingFee : 0)}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 bg-white p-3 rounded-lg">
                                                <strong>Note:</strong> 1000 - 5000 FCFA à négocier en fonction de la distance
                                            </div>
                                            <div className="border-t border-gray-200 pt-4">
                                                <div className="flex justify-between font-semibold text-lg">
                                                    <span className="text-gray-900">Total</span>
                                                    <span className="text-gray-900">{formatPrice(total)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <button 
                                                onClick={() => router.push('/checkout')}
                                                className="w-full bg-black text-white py-4 rounded-full font-semibold shadow-sm hover:bg-gray-800 transition-colors flex items-center justify-center"
                                            >
                                                <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01m-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23m4.52-6.16c-.25-.12-1.47-.72-1.69-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.78.97c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-1.99-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31c-.22.25-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74c.59.26 1.05.41 1.41.52c.59.19 1.13.16 1.56.1c.48-.07 1.47-.6 1.67-1.18c.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28"/></svg>
                                                Commander via WhatsApp
                                            </button>
                                            
                                            <Link href="/" className="block">
                                                <button className="w-full py-3 px-4 border-2 border-black text-black rounded-full font-medium hover:bg-black hover:text-white transition-colors">
                                                    Continuer mes achats
                                                </button>
                                            </Link>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center text-gray-500">
                                        <p>Votre résumé apparaîtra ici une fois que vous aurez ajouté des articles.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de confirmation pour supprimer un article */}
            {itemToDelete !== null && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl p-5 w-full max-w-sm text-black">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg text-black">Confirmer la suppression</h3>
                            <button onClick={cancelRemove} className="p-1">
                                <FiX size={20} />
                            </button>
                        </div>
                        <div className="mb-6 text-center">
                            <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <FiAlertTriangle size={30} className="text-red-500" />
                            </div>
                            <p className="text-black">Êtes-vous sûr de vouloir supprimer cet article du panier ?</p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={cancelRemove}
                                className="flex-1 py-2 cursor-pointer border border-gray-300 text-black rounded-full font-medium"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={removeItem}
                                className="flex-1 py-2 bg-red-500 cursor-pointer text-white rounded-full font-medium"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmation pour vider le panier */}
            {showClearCartConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl p-5 w-full max-w-sm text-black">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg cursor-pointer text-black">Vider le panier</h3>
                            <button onClick={() => setShowClearCartConfirm(false)} className="p-1">
                                <FiX size={20} />
                            </button>
                        </div>
                        <div className="mb-6 text-center">
                            <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <FiAlertTriangle size={30} className="text-red-500" />
                            </div>
                            <p className="text-black">Êtes-vous sûr de vouloir vider complètement votre panier ?</p>
                            <p className="text-sm text-gray-500 mt-2">Cette action ne peut pas être annulée.</p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowClearCartConfirm(false)}
                                className="flex-1 py-2 cursor-pointer border border-gray-300 text-black rounded-full font-medium"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        setClearing(true);
                                        const res = await apiClearCart();
                                        if (!res.ok) throw new Error(res.message);
                                        const refreshed = await getCartFull();
                                        setServerCart(refreshed);
                                    } finally {
                                        setClearing(false);
                                        setShowClearCartConfirm(false);
                                    }
                                }}
                                className="flex-1 py-2 bg-red-500 text-white rounded-full font-medium"
                            >
                                {clearing ? 'Vidage...' : 'Vider'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
