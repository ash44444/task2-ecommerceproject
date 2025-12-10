// src/pages/Auth.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function Auth() {
  const [mode, setMode] = useState("register");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [me, setMe] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("userName")
  );

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const navigate = useNavigate();

  // 🔹 Sync localStorage user with UI
  useEffect(() => {
    const handleUpdate = () => {
      const userName = localStorage.getItem("userName");
      setIsLoggedIn(!!userName);
      if (!userName) setMe(null);
    };

    window.addEventListener("userNameUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("userNameUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const saveUserToLocal = (user) => {
    if (!user) return;
    localStorage.setItem("userName", user.name);
    localStorage.setItem("userRole", user.role || "user");
    setIsLoggedIn(true);
    window.dispatchEvent(new Event("userNameUpdated"));
  };

  // 🔹 REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setFieldErrors({});

    try {
      const res = await axiosClient.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      setMessage(res.data.message || "Registered successfully, please login.");
      setMode("login");
      setForm({ name: "", email: form.email, password: "" });
    } catch (err) {
      const data = err.response?.data || {};
      const msg = data.message || "Something went wrong in register";

      if (data.errors && typeof data.errors === "object") {
        setFieldErrors(data.errors);
        setMessage("Please fix the highlighted fields.");
      } else {
        const lower = msg.toLowerCase();
        const fe = {};
        if (lower.includes("name")) fe.name = msg;
        if (lower.includes("email")) fe.email = msg;
        if (lower.includes("password")) fe.password = msg;
        setFieldErrors(fe);
        setMessage(msg);
      }
    }
  };

  // 🔹 LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setFieldErrors({});

    try {
      const res = await axiosClient.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      setMessage(res.data.message || "Login successful");

      const meRes = await axiosClient.get("/auth/me");
      setMe(meRes.data.user);
      saveUserToLocal(meRes.data.user);

      navigate("/");
    } catch (err) {
      const data = err.response?.data || {};
      const msg = data.message || "Something went wrong in login";

      if (data.errors && typeof data.errors === "object") {
        setFieldErrors(data.errors);
        setMessage("Please fix the highlighted fields.");
      } else {
        const lower = msg.toLowerCase();
        const fe = {};
        if (lower.includes("email")) fe.email = msg;
        if (lower.includes("password")) fe.password = msg;
        setFieldErrors(fe);
        setMessage(msg);
      }
    }
  };

  const handleLogout = async () => {
    setMessage("");
    try {
      const res = await axiosClient.get("/auth/logout");
      setMessage(res.data.message || "Logged out");
      localStorage.removeItem("userName");
      localStorage.removeItem("userRole");
      setMe(null);
      setIsLoggedIn(false);
      window.dispatchEvent(new Event("userNameUpdated"));
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Something went wrong in logout"
      );
    }
  };

  const fetchMe = async () => {
    setMessage("");
    try {
      const res = await axiosClient.get("/auth/me");
      setMe(res.data.user);
      setMessage("Fetched profile successfully");
    } catch (err) {
      setMe(null);
      setIsLoggedIn(false);
      setMessage(
        err.response?.data?.message || "Unable to fetch profile, login first"
      );
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setMessage("");
    setFieldErrors({});
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-3 sm:px-4 md:px-6 py-6 sm:py-10">
      <div className="w-full max-w-md bg-white shadow-md sm:shadow-lg rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-5 text-center text-gray-900">
          {mode === "register" ? "Register" : "Login"}
        </h2>

        {/* Toggle buttons */}
        <div className="flex justify-center gap-2 mb-5">
          <button
            className={`flex-1 max-w-[140px] px-3 py-1.5 rounded-full text-xs sm:text-sm border transition ${
              mode === "register"
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-gray-100 text-gray-700 border-gray-200"
            }`}
            onClick={() => switchMode("register")}
          >
            Register
          </button>
          <button
            className={`flex-1 max-w-[140px] px-3 py-1.5 rounded-full text-xs sm:text-sm border transition ${
              mode === "login"
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-gray-100 text-gray-700 border-gray-200"
            }`}
            onClick={() => switchMode("login")}
          >
            Login
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={mode === "register" ? handleRegister : handleLogin}
          className="space-y-3 sm:space-y-4"
        >
          {/* NAME (only on register) */}
          {mode === "register" && (
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-700">
                Name
              </label>
              <input
                name="name"
                type="text"
                className={`w-full border rounded-md px-3 py-2 text-sm sm:text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  fieldErrors.name ? "border-red-500" : "border-gray-300"
                }`}
                value={form.name}
                onChange={handleChange}
                required={mode === "register"}
              />
              {fieldErrors.name && (
                <p className="text-[11px] sm:text-xs text-red-600 mt-1">
                  {fieldErrors.name}
                </p>
              )}
            </div>
          )}

          {/* EMAIL */}
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-700">
              Email
            </label>
            <input
              name="email"
              type="email"
              className={`w-full border rounded-md px-3 py-2 text-sm sm:text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                fieldErrors.email ? "border-red-500" : "border-gray-300"
              }`}
              value={form.email}
              onChange={handleChange}
              required
            />
            {fieldErrors.email && (
              <p className="text-[11px] sm:text-xs text-red-600 mt-1">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* PASSWORD + SHOW/HIDE */}
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                className={`w-full border rounded-md pl-3 pr-16 py-2 text-sm sm:text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  fieldErrors.password ? "border-red-500" : "border-gray-300"
                }`}
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-2 flex items-center px-2 text-[11px] sm:text-xs font-medium text-gray-600 hover:text-indigo-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-[11px] sm:text-xs text-red-600 mt-1">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="w-full mt-1 sm:mt-2 bg-indigo-600 text-white py-2.5 sm:py-3 rounded-md text-sm sm:text-[15px] font-semibold hover:bg-indigo-700 active:scale-[0.98] transition shadow-sm"
          >
            {mode === "register" ? "Create Account" : "Login"}
          </button>
        </form>

        {/* Authenticated actions */}
        {isLoggedIn && (
          <div className="mt-4 sm:mt-5 flex flex-col gap-2">
            <button
              onClick={fetchMe}
              className="w-full bg-gray-100 text-gray-800 py-2 rounded-md text-xs sm:text-sm hover:bg-gray-200"
            >
              Get My Profile (/auth/me)
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-red-100 text-red-700 py-2 rounded-md text-xs sm:text-sm hover:bg-red-200"
            >
              Logout
            </button>
          </div>
        )}

        {/* Global message */}
        {message && (
          <p className="mt-3 text-center text-xs sm:text-sm text-gray-700">
            {message}
          </p>
        )}

        {/* Debug / profile view */}
        {me && (
          <div className="mt-4 text-xs sm:text-sm bg-gray-50 rounded-md p-3 sm:p-4">
            <p className="font-semibold mb-1">Current User:</p>
            <p>Name: {me.name}</p>
            <p>Email: {me.email}</p>
            {me.role && <p>Role: {me.role}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
