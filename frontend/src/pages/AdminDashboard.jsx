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

  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
    price: "",
  });

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
  };

  const resetForm = () => {
    setForm({ name: "", description: "", image: "", price: "" });
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      if (editing) {
        const res = await axiosClient.put(
          `/admin/products/${editing._id}`,
          form
        );
        setMessage(res.data.message || "Product updated");
      } else {
        const res = await axiosClient.post("/admin/products", form);
        setMessage(res.data.message || "Product created");
      }
      resetForm();
      await loadProducts();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong while saving product"
      );
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
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
        <p className="text-sm text-gray-600 mb-4">
          Create, update and delete products.
        </p>

        {message && (
          <p className="mb-2 text-sm text-green-600 font-medium">{message}</p>
        )}
        {error && (
          <p className="mb-2 text-sm text-red-600 font-medium">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              name="name"
              type="text"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              name="price"
              type="number"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              name="image"
              type="text"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be a valid URL (Zod validator fail hoga agar sahi URL nahi).
            </p>
          </div>

          <div className="md:col-span-2 flex gap-3 mt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
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
                className="px-3 py-2 text-sm border rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">All Products</h3>
          {loading && <span className="text-xs text-gray-500">Loading...</span>}
        </div>

        {products.length === 0 ? (
          <p className="text-sm text-gray-600">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((p) => (
              <div
                key={p._id}
                className="border rounded-lg p-3 flex flex-col gap-2"
              >
                <div className="flex items-center gap-3">
                  {p.image && (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-16 h-16 rounded object-cover"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold text-sm">{p.name}</h4>
                    <p className="text-xs text-gray-500">
                      {p.description?.slice(0, 80)}
                      {p.description && p.description.length > 80 && "..."}
                    </p>
                    <p className="text-sm font-bold text-indigo-600 mt-1">
                      ₹{p.price}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 justify-end mt-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="text-xs px-3 py-1 rounded-md bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="text-xs px-3 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200"
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
  );
}
