// src/store/cart.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "../types/product";
import { useAuth } from "../context/AuthProvider";
import { db } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

type CartItem = { product: Product; size?: string; qty: number };

type CartCtx = {
  items: CartItem[];
  add: (p: Product, size?: string, qty?: number) => Promise<void>;
  remove: (slug: string, size?: string) => Promise<void>;
  inc: (slug: string, size?: string) => Promise<void>;
  dec: (slug: string, size?: string) => Promise<void>;
  clear: () => Promise<void>;
  total: number;
};

const Ctx = createContext<CartCtx | null>(null);

export const useCart = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("CartProvider missing");
  return v;
};

// Build a unique Firestore doc id per product+size
const lineId = (slug: string, size?: string) => (size ? `${slug}__${size}` : slug);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const nav = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from Firestore whenever user changes
  useEffect(() => {
    (async () => {
      if (!user) {
        setItems([]);
        return;
      }
      const snap = await getDocs(collection(db, "users", user.uid, "cart"));
      const rows: CartItem[] = [];
      for (const d of snap.docs) {
        const data = d.data() as any;
        const pref = data.productRef ? await getDoc(data.productRef) : null;
        if (pref && pref.exists()) {
          rows.push({
            product: { id: pref.id, ...(pref.data() as Product) },
            qty: Number(data.qty || 1),
            size: data.size || undefined,
          });
        }
      }
      setItems(rows);
    })();
  }, [user?.uid]);

  // If not signed in, send them to sign-in/profile and return false
  const ensureAuth = (): boolean => {
    if (!user) {
      // change to "/signin" if you have a dedicated sign-in route
      nav("/profile", { replace: true });
      return false;
    }
    return true;
  };

  const writeMerge = async (
    slug: string,
    size: string | undefined,
    data: Record<string, any>
  ) => {
    if (!ensureAuth()) return;
    const id = lineId(slug, size);
    const ref = doc(db, "users", user!.uid, "cart", id);
    await setDoc(
      ref,
      {
        ...data,
        size: size ?? null,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const add: CartCtx["add"] = async (p, size, qty = 1) => {
    if (!ensureAuth()) return;

    const id = lineId(p.slug, size);
    const ref = doc(db, "users", user!.uid, "cart", id);

    // Read current qty from Firestore (avoid races with local state)
    const snap = await getDoc(ref);
    const prevQty = snap.exists() ? Number((snap.data() as any).qty || 0) : 0;
    const newQty = prevQty + qty;

    await setDoc(
      ref,
      {
        productRef: doc(db, "products", p.id as string),
        qty: newQty,
        size: size ?? null,
        addedAt: snap.exists() ? (snap.data() as any).addedAt ?? serverTimestamp() : serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Optimistic UI update
    setItems((prev) => {
      const i = prev.findIndex((x) => x.product.slug === p.slug && x.size === size);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + qty };
        return copy;
      }
      return [...prev, { product: p, size, qty }];
    });
  };

  const remove: CartCtx["remove"] = async (slug, size) => {
    if (!ensureAuth()) return;
    const id = lineId(slug, size);
    try {
      await deleteDoc(doc(db, "users", user!.uid, "cart", id));
    } catch (e) {
      console.error("[Cart.remove] failed", id, e);
    }
    setItems((prev) => prev.filter((x) => !(x.product.slug === slug && x.size === size)));
  };

  const inc: CartCtx["inc"] = async (slug, size) => {
    if (!ensureAuth()) return;
    const id = lineId(slug, size);
    const ref = doc(db, "users", user!.uid, "cart", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const cur = Number((snap.data() as any).qty || 1) + 1;
    await writeMerge(slug, size, { qty: cur });
    setItems((prev) =>
      prev.map((x) =>
        x.product.slug === slug && x.size === size ? { ...x, qty: x.qty + 1 } : x
      )
    );
  };

  const dec: CartCtx["dec"] = async (slug, size) => {
    if (!ensureAuth()) return;
    const id = lineId(slug, size);
    const ref = doc(db, "users", user!.uid, "cart", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const cur = Math.max(1, Number((snap.data() as any).qty || 1) - 1);
    await writeMerge(slug, size, { qty: cur });
    setItems((prev) =>
      prev.map((x) =>
        x.product.slug === slug && x.size === size ? { ...x, qty: Math.max(1, x.qty - 1) } : x
      )
    );
  };

  const clear = async () => {
    if (!ensureAuth()) return;
    const copy = [...items];
    setItems([]);
    await Promise.all(
      copy.map((i) =>
        deleteDoc(doc(db, "users", user!.uid, "cart", lineId(i.product.slug, i.size)))
      )
    );
  };

  const total = useMemo(
    () => items.reduce((s, i) => s + i.qty * Number(i.product.price ?? 0), 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, add, remove, inc, dec, clear, total }),
    [items, total]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
