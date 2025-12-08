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

  const navigate = useNavigate();

  useEffect(() => {
    const handleUpdate = () => {
      setIsLoggedIn(!!localStorage.getItem("userName"));
      if (!localStorage.getItem("userName")) {
        setMe(null);
      }
    };

    window.addEventListener("userNameUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("userNameUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveUserToLocal = (user) => {
    if (!user) return;
    localStorage.setItem("userName", user.name);
    if (user.role) {
      localStorage.setItem("userRole", user.role);
    } else {
      localStorage.setItem("userRole", "user");
    }
    setIsLoggedIn(true);
    window.dispatchEvent(new Event("userNameUpdated"));
  };

  // 🔹 REGISTER: sirf register karega, login nahi
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axiosClient.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      //  Sirf success message + login tab
      setMessage(res.data.message || "Registered successfully, please login.");
      setMode("login");

      // optional: form clear karna ho to
      setForm({ name: "", email: form.email, password: "" });
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Something went wrong in register"
      );
    }
  };

  // 🔹 LOGIN: yahan se hi actual login + redirect hoga
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axiosClient.post("/auth/login", {
        email: form.email,
        password: form.password,
      });
      setMessage(res.data.message || "Login successful");

      const meRes = await axiosClient.get("/auth/me");
      setMe(meRes.data.user);
      saveUserToLocal(meRes.data.user);

      //  Login ke baad HOME par redirect
      navigate("/");
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Something went wrong in login"
      );
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
      // (optional) navigate("/auth");
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

  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-md mx-auto mt-24">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {mode === "register" ? "Register" : "Login"}
      </h2>

      <div className="flex justify-center gap-2 mb-4">
        <button
          className={`px-3 py-1 rounded-md text-sm ${
            mode === "register"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setMode("register")}
        >
          Register
        </button>
        <button
          className={`px-3 py-1 rounded-md text-sm ${
            mode === "login"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setMode("login")}
        >
          Login
        </button>
      </div>

      <form
        onSubmit={mode === "register" ? handleRegister : handleLogin}
        className="space-y-3"
      >
        {mode === "register" && (
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              name="name"
              type="text"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.name}
              onChange={handleChange}
              required={mode === "register"}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            name="email"
            type="email"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            name="password"
            type="password"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          {mode === "register" ? "Create Account" : "Login"}
        </button>
      </form>

      {isLoggedIn && (
        <div className="mt-4 flex flex-col gap-2">
          <button
            onClick={fetchMe}
            className="w-full bg-gray-100 text-gray-800 py-2 rounded-md text-sm hover:bg-gray-200"
          >
            Get My Profile (/auth/me)
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-red-100 text-red-700 py-2 rounded-md text-sm hover:bg-red-200"
          >
            Logout
          </button>
        </div>
      )}

      {message && (
        <p className="mt-3 text-center text-sm text-gray-700">{message}</p>
      )}

      {me && (
        <div className="mt-4 text-sm bg-gray-50 rounded-md p-3">
          <p className="font-semibold mb-1">Current User:</p>
          <p>Name: {me.name}</p>
          <p>Email: {me.email}</p>
          {me.role && <p>Role: {me.role}</p>}
        </div>
      )}
    </div>
  );
}
