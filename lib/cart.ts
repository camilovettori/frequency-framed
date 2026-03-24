export type CartItem = {
  id: string;
  title: string;
  price: number;
  image: string;
};

const CART_KEY = "frequency_framed_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  const exists = cart.some((cartItem) => cartItem.id === item.id);

  if (exists) return false;

  cart.push(item);
  saveCart(cart);
  return true;
}

export function removeFromCart(id: string) {
  const updated = getCart().filter((item) => item.id !== id);
  saveCart(updated);
  return updated;
}

export function clearCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
}

export function getCartTotal(items?: CartItem[]) {
  const source = items ?? getCart();
  return source.reduce((acc, item) => acc + item.price, 0);
}