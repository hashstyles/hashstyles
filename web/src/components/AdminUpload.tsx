import React, { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { storage, db } from "../firebase";

export default function AdminUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Pick a file");
    const storageRef = ref(storage, `public/products/${Date.now()}_${file.name}`);
    const task = uploadBytesResumable(storageRef, file);

    task.on("state_changed", undefined, (err) => alert(err.message), async () => {
      const url = await getDownloadURL(task.snapshot.ref);
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await addDoc(collection(db, "products"), {
        title, price: Number(price), images: [url], slug, createdAt: serverTimestamp()
      });
      alert("Uploaded");
      setTitle(""); setPrice(""); setFile(null);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="border p-2 block mb-2" />
      <input value={price} onChange={e=>setPrice(e.target.value)} placeholder="Price" className="border p-2 block mb-2" />
      <input type="file" onChange={e=>setFile(e.target.files?.[0] ?? null)} className="block mb-4" />
      <button className="px-4 py-2 bg-black text-white rounded">Create product</button>
    </form>
  );
}
