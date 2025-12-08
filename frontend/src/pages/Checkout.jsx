// src/pages/Checkout.jsx
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../store/slices/cartSlice";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function Checkout() {
  const items = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [shipping, setShipping] = useState({
    fullName: "",
    phone: "",
    city: "",
    pincode: "",
    addressLine: "",
  });

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    setMessage("");
    setError("");

    if (items.length === 0) {
      setError("Your cart is empty. Add some products first.");
      return;
    }

    if (
      !shipping.fullName.trim() ||
      !shipping.phone.trim() ||
      !shipping.city.trim() ||
      !shipping.pincode.trim() ||
      !shipping.addressLine.trim()
    ) {
      setError("Please fill all shipping details.");
      return;
    }

    const payload = {
      items: items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      shipping: { ...shipping },
    };

    try {
      setPlacing(true);

      const res = await axiosClient.post("/orders/checkout", payload);

      if (res.data?.success) {
        dispatch(clearCart());

        // 🌟 NEW — beautiful success message
        setMessage("🎉 Your order has been placed successfully!");

        // Redirect after 3 seconds
        setTimeout(() => navigate("/"), 3000);
      } else {
        setError(res.data?.message || "Unable to place order.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to place order. Please try again."
      );
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* 🌟 SUCCESS MESSAGE */}
      {message && (
        <div className="mb-4 p-3 rounded-md bg-green-100 text-green-700 text-sm font-semibold shadow-sm">
          {message}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 text-sm font-semibold shadow-sm">
          {error}
        </div>
      )}

      <h2 className="text-2xl font-bold mb-1">Checkout</h2>
      <p className="text-sm text-gray-500 mb-4">
        This will place your order and store it in backend (MongoDB).
      </p>

      {/* Order Summary */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-2">Order Summary</h3>

        {items.length === 0 ? (
          <p className="text-sm text-gray-600">
            Your cart is empty.{" "}
            <Link to="/products" className="text-indigo-600 hover:underline">
              Go back to products
            </Link>
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm border-b pb-2"
              >
                <div className="flex items-center gap-2">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-semibold">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}

            <div className="flex items-center justify-between pt-2 text-sm">
              <span className="font-semibold">Total Payable</span>
              <span className="text-lg font-bold text-indigo-600">
                ₹{total}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Shipping Details */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-2">Shipping Details</h3>

        <div className="grid gap-2 sm:grid-cols-2">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={shipping.fullName}
            onChange={handleChange}
            className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={shipping.phone}
            onChange={handleChange}
            className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={shipping.city}
            onChange={handleChange}
            className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            name="pincode"
            placeholder="Pincode"
            value={shipping.pincode}
            onChange={handleChange}
            className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <textarea
          name="addressLine"
          rows={3}
          placeholder="Full Address"
          value={shipping.addressLine}
          onChange={handleChange}
          className="mt-2 w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handlePlaceOrder}
          disabled={placing || items.length === 0}
          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
        >
          {placing ? "Placing Order..." : "Place Order"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/cart")}
          className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-200"
        >
          Back to Cart
        </button>
      </div>
    </div>
  );
}
