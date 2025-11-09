// src/pages/WishlistPage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { useWishlist } from "../store/wishlist";
import type { Product } from "../types/product";
import { db, collection, getDocs, query, where } from "../lib/firestore";

export default function WishlistPage() {
  const wl = useWishlist() as any; // store exposes { ids, has, toggle }
  const ids: string[] = wl?.ids ?? [];
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!ids.length) { setProducts([]); return; }
      setLoading(true);

      // Firestore `in` supports up to 10 values
      const chunks: string[][] = [];
      for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));

      const col = collection(db, "products");
      const results: Product[] = [];
      for (const slugs of chunks) {
        const qy = query(col, where("slug", "in", slugs));
        const snap = await getDocs(qy);
        snap.forEach(d => results.push({ id: d.id, ...(d.data() as Product) }));
      }

      if (!cancelled) setProducts(results);
      setLoading(false);
    };
    run();
    return () => { cancelled = true; };
  }, [ids]);

  return (
    <div className="bg-background-light min-h-screen font-display flex flex-col">
      <header className="top-0 z-10 flex items-center p-4 bg-[var(--bg)]/80 backdrop-blur border-b border-[var(--border)]">
        <button onClick={() => nav(-1)} className="h-10 w-10" aria-label="Back">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center text-xl font-bold">Wishlist</h1>
        <div className="h-10 w-10" />
      </header>

      <main className="grid grid-cols-2 gap-4 p-4 pb-24 flex-1">
        {loading && (
          <div className="col-span-2 p-6 card text-center">Loading…</div>
        )}

        {!loading && ids.length > 0 && products.length === 0 && (
          <div className="col-span-2 p-6 card text-center">
            No matching products found.
          </div>
        )}

        {!loading && ids.length === 0 && (
          <div className="col-span-2 p-6 card text-center">
            No items in wishlist.
          </div>
        )}

        {products.map((p) => (
          <Link key={p.id} to={`/p/${p.slug}`} className="card overflow-hidden">
            <img
              className="w-full aspect-[3/4] object-cover"
              src={p.images?.[0] || ""}
              alt={p.title}
            />
            <div className="p-3">
              <p className="font-medium line-clamp-2" title={p.title}>{p.title}</p>
              <p className="text-sm text-[color:var(--text-secondary)]">₹{p.price}</p>
            </div>
          </Link>
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
