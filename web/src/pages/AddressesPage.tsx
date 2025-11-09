// src/pages/AddressesPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthProvider";
import {
  db,
  collection,
  addDoc,
  getDocs,
  doc,
  writeBatch,
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

function AddressesInner() {
  const { user } = useAuth();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const selectMode = sp.get("select") === "1";

  const [list, setList] = useState<Array<{ id: string; data: Addr }>>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const [f, setF] = useState<Addr>({
    name: "",
    line1: "",
    city: "",
    pin: "",
    phone: "",
  });
  const on =
    (k: keyof Addr) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setF({ ...f, [k]: e.target.value });

  const refresh = async () => {
    if (!user) return;
    const snap = await getDocs(collection(db, "users", user.uid, "addresses"));
    const rows = snap.docs.map((d) => ({ id: d.id, data: d.data() as Addr }));
    rows.sort((a, b) => Number(b.data.isDefault) - Number(a.data.isDefault)); // default first
    setList(rows);
    if (!selectedId) {
      const def = rows.find((r) => r.data.isDefault);
      setSelectedId(def?.id ?? rows[0]?.id);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const add = async () => {
    if (!user) return;
    if (!f.name || !f.line1 || !f.city || !f.pin || !f.phone) return;
    await addDoc(collection(db, "users", user.uid, "addresses"), {
      ...f,
      isDefault: list.length === 0, // first becomes default
    });
    setF({ name: "", line1: "", city: "", pin: "", phone: "" });
    await refresh();
  };

  // Set an address as default (used only in non-select mode)
  const setDefault = async (addrId: string) => {
    if (!user) return;
    const snap = await getDocs(collection(db, "users", user.uid, "addresses"));
    const batch = writeBatch(db);
    snap.docs.forEach((d) => {
      const ref = doc(db, "users", user.uid, "addresses", d.id);
      batch.update(ref, { isDefault: d.id === addrId });
    });
    await batch.commit();
    await refresh();
  };

  // When a radio/row is chosen
  const handleChoose = async (addrId: string) => {
    setSelectedId(addrId);
    if (selectMode) {
      // Immediately send choice back to Checkout and go back
      sessionStorage.setItem("checkout_addr_id", addrId);
      nav("/checkout", { replace: true });
    }
  };

  const selectedIsDefault = useMemo(() => {
    if (!selectedId) return false;
    const row = list.find((r) => r.id === selectedId);
    return !!row?.data.isDefault;
  }, [list, selectedId]);

  return (
    <div className="bg-background-light min-h-screen font-display">
      <header className="top-0 z-10 flex items-center p-4 bg-[var(--bg)]/80 backdrop-blur border-b border-[var(--border)]">
        <button onClick={() => nav(-1)} className="h-10 w-10" aria-label="Back">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
          <h1 className="flex-1 text-center text-xl font-bold">Saved Addresses</h1>
          {selectMode && <span className="text-sm opacity-70">Select an address</span>}
        <div className="h-10 w-10" />
      </header>

      <main className="p-4 pb-28">
        {/* Add form */}
        <div className="card p-4 space-y-3">
          <input placeholder="Full name" value={f.name} onChange={on("name")} />
          <input placeholder="Address line 1" value={f.line1} onChange={on("line1")} />
          <input placeholder="Address line 2 (optional)" value={f.line2 || ""} onChange={on("line2")} />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="City" value={f.city} onChange={on("city")} />
            <input placeholder="Pincode" value={f.pin} onChange={on("pin")} />
          </div>
          <input placeholder="Mobile number" value={f.phone} onChange={on("phone")} />
          <button className="btn-primary w-full" onClick={add}>Add Address</button>
        </div>

        {/* List */}
        <div className="mt-4 space-y-3">
          {list.map(({ id, data }) => (
            <label
              key={id}
              className="flex gap-3 items-start cursor-pointer"
              onClick={() => {
                setSelectedId(id);

                if (selectMode) {
                  // user came from checkout: pick and return
                  sessionStorage.setItem("checkout_addr_id", id);
                  nav("/checkout", { replace: true });
                }
              }}
            >
              <input
                type="radio"
                name="addr"
                className="mt-1 accent-primary-600 h-5 w-5"
                checked={selectedId === id}
                onChange={() => {
                  setSelectedId(id);
                  if (selectMode) {
                    sessionStorage.setItem("checkout_addr_id", id);
                    nav("/checkout", { replace: true });
                  }
                }}
              />
              <div className="flex-1 card p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{data.name}</p>
                    <p className="text-sm text-[color:var(--text-secondary)]">
                      {data.line1}
                      {data.line2 ? `, ${data.line2}` : ""}
                    </p>
                    <p className="text-sm text-[color:var(--text-secondary)]">
                      {data.city} - {data.pin}
                    </p>
                    <p className="text-sm mt-1">📞 {data.phone}</p>
                    {data.isDefault && (
                      <span className="mt-2 inline-block text-xs px-2 py-1 rounded bg-primary-50 text-primary-700">
                        Default
                      </span>
                    )}
                  </div>

                  {/* show "Set as default" only in normal mode */}
                  {!selectMode && !data.isDefault && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await setDefault(id);
                      }}
                      className="text-sm font-semibold text-primary-600 underline"
                    >
                      Set as default
                    </button>
                  )}
                </div>
              </div>
            </label>
          ))}

          {list.length === 0 && (
            <div className="card p-4 text-sm text-center text-[color:var(--text-secondary)]">
              No addresses saved yet.
            </div>
          )}
        </div>
      </main>

      {/* Footer (only for non-select mode) */}
      {!selectMode && (
        <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t border-[var(--border)]">
          <button
            className="w-full btn-primary h-12 disabled:opacity-50"
            disabled={!selectedId || selectedIsDefault}
            onClick={() => selectedId && setDefault(selectedId)}
          >
            {selectedIsDefault ? "Already default" : "Set as default"}
          </button>
        </footer>
      )}

      <BottomNav />
    </div>
  );
}

export default function AddressesPage() {
  return (
    <ProtectedRoute>
      <AddressesInner />
    </ProtectedRoute>
  );
}
