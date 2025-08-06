"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowLeft, FiMinus, FiPlus, FiTrash2, FiX, FiAlertTriangle } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';

// Import des images
import Popular1 from '../../assets/images/popular1 (1).jpg';
import Popular2 from '../../assets/images/popular1 (2).jpg';
import Popular3 from '../../assets/images/popular1 (3).jpg';

export default function CartPage() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState([
        { id: 1, name: 'Black Opium', brand: 'Yves Saint Laurent', price: 65000, quantity: 1, image: Popular1 },
        { id: 2, name: 'Coco Mademoiselle', brand: 'Chanel', price: 72000, quantity: 2, image: Popular2 },
        { id: 3, name: 'Loui Martin', brand: 'Louis Vuitton', price: 39000, quantity: 1, image: Popular3 },
    ]);

    // États pour gérer les confirmations
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);

    // Fonction pour formater le prix en FCFA
    const formatPrice = (price: number) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
    };

    // Fonction pour augmenter la quantité d'un article
    const increaseQuantity = (id: number) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, quantity: item.quantity + 1 } : item
            )
        );
    };

    // Fonction pour diminuer la quantité d'un article
    const decreaseQuantity = (id: number) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
            )
        );
    };

    // Fonction pour demander confirmation avant de supprimer un article
    const confirmRemoveItem = (id: number) => {
        setItemToDelete(id);
    };

    // Fonction pour supprimer un article du panier après confirmation
    const removeItem = () => {
        if (itemToDelete !== null) {
            setCartItems(prevItems => prevItems.filter(item => item.id !== itemToDelete));
            setItemToDelete(null);
        }
    };

    // Fonction pour annuler la suppression
    const cancelRemove = () => {
        setItemToDelete(null);
    };

    // Calculer le sous-total
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Frais de livraison
    const shippingFee = 5000;

    // Total
    const total = subtotal + shippingFee;

    return (
        <>
            <Header defaultLanguage="FR" />
            <div className="pt-16 bg-[#fbf0ef] min-h-screen px-4 pb-20">
                {/* En-tête de la page */}
                <div className="py-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={() => router.back()}
                            className="mr-3 bg-white p-2 rounded-full shadow-sm"
                        >
                            <FiArrowLeft size={20} />
                        </button>
                        <h1 className="text-2xl font-bold">Mon Panier</h1>
                    </div>
                    {cartItems.length > 0 && (
                        <button
                            onClick={() => setShowClearCartConfirm(true)}
                            className="text-red-500 text-sm font-medium flex items-center"
                        >
                            <FiTrash2 size={16} className="mr-1" />
                            Vider le panier
                        </button>
                    )}
                </div>

                {cartItems.length > 0 ? (
                    <>
                        {/* Liste des articles */}
                        <div className="space-y-4 mb-8">
                            {cartItems.map(item => (
                                <div key={item.id} className="bg-white rounded-2xl px-2 py-2 space-y-2 shadow-sm">
                                    <div className="flex items-center">
                                        <div className="relative w-20 h-20 rounded-xl overflow-hidden mr-3">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{item.name}</h3>
                                            <p className="text-gray-500 text-sm">{item.brand}</p>
                                            <p className="font-semibold mt-1">{formatPrice(item.price)}</p>
                                        </div>
                                        <div className="flex flex-col space-y-4 items-end">
                                            <div className="flex items-center border border-gray-200 rounded-full">
                                                <button
                                                    className="px-2"
                                                    onClick={() => decreaseQuantity(item.id)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <FiMinus size={14} />
                                                </button>
                                                <span className="px-3 text-sm">{item.quantity}</span>
                                                <button
                                                    className="px-2 py-1"
                                                    onClick={() => increaseQuantity(item.id)}
                                                >
                                                    <FiPlus size={14} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => confirmRemoveItem(item.id)}
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
                            <h2 className="text-lg font-semibold mb-4">Résumé de la commande</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Sous-total</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Frais de livraison</span>
                                    <span>{formatPrice(shippingFee)}</span>
                                </div>
                                <div className="border-t border-gray-100 pt-3 mt-3">
                                    <div className="flex justify-between font-semibold">
                                        <span>Total</span>
                                        <span>{formatPrice(total)}</span>
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
                            <h2 className="text-xl font-semibold mb-2">Votre panier est vide</h2>
                            <p className="text-gray-500 mb-6">Vous n'avez pas encore ajouté d'articles à votre panier.</p>
                            <Link href="/products">
                                <button className="bg-black text-white py-3 px-6 rounded-full font-medium">
                                    Découvrir nos produits
                                </button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de confirmation pour supprimer un article */}
            {itemToDelete !== null && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg">Confirmer la suppression</h3>
                            <button onClick={cancelRemove} className="p-1">
                                <FiX size={20} />
                            </button>
                        </div>
                        <div className="mb-6 text-center">
                            <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <FiAlertTriangle size={30} className="text-red-500" />
                            </div>
                            <p>Êtes-vous sûr de vouloir supprimer cet article du panier ?</p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={cancelRemove}
                                className="flex-1 py-2 border border-gray-300 rounded-full font-medium"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={removeItem}
                                className="flex-1 py-2 bg-red-500 text-white rounded-full font-medium"
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
                    <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg">Vider le panier</h3>
                            <button onClick={() => setShowClearCartConfirm(false)} className="p-1">
                                <FiX size={20} />
                            </button>
                        </div>
                        <div className="mb-6 text-center">
                            <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <FiAlertTriangle size={30} className="text-red-500" />
                            </div>
                            <p>Êtes-vous sûr de vouloir vider complètement votre panier ?</p>
                            <p className="text-sm text-gray-500 mt-2">Cette action ne peut pas être annulée.</p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowClearCartConfirm(false)}
                                className="flex-1 py-2 border border-gray-300 rounded-full font-medium"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => {
                                    setCartItems([]);
                                    setShowClearCartConfirm(false);
                                }}
                                className="flex-1 py-2 bg-red-500 text-white rounded-full font-medium"
                            >
                                Vider
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
