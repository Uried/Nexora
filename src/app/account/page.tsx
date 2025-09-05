"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiShoppingCart, FiHeart, FiPackage, FiCreditCard, FiMapPin, FiSettings, FiLogOut } from 'react-icons/fi';
import Header from '../../components/Header';

// Import d'une image d'avatar (à remplacer par l'image réelle de l'utilisateur)
import Avatar from '../../assets/images/profile-pic.jpg';

export default function AccountPage() {
  const router = useRouter();
  
  // État pour les informations utilisateur (simulées)
  const [user, setUser] = useState({
    name: 'Eva Nojiwou',
    email: 'eva.nojiwou@gmail.com',
    phone: '+237 676 663 623',
    address: 'Immeuble Kafu, Douala, Cameroun',
    notifications: true,
    newsletter: true
  });
  
  // État pour le mode d'édition
  const [isEditing, setIsEditing] = useState(false);
  
  // État pour les informations en cours d'édition
  const [editedUser, setEditedUser] = useState(user);
  
  // Fonction pour gérer les changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Fonction pour sauvegarder les modifications
  const saveChanges = () => {
    setUser(editedUser);
    setIsEditing(false);
  };
  
  // Fonction pour annuler les modifications
  const cancelEdit = () => {
    setEditedUser(user);
    setIsEditing(false);
  };
  
  // Sections du compte utilisateur
  const accountSections = [
    { 
      id: 'orders', 
      title: 'Mes commandes', 
      icon: <FiPackage className="mr-3" size={20} />,
      action: () => router.push('/orders')
    },
    { 
      id: 'wishlist', 
      title: 'Articles favoris', 
      icon: <FiHeart className="mr-3" size={20} />,
      action: () => router.push('/liked')
    },
    { 
      id: 'payments', 
      title: 'Moyens de paiement', 
      icon: <FiCreditCard className="mr-3" size={20} />,
      action: () => router.push('/payments')
    },
    { 
      id: 'addresses', 
      title: 'Adresses de livraison', 
      icon: <FiMapPin className="mr-3" size={20} />,
      action: () => router.push('/addresses')
    },
    { 
      id: 'settings', 
      title: 'Paramètres', 
      icon: <FiSettings className="mr-3" size={20} />,
      action: () => setIsEditing(true)
    }
  ];

  return (
    <>
      <Header defaultLanguage="FR" />
      <div className="pt-16 pb-20 bg-[#fbf0ef] min-h-screen px-4">
        {/* Header avec titre et bouton retour */}
        <div className="flex items-center justify-between mb-6 mt-6">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium shadow-sm text-black mr-4"
            >
              <FiArrowLeft className="mr-2" /> Retour
            </Link>
            <h1 className="text-2xl font-bold text-black">Mon compte</h1>
          </div>
          <button 
            onClick={() => router.push('/cart')} 
            className="flex items-center bg-black text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-sm"
          >
            <FiShoppingCart className="mr-2" /> Panier
          </button>
        </div>

        {/* Profil utilisateur */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-6">
          <div className="p-6">
            <div className="flex items-center">
              <div className="relative w-20 h-20 rounded-full overflow-hidden mr-4">
                <Image
                  src={Avatar}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informations personnelles */}
        {isEditing ? (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-6">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Modifier mes informations</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    name="name"
                    value={editedUser.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editedUser.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editedUser.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    name="address"
                    value={editedUser.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifications"
                    name="notifications"
                    checked={editedUser.notifications}
                    onChange={handleChange}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                  <label htmlFor="notifications" className="ml-2 block text-sm text-gray-700">
                    Recevoir des notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="newsletter"
                    name="newsletter"
                    checked={editedUser.newsletter}
                    onChange={handleChange}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                  <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-700">
                    S&#39;abonner à la newsletter
                  </label>
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={saveChanges}
                    className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium"
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full text-sm font-medium"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-6">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Informations personnelles</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Adresse</p>
                  <p className="font-medium">{user.address}</p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium"
                  >
                    Modifier mes informations
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sections du compte */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-6">
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4">Mon espace client</h3>
            <div className="space-y-4">
              {accountSections.map((section) => (
                <button
                  key={section.id}
                  onClick={section.action}
                  className="flex items-center w-full p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {section.icon}
                  <span>{section.title}</span>
                </button>
              ))}
              <button
                className="flex items-center w-full p-3 hover:bg-gray-50 rounded-lg transition-colors text-red-500"
              >
                <FiLogOut className="mr-3" size={20} />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Historique récent */}
        {/* <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4">Derniers produits consultés</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-100 rounded-lg p-3 flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-md mr-3"></div>
                <div>
                  <p className="font-medium text-sm">Black Opium</p>
                  <p className="text-xs text-gray-500">YSL</p>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-3 flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-md mr-3"></div>
                <div>
                  <p className="font-medium text-sm">Sac à main</p>
                  <p className="text-xs text-gray-500">Gucci</p>
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </>
  );
}
