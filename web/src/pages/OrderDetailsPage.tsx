import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "../lib/firestore";
import { db } from "../firebase";
import BottomNav from "../components/BottomNav";

type OrderItem = {
  productRef?: any;
  title: string;
  slug: string;
  price: number;
  qty: number;
  size?: string | null;
  image?: string | null;
};

type Address = {
  name: string;
  addr1?: string;
  addr2?: string;
  line1?: string;       // some pages used line1/line2
  line2?: string;
  city: string;
  pin: string;
  phone: string;
};

type Order = {
  userId: string;
  orderNumber?: string; 
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  address: Address;
  status: string;
  createdAt?: { seconds: number; nanoseconds: number } | any;
};

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const snap = await getDoc(doc(db, "orders", id));
      if (snap.exists()) setOrder(snap.data() as Order);
      setLoading(false);
    })();
  }, [id]);

  const created = useMemo(() => {
    if (!order?.createdAt) return "";
    // works for Firestore Timestamp or {seconds}
    const ms =
      typeof (order as any).createdAt.toDate === "function"
        ? (order as any).createdAt.toDate().getTime()
        : (order as any).createdAt.seconds * 1000;
    return new Date(ms).toLocaleString();
  }, [order?.createdAt]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!order) return <div className="p-6">Order not found.</div>;

  const addr = order.address;
  const line1 = addr.line1 || addr.addr1 || "";
  const line2 = addr.line2 || addr.addr2 || "";

  return (
    <div className="bg-background-light min-h-screen font-display">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center p-4 bg-[var(--bg)]/80 backdrop-blur border-b border-[var(--border)]">
        <button onClick={() => nav(-1)} className="h-10 w-10" aria-label="Back">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center text-xl font-bold">Order #{order?.orderNumber || id?.slice(-6)}</h1>
        <div className="h-10 w-10" />
      </header>

      {/* Meta */}
      <section className="p-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[color:var(--text-secondary)]">Placed on</p>
            <p className="text-sm font-medium">{created}</p>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-[color:var(--text-secondary)]">Status</p>
            <span className="text-sm font-semibold">{order.status}</span>
          </div>
        </div>
      </section>

      {/* Items */}
      <main className="p-4 pb-28">
        <h2 className="section-title mb-3">Items</h2>
        <div className="space-y-3">
          {order.items.map((it, i) => (
            <div key={`${it.slug}-${i}`} className="card p-4 flex gap-4">
              <div
                className="h-24 w-24 rounded-md bg-cover bg-center"
                style={{ backgroundImage: `url(${it.image || ""})` }}
              />
              <div className="flex-1">
                <p className="font-semibold">{it.title}</p>
                {!!it.size && <p className="text-sm text-[color:var(--text-secondary)]">Size: {it.size}</p>}
                <p className="text-sm text-[color:var(--text-secondary)]">Qty: {it.qty}</p>
                <p className="mt-1 font-bold">₹{Number(it.price).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Shipping Address */}
        <h2 className="section-title mt-6 mb-3">Shipping Address</h2>
        <div className="card p-4">
          <p className="font-semibold">{addr.name}</p>
          <p className="text-sm text-[color:var(--text-secondary)]">
            {line1}{line2 ? `, ${line2}` : ""}
          </p>
          <p className="text-sm text-[color:var(--text-secondary)]">
            {addr.city} - {addr.pin}
          </p>
          <p className="text-sm mt-1">📞 {addr.phone}</p>
        </div>

        {/* Summary */}
        <h2 className="section-title mt-6 mb-3">Summary</h2>
        <div className="card p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[color:var(--text-secondary)]">Subtotal</span>
            <span>₹{Number(order.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[color:var(--text-secondary)]">Shipping</span>
            <span>₹{Number(order.shipping).toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t pt-3 font-bold text-base">
            <span>Total</span>
            <span className="text-primary-600">₹{Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
