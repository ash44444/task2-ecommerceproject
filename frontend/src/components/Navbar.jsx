// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const role = localStorage.getItem("userRole");
  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const burgerBtnRef = useRef(null);

  // close mobile menu on outside click / escape
  useEffect(() => {
    const handleOutside = (e) => {
      // if menu is closed nothing to do
      if (!mobileOpen) return;
      const target = e.target;
      // if click is inside menu or inside hamburger button -> do nothing
      if (
        (mobileMenuRef.current && mobileMenuRef.current.contains(target)) ||
        (burgerBtnRef.current && burgerBtnRef.current.contains(target))
      ) {
        return;
      }
      // else close menu
      setMobileOpen(false);
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };

    // use mousedown for better cross-browser behavior (fires before click)
    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [mobileOpen]);

  // ---------------- LOGOUT ----------------
  const handleLogout = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    window.dispatchEvent(new Event("userNameUpdated"));
    navigate("/auth");
  };

  const goToAuth = () => navigate("/auth");

  const MobileLink = ({ to, children }) => (
    <Link
      to={to}
      onClick={() => setMobileOpen(false)}
      className="block px-4 py-2 text-base text-gray-700 hover:bg-gray-100 transition rounded-md"
    >
      {children}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-4">
        {/* LEFT */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Link to="/" className="flex items-center gap-2 group cursor-pointer min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-sm sm:text-base font-bold shadow-md group-hover:scale-105 transition">S</div>
            <div className="flex flex-col leading-tight overflow-hidden">
              <span className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight truncate">ShopSmart</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.12em] text-gray-400">Ecommerce</span>
            </div>
          </Link>

          <div className="hidden sm:flex gap-3 sm:gap-4 text-sm ml-1 sm:ml-4">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/products">Products</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            {role === "admin" && (
              <Link to="/admin" className="text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-full border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition">Admin</Link>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button onClick={() => navigate("/cart")} className="relative flex items-center gap-1 text-[11px] sm:text-sm bg-gray-100 px-2.5 sm:px-3 py-1.5 rounded-full hover:bg-gray-200 transition" aria-label="Open cart">
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">shopping_cart</span>
            <span className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-semibold bg-indigo-600 text-white rounded-full px-1.5">{cartCount}</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 max-w-[150px]">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[11px] font-semibold text-indigo-700">{userName ? userName.charAt(0).toUpperCase() : "G"}</div>
            <span className="text-xs text-gray-700 truncate">{userName ? `Hi, ${userName}` : "Guest user"}</span>
          </div>

          <div className="hidden sm:block">
            {userName ? (
              <button onClick={handleLogout} className="text-[10px] sm:text-xs bg-red-600 text-white px-3 sm:px-4 py-1.5 rounded-full font-semibold shadow-sm hover:bg-red-700 transition">Logout</button>
            ) : (
              <button onClick={goToAuth} className="text-[10px] sm:text-xs bg-indigo-600 text-white px-3 sm:px-4 py-1.5 rounded-full font-semibold shadow-sm hover:bg-indigo-700 transition">Login</button>
            )}
          </div>

          {/* Hamburger */}
          <div className="sm:hidden">
            <button
              ref={burgerBtnRef}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((s) => !s)}
              className="p-2 rounded-md inline-flex items-center justify-center hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div id="mobile-menu" ref={mobileMenuRef} className="sm:hidden px-3 pb-4">
          <div className="bg-white border-t border-b border-gray-200 shadow-sm rounded-b-lg py-3">
            <MobileLink to="/">Home</MobileLink>
            <MobileLink to="/products">Products</MobileLink>
            <MobileLink to="/about">About</MobileLink>
            <MobileLink to="/contact">Contact</MobileLink>

            {role === "admin" && (
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-base text-red-600 font-semibold rounded-md hover:bg-red-50 transition">Admin</Link>
            )}

            <div className="mt-2 px-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-semibold text-indigo-700">{userName ? userName.charAt(0).toUpperCase() : "G"}</div>
                  <div className="text-sm text-gray-700">{userName ? `Hi, ${userName}` : "Guest user"}</div>
                </div>

                <div>
                  {userName ? (
                    <button onClick={() => { setMobileOpen(false); handleLogout(); }} className="text-sm bg-red-600 text-white px-3 py-1 rounded-full font-semibold hover:bg-red-700 transition">Logout</button>
                  ) : (
                    <button onClick={() => { setMobileOpen(false); goToAuth(); }} className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-full font-semibold hover:bg-indigo-700 transition">Login</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

/* NavLink Component (desktop) */
function NavLink({ to, children }) {
  return (
    <Link to={to} className="group relative inline-flex items-center text-gray-700 hover:text-indigo-600 font-medium transition text-[12px] sm:text-[13px]">
      {children}
      <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-indigo-600 rounded-full transition-all duration-200 group-hover:w-full" />
    </Link>
  );
}
