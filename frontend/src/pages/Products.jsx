// src/pages/Products.jsx
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useDispatch } from "react-redux";
import { addToCart } from "../store/slices/cartSlice";
import { Link, useNavigate } from "react-router-dom";

export default function Products() {
  const [products, setProducts] = useState([]); // only backend data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axiosClient.get("/products");

        if (res.data.success && Array.isArray(res.data.products)) {
          const normalized = res.data.products.map((p) => ({
            id: p._id,
            name: p.name,
            price: p.price,
            description: p.description,
            image: p.image,
          }));
          setProducts(normalized);
        } else {
          setProducts([]);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load products from server"
        );
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  // BUY NOW → directly go to checkout
  const handleBuyNow = (product) => {
    const buyItem = {
      _id: product.id, // backend expects productId = _id
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description,
      quantity: 1,
    };

    navigate("/checkout", {
      state: {
        items: [buyItem],
        total: product.price,
      },
    });
  };

  // Sorting logic
  const getSortedProducts = () => {
    if (sortBy === "priceLowHigh") {
      return [...products].sort((a, b) => a.price - b.price);
    }
    if (sortBy === "priceHighLow") {
      return [...products].sort((a, b) => b.price - a.price);
    }
    if (sortBy === "nameAZ") {
      return [...products].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === "nameZA") {
      return [...products].sort((a, b) => b.name.localeCompare(a.name));
    }
    return products;
  };

  const sortedProducts = getSortedProducts();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 px-3 sm:px-4 md:px-6 py-4 sm:py-6 lg:py-8">
      <div className="max-w-6xl mx-auto bg-linear-to-b from-gray-50 to-gray-100 rounded-2xl shadow-sm p-4 sm:p-6 lg:p-7">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              All Products
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-500">
              Fetched from backend (MongoDB)
            </p>
          </div>

          {/* Right side: count + sort dropdown */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-[10px] sm:text-[11px] font-medium text-indigo-600">
              {sortedProducts.length} items available
            </span>

            <div className="flex items-center gap-1 text-[10px] sm:text-xs">
              <span className="text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-full px-2 py-1 text-[10px] sm:text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="default">Default</option>
                <option value="priceLowHigh">Price: Low to High</option>
                <option value="priceHighLow">Price: High to Low</option>
                <option value="nameAZ">Name: A → Z</option>
                <option value="nameZA">Name: Z → A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading / Error / Empty states */}
        {loading && (
          <p className="text-xs sm:text-sm text-gray-500 mb-3">
            Loading products...
          </p>
        )}

        {error && (
          <p className="text-xs sm:text-sm text-red-600 mb-3 font-medium">
            {error}
          </p>
        )}

        {!loading && !error && sortedProducts.length === 0 && (
          <p className="text-xs sm:text-sm text-gray-600">
            No products found. Ask admin to add some.
          </p>
        )}

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-2">
          {sortedProducts.map((product) => (
            <div
              key={product.id}
              className="group border border-gray-200 rounded-2xl overflow-hidden bg-white flex flex-col transition shadow-sm hover:shadow-xl hover:border-indigo-200"
            >
              <Link to={`/products/${product.id}`}>
                {product.image && (
                  <div className="w-full aspect-4/3 bg-gray-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
              </Link>

              <div className="p-4 sm:p-5 flex flex-col flex-1">
                <Link to={`/products/${product.id}`}>
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-1 text-gray-900 group-hover:text-indigo-600 line-clamp-1">
                    {product.name}
                  </h3>
                </Link>

                <p className="text-[12px] sm:text-[13px] text-gray-600 mb-2 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mt-1 mb-3">
                  <p className="text-lg sm:text-xl font-bold text-indigo-600">
                    ₹{product.price}
                  </p>
                  <Link
                    to={`/products/${product.id}`}
                    className="text-[11px] sm:text-xs font-medium text-indigo-600 hover:underline"
                  >
                    View details
                  </Link>
                </div>

                {/* Add to Cart + Buy Now buttons */}
                <div className="mt-auto w-full flex flex-col xs:flex-row sm:flex-row gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-indigo-600 text-white py-2.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-indigo-700 active:scale-[0.98] transition"
                  >
                    Add to Cart
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBuyNow(product)}
                    className="flex-1 border border-orange-500 text-orange-600 py-2.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-orange-50 active:scale-[0.98] transition"
                  >
                    Buy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
