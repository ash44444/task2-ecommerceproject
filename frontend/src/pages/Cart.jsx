// src/pages/Cart.jsx
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromCart,
  decreaseQuantity,
  addToCart,
  clearCart,
} from "../store/slices/cartSlice";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const items = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 🔹 EMPTY CART STATE
  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 px-3 sm:px-4 md:px-6 py-4 sm:py-6 lg:py-8">
        <div className="max-w-3xl mx-auto bg-white shadow-md sm:shadow-lg rounded-2xl p-4 sm:p-6 md:p-7">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
            Your Cart
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Your cart is empty. Add some products to continue.
          </p>
        </div>
      </div>
    );
  }

  // 🔹 CART WITH ITEMS
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 px-3 sm:px-4 md:px-6 py-4 sm:py-6 lg:py-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md sm:shadow-lg rounded-2xl p-4 sm:p-6 md:p-7">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">Your Cart</h2>
          <button
            onClick={() => dispatch(clearCart())}
            className="self-start sm:self-auto text-[11px] sm:text-xs px-3 py-1.5 rounded-md bg-red-100 text-red-700 hover:bg-red-200"
          >
            Clear Cart
          </button>
        </div>

        {/* Cart items */}
        <div className="space-y-3 sm:space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 border rounded-lg p-3 sm:p-4"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-16 sm:w-24 sm:h-18 object-cover rounded-md shrink-0"
                />
              )}

              {/* title + price */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-[15px] truncate">
                  {item.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                  ₹{item.price} × {item.quantity}
                </p>
              </div>

              {/* quantity controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => dispatch(decreaseQuantity(item.id))}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border rounded-full text-sm sm:text-base"
                >
                  -
                </button>
                <span className="w-6 text-center text-sm">{item.quantity}</span>
                <button
                  onClick={() => dispatch(addToCart(item))}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border rounded-full text-sm sm:text-base"
                >
                  +
                </button>
              </div>

              {/* remove button */}
              <button
                onClick={() => dispatch(removeFromCart(item.id))}
                className="text-[11px] sm:text-xs text-red-600 hover:text-red-800 mt-1 sm:mt-0"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Total + Checkout */}
        <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto">
            <span className="text-sm sm:text-base font-semibold">Total:</span>
            <span className="text-lg sm:text-xl font-bold text-indigo-600 ml-2">
              ₹{total}
            </span>
          </div>

          <button
            onClick={() =>
              navigate("/checkout", {
                state: {
                  items,
                  total,
                },
              })
            }
            className="w-full sm:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm sm:text-[15px] font-semibold hover:bg-indigo-700 active:scale-[0.98] transition"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
