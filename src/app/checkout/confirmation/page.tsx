"use client";

import React from 'react';
import { FiCheck, FiShoppingBag, FiHome } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';

export default function OrderConfirmationPage() {
    const router = useRouter();

    return (
        <>
            <Header defaultLanguage="FR" />
            <div className="pt-16 bg-[#fbf0ef] min-h-screen px-4 pb-20 flex items-center justify-center">
                <div className="bg-white rounded-2xl p-6 shadow-sm max-w-md w-full text-center">
                    <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <FiCheck size={40} className="text-green-600" />
                    </div>
                    
                    <h1 className="text-2xl font-bold text-black mb-2">Commande envoyée avec succès!</h1>
                    
                    <p className="text-gray-600 mb-6">
                        Votre commande a été transmise via WhatsApp. Notre équipe va traiter votre demande dans les plus brefs délais.
                    </p>
                    
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6 text-left">
                        <p className="text-sm text-gray-700">
                            <strong>Note:</strong> Si vous n&#39;avez pas été redirigé vers WhatsApp, veuillez nous contacter directement au 
                            <a href="tel:+237651418376" className="text-black font-medium"> +237 6 51 41 83 76</a> pour finaliser votre commande.
                        </p>
                    </div>
                    
                    <div className="space-y-3">
                        <button 
                            onClick={() => router.push('/orders')}
                            className="w-full hidden bg-black text-white py-3 rounded-full font-medium flex items-center justify-center"
                        >
                            <FiShoppingBag className="mr-2" /> Voir mes commandes
                        </button>
                        
                        <button 
                            onClick={() => router.push('/')}
                            className="w-full bg-white border border-gray-200 py-3 rounded-full font-medium flex items-center justify-center"
                        >
                            <FiHome className="mr-2" /> Retour à l&#39;accueil
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
