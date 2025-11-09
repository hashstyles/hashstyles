import React from "react";
import { Link } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import SearchBar from "../components/SearchBar";
import { db, collection, getDocs, orderBy, query } from "../lib/firestore";
import { useEffect, useState } from "react";
import AppHeader from "../components/AppHeader";


type Category = { id: string; name: string; slug: string; image?: string; sort?: number };

export default function HomePage(){

  const [cats, setCats] = useState<Category[]>([]);

    useEffect(() => {
      (async () => {
        const q = query(collection(db, "categories"), orderBy("sort"));
        const snap = await getDocs(q);
        setCats(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
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
            src="https://plus.unsplash.com/premium_photo-1683121269108-1bd195cd18cf?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fHNob3BwaW5nfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=500"
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
        <h3 className="section-title mb-3">New Arrivals</h3>
        <div className="grid grid-cols-2 gap-3">
          {/* {[
            {t:"Floral Breeze Kurti", p:"49.99"},
            {t:"Pastel Dream Set", p:"54.99"},
            ].map(a=>(
            <div key={a.t} className="card overflow-hidden">
              <img className="w-full aspect-[3/4] object-cover"
                   src="https://images.unsplash.com/photo-1542060748-10c28b62716a?q=80&w=1200&auto=format&fit=crop"/>
              <div className="p-3">
                <p className="font-medium">{a.t}</p>
                <p className="text-sm">${a.p}</p>
              </div>
            </div>
          ))} */}
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
