export type AddToCartPayload = {
  cartId: string;
  productId: string;
  quantity: number;
  priceAtAdd: number;
};

export function getKasiUserId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('kasiUserId');
  } catch {
    return null;
  }
}

export async function clearCart(): Promise<{ ok: boolean; message?: string }>{
  const cartId = getKasiUserId();
  if (!cartId) return { ok: false, message: 'Identifiant client introuvable' };
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '');
  try {
    const res = await fetch(`${base}/api/cart?cartId=${encodeURIComponent(cartId)}`, { method: 'DELETE' });
    if (!res.ok) return { ok: false, message: `HTTP ${res.status}` };
    return { ok: true };
  } catch (e: unknown) {
    const message =
      typeof e === 'object' && e !== null && 'message' in e
        ? String((e as { message?: unknown }).message)
        : 'Erreur réseau';
    return { ok: false, message };
  }
}

export async function removeCartItem(itemId: string): Promise<{ ok: boolean; message?: string }>{
  const cartId = getKasiUserId();
  if (!cartId) return { ok: false, message: 'Identifiant client introuvable' };
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '');
  try {
    const res = await fetch(`${base}/api/cart/items/${encodeURIComponent(itemId)}?cartId=${encodeURIComponent(cartId)}`, { method: 'DELETE' });
    if (!res.ok) return { ok: false, message: `HTTP ${res.status}` };
    return { ok: true };
  } catch (e: unknown) {
    const message =
      typeof e === 'object' && e !== null && 'message' in e
        ? String((e as { message?: unknown }).message)
        : 'Erreur réseau';
    return { ok: false, message };
  }
}

export async function updateCartItemQuantity(itemId: string, quantity: number): Promise<{ ok: boolean; message?: string }>{
  const cartId = getKasiUserId();
  if (!cartId) return { ok: false, message: 'Identifiant client introuvable' };
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '');
  try {
    const res = await fetch(`${base}/api/cart/items/${encodeURIComponent(itemId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartId, quantity }),
    });
    if (!res.ok) return { ok: false, message: `HTTP ${res.status}` };
    return { ok: true };
  } catch (e: unknown) {
    const message =
      typeof e === 'object' && e !== null && 'message' in e
        ? String((e as { message?: unknown }).message)
        : 'Erreur réseau';
    return { ok: false, message };
  }
}

export type ServerCartItem = {
  productId: {
    id: string;
    name: string;
    description?: string;
    price: number;
    discountPrice?: number;
    images?: string[];
    details?: { brand?: string };
  };
  quantity: number;
  priceAtAdd?: number;
  lineTotal?: number;
  _id: string;
};

export type ServerCartResponse = {
  cart: {
    cartId: string;
    items: ServerCartItem[];
  };
  totals?: {
    quantity?: number;
    items?: number;
    totalAmount?: number;
  };
};

export async function getCartFull(): Promise<ServerCartResponse | null> {
  const cartId = getKasiUserId();
  if (!cartId) return null;
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '');
  const url = `${base}/api/cart/full/${encodeURIComponent(cartId)}?populate=true`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function addToCart(productId: string, quantity: number = 1, priceAtAdd?: number): Promise<{ ok: boolean; message?: string }>{
  const cartId = getKasiUserId();
  if (!cartId) return { ok: false, message: 'Identifiant client introuvable' };

  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '');
  try {
    const res = await fetch(`${base}/api/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartId, productId, quantity, priceAtAdd }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, message: text || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e: unknown) {
    const message =
      typeof e === 'object' && e !== null && 'message' in e
        ? String((e as { message?: unknown }).message)
        : 'Erreur réseau';
    return { ok: false, message };
  }
}
