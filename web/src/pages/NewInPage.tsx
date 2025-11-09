import React, { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { db } from "../firebase";
import type { Product } from "../types/product";
import { Link, useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";

export default function NewInPage(){
  const [products, setProducts] = useState<Product[]>([]);
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      const q = query(collection(db, "products"), orderBy("createdAt","desc"), limit(12));
      const snap = await getDocs(q);
      setProducts(snap.docs.map(d => ({ id: d.id, ...(d.data() as Product) })));
    })();
  }, []);

  return (
    <div className="bg-background-light min-h-screen font-display">
      <header className="top-0 z-10 flex items-center p-4 bg-[var(--bg)]/80 backdrop-blur border-b border-[var(--border)]">
        <button onClick={() => nav(-1)} className="h-10 w-10" aria-label="Back">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center text-xl font-bold">New In</h1>
        <div className="h-10 w-10" />
      </header>

      <main className="grid grid-cols-2 gap-4 p-4 pb-24">
        {products.map(p => (
          <Link key={p.id} to={`/p/${p.slug}`} className="card overflow-hidden">
            <img className="w-full aspect-[3/4] object-cover" src={p.images?.[0] || ""} />
            <div className="p-3">
              <p className="font-medium">{p.title}</p>
              <p className="text-sm text-[color:var(--text-secondary)]">₹{p.price}</p>
            </div>
          </Link>
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
