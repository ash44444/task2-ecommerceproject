// src/pages/ProductDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useDispatch } from "react-redux";
import { addToCart } from "../store/slices/cartSlice";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axiosClient.get("/products");

        if (res.data.success && Array.isArray(res.data.products)) {
          const raw = res.data.products.find((p) => p._id === id);
          if (!raw) {
            setError("Product not found");
            setProduct(null);
          } else {
            setProduct({
              id: raw._id,
              name: raw.name,
              price: raw.price,
              description: raw.description,
              image: raw.image,
            });
          }
        } else {
          setError("Unable to load product");
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load product from server"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) dispatch(addToCart(product));
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-sm text-gray-500">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-sm text-red-600 mb-3">
          {error || "Product not found"}
        </p>
        <Link
          to="/products"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-b from-gray-50 to-gray-100 rounded-2xl p-4 sm:p-6">
      {/* breadcrumb */}
      <div className="mb-3 text-[11px] text-gray-500">
        <Link to="/products" className="hover:text-indigo-600">
          Products
        </Link>{" "}
        <span className="mx-1">›</span>
        <span className="text-gray-700 line-clamp-1">{product.name}</span>
      </div>

      <div className="bg-white shadow-lg rounded-2xl px-4 py-5 sm:px-8 sm:py-7">
        <div className="flex flex-col md:flex-row gap-8">
          {/* LEFT: Product Image – ecommerce style */}
          <div className="md:w-1/2 flex justify-center items-center">
            <div className="w-[90%] max-w-[420px] bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
              <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden flex justify-center items-center">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">
                    No image available
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Details */}
          <div className="md:w-1/2 flex flex-col">
            {/* title + info */}
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-gray-900">
              {product.name}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mb-3">
              Sold by{" "}
              <span className="font-medium text-gray-700">AshishStore</span> •
              Eligible for fast delivery
            </p>

            {/* small divider */}
            <div className="h-px bg-gray-200 my-2" />

            {/* price block */}
            <div className="mb-4">
              <div className="flex items-end gap-2">
                <span className="text-sm text-gray-500">Price:</span>
                <span className="text-3xl font-bold text-indigo-600">
                  ₹{product.price}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Inclusive of all taxes • Free delivery on eligible orders
              </p>
            </div>

            {/* stock + fake highlights */}
            <div className="mb-5">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-green-100 text-green-700">
                In stock
              </span>
              <ul className="mt-3 space-y-1 text-sm text-gray-600 list-disc list-inside">
                <li>High quality product for daily use</li>
                <li>Secure packaging and fast shipping</li>
                <li>Easy returns as per policy</li>
              </ul>
            </div>

            {/* buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-md shadow-indigo-200 transition active:scale-[0.98]"
              >
                Add to Cart
              </button>
              <button
                type="button"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-md shadow-orange-200 transition active:scale-[0.98]"
              >
                Buy Now
              </button>
            </div>

            {/* description */}
            <div className="mt-1">
              <h2 className="text-sm font-semibold text-gray-800 mb-1">
                Product description
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* back link */}
            <div className="mt-6">
              <Link
                to="/products"
                className="text-sm text-gray-600 hover:text-indigo-600"
              >
                ← Back to all products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
