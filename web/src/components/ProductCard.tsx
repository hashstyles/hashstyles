import React from "react";
import { Link } from "react-router-dom";
import type { Product } from "../types/product";

export default function ProductCard({ product }: { product: Product }) {
  const img = product.images?.[0] || "/placeholder.png";
  return (
    <Link to={`/p/${product.slug}`} className="block border p-2 rounded">
      <img src={img} alt={product.title} className="w-full h-56 object-cover rounded" />
      <div className="mt-2">
        <div className="font-medium">{product.title}</div>
        <div className="text-sm">₹{product.price}</div>
      </div>
    </Link>
  );
}
