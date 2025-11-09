import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../store/cart";
import { useAuth } from "../context/AuthProvider";
import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
  runTransaction,
} from "../lib/firestore";

type Addr = {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  pin: string;
  phone: string;
  isDefault?: boolean;
};

async function nextOrderNumber(prefix: string) {
  const counterRef = doc(db, "order_counters", prefix);
  const seq = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const current = snap.exists() ? Number((snap.data() as any).seq || 0) : 0;
    const next = current + 1;
    if (snap.exists()) tx.update(counterRef, { seq: next });
    else tx.set(counterRef, { seq: next });
    return next;
  });
  return `${prefix}${String(seq).padStart(4, "0")}`; // e.g. 2025000001
}

export default function CheckoutPage() {
  const nav = useNavigate();
  const { items, total, clear } = useCart();
  const { user } = useAuth();

  const [addr, setAddr] = useState<Addr | null>(null);
  const [loadingAddr, setLoadingAddr] = useState(true);

  // Load selected address (from sessionStorage), else fallback to default
  const loadAddress = async () => {
    if (!user) return;
    setLoadingAddr(true);

    const chosenId = sessionStorage.getItem("checkout_addr_id");
    if (chosenId) {
      const ref = doc(db, "users", user.uid, "addresses", chosenId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setAddr(snap.data() as Addr);
        setLoadingAddr(false);
        return;
      }
      // if selected id no longer exists, clear and fall back
      sessionStorage.removeItem("checkout_addr_id");
    }

    // fallback: fetch default address
    const snap = await getDocs(collection(db, "users", user.uid, "addresses"));
    const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Addr) }));
    const def = rows.find((r) => r.isDefault);
    const first = rows[0];
    setAddr((def || first || null) as any);
    setLoadingAddr(false);
  };

  useEffect(() => {
    if (user) void loadAddress();
  }, [user?.uid]);

  // Re-check when user returns from Addresses (mobile back, etc.)
  useEffect(() => {
    const onFocus = () => { if (user) void loadAddress(); };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user?.uid]);

  const placeOrder = async () => {
    if (!user) { alert("Please sign in to place order"); return; }
    if (!items.length) { alert("Your cart is empty"); return; }
    if (!addr?.name) return alert("Please select or fill a shipping address");
    // if (!addr) { alert("Please select a shipping address"); return; }

    // const orderId = doc(collection(db, "orders")).id;
    const orderRef = doc(collection(db, "orders"));
    const prefix = `${new Date().getFullYear()}00`; // e.g. 2025 -> 202500
    const orderNumber = await nextOrderNumber(prefix);

    await setDoc(orderRef, {
      userId: user.uid,
      orderNumber,            // <-- store the human-readable order no
      items: items.map(i => ({
        productRef: doc(db, "products", i.product.id),
        title: i.product.title,
        slug: i.product.slug,
        price: i.product.price,
        qty: i.qty,
        size: i.size || null,
        image: i.product.images?.[0] || null,
      })),
      subtotal: total,
      shipping: 0,
      total: total,
      address: addr,
      status: "processing",
      createdAt: serverTimestamp(),
    });

    await clear();
    // don’t keep stale selection around
    sessionStorage.removeItem("checkout_addr_id");
    sessionStorage.setItem("last_order_id", orderRef.id);
    nav(`/order/confirmed?o=${orderRef.id}`);
  };

  return (
    <div className="bg-brand-background min-h-screen font-display">
      <div className="flex items-center p-4 justify-between sticky top-0 z-10 bg-[var(--bg)]/80 backdrop-blur border-b border-[var(--border)]">
        <button onClick={() => nav(-1)} className="h-10 w-10" aria-label="Back">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold flex-1 text-center">Checkout</h1>
        <div className="h-10 w-10" />
      </div>

      {/* Shipping Address */}
      <main className="p-4">
        <section className="card p-4">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Shipping Address</h2>
            <button
              className="text-primary-700 font-semibold"
              onClick={() => nav("/addresses?select=1")}
            >
              Manage addresses
            </button>
          </div>

          {loadingAddr ? (
            <p className="text-sm opacity-70">Loading address…</p>
          ) : addr ? (
            <div className="mt-2 text-sm">
              <p className="font-semibold">{addr.name}</p>
              <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
              <p>{addr.city} - {addr.pin}</p>
              <p className="mt-1">📞 {addr.phone}</p>
            </div>
          ) : (
            <div className="mt-2 text-sm">
              <p>No address selected.</p>
              <button
                className="mt-2 btn-primary h-10 px-4"
                onClick={() => nav("/addresses?select=1")}
              >
                Select address
              </button>
            </div>
          )}
        </section>

        {/* Order Summary (live from cart) */}
        <section className="card p-4 mt-4">
          <h2 className="section-title">Order Summary</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Items</span>
              <span>{items.reduce((s, i) => s + i.qty, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between border-t pt-3 font-bold text-base">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </section>
      </main>

      {/* CTA */}
      <div className="sticky bottom-0 bg-white rounded-t-2xl p-4 mt-8 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] border-t border-[var(--border)]">
        <button
          onClick={placeOrder}
          className="w-full mt-1 btn-primary text-base disabled:opacity-50"
          disabled={!addr || !items.length}
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}
