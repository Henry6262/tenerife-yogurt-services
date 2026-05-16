import { useState, useEffect, useCallback } from "react";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface AppliedPromo {
  code: string;
  stripeCouponId: string;
  discountType: string;
  discountValue: number;
}

const CART_KEY = "yogurt-cart";
const PROMO_KEY = "yogurt-promo";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function loadPromo(): AppliedPromo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROMO_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function savePromo(promo: AppliedPromo | null) {
  if (typeof window === "undefined") return;
  if (promo) localStorage.setItem(PROMO_KEY, JSON.stringify(promo));
  else localStorage.removeItem(PROMO_KEY);
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promo, setPromoState] = useState<AppliedPromo | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setPromoState(loadPromo());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveCart(items);
  }, [items, hydrated]);

  useEffect(() => {
    if (hydrated) savePromo(promo);
  }, [promo, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setPromoState(null);
  }, []);

  const setPromo = useCallback((p: AppliedPromo | null) => {
    setPromoState(p);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  let discount = 0;
  if (promo) {
    if (promo.discountType === "percentage") {
      discount = subtotal * (promo.discountValue / 100);
    } else {
      discount = Math.min(promo.discountValue, subtotal);
    }
  }

  const totalPrice = Math.max(0, subtotal - discount);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    promo,
    setPromo,
    totalItems,
    subtotal,
    discount,
    totalPrice,
    hydrated,
  };
}
