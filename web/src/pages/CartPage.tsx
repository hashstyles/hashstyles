import React from "react";
import { useCart } from "../store/cart";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


export default function CartPage() {
  const { items, inc, dec, remove, total } = useCart();
  const nav = useNavigate();
  return (
    <div className="bg-background-light min-h-screen font-display">
      <header className="sticky top-0 z-10 flex items-center p-4 bg-[var(--bg)]/80 backdrop-blur border-b border-[var(--border)]">
        <button onClick={() => nav(-1)} className="h-10 w-10" aria-label="Back">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center text-xl font-bold">My Cart</h1>
        <div className="w-10" />
      </header>

      <main className="px-4 pb-32">
        <div className="flex flex-col gap-4 pt-4">
          {items.map(({ product, qty, size }) => (
            <div key={product.slug} className="flex gap-4 card p-4">
              <div className="h-24 w-24 rounded-md bg-cover bg-center" style={{ backgroundImage: `url(${product.images?.[0] || ""})` }} />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-base font-semibold">{product.title}</p>
                  {size && <p className="text-sm text-[color:var(--text-secondary)]">Size: {size}</p>}
                  <p className="mt-1 text-base font-bold text-primary-600">₹{product.price}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => dec(product.slug, size)} className="h-7 w-7 rounded-full bg-gray-100">-</button>
                    <span className="text-base font-medium">{qty}</span>
                    <button onClick={() => inc(product.slug, size)} className="h-7 w-7 rounded-full bg-gray-100">+</button>
                  </div>
                  <button onClick={() => remove(product.slug, size)} className="h-8 w-8 rounded-full hover:bg-red-50">
                    <span className="material-symbols-outlined text-gray-500 hover:text-red-600">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 card p-4">
          <h3 className="text-lg font-bold">Order Summary</h3>
          <div className="mt-4 flex flex-col gap-3 border-t pt-4">
            <div className="flex justify-between text-base"><p className="text-[color:var(--text-secondary)]">Subtotal</p><p className="font-medium">₹{total.toFixed(2)}</p></div>
            <div className="flex justify-between text-base"><p className="text-[color:var(--text-secondary)]">Shipping</p><p className="font-medium">₹0.00</p></div>
            <div className="mt-2 flex justify-between border-t border-dashed pt-3">
              <p className="text-lg font-bold">Total</p>
              <p className="text-xl font-bold text-primary-600">₹{total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t border-[var(--border)]">
        <Link to="/checkout" className="block">
          <button className="h-14 w-full btn-primary text-lg">Proceed to Checkout</button>
        </Link>
      </footer>
    </div>
  );
}
