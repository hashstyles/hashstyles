import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "../types/product";
import { useAuth } from "../context/AuthProvider";
import { db, collection, doc, setDoc, deleteDoc, getDocs } from "../lib/firestore";

type CtxT = {
  ids: string[];
  has: (slug: string) => boolean;
  toggle: (p: Product) => Promise<void>;
};
const Ctx = createContext<CtxT | null>(null);
export const useWishlist = () => { const v = useContext(Ctx); if (!v) throw new Error("WishlistProvider missing"); return v; };

export const WishlistProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { user } = useAuth();
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      if (!user) { setIds([]); return; }
      const snap = await getDocs(collection(db, "users", user.uid, "wishlist"));
      setIds(snap.docs.map(d => d.id));
    })();
  }, [user?.uid]);

  const has = (slug: string) => ids.includes(slug);
  const toggle = async (p: Product) => {
    if (!user) return; // you can redirect to login if you want
    const ref = doc(db, "users", user.uid, "wishlist", p.slug);
    if (ids.includes(p.slug)) {
      await deleteDoc(ref);
      setIds(prev => prev.filter(x => x !== p.slug));
    } else {
      await setDoc(ref, { productRef: doc(db, "products", p.id) });
      setIds(prev => [...prev, p.slug]);
    }
  };

  const value = useMemo(() => ({ ids, has, toggle }), [ids]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
