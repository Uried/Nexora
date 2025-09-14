"use client";

import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import DesktopHeader from '../../components/DesktopHeader';
import { getCartFull, clearCart, type ServerCartItem, type ServerCartResponse } from '../../lib/cart';

export default function CheckoutPage() {
    const router = useRouter();
    
    // États pour le panier
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [serverCart, setServerCart] = useState<ServerCartResponse | null>(null);
    
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
    const cartItems: ServerCartItem[] = serverCart?.cart?.items || [];

    // États pour le formulaire de commande
    const [formData, setFormData] = useState({
        phone: '',
        address: '',
        notes: ''
    });

    // État pour les erreurs de validation
    const [errors, setErrors] = useState({
        phone: '',
        address: ''
    });

    // État pour le chargement de la soumission
    const [submitting, setSubmitting] = useState(false);

    // Calculer le sous-total (même logique que dans cart.tsx)
    const subtotal = cartItems.reduce((acc, item) => {
        const itemPrice = item.priceAtAdd ?? item.productId.discountPrice ?? item.productId.price;
        return acc + (itemPrice * item.quantity);
    }, 0);
    
    // Frais de livraison
    const shippingFee = 1000;
    
    // Total
    const total = subtotal + shippingFee;

    // Fonction pour formater le prix en FCFA
    const formatPrice = (price: number) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
    };

    // Gérer les changements dans le formulaire
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Effacer l'erreur lorsque l'utilisateur commence à taper
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Valider le formulaire
    const validateForm = () => {
        let isValid = true;
        const newErrors = { ...errors };
        
        if (!formData.phone.trim()) {
            newErrors.phone = 'Le numéro de téléphone est requis';
            isValid = false;
        } else {
            // Extraire seulement les chiffres du numéro de téléphone
            const phoneDigits = formData.phone.replace(/\D/g, '');
            if (phoneDigits.length < 9) {
                newErrors.phone = 'Le numéro de téléphone doit contenir au moins 9 chiffres';
                isValid = false;
            }
        }
        
        if (!formData.address.trim()) {
            newErrors.address = 'L\'adresse de livraison est requise';
            isValid = false;
        }
        
        setErrors(newErrors);
        return isValid;
    };

    // Préparer le message WhatsApp
    const prepareWhatsAppMessage = () => {
        // Numéro WhatsApp de l'entreprise (à remplacer par le vrai numéro)
        const whatsappNumber = "237651418376"; // Format: code pays + numéro sans +
       
        
        // Construire le message
        let message = `*NOUVELLE COMMANDE KASI*\n\n`;
        message += `*Informations client:*\n`;
        message += `Téléphone: ${formData.phone}\n`;
        message += `Adresse de livraison: ${formData.address}\n\n`;
        
        message += `*Articles commandés:*\n`;
        cartItems.forEach(item => {
            const itemPrice = item.priceAtAdd ?? item.productId.discountPrice ?? item.productId.price;
            const brand = item.productId.details?.brand || '';
            message += `- ${item.quantity}x ${item.productId.name}${brand ? ` (${brand})` : ''}: ${formatPrice(itemPrice * item.quantity)}\n`;
        });
        
        message += `\n*Sous-total:* ${formatPrice(subtotal)}\n`;
        message += `*Frais de livraison:* ${formatPrice(shippingFee)}\n`;
        message += `*Note:* (1000 - 5000 FCFA à négocier en fonction de la distance)\n`;
        message += `*TOTAL:* ${formatPrice(total)}\n\n`;
        
        if (formData.notes) {
            message += `*Notes:* ${formData.notes}\n\n`;
        }
        
        message += `Merci!`;
        
        // Encoder le message pour l'URL
        const encodedMessage = encodeURIComponent(message);
        
        // Construire l'URL WhatsApp
        return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    };

    // Gérer la soumission du formulaire
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (validateForm()) {
            setSubmitting(true);
            setError(null);
            
            try {
                // Préparer les données de la commande pour l'API (format exact Postman)
                const orderData = {
                    phone: formData.phone,
                    shippingAddress: formData.address,
                    notes: formData.notes || "",
                    items: cartItems.map(item => ({
                        productId: item.productId.id,
                        name: item.productId.name,
                        price: item.priceAtAdd ?? item.productId.discountPrice ?? item.productId.price,
                        quantity: item.quantity,
                        image: item.productId.images?.[0] || "",
                        brand: item.productId.details?.brand || "",
                        variant: (item.productId.details as { brand?: string; variant?: string })?.variant || ""
                    })),
                    shippingFee: shippingFee,
                    discount: 0,
                    paymentMethod: "whatsapp"
                };

                // Appeler l'API pour créer la commande
                const response = await fetch('https://api.kasi.market/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(orderData),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erreur lors de la création de la commande');
                }

                const result = await response.json();
                console.log('Commande créée avec succès:', result);
                console.log('Numéro de commande:', result.orderNumber);

                // Vider le panier après la création réussie de la commande
                try {
                    const clearResult = await clearCart();
                    if (!clearResult.ok) {
                        console.warn('Erreur lors du vidage du panier:', clearResult.message);
                    } else {
                        console.log('Panier vidé avec succès');
                    }
                } catch (clearError) {
                    console.warn('Erreur lors du vidage du panier:', clearError);
                }

                // Rediriger vers WhatsApp avec le message préparé
                const whatsappUrl = prepareWhatsAppMessage();
                
                // Détecter si c'est un appareil mobile iOS
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                
                if (isIOS || isMobile) {
                    // Sur mobile (surtout iOS), utiliser window.location.href
                    window.location.href = whatsappUrl;
                } else {
                    // Sur desktop, utiliser window.open
                    window.open(whatsappUrl, '_blank');
                }
                
                // Rediriger vers la page de confirmation
                setTimeout(() => {
                    router.push('/checkout/confirmation');
                }, 1000);

            } catch (error) {
                console.error('Erreur lors de la création de la commande:', error);
                // Afficher une erreur à l'utilisateur
                setError(error instanceof Error ? error.message : 'Erreur lors de la création de la commande');
            } finally {
                setSubmitting(false);
            }
        }
    };

    return (
        <>
            <Header defaultLanguage="FR" />
            <DesktopHeader />
            {/* Mobile Layout */}
            <div className="lg:hidden pt-16 bg-[#fbf0ef] min-h-screen px-4 pb-20">
                {/* En-tête de la page */}
                <div className="py-6 flex items-center">
                    <button
                        onClick={() => router.back()}
                        className="mr-3 bg-white p-2 rounded-full shadow-sm text-black"
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-black">Finaliser la commande</h1>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="bg-white px-6 py-4 rounded-xl shadow-sm">Chargement du panier...</div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="bg-white px-6 py-4 rounded-xl shadow-sm text-red-600">{error}</div>
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md mx-auto">
                            <div className="text-5xl mb-4">🛒</div>
                            <h2 className="text-xl font-semibold text-black mb-2">Votre panier est vide</h2>
                            <p className="text-gray-500 mb-6">Vous devez ajouter des articles à votre panier avant de passer commande.</p>
                            <button 
                                onClick={() => router.push('/products')}
                                className="bg-black text-white py-3 px-6 rounded-full font-medium"
                            >
                                Découvrir nos produits
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                
                {/* Note sur le paiement - Placée en haut de la page */}
                <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 flex items-start mb-6">
                    <FiAlertTriangle className="text-yellow-500 mt-1 mr-3 flex-shrink-0" size={20} />
                    <div>
                        <p className="text-sm text-gray-700">
                            <strong>Note:</strong> Le paiement en ligne n&#39;est pas encore disponible. Après avoir validé votre commande, 
                            vous serez redirigé vers WhatsApp pour finaliser votre commande avec notre équipe.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Formulaire de commande */}
                    <div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Informations de contact */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm">
                                <h2 className="text-lg font-semibold text-black mb-4">Informations de contact</h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                            Téléphone (WhatsApp) *
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 text-black rounded-xl border ${errors.phone ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-black/20`}
                                            placeholder="Ex: 676 663 623"
                                        />
                                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Adresse de livraison */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm">
                                <h2 className="text-lg font-semibold text-black mb-4">Adresse de livraison</h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                            Lieu de livraison détaillé *
                                        </label>
                                        <textarea
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            rows={3}
                                            className={`w-full px-4 py-3 text-black rounded-xl border ${errors.address ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-black/20`}
                                            placeholder="Quartier, rue, point de repère, etc."
                                        />
                                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                            Notes (optionnel)
                                        </label>
                                        <textarea
                                            id="notes"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            rows={2}
                                            className="w-full px-4 py-3 rounded-xl border border-black text-black focus:outline-none focus:ring-2 focus:ring-black/20"
                                            placeholder="Instructions spéciales pour la livraison"
                                        />
                                    </div>
                                </div>
                            </div>
                            

                            
                            {/* Affichage des erreurs */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
                                    <FiAlertTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" size={20} />
                                    <div>
                                        <p className="text-sm text-red-700">
                                            <strong>Erreur:</strong> {error}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Bouton de soumission */}
                            <button 
                                type="submit"
                                disabled={submitting}
                                className={`w-full py-4 rounded-full font-semibold shadow-md flex items-center justify-center transition-colors ${
                                    submitting 
                                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                        : 'bg-black text-white hover:bg-gray-800'
                                }`}
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Création de la commande...
                                    </>
                                ) : (
                                    <>
                                        <svg className='mr-2' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01m-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23m4.52-6.16c-.25-.12-1.47-.72-1.69-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.78.97c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-1.99-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31c-.22.25-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74c.59.26 1.05.41 1.41.52c.59.19 1.13.16 1.56.1c.48-.07 1.47-.6 1.67-1.18c.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28"/></svg>
                                        Commander via WhatsApp
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
                </>
                )}
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block pt-36 bg-white min-h-screen">
                <div className="container mx-auto px-6 py-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="bg-gray-50 px-6 py-4 rounded-xl">Chargement du panier...</div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="bg-red-50 px-6 py-4 rounded-xl text-red-600">{error}</div>
                        </div>
                    ) : cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="text-center">
                                <div className="text-6xl mb-4">🛒</div>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Votre panier est vide</h2>
                                <p className="text-gray-500 mb-6">Vous devez ajouter des articles à votre panier avant de passer commande.</p>
                                <button 
                                    onClick={() => router.push('/')}
                                    className="bg-black text-white py-3 px-6 rounded-full font-medium hover:bg-gray-800 transition-colors cursor-pointer"
                                >
                                    Découvrir nos produits
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-8">
                            {/* Left: Checkout Form */}
                            <div className="col-span-2">
                                {/* Header */}
                                <div className="flex items-center mb-8">
                                    <button
                                        onClick={() => router.back()}
                                        className="mr-4 p-2 border-2 border-black rounded-full hover:bg-black hover:text-white transition-colors cursor-pointer"
                                    >
                                        <FiArrowLeft size={20} />
                                    </button>
                                    <h1 className="text-3xl font-bold text-gray-900">Finaliser la commande</h1>
                                </div>

                                {/* Payment Note */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start mb-8">
                                    <FiAlertTriangle className="text-yellow-500 mt-1 mr-3 flex-shrink-0" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            <strong>Note:</strong> Le paiement en ligne n&apos;est pas encore disponible. Après avoir validé votre commande, 
                                            vous serez redirigé vers WhatsApp pour finaliser votre commande avec notre équipe.
                                        </p>
                                    </div>
                                </div>

                                <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                                    {/* Contact Information */}
                                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations de contact</h2>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="phone-desktop" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Téléphone (WhatsApp) *
                                                </label>
                                                <input
                                                    type="tel"
                                                    id="phone-desktop"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-3 text-black rounded-xl border-2 ${errors.phone ? 'border-red-500' : 'border-black'} focus:outline-none focus:ring-2 focus:ring-black/20`}
                                                    placeholder="Ex: 676 663 623"
                                                />
                                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Shipping Address */}
                                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Adresse de livraison</h2>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="address-desktop" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Lieu de livraison détaillé *
                                                </label>
                                                <textarea
                                                    id="address-desktop"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    rows={3}
                                                    className={`w-full px-4 py-3 text-black rounded-xl border-2 ${errors.address ? 'border-red-500' : 'border-black'} focus:outline-none focus:ring-2 focus:ring-black/20`}
                                                    placeholder="Quartier, rue, point de repère, etc."
                                                />
                                                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                                            </div>
                                            
                                            <div>
                                                <label htmlFor="notes-desktop" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Notes (optionnel)
                                                </label>
                                                <textarea
                                                    id="notes-desktop"
                                                    name="notes"
                                                    value={formData.notes}
                                                    onChange={handleChange}
                                                    rows={2}
                                                    className="w-full px-4 py-3 rounded-xl border-2 border-black text-black focus:outline-none focus:ring-2 focus:ring-black/20"
                                                    placeholder="Instructions spéciales pour la livraison"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Error Display */}
                                    {error && (
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
                                            <FiAlertTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" size={20} />
                                            <div>
                                                <p className="text-sm text-red-700">
                                                    <strong>Erreur:</strong> {error}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </form>
                            </div>

                            {/* Right: Order Summary */}
                            <div className="col-span-1">
                                <div className="bg-gray-50 rounded-xl p-6 sticky top-40">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Résumé de la commande</h2>
                                    
                                    {/* Cart Items */}
                                    <div className="space-y-4 mb-6">
                                        {cartItems.map(item => (
                                            <div key={item._id} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                                    {item.productId?.images?.[0] ? (
                                                        <img
                                                            src={item.productId.images[0]}
                                                            alt={item.productId?.name || 'Produit'}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-100" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-900 text-sm truncate">{item.productId?.name || 'Produit indisponible'}</h4>
                                                    <p className="text-gray-500 text-xs">{item.productId?.details?.brand || ''}</p>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <span className="text-xs text-gray-500">Qté: {item.quantity}</span>
                                                        <span className="font-medium text-sm">{formatPrice((item.priceAtAdd ?? item.productId?.discountPrice ?? item.productId?.price ?? 0) * item.quantity)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Price Summary */}
                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Sous-total</span>
                                            <span className="text-gray-900 font-medium">{formatPrice(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Frais de livraison</span>
                                            <span className="text-gray-900 font-medium">{formatPrice(shippingFee)}</span>
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

                                    {/* Submit Button */}
                                    <button 
                                        type="submit"
                                        form="checkout-form"
                                        disabled={submitting}
                                        className={`w-full py-4 rounded-full font-semibold shadow-sm flex items-center justify-center transition-colors ${
                                            submitting 
                                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                                : 'bg-black text-white hover:bg-gray-800 cursor-pointer'
                                        }`}
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                Création de la commande...
                                            </>
                                        ) : (
                                            <>
                                                <svg className='mr-2' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01m-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23m4.52-6.16c-.25-.12-1.47-.72-1.69-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.78.97c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-1.99-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31c-.22.25-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74c.59.26 1.05.41 1.41.52c.59.19 1.13.16 1.56.1c.48-.07 1.47-.6 1.67-1.18c.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28"/></svg>
                                                Commander via WhatsApp
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
