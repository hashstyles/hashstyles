import { Link } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { db, collection, getDocs, orderBy, query, limit } from "../lib/firestore";
import { useEffect, useState } from "react";
import AppHeader from "../components/AppHeader";
import type { Product } from "../types/product";


type Category = { id: string; name: string; slug: string; image?: string; sort?: number };

export default function HomePage(){

  const [cats, setCats] = useState<Category[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);

    useEffect(() => {
      (async () => {
        const q = query(collection(db, "categories"), orderBy("sort"));
        const snap = await getDocs(q);
        setCats(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));

        // NEW ARRIVALS (just a teaser for home)
    const qNew = query(
      collection(db, "products"),
      orderBy("createdAt", "desc"),
      limit(4) // show 4/6/8 as you like
    );
    const snapNew = await getDocs(qNew);
    setNewProducts(snapNew.docs.map(d => ({ id: d.id, ...(d.data() as Product) })));

      })();
    }, []);
  return (
    <div className="bg-background-light min-h-screen font-display">
      {/* Top bar */}
      <AppHeader />
      

      {/* Hero */}
      <section className="p-4">
        <div className="card overflow-hidden">
          <img
            className="w-full aspect-[16/9] object-cover"
            src="https://fashionsuggest.in/wp-content/uploads/2018/05/kurti-banner-compressed-1021x580.jpg"
          />
          <div className="p-4">
            <h2 className="text-xl font-bold">Elegance Redefined</h2>
            <p className="text-sm text-[color:var(--text-secondary)]">Discover the latest trends for the season.</p>
            <Link to="/shop" className="inline-block mt-3 btn-primary px-5">Shop Now</Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4">
        <h3 className="section-title mb-3">Shop by Category</h3>
        <div className="grid grid-cols-2 gap-3">
          {cats.map(c => (
            <Link key={c.id} to={`/shop?cat=${c.slug}`} className="card h-36 flex items-end p-3"
              style={{ backgroundImage: c.image ? `url(${c.image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'top center' }}>
              <span className="font-semibold bg-white/80 px-2 py-1 rounded">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals (static teaser) */}
      <section className="px-4 mt-6 pb-24">
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-title">New Arrivals</h3>
          <Link to="/new" className="text-sm font-semibold text-primary-700">See all</Link>
        </div>

        {newProducts.length === 0 ? (
          <div className="text-sm text-[color:var(--text-secondary)]">No new items yet.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {newProducts.map(p => (
              <Link key={p.id} to={`/p/${p.slug}`} className="card overflow-hidden">
                <img className="w-full aspect-[3/4] object-cover" src={p.images?.[0] || ""} alt={p.title}/>
                <div className="p-3">
                  <p className="font-medium">{p.title}</p>
                  <p className="text-sm text-[color:var(--text-secondary)]">₹{p.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      
      <BottomNav />
    </div>
  );
}
