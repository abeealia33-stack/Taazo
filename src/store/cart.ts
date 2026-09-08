"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  /** Stable per-line key. Configured gift boxes differ line to line. */
  id: string;
  slug: string;
  name: string;
  price: number;
  qty: number;
  size: string;
  accent: string;
  photo: string | null;
  /** Present on configured gift boxes only. */
  giftBox?: {
    bottles: number;
    items: { slug: string; name: string; qty: number }[];
    noteCard?: string;
    recipientName?: string;
  };
};

type CartState = {
  lines: CartLine[];
  open: boolean;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      open: false,

      add: (line, qty = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.id === line.id);
          const lines = existing
            ? state.lines.map((l) =>
                l.id === line.id ? { ...l, qty: l.qty + qty } : l,
              )
            : [...state.lines, { ...line, qty }];
          return { lines, open: true };
        }),

      remove: (id) =>
        set((state) => ({ lines: state.lines.filter((l) => l.id !== id) })),

      setQty: (id, qty) =>
        set((state) => ({
          lines:
            qty <= 0
              ? state.lines.filter((l) => l.id !== id)
              : state.lines.map((l) => (l.id === id ? { ...l, qty } : l)),
        })),

      clear: () => set({ lines: [] }),
      setOpen: (open) => set({ open }),
    }),
    {
      name: "taazo-cart",
      // `open` is per-visit UI state and must never be restored from storage.
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
);

export function cartCount(lines: CartLine[]) {
  return lines.reduce((n, l) => n + l.qty, 0);
}

export function cartSubtotal(lines: CartLine[]) {
  return lines.reduce((n, l) => n + l.price * l.qty, 0);
}
