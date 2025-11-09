// main.tsx
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import ListingPage from "./pages/ListingPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import ProfilePage from "./pages/ProfilePage";
import WishlistPage from "./pages/WishlistPage";
import NewInPage from "./pages/NewInPage";
import OrdersPage from "./pages/OrdersPage";
import AddressesPage from "./pages/AddressesPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";

import { AuthProvider } from "./context/AuthProvider";
import { WishlistProvider } from "./store/wishlist";
import { CartProvider } from "./store/cart";
import "./index.css";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/shop" element={<ListingPage />} />
      <Route path="/new" element={<NewInPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/addresses" element={<AddressesPage />} />
      <Route path="/p/:slug" element={<ProductPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order/confirmed" element={<ConfirmationPage />} />
      <Route path="/order/:id" element={<OrderDetailsPage />} />
    </Routes>
  );
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  </BrowserRouter>
);
