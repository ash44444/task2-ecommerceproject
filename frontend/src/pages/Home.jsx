// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useDispatch } from "react-redux";
import { addToCart } from "../store/slices/cartSlice";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  // BUY NOW → directly go to checkout with single item
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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 px-3 sm:px-4 md:px-6 py-4 sm:py-6 lg:py-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-7">
        {/* Hero Section */}
        <section className="bg-linear-to-r from-indigo-600 via-indigo-500 to-indigo-700 text-white rounded-2xl shadow-md sm:shadow-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-8 sm:py-7 lg:px-10 lg:py-8 flex flex-col md:flex-row items-center gap-5 md:gap-10">
            <div className="flex-1">
              <p className="inline-flex items-center text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full mb-3">
                New season • Best deals
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 leading-tight">
                Welcome to{" "}
                <span className="text-yellow-300 drop-shadow-sm">
                  ShopSmart
                </span>
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-indigo-100 mb-4 max-w-xl">
                Discover hand-picked products at great prices. Browse, explore,
                and add your favourites to the cart. Click on any product to
                view full details like a real ecommerce app.
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-2">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center text-xs sm:text-sm font-semibold bg-white text-indigo-700 px-4 py-2.5 rounded-full shadow-md hover:bg-indigo-50 active:scale-[0.98] transition"
                >
                  View All Products
                </Link>
                <span className="text-[11px] sm:text-[12px] text-indigo-100">
                  {products.length > 0
                    ? `Over ${products.length} items available today`
                    : "Login and ask admin to add products"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="bg-linear-to-b from-gray-50 to-gray-100 rounded-2xl shadow-sm p-4 sm:p-6 lg:p-7">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                Latest Products
              </h2>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-[10px] sm:text-[11px] font-medium text-indigo-600">
              Showing {products.length} items
            </span>
          </div>

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

          {!loading && !error && products.length === 0 && (
            <p className="text-xs sm:text-sm text-gray-600">
              No products found. Ask admin to add some.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mt-2">
            {products.map((product) => (
              <div
                key={product.id}
                className="group border border-gray-200 rounded-2xl overflow-hidden flex flex-col bg-white shadow-sm hover:shadow-xl hover:border-indigo-200 transition"
              >
                {/* Clickable image → details */}
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

                <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
                  {/* Clickable title → details */}
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

                  {/* Add to Cart + Buy buttons */}
                  <div className="mt-auto w-full flex flex-col xs:flex-row sm:flex-row gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full xs:flex-1 sm:flex-1 bg-indigo-600 text-white py-2.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-indigo-700 active:scale-[0.98] transition"
                    >
                      Add to Cart
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBuyNow(product)}
                      className="w-full xs:flex-1 sm:flex-1 border border-orange-500 text-orange-600 py-2.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-orange-50 active:scale-[0.98] transition"
                    >
                      Buy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
