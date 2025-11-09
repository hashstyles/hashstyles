import React, { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthProvider";
import { db, collection, getDocs, orderBy, query, where } from "../lib/firestore";
import { Link, useNavigate } from "react-router-dom";

type Order = {
  id: string;
  orderNumber?: string;
  total: number;
  createdAt?: any;
  status?: string;
};

function OrdersInner() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const nav = useNavigate();
  useEffect(() => {
    (async () => {
      if (!user) return;
      const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setOrders(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    })();
  }, [user?.uid]);

  return (
    <div className="bg-background-light min-h-screen font-display">
      <header className="top-0 z-10 flex items-center p-4 bg-[var(--bg)]/80 backdrop-blur border-b border-[var(--border)]">
        <button onClick={() => nav(-1)} className="h-10 w-10" aria-label="Back">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center text-xl font-bold">My Orders</h1>
        <div className="h-10 w-10" />
      </header>

      <main className="p-4 pb-24 space-y-3">
        {orders.map((o) => (
          <Link
            key={o.id}
            to={`/order/${o.id}`}
            className="card p-4 flex items-center justify-between"
          >
            <div>
              <p className="font-semibold text-primary-700">
                {o.orderNumber || o.id}
              </p>
              <p className="text-sm text-[color:var(--text-secondary)]">
                {new Date((o.createdAt?.seconds ?? 0) * 1000).toLocaleDateString()} •{" "}
                {o.status || "Processing"}
              </p>
            </div>
            <p className="font-bold text-primary-700">
              ₹{o.total.toFixed(2)}
            </p>
          </Link>
        ))}

        {!orders.length && (
          <p className="text-sm text-[color:var(--text-secondary)]">
            No orders yet.
          </p>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersInner />
    </ProtectedRoute>
  );
}
