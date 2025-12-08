// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/Products";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Cart from "./pages/Cart";
import AdminDashboard from "./pages/AdminDashboard";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout"; // 🔹 NEW

// ✅ SAME AS BEFORE – ProtectedRoute
function ProtectedRoute({ children, isLoggedIn }) {
  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

// ✅ SAME AS BEFORE – AdminRoute
function AdminRoute({ children, isLoggedIn }) {
  const role = localStorage.getItem("userRole");
  if (!isLoggedIn || role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("userName")
  );

  useEffect(() => {
    const updateLoginState = () => {
      setIsLoggedIn(!!localStorage.getItem("userName"));
    };

    window.addEventListener("userNameUpdated", updateLoginState);

    return () => {
      window.removeEventListener("userNameUpdated", updateLoginState);
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {isLoggedIn && <Navbar />}

        <main className="max-w-5xl mx-auto px-4 pb-8 pt-6">
          <Routes>
            {/* HOME */}
            <Route
              path="/"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <Home />
                </ProtectedRoute>
              }
            />

            {/* PRODUCTS LIST */}
            <Route
              path="/products"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <Products />
                </ProtectedRoute>
              }
            />

            {/* PRODUCT DETAIL */}
            <Route
              path="/products/:id"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <ProductDetail />
                </ProtectedRoute>
              }
            />

            {/* ABOUT */}
            <Route
              path="/about"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <About />
                </ProtectedRoute>
              }
            />

            {/* CONTACT */}
            <Route
              path="/contact"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <Contact />
                </ProtectedRoute>
              }
            />

            {/* CART */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <Cart />
                </ProtectedRoute>
              }
            />

            {/* ✅ NEW: CHECKOUT */}
            <Route
              path="/checkout"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <Checkout />
                </ProtectedRoute>
              }
            />

            {/* ADMIN DASHBOARD */}
            <Route
              path="/admin"
              element={
                <AdminRoute isLoggedIn={isLoggedIn}>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* PUBLIC AUTH PAGE */}
            <Route path="/auth" element={<Auth />} />

            {/* FALLBACK */}
            <Route
              path="*"
              element={
                isLoggedIn ? (
                  <Navigate to="/" replace />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
