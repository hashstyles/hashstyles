import React from "react";
import { NavLink } from "react-router-dom";

const base = "flex flex-col items-center gap-1 text-[color:var(--text-secondary)]";
const active = "text-primary-600 font-bold";

export default function BottomNav(){
  return (
    <nav className="mt-auto sticky bottom-0 z-10 grid grid-cols-5 gap-2 border-t border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur px-4 pb-3 pt-2">
      <NavLink to="/" className={({isActive}) => `${base} ${isActive?active:""}`}>
        <span className="material-symbols-outlined">home</span><span className="text-xs">Home</span>
      </NavLink>
      <NavLink to="/shop" className={({isActive}) => `${base} ${isActive?active:""}`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
        <span className="text-xs">Shop</span>
      </NavLink>
      <NavLink to="/new" className={({isActive}) => `${base} ${isActive?active:""}`}>
        <span className="material-symbols-outlined">auto_awesome</span><span className="text-xs">New In</span>
      </NavLink>
      <NavLink to="/wishlist" className={({isActive}) => `${base} ${isActive?active:""}`}>
        <span className="material-symbols-outlined">favorite_border</span><span className="text-xs">Wishlist</span>
      </NavLink>
      <NavLink to="/profile" className={({isActive}) => `${base} ${isActive?active:""}`}>
        <span className="material-symbols-outlined">person_outline</span><span className="text-xs">Profile</span>
      </NavLink>
    </nav>
  );
}
