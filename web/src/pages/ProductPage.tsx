// src/pages/ProductPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import type { Product } from "../types/product";
import { useCart } from "../store/cart";
import { useWishlist } from "../store/wishlist";
import { useAuth } from "../context/AuthProvider";

export default function ProductPage() {
  const { slug } = useParams();
  const nav = useNavigate();
  const loc = useLocation();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [size, setSize] = useState<string | undefined>();
  const { add } = useCart();
  const { toggle, has } = useWishlist();

  useEffect(() => {
    (async () => {
      if (!slug) return;
      const qy = query(collection(db, "products"), where("slug", "==", slug));
      const snap = await getDocs(qy);
      if (!snap.empty) setProduct({ id: snap.docs[0].id, ...(snap.docs[0].data() as Product) });
    })();
  }, [slug]);

  if (!product) return <div className="p-6">Loading…</div>;

  const share = async () => {
    const url = `${window.location.origin}/p/${product.slug}`;
    const title = product.title;
    const text = `Check this out on Hashstyles: ${title}`;
    try {
      if (navigator.share) await navigator.share({ title, text, url });
      else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(url); alert("Link copied to clipboard"); }
      else {
        const ta = document.createElement("textarea");
        ta.value = url; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
        alert("Link copied to clipboard");
      }
    } catch {}
  };

  const wishlisted = has(product.slug);

  return (
    <div className="bg-background-light min-h-screen font-display">
      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between p-4 bg-[var(--bg)]/80 backdrop-blur border-b border-[var(--border)]">
        <button onClick={() => nav(-1)} className="h-10 w-10" aria-label="Back">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex items-center gap-2">
          <button onClick={share} className="h-12 w-12 rounded-full" aria-label="Share">
            <span className="material-symbols-outlined">share</span>
          </button>
          <button
            onClick={() => toggle(product)}
            className="h-12 w-12 rounded-full"
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <span
              className="material-symbols-outlined transition-colors duration-200"
              style={{
                fontVariationSettings: wishlisted ? "'FILL' 1" : "'FILL' 0",
                color: wishlisted ? "#ef4444" : "#9ca3af",
                fontSize: "28px",
              }}
            >
              favorite
            </span>
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="px-4">
        <div
          className="w-full aspect-[3/4] bg-center bg-cover rounded-xl"
          style={{ backgroundImage: `url(${product.images?.[0] || ""})` }}
        />
      </div>

      {/* Info */}
      <div className="p-4 pt-6 space-y-4">
        <p className="text-sm font-semibold uppercase text-primary-600">Hash</p>
        <h1 className="text-3xl font-bold">{product.title}</h1>
        <div className="flex items-baseline gap-3">
          <h2 className="text-3xl font-bold">₹{product.price}</h2>
      </div>
      </div>

      {/* Sizes */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Select Size</h3>
          <a className="text-sm font-medium text-primary-600" href="#">Size Guide</a>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {(product.sizes || ["S", "M", "L", "XL", "XXL"]).map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`p-3 border rounded-lg font-semibold ${size === s ? "text-white bg-primary-500 border-primary-500" : "border-[var(--border)]"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="h-28" />
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t border-[var(--border)]">
        <button
          onClick={async () => {
            if (!product) return;
            if ((product.sizes?.length ?? 0) > 0 && !size) {
              alert("Please select a size");
              return;
            }
            // 🔒 If not signed in, send to sign-in and remember intent
            if (!user) {
              sessionStorage.setItem("after_signin_action", JSON.stringify({ type: "addToCart", slug: product.slug, size }));
              // send them to your sign-in/profile page and return to this product afterwards
              nav(`/profile?next=${encodeURIComponent(loc.pathname + loc.search)}`);
              return;
            }
            // Signed-in: add then go to cart
            try {
              await add(product, size, 1);
              nav("/cart");
            } catch (e) {
              // if store still throws for auth for any reason, redirect
              nav(`/profile?next=${encodeURIComponent(loc.pathname + loc.search)}`);
            }
          }}
          className="w-full h-14 btn-primary text-lg"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
