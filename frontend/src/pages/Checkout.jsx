// src/pages/Checkout.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { z, ZodError } from "zod";
import { useDispatch } from "react-redux";
import { clearCart } from "../store/slices/cartSlice";

// 🔹 SAME RULES AS BACKEND (shippingSchema)
const fullNameSchema = z
  .string()
  .trim()
  .min(2, "Full name must be at least 2 characters")
  .max(40, "Full name must be at most 40 characters")
  .regex(
    /^[A-Za-z0-9À-ÖØ-öø-ÿ ]+$/,
    "Full name can only contain letters, numbers and spaces"
  )
  .refine((v) => /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(v), {
    message: "Full name must contain at least one letter",
  });

const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^[0-9+\-() ]{10,20}$/,
    "Phone can contain digits, spaces, +, -, () and must be 10–20 characters"
  )
  .refine(
    (v) => {
      const digits = (v.match(/\d/g) || []).length;
      return digits >= 10 && digits <= 15;
    },
    {
      message: "Phone must contain 10–15 digits",
    }
  );

const citySchema = z
  .string()
  .trim()
  .min(2, "City must be at least 2 characters")
  .max(80, "City must be at most 80 characters")
  .regex(
    /^[A-Za-zÀ-ÖØ-öø-ÿ .'-]+$/,
    "City can only contain letters, spaces, dots, apostrophes and hyphens"
  )
  .refine((v) => /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(v), {
    message: "City must contain at least one letter",
  });

const pincodeSchema = z
  .string()
  .trim()
  .regex(/^[1-9][0-9]{5}$/, "Pincode must be a valid 6-digit code");

const addressSchema = z
  .string()
  .trim()
  .min(5, "Address must be at least 5 characters")
  .max(200, "Address must be at most 200 characters");

const shippingSchema = z.object({
  fullName: fullNameSchema,
  phone: phoneSchema,
  city: citySchema,
  pincode: pincodeSchema,
  addressLine: addressSchema,
});

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const cartItems = location.state?.items || [];

  const [shipping, setShipping] = useState({
    fullName: "",
    phone: "",
    city: "",
    pincode: "",
    addressLine: "",
  });

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));

    const key = `shipping.${name}`;
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPlacing(true);
    setError("");
    setMessage("");
    setFieldErrors({});

    // Frontend validation
    try {
      shippingSchema.parse(shipping);
    } catch (err) {
      if (err instanceof ZodError) {
        const newErrors = {};
        err.issues.forEach((issue) => {
          const field = issue.path[0];
          newErrors[`shipping.${field}`] = issue.message;
        });
        setFieldErrors(newErrors);
        setError("Validation failed");
        setPlacing(false);
        return;
      }
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty. Please add items before checkout.");
      setPlacing(false);
      return;
    }

    // Backend call
    try {
      const body = {
        items: cartItems.map((i) => ({
          productId: i._id || i.id,
          quantity: i.quantity || 1,
        })),
        shipping,
      };

      const res = await axiosClient.post("/orders/checkout", body);

      setMessage(res.data.message || "Order placed successfully");

      dispatch(clearCart());
      localStorage.removeItem("cart");
      navigate("/", { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Something went wrong while placing order";

      setError(msg);

      const backendErrors = err.response?.data?.errors || {};
      setFieldErrors(backendErrors);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="
      min-h-screen 
      flex items-center justify-center 
      bg-gray-50 
      px-3 sm:px-4 md:px-6 py-6
    ">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-5 sm:p-7">

        {/* Alerts */}
        {error && (
          <div className="mb-4 rounded-md bg-red-100 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-md bg-green-100 text-green-700 px-4 py-3 text-sm">
            {message}
          </div>
        )}

        <h2 className="text-2xl font-bold mb-1">Checkout</h2>
        <p className="text-sm text-gray-600 mb-4">
          Enter your shipping details to place the order.
        </p>

        {/* FORM */}
        <h3 className="text-lg font-semibold mb-2">Shipping Details</h3>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name + Phone */}
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <input
                name="fullName"
                type="text"
                placeholder="Full Name"
                className={`w-full border rounded-md px-3 py-2 text-sm ${
                  fieldErrors["shipping.fullName"] ? "border-red-500" : ""
                }`}
                value={shipping.fullName}
                onChange={handleChange}
              />
              {fieldErrors["shipping.fullName"] && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors["shipping.fullName"]}
                </p>
              )}
            </div>

            <div>
              <input
                name="phone"
                type="text"
                placeholder="Phone"
                className={`w-full border rounded-md px-3 py-2 text-sm ${
                  fieldErrors["shipping.phone"] ? "border-red-500" : ""
                }`}
                value={shipping.phone}
                onChange={handleChange}
              />
              {fieldErrors["shipping.phone"] && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors["shipping.phone"]}
                </p>
              )}
            </div>
          </div>

          {/* City + Pincode */}
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <input
                name="city"
                type="text"
                placeholder="City"
                className={`w-full border rounded-md px-3 py-2 text-sm ${
                  fieldErrors["shipping.city"] ? "border-red-500" : ""
                }`}
                value={shipping.city}
                onChange={handleChange}
              />
              {fieldErrors["shipping.city"] && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors["shipping.city"]}
                </p>
              )}
            </div>

            <div>
              <input
                name="pincode"
                type="text"
                placeholder="Pincode"
                className={`w-full border rounded-md px-3 py-2 text-sm ${
                  fieldErrors["shipping.pincode"] ? "border-red-500" : ""
                }`}
                value={shipping.pincode}
                onChange={handleChange}
              />
              {fieldErrors["shipping.pincode"] && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors["shipping.pincode"]}
                </p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <textarea
              name="addressLine"
              rows={3}
              placeholder="Full Address"
              className={`w-full border rounded-md px-3 py-2 text-sm ${
                fieldErrors["shipping.addressLine"] ? "border-red-500" : ""
              }`}
              value={shipping.addressLine}
              onChange={handleChange}
            />
            {fieldErrors["shipping.addressLine"] && (
              <p className="text-xs text-red-600 mt-1">
                {fieldErrors["shipping.addressLine"]}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row gap-3">
            <button
              type="submit"
              disabled={placing}
              className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
            >
              {placing ? "Placing..." : "Place Order"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/cart")}
              className="flex-1 border rounded-md px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
            >
              Back to Cart
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
