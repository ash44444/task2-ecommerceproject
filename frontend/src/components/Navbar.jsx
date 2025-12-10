// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Navbar() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const role = localStorage.getItem("userRole");
  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // ---------------- LOGOUT ----------------
  const handleLogout = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");

    // Trigger global login state update
    window.dispatchEvent(new Event("userNameUpdated"));

    navigate("/auth");
  };

  const goToAuth = () => navigate("/auth");

  return (
    <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-4 flex-wrap">
        {/* LEFT SECTION */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {/* Logo + Brand */}
          <Link
            to="/"
            className="flex items-center gap-2 group cursor-pointer min-w-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-sm sm:text-base font-bold shadow-md group-hover:scale-105 transition">
              S
            </div>
            <div className="flex flex-col leading-tight overflow-hidden">
              <span className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight truncate">
                ShopSmart
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.12em] text-gray-400">
                Ecommerce
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden sm:flex gap-3 sm:gap-4 text-sm ml-1 sm:ml-4">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/products">Products</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>

            {role === "admin" && (
              <Link
                to="/admin"
                className="text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-full border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition"
              >
                Admin
              </Link>
            )}
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Cart Button */}
          <button
            onClick={() => navigate("/cart")}
            className="relative flex items-center gap-1 text-[11px] sm:text-sm bg-gray-100 px-2.5 sm:px-3 py-1.5 rounded-full hover:bg-gray-200 transition"
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
              shopping_cart
            </span>
            <span className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-semibold bg-indigo-600 text-white rounded-full px-1.5">
              {cartCount}
            </span>
          </button>

          {/* User Badge (hidden on very small screens) */}
          <div className="hidden sm:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 max-w-[150px]">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[11px] font-semibold text-indigo-700">
              {userName ? userName.charAt(0).toUpperCase() : "G"}
            </div>
            <span className="text-xs text-gray-700 truncate">
              {userName ? `Hi, ${userName}` : "Guest user"}
            </span>
          </div>

          {/* Login / Logout Button */}
          {userName ? (
            <button
              onClick={handleLogout}
              className="text-[10px] sm:text-xs bg-red-600 text-white px-3 sm:px-4 py-1.5 rounded-full font-semibold shadow-sm hover:bg-red-700 transition"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={goToAuth}
              className="text-[10px] sm:text-xs bg-indigo-600 text-white px-3 sm:px-4 py-1.5 rounded-full font-semibold shadow-sm hover:bg-indigo-700 transition"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

/* NavLink Component */
function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="group relative inline-flex items-center text-gray-700 hover:text-indigo-600 font-medium transition text-[12px] sm:text-[13px]"
    >
      {children}
      <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-indigo-600 rounded-full transition-all duration-200 group-hover:w-full" />
    </Link>
  );
}
