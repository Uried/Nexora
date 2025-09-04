"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiShoppingCart, FiSearch, FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Header from '../../components/Header';

// Import des images pour les produits
import Popular1 from '../../assets/images/popular1 (1).jpg';
import Popular2 from '../../assets/images/popular1 (2).jpg';
import Popular3 from '../../assets/images/popular1 (3).jpg';
import Bag1 from '../../assets/images/bag1.png';

export default function OrdersPage() {
  const router = useRouter();
  
  // État pour le filtrage et la recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  
  // Données simulées des commandes
  const orders = [
    {
      id: 'CMD-2025-0723',
      date: '23 juillet 2025',
      status: 'delivered',
      statusText: 'Livré',
      total: '157 000 FCFA',
      items: [
        { id: 1, name: 'Black Opium', brand: 'Yves Saint Laurent', price: '65 000 FCFA', quantity: 1, image: Popular1 },
        { id: 2, name: 'Coco Mademoiselle', brand: 'Chanel', price: '72 000 FCFA', quantity: 1, image: Popular2 },
        { id: 8, name: 'Sac à main', brand: 'Gucci', price: '120 000 FCFA', quantity: 1, image: Bag1 }
      ],
      shippingAddress: '123 Rue des Fleurs, Douala, Cameroun',
      paymentMethod: 'Carte bancaire',
      trackingNumber: 'TRK-9876543210'
    },
    {
      id: 'CMD-2025-0615',
      date: '15 juin 2025',
      status: 'delivered',
      statusText: 'Livré',
      total: '39 000 FCFA',
      items: [
        { id: 3, name: 'Loui Martin', brand: 'Louis Vuitton', price: '39 000 FCFA', quantity: 1, image: Popular3 }
      ],
      shippingAddress: '123 Rue des Fleurs, Douala, Cameroun',
      paymentMethod: 'Mobile Money',
      trackingNumber: 'TRK-9876543211'
    },
    {
      id: 'CMD-2025-0702',
      date: '2 juillet 2025',
      status: 'processing',
      statusText: 'En cours',
      total: '72 000 FCFA',
      items: [
        { id: 2, name: 'Coco Mademoiselle', brand: 'Chanel', price: '72 000 FCFA', quantity: 1, image: Popular2 }
      ],
      shippingAddress: '123 Rue des Fleurs, Douala, Cameroun',
      paymentMethod: 'Carte bancaire',
      trackingNumber: 'TRK-9876543212'
    },
    {
      id: 'CMD-2025-0629',
      date: '29 juin 2025',
      status: 'shipped',
      statusText: 'Expédié',
      total: '65 000 FCFA',
      items: [
        { id: 1, name: 'Black Opium', brand: 'Yves Saint Laurent', price: '65 000 FCFA', quantity: 1, image: Popular1 }
      ],
      shippingAddress: '123 Rue des Fleurs, Douala, Cameroun',
      paymentMethod: 'Mobile Money',
      trackingNumber: 'TRK-9876543213'
    }
  ];
  
  // Fonction pour filtrer les commandes
  const filteredOrders = orders.filter(order => {
    // Filtrer par statut
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }
    
    // Filtrer par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.id.toLowerCase().includes(query) ||
        order.items.some(item => 
          item.name.toLowerCase().includes(query) || 
          item.brand.toLowerCase().includes(query)
        )
      );
    }
    
    return true;
  });
  
  // Fonction pour basculer l'affichage détaillé d'une commande
  const toggleOrderDetails = (orderId: number) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };
  
  // Fonction pour obtenir la couleur de statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Header defaultLanguage="FR" />
      <div className="pt-16 pb-20 bg-[#beb7a4]/40 min-h-screen px-4">
        {/* Header avec titre et bouton retour */}
        <div className="flex items-center justify-between mb-6 mt-6">
          <div className="flex items-center">
            <Link 
              href="/account" 
              className="flex items-center bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium shadow-sm mr-4"
            >
              <FiArrowLeft className="mr-2" /> Retour
            </Link>
            <h1 className="text-2xl font-bold">Mes commandes</h1>
          </div>
          <button 
            onClick={() => router.push('/cart')} 
            className="flex items-center bg-black text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-sm"
          >
            <FiShoppingCart className="mr-2" /> Panier
          </button>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="mb-6">
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Rechercher une commande..."
              className="w-full bg-white rounded-full py-3 px-5 pl-12 shadow-sm focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          
          <div className="flex justify-between items-center">
            <button
              className="flex items-center bg-white px-4 py-2 rounded-full text-sm shadow-sm"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <FiFilter className="mr-2" /> Filtrer
              {filterOpen ? <FiChevronUp className="ml-2" /> : <FiChevronDown className="ml-2" />}
            </button>
            <p className="text-sm text-gray-500">{filteredOrders.length} commande(s)</p>
          </div>
          
          {filterOpen && (
            <div className="bg-white rounded-2xl p-4 mt-3 shadow-sm">
              <h3 className="font-medium mb-3">Statut de la commande</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1.5 rounded-full text-sm ${statusFilter === 'all' ? 'bg-black text-white' : 'bg-gray-100'}`}
                  onClick={() => setStatusFilter('all')}
                >
                  Toutes
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full text-sm ${statusFilter === 'processing' ? 'bg-black text-white' : 'bg-gray-100'}`}
                  onClick={() => setStatusFilter('processing')}
                >
                  En cours
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full text-sm ${statusFilter === 'shipped' ? 'bg-black text-white' : 'bg-gray-100'}`}
                  onClick={() => setStatusFilter('shipped')}
                >
                  Expédié
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full text-sm ${statusFilter === 'delivered' ? 'bg-black text-white' : 'bg-gray-100'}`}
                  onClick={() => setStatusFilter('delivered')}
                >
                  Livré
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full text-sm ${statusFilter === 'cancelled' ? 'bg-black text-white' : 'bg-gray-100'}`}
                  onClick={() => setStatusFilter('cancelled')}
                >
                  Annulé
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Liste des commandes */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <div key={order.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => toggleOrderDetails(index)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{order.id}</h3>
                      <p className="text-sm text-gray-500">{order.date}</p>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {order.statusText}
                      </span>
                      {expandedOrder === index ? 
                        <FiChevronUp className="ml-3" /> : 
                        <FiChevronDown className="ml-3" />
                      }
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm">Total: <span className="font-semibold">{order.total}</span></p>
                    <p className="text-sm">{order.items.length} article(s)</p>
                  </div>
                </div>
                
                {expandedOrder === index && (
                  <div className="border-t border-gray-100 p-4">
                    <h4 className="font-medium mb-3">Détails de la commande</h4>
                    
                    {/* Articles de la commande */}
                    <div className="space-y-3 mb-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="ml-3 flex-1">
                            <h5 className="font-medium">{item.name}</h5>
                            <p className="text-sm text-gray-500">{item.brand}</p>
                            <div className="flex justify-between mt-1">
                              <p className="text-sm">{item.price}</p>
                              <p className="text-sm">Qté: {item.quantity}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Informations de livraison et paiement */}
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-500">Adresse de livraison:</p>
                        <p>{order.shippingAddress}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Méthode de paiement:</p>
                        <p>{order.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Numéro de suivi:</p>
                        <p>{order.trackingNumber}</p>
                      </div>
                    </div>
                    
                    {/* Boutons d'action */}
                    <div className="flex space-x-3 mt-4">
                      <button className="flex-1 bg-black text-white py-2 rounded-full text-sm font-medium">
                        Suivre la livraison
                      </button>
                      <button className="flex-1 bg-gray-100 py-2 rounded-full text-sm font-medium">
                        Besoin d&#39;aide
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 text-center">
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Aucune commande trouvée</h3>
            <p className="text-gray-500 mb-4">Vous n&#39;avez pas encore passé de commande ou aucune commande ne correspond à votre recherche.</p>
            <button 
              onClick={() => router.push('/products')}
              className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium"
            >
              Découvrir nos produits
            </button>
          </div>
        )}
      </div>
    </>
  );
}
