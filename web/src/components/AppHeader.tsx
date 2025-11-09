import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import logo from "../assets/logo_hash.png";

export default function AppHeader() {
  const [sp] = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const nav = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    nav(`/shop?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="z-10 w-full border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        {/* Logo */}
        <Link to="/" className="shrink-0 flex items-center gap-2">
          <img
            src={logo}
            alt="Hash"
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* Search */}
        <form onSubmit={submit} className="flex-1">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-secondary)]">
              search
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="w-full h-10 rounded-xl pl-10 pr-3 border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>
        </form>

        {/* Cart */}
        <Link
          to="/cart"
          className="shrink-0 h-10 w-10 grid place-items-center rounded-xl hover:bg-black/5"
          aria-label="Cart"
        >
          <span className="material-symbols-outlined">shopping_bag</span>
        </Link>
      </div>
    </header>
  );
}
