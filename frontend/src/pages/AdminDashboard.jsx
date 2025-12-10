// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(null); // product object or null

  // field-wise form data
  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
    price: "",
  });

  // field-wise errors
  const [fieldErrors, setFieldErrors] = useState({});

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosClient.get("/products");
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load products for admin"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // field ka error clear
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const resetForm = () => {
    setForm({ name: "", description: "", image: "", price: "" });
    setEditing(null);
    setFieldErrors({});
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    setFieldErrors({});

    try {
      let res;
      if (editing) {
        res = await axiosClient.put(`/admin/products/${editing._id}`, form);
        setMessage(res.data.message || "Product updated");
      } else {
        res = await axiosClient.post("/admin/products", form);
        setMessage(res.data.message || "Product created");
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      const data = err.response?.data || {};
      const msg = data.message || "Something went wrong while saving product";

      if (data.errors && typeof data.errors === "object") {
        setFieldErrors(data.errors);
        setError("Please fix the highlighted fields.");
      } else {
        setError(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name || "",
      description: product.description || "",
      image: product.image || "",
      price: product.price || "",
    });
    setFieldErrors({});
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await axiosClient.delete(`/admin/products/${id}`);
      setMessage(res.data.message || "Product deleted");
      await loadProducts();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong while deleting product"
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 px-3 sm:px-4 md:px-6 py-4 sm:py-6 lg:py-8">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        {/* FORM CARD */}
        <div className="bg-white shadow-md sm:shadow-lg rounded-2xl p-4 sm:p-6 md:p-7">
          <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
            Admin Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">
            Create, update and delete products.
          </p>

          {message && (
            <p className="mb-2 text-xs sm:text-sm text-green-600 font-medium">
              {message}
            </p>
          )}
          {error && (
            <p className="mb-2 text-xs sm:text-sm text-red-600 font-medium">
              {error}
            </p>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid gap-3 sm:gap-4 md:grid-cols-2"
          >
            {/* NAME */}
            <div className="md:col-span-1">
              <label className="block text-xs sm:text-sm font-medium mb-1">
                Name
              </label>
              <input
                name="name"
                type="text"
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  fieldErrors.name ? "border-red-500" : "border-gray-300"
                }`}
                value={form.name}
                onChange={handleChange}
                required
              />
              {fieldErrors.name && (
                <p className="text-[11px] sm:text-xs text-red-600 mt-1">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* PRICE */}
            <div className="md:col-span-1">
              <label className="block text-xs sm:text-sm font-medium mb-1">
                Price
              </label>
              <input
                name="price"
                type="number"
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  fieldErrors.price ? "border-red-500" : "border-gray-300"
                }`}
                value={form.price}
                onChange={handleChange}
                required
              />
              {fieldErrors.price && (
                <p className="text-[11px] sm:text-xs text-red-600 mt-1">
                  {fieldErrors.price}
                </p>
              )}
            </div>

            {/* DESCRIPTION */}
            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                name="description"
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  fieldErrors.description ? "border-red-500" : "border-gray-300"
                }`}
                rows={3}
                value={form.description}
                onChange={handleChange}
              />
              {fieldErrors.description && (
                <p className="text-[11px] sm:text-xs text-red-600 mt-1">
                  {fieldErrors.description}
                </p>
              )}
            </div>

            {/* IMAGE URL */}
            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-medium mb-1">
                Image URL
              </label>
              <input
                name="image"
                type="text"
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  fieldErrors.image ? "border-red-500" : "border-gray-300"
                }`}
                value={form.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                required
              />
              <p className="text-[11px] sm:text-xs text-gray-500 mt-1">
                Must be a valid image URL (jpg, jpeg, png, webp, gif, avif)
              </p>
              {fieldErrors.image && (
                <p className="text-[11px] sm:text-xs text-red-600 mt-1">
                  {fieldErrors.image}
                </p>
              )}
            </div>

            <div className="md:col-span-2 flex flex-col sm:flex-row gap-2 sm:gap-3 mt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editing
                  ? "Update Product"
                  : "Create Product"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto px-4 py-2 text-sm border rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* PRODUCTS LIST */}
        <div className="bg-white shadow-md sm:shadow-lg rounded-2xl p-4 sm:p-6 md:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h3 className="text-lg sm:text-xl font-semibold">All Products</h3>
            {loading && (
              <span className="text-[11px] sm:text-xs text-gray-500">
                Loading...
              </span>
            )}
          </div>

          {products.length === 0 ? (
            <p className="text-xs sm:text-sm text-gray-600">
              No products found.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {products.map((p) => (
                <div
                  key={p._id}
                  className="border rounded-lg p-3 sm:p-4 flex flex-col gap-2 bg-white"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    {p.image && (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm sm:text-[15px] truncate">
                        {p.name}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-3">
                        {p.description}
                      </p>
                      <p className="text-sm sm:text-[15px] font-bold text-indigo-600 mt-1">
                        ₹{p.price}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end mt-1 sm:mt-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="text-[11px] sm:text-xs px-3 py-1.5 rounded-md bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="text-[11px] sm:text-xs px-3 py-1.5 rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
