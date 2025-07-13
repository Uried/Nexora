"use client";

import React, { useState } from 'react';
import { FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';

// Import des images
import Popular1 from '../../assets/images/popular1 (1).jpg';
import Popular2 from '../../assets/images/popular1 (2).jpg';
import Popular3 from '../../assets/images/popular1 (3).jpg';

export default function CheckoutPage() {
    const router = useRouter();
    
    // Simuler les articles du panier (dans une application réelle, cela viendrait d'un état global ou d'une API)
    const cartItems = [
        { id: 1, name: 'Black Opium', brand: 'Yves Saint Laurent', price: 65000, quantity: 1, image: Popular1 },
        { id: 2, name: 'Coco Mademoiselle', brand: 'Chanel', price: 72000, quantity: 2, image: Popular2 },
        { id: 3, name: 'Loui Martin', brand: 'Louis Vuitton', price: 39000, quantity: 1, image: Popular3 },
    ];

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

    // Calculer le sous-total
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Frais de livraison
    const shippingFee = 5000;
    
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
        } else if (!/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(formData.phone.trim())) {
            newErrors.phone = 'Numéro de téléphone invalide';
            isValid = false;
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
        const whatsappNumber = "237676663623"; // Format: code pays + numéro sans +
        
        // Construire le message
        let message = `*NOUVELLE COMMANDE NEXORA*\n\n`;
        message += `*Informations client:*\n`;
        message += `Téléphone: ${formData.phone}\n`;
        message += `Adresse de livraison: ${formData.address}\n\n`;
        
        message += `*Articles commandés:*\n`;
        cartItems.forEach(item => {
            message += `- ${item.quantity}x ${item.name} (${item.brand}): ${formatPrice(item.price * item.quantity)}\n`;
        });
        
        message += `\n*Sous-total:* ${formatPrice(subtotal)}\n`;
        message += `*Frais de livraison:* ${formatPrice(shippingFee)}\n`;
        message += `*TOTAL:* ${formatPrice(total)}\n\n`;
        
        if (formData.notes) {
            message += `*Notes:* ${formData.notes}\n\n`;
        }
        
        message += `Merci pour votre commande!`;
        
        // Encoder le message pour l'URL
        const encodedMessage = encodeURIComponent(message);
        
        // Construire l'URL WhatsApp
        return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    };

    // Gérer la soumission du formulaire
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (validateForm()) {
            // Rediriger vers WhatsApp avec le message préparé
            const whatsappUrl = prepareWhatsAppMessage();
            window.open(whatsappUrl, '_blank');
            
            // Simuler la création d'une commande et rediriger vers la page de confirmation
            // Dans une application réelle, vous enverriez ces données à votre backend
            setTimeout(() => {
                router.push('/checkout/confirmation');
            }, 1000);
        }
    };

    return (
        <>
            <Header defaultLanguage="FR" />
            <div className="pt-16 bg-[#fbf0ef] min-h-screen px-4 pb-20">
                {/* En-tête de la page */}
                <div className="py-6 flex items-center">
                    <button
                        onClick={() => router.back()}
                        className="mr-3 bg-white p-2 rounded-full shadow-sm"
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold">Finaliser la commande</h1>
                </div>
                
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Formulaire de commande */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Informations de contact */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm">
                                <h2 className="text-lg font-semibold mb-4">Informations de contact</h2>
                                
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
                                            className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-black/20`}
                                            placeholder="Ex: +237 676 663 623"
                                        />
                                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Adresse de livraison */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm">
                                <h2 className="text-lg font-semibold mb-4">Adresse de livraison</h2>
                                
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
                                            className={`w-full px-4 py-3 rounded-xl border ${errors.address ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-black/20`}
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
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/20"
                                            placeholder="Instructions spéciales pour la livraison"
                                        />
                                    </div>
                                </div>
                            </div>
                            

                            
                            {/* Bouton de soumission */}
                            <button 
                                type="submit"
                                className="w-full bg-black text-white py-4 rounded-full font-semibold shadow-md flex items-center justify-center"
                            >
                                <svg className='mr-2' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01m-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23m4.52-6.16c-.25-.12-1.47-.72-1.69-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.78.97c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-1.99-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31c-.22.25-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74c.59.26 1.05.41 1.41.52c.59.19 1.13.16 1.56.1c.48-.07 1.47-.6 1.67-1.18c.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28"/></svg>
                                Commander via WhatsApp
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
