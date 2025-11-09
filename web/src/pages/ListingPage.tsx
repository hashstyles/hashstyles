// src/pages/ListingPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import type { Product } from "../types/product";
import BottomNav from "../components/BottomNav";

type SortKey = "new" | "price-asc" | "price-desc";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function ListingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();

  const catParam = (sp.get("cat") || "").toLowerCase().trim();
  const q = (sp.get("q") || "").toLowerCase().trim();
  const sort: SortKey = (sp.get("sort") as SortKey) || "new";
  const min = sp.get("min") ? Number(sp.get("min")) : undefined;
  const max = sp.get("max") ? Number(sp.get("max")) : undefined;
  const sizesSelected = (sp.get("sizes") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    (async () => {
      const qy = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const snap = await getDocs(qy);
      setProducts(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Product) })));
    })();
  }, []);

  const norm = (s?: string) => (s || "").toLowerCase();

  const filteredSorted = useMemo(() => {
    let list = products;

    if (catParam) {
      list = list.filter((p) => {
        const fromName = slugify(p.category || "");
        const fromDoc = (p as any).categorySlug?.toLowerCase?.() || "";
        return fromName === catParam || fromDoc === catParam;
      });
    }

    if (q) {
      list = list.filter((p) => {
        const title = norm(p.title);
        const desc = norm((p as any).description);
        const category = norm(p.category);
        const tags = Array.isArray((p as any).tags) ? (p as any).tags.map(norm).join(" ") : "";
        return title.includes(q) || desc.includes(q) || category.includes(q) || tags.includes(q);
      });
    }

    if (typeof min === "number" && !Number.isNaN(min)) list = list.filter((p) => (p.price ?? 0) >= min);
    if (typeof max === "number" && !Number.isNaN(max)) list = list.filter((p) => (p.price ?? Infinity) <= max);

    if (sizesSelected.length) {
      list = list.filter((p) => {
        const sizes = (p.sizes || []) as string[];
        return sizes.some((s) => sizesSelected.includes(s));
      });
    }

    const copy = [...list];
    switch (sort) {
      case "price-asc":
        copy.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case "price-desc":
        copy.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case "new":
      default:
        break;
    }
    return copy;
  }, [products, catParam, q, min, max, sizesSelected, sort]);

  const writeParam = (k: string, v?: string) => {
    const next = new URLSearchParams(sp);
    if (!v || v === "new") next.delete(k);
    else next.set(k, v);
    setSp(next, { replace: true });
  };

  const updateRange = (which: "min" | "max", val: string) => {
    if (!val) return writeParam(which, undefined);
    const n = Math.max(0, Number(val) || 0).toString();
    writeParam(which, n);
  };

  const toggleSize = (s: string) => {
    const set = new Set(sizesSelected);
    if (set.has(s)) set.delete(s);
    else set.add(s);
    const joined = Array.from(set).join(",");
    writeParam("sizes", joined || undefined);
  };

  return (
    <div className="bg-background-light min-h-screen font-display">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-[var(--bg)]/80 backdrop-blur border-b border-[var(--border)]">
        <button onClick={() => nav(-1)} className="h-10 w-10" aria-label="Back">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold">Shop</h1>
        <Link to="/cart" className="h-10 w-10 flex items-center justify-center">
          <span className="material-symbols-outlined">shopping_bag</span>
        </Link>
      </header>

      {/* Sort & Filter pills */}
      <div className="sticky top-[64px] z-10 bg-[var(--bg)]/80 backdrop-blur">
        <div className="flex gap-3 px-4 py-3">
          <button
            onClick={() => {
              setShowSort((v) => !v);
              setShowFilter(false);
            }}
            className="flex-1 h-10 rounded-xl border border-[var(--border)] bg-primary-50 text-primary-700 font-semibold flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">swap_vert</span>
            {sort === "price-asc" ? "Price ↑" : sort === "price-desc" ? "Price ↓" : "Newest"}
          </button>
          <button
            onClick={() => {
              setShowFilter((v) => !v);
              setShowSort(false);
            }}
            className="flex-1 h-10 rounded-xl border border-[var(--border)] bg-primary-50 text-primary-700 font-semibold flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">filter_list</span>
            Filter
          </button>
        </div>
      </div>

      {/* Sort sheet */}
      {showSort && (
        <div className="px-4 relative z-20">
          <div className="card p-2 mb-2">
            {([
              { k: "new", label: "Newest" },
              { k: "price-asc", label: "Price: Low to High" },
              { k: "price-desc", label: "Price: High to Low" },
            ] as const).map((opt) => (
              <button
                key={opt.k}
                type="button"
                onClick={() => {
                  writeParam("sort", opt.k === "new" ? undefined : opt.k);
                  setShowSort(false);
                }}
                className={`w-full text-left px-3 py-3 rounded-lg ${
                  sort === opt.k ? "bg-primary-50 text-primary-700 font-semibold" : "hover:bg-black/5"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter sheet */}
      {showFilter && (
        <div className="px-4 relative z-20">
          <div className="card p-4 mb-2 space-y-4">
            {/* Price */}
            <div>
              <p className="font-semibold mb-2">Price</p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  inputMode="numeric"
                  placeholder="Min"
                  defaultValue={min ?? ""}
                  onBlur={(e) => updateRange("min", e.target.value)}
                  className="h-10 rounded-xl border border-[var(--border)] px-3 focus:ring-2 focus:ring-primary-300"
                />
                <input
                  inputMode="numeric"
                  placeholder="Max"
                  defaultValue={max ?? ""}
                  onBlur={(e) => updateRange("max", e.target.value)}
                  className="h-10 rounded-xl border border-[var(--border)] px-3 focus:ring-2 focus:ring-primary-300"
                />
              </div>
            </div>

            {/* Sizes */}
            <div>
              <p className="font-semibold mb-2">Size</p>
              <div className="grid grid-cols-6 gap-2">
                {["XS", "S", "M", "L", "XL", "XXL"].map((s) => {
                  const active = sizesSelected.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      className={`h-10 rounded-lg border font-semibold ${
                        active ? "bg-primary-600 text-white border-primary-600" : "border-[var(--border)]"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 h-11 rounded-xl border border-[var(--border)]"
                onClick={() => {
                  const next = new URLSearchParams(sp);
                  ["min", "max", "sizes"].forEach((k) => next.delete(k));
                  setSp(next, { replace: true });
                }}
              >
                Clear
              </button>
              <button
                type="button"
                className="flex-1 h-11 rounded-xl bg-primary-600 text-white font-semibold"
                onClick={() => setShowFilter(false)}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <main className="grid grid-cols-2 gap-4 p-4 pb-24">
        {filteredSorted.length === 0 && (
          <div className="col-span-2 text-center text-sm text-[color:var(--text-secondary)] py-10">
            No products found{q ? ` for “${q}”` : ""}{catParam ? ` in ${catParam}` : ""}.
          </div>
        )}

        {filteredSorted.map((p) => (
          <Link key={p.id} to={`/p/${p.slug}`} className="card overflow-hidden">
            <img className="w-full aspect-[3/4] object-cover" src={p.images?.[0] || ""} alt={p.title} />
            <div className="p-3">
              <p className="text-base font-medium">{p.title}</p>
              <p className="text-sm text-[color:var(--text-secondary)]">₹{p.price}</p>
            </div>
          </Link>
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
