import { NextRequest, NextResponse } from 'next/server';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  brand: string;
  variant?: string;
}

interface OrderData {
  phone: string;
  email?: string;
  shippingAddress: string;
  notes?: string;
  items: OrderItem[];
  shippingFee: number;
  discount?: number;
  paymentMethod: string;
}

export async function POST(request: NextRequest) {
  try {
    const orderData: OrderData = await request.json();
    
    // Validation des données requises
    if (!orderData.phone || !orderData.shippingAddress || !orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { error: 'Données manquantes: téléphone, adresse de livraison et articles sont requis' },
        { status: 400 }
      );
    }

    // Calculer le total
    const subtotal = orderData.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const total = subtotal + orderData.shippingFee - (orderData.discount || 0);

    // Créer l'objet commande complet
    const order = {
      id: generateOrderId(),
      ...orderData,
      subtotal,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // TODO: Ici vous pourriez sauvegarder la commande dans une base de données
    // Pour l'instant, on simule juste la création
    console.log('Nouvelle commande créée:', order);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: 'Commande créée avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Fonction pour générer un ID de commande unique
function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `ORDER-${timestamp}-${randomStr}`.toUpperCase();
}
