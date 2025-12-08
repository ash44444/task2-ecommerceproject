// src/pages/Cart.jsx
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromCart,
  decreaseQuantity,
  addToCart,
  clearCart,
} from "../store/slices/cartSlice";
import { useNavigate } from "react-router-dom"; // 🔹 NEW

export default function Cart() {
  const items = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate(); // 🔹 NEW

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-3">Your Cart</h2>
        <p className="text-sm text-gray-600">Cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Your Cart</h2>
        <button
          onClick={() => dispatch(clearCart())}
          className="text-xs px-3 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200"
        >
          Clear Cart
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 border rounded-md p-3"
          >
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-16 object-cover rounded"
              />
            )}

            <div className="flex-1">
              <h3 className="font-semibold text-sm">{item.name}</h3>
              <p className="text-xs text-gray-500">
                ₹{item.price} x {item.quantity}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch(decreaseQuantity(item.id))}
                className="w-7 h-7 flex items-center justify-center border rounded-full text-sm"
              >
                -
              </button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <button
                onClick={() => dispatch(addToCart(item))}
                className="w-7 h-7 flex items-center justify-center border rounded-full text-sm"
              >
                +
              </button>
            </div>

            <button
              onClick={() => dispatch(removeFromCart(item.id))}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* 🔹 Total + Checkout */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <span className="text-sm font-semibold">Total:</span>
          <span className="text-lg font-bold text-indigo-600 ml-2">
            ₹{total}
          </span>
        </div>

        <button
          onClick={() => navigate("/checkout")}
          className="w-full sm:w-auto bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 active:scale-[0.98] transition"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
