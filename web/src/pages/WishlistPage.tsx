import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "../store/wishlist";
import BottomNav from "../components/BottomNav";
import type { Product } from "../types/product";

export default function WishlistPage() {
  // be defensive if provider/store hasn't populated yet
  const wl = useWishlist(); // could be undefined in edge cases
  type WLItem = { product: Product };
  const items: WLItem[] = (wl as any)?.items ?? [];
  const nav = useNavigate();

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
        {items.length === 0 && (
          <div className="col-span-2 p-6 card text-center">
            No items in wishlist.
          </div>
        )}

        {items.map(({ product }) => (
          <Link
            key={product.slug}
            to={`/p/${product.slug}`}
            className="card overflow-hidden"
          >
            <img
              className="w-full aspect-[3/4] object-cover"
              src={product.images?.[0] || ""}
              alt={product.title}
            />
            <div className="p-3">
              <p className="font-medium">{product.title}</p>
              <p className="text-sm text-[color:var(--text-secondary)]">
                ₹{product.price}
              </p>
            </div>
          </Link>
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
