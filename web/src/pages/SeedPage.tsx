import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { dummyProducts } from "../data/dummyProducts";

const dummyCategories = [
  { name: "Cotton Sets", slug: "cotton-sets", sort: 1 },
  { name: "Silk Sets", slug: "silk-sets", sort: 2 },
  { name: "Festive Wear", slug: "festive-wear", sort: 3 },
  { name: "Casual Wear", slug: "casual-wear", sort: 4 },
];

export default function SeedPage() {
  const [status, setStatus] = useState<"idle"|"seeding"|"done"|"error">("idle");
  const [msg, setMsg] = useState("");

  const seed = async () => {
    try {
      setStatus("seeding");

      // Seed categories
      for (const c of dummyCategories) {
        await addDoc(collection(db, "categories"), c);
      }

      // Seed products
      for (const p of dummyProducts) {
        await addDoc(collection(db, "products"), {
          ...(p as any),
          createdAt: serverTimestamp(),
        });
      }

      setStatus("done");
      setMsg(`Seeded ${dummyCategories.length} categories and ${dummyProducts.length} products.`);
    } catch (e: any) {
      setStatus("error");
      setMsg(e.message);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Seed Firestore (DEV)</h1>
      <p className="text-sm opacity-80 mb-4">
        This will create sample <code>categories</code> and <code>products</code> collections.
        Remove this page before production.
      </p>
      <button onClick={seed} className="btn-primary w-full">Seed Firestore</button>
      <div className="mt-4 text-sm">
        State: <b>{status}</b> {msg && <span>— {msg}</span>}
      </div>
    </div>
  );
}
