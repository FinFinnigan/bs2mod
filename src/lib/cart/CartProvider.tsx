"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import type { CartItem, CartState, ProductCard, ProductVariant } from "@/lib/types";
import { SITE } from "@/lib/data/site";

const STORAGE_KEY = "boyshop.cart.v1";

type Action =
  | { type: "ADD"; product: ProductCard; variant: ProductVariant; qty: number }
  | { type: "UPDATE"; variantId: string; qty: number }
  | { type: "REMOVE"; variantId: string }
  | { type: "HYDRATE"; items: CartItem[] };

function itemTotal(product: ProductCard, variant: ProductVariant, qty: number) {
  const unit = variant.price?.amount ?? product.price.amount;
  return unit * qty;
}

function buildCart(items: CartItem[]): CartState {
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const discounts = [] as { label: string; amount: number }[];
  const total = subtotal - discounts.reduce((s, d) => s + d.amount, 0);
  return {
    items,
    itemCount,
    subtotal,
    discounts,
    total,
    freeShippingThreshold: SITE.freeShippingThreshold,
    amountToFreeShipping: Math.max(0, SITE.freeShippingThreshold - subtotal),
  };
}

function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case "ADD": {
      const existing = state.find((i) => i.variant.id === action.variant.id);
      if (existing) {
        return state.map((i) =>
          i.variant.id === action.variant.id
            ? {
                ...i,
                quantity: i.quantity + action.qty,
                lineTotal: itemTotal(action.product, action.variant, i.quantity + action.qty),
              }
            : i
        );
      }
      return [
        ...state,
        {
          product: action.product,
          variant: action.variant,
          quantity: action.qty,
          lineTotal: itemTotal(action.product, action.variant, action.qty),
        },
      ];
    }
    case "UPDATE": {
      if (action.qty <= 0) return state.filter((i) => i.variant.id !== action.variantId);
      return state.map((i) =>
        i.variant.id === action.variantId
          ? { ...i, quantity: action.qty, lineTotal: itemTotal(i.product, i.variant, action.qty) }
          : i
      );
    }
    case "REMOVE":
      return state.filter((i) => i.variant.id !== action.variantId);
    case "HYDRATE":
      return action.items;
    default:
      return state;
  }
}

interface CartContextValue {
  cart: CartState;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: ProductCard, variant: ProductVariant, qty?: number) => void;
  updateQty: (variantId: string, qty: number) => void;
  removeItem: (variantId: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(reducer, []);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "HYDRATE", items: JSON.parse(raw) });
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota errors
    }
  }, [items, hydrated]);

  const addItem = useCallback(
    (product: ProductCard, variant: ProductVariant, qty = 1) => {
      dispatch({ type: "ADD", product, variant, qty });
      setIsOpen(true);
    },
    []
  );

  const updateQty = useCallback((variantId: string, qty: number) => {
    dispatch({ type: "UPDATE", variantId, qty });
  }, []);

  const removeItem = useCallback((variantId: string) => {
    dispatch({ type: "REMOVE", variantId });
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const cart = useMemo(() => buildCart(items), [items]);

  const value = useMemo(
    () => ({ cart, isOpen, openCart, closeCart, addItem, updateQty, removeItem }),
    [cart, isOpen, openCart, closeCart, addItem, updateQty, removeItem]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
