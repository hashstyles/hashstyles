import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { db, doc, getDoc } from "../lib/firestore";

type OrderDoc = {
  orderNumber?: string;
  createdAt?: any;
  total?: number;
  userId?: string;
};

const formatDate = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

export default function ConfirmationPage() {
  const { user } = useAuth();
  const [sp] = useSearchParams();
  const [order, setOrder] = useState<OrderDoc | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // compute delivery window: today+3 to today+5
  const today = new Date();
  const deliveryBeginDate = new Date();
  const deliveryEndDate = new Date();
  deliveryBeginDate.setDate(today.getDate() + 3);
  deliveryEndDate.setDate(today.getDate() + 5);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        if (!user) {
          // Wait for auth — AuthProvider will update this. Just show loader.
          return;
        }

        const fromParam = sp.get("o") || "";
        const fallback = sessionStorage.getItem("last_order_id") || "";
        const orderId = fromParam || fallback;
        if (!orderId) {
          setErr("No order to show.");
          return;
        }

        const snap = await getDoc(doc(db, "orders", orderId));
        if (!snap.exists()) {
          setErr("Order not found.");
          return;
        }
        const data = snap.data() as OrderDoc;

        // Important: rules allow read only if this order belongs to the user
        if (data.userId !== user.uid) {
          setErr("You don’t have permission to view this order.");
          return;
        }

        setOrder(data);
      } catch (e: any) {
        // Most common: "Missing or insufficient permissions" if user mismatch or not signed in yet
        setErr(e?.message || "Could not load order.");
      } finally {
        setLoading(false);
      }
    })();
  }, [sp, user?.uid]);

  return (
    <div className="bg-background-light min-h-screen font-display">
      <div className="top-0 z-10 flex items-center p-4 justify-between">
        <div className="flex size-10 items-center justify-center">
          <span className="material-symbols-outlined">close</span>
        </div>
        <h2 className="text-lg font-bold flex-1 text-center">Confirmation</h2>
        <div className="size-10" />
      </div>

      <main className="px-4 pb-8 pt-4">
        {loading ? (
          <div className="card p-4 text-sm opacity-70">Loading order…</div>
        ) : err ? (
          <div className="card p-4 text-sm text-red-600">{err}</div>
        ) : (
          <>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-100">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-200">
                  <span className="material-symbols-outlined text-4xl text-primary-600">check_circle</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold">Thank You For Your Order!</h1>
              <p className="mt-2 max-w-sm text-base opacity-80">
                We’ve sent a confirmation to your email and will notify you once your order is on the way.
              </p>
            </div>

            <div className="mt-8 rounded-xl border bg-subtle-light p-4">
              <div className="flex justify-between items-center text-sm">
                <div className="flex flex-col items-start">
                  <span className="opacity-70">Order No.</span>
                  <span className="font-bold mt-1">{order?.orderNumber || "—"}</span>
                </div>
                <div className="h-8 w-px bg-black/10" />
                <div className="flex flex-col items-end text-right">
                  <span className="opacity-70">Estimated Delivery</span>
                  <span className="font-bold mt-1">
                    {formatDate(deliveryBeginDate)} - {formatDate(deliveryEndDate)}
                  </span>
                </div>
              </div>
            </div>

            {typeof order?.total === "number" && (
              <div className="mt-4 text-center text-sm opacity-80">
                Order Total: <b>₹{order.total.toFixed(2)}</b>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bottom-0 z-10 space-y-3 p-4 pt-2">
        <Link to="/" className="block">
          <button className="w-full btn-primary px-6 py-4 text-base">Continue Shopping</button>
        </Link>
        <Link to="/orders" className="block">
          <button className="w-full bg-primary-50 text-primary-700 font-bold rounded-xl px-6 py-4 text-base">
            View Order Details
          </button>
        </Link>
      </footer>
    </div>
  );
}
