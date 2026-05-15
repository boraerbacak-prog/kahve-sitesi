"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  weight: number;
  grind: string;
};

type CartContext = {
  items: CartItem[];
  addItem: (item: { id: string; name: string; price: number; image: string; weight: number; grind: string }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartCtx = createContext<CartContext | null>(null);

function makeCartId(productId: string, weight: number, grind: string): string {
  return `${productId}:${weight}:${grind}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try { setItems(JSON.parse(stored)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item: { id: string; name: string; price: number; image: string; weight: number; grind: string }) => {
    const cartId = makeCartId(item.id, item.weight, item.grind);
    const unitPrice = item.price * (item.weight / 1000);

    setItems(prev => {
      const existing = prev.find(i => i.id === cartId);
      if (existing) {
        return prev.map(i => i.id === cartId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: cartId, name: item.name, price: unitPrice, quantity: 1, image: item.image, weight: item.weight, grind: item.grind }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty <= 0) { removeItem(id); return; }
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartCtx.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      total, count, isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false)
    }}>
      {children}
    </CartCtx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
