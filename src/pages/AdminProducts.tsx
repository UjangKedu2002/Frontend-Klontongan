import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useApp } from "../context/AppContext";
import { Product } from "../types";
import {
  Plus,
  Edit2,
  Trash2,
  Camera,
  RefreshCw,
  XCircle,
  Hammer,
  EyeOff,
  Save,
  Sparkles,
} from "lucide-react";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<number>(1);

  const categories = [
    { id: 1, name: "Fashion" },
    { id: 2, name: "Electronic" },
    { id: 3, name: "Gaming" },
    { id: 4, name: "Home & Living" },
    { id: 5, name: "Beauty & Health" },
  ];
  const [image, setImage] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const { showToaster } = useApp();

  const loadProducts = async () => {
    setLoading(true);

    try {
      const res = await api.get("/products");

      const productList = res.data?.products;

      if (Array.isArray(productList)) {
        setProducts(productList);
      } else {
        setProducts([]);
      }
    } catch (err: any) {
      console.error("LOAD PRODUCTS ERROR:", err);
      showToaster(
        err.response?.data?.message || "Gagal memuat data produk",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      showToaster("Format gambar harus JPG, JPEG, PNG, atau WEBP", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToaster("Ukuran gambar maksimal 5MB", "error");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setIsUploading(true);

    try {
      showToaster("Mengupload gambar ke Cloudinary...", "info");

      const res = await api.post("/upload", formData);

      const uploadedImageUrl = res.data?.data?.imageUrl;

      if (!uploadedImageUrl) {
        throw new Error("Backend tidak mengembalikan imageUrl");
      }

      setImage(uploadedImageUrl);
      showToaster("Gambar berhasil diupload", "success");
    } catch (err: any) {
      console.error("UPLOAD IMAGE ERROR:", err);
      showToaster(
        err.response?.data?.message || "Gagal upload gambar produk",
        "error"
      );
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const getProductCategoryName = (product: any) => {
    const foundCategory = categories.find(
      (cat) => cat.id === product.categoryId
    );

    return foundCategory?.name || "Unknown";
  };

  const handleEditSetup = (product: any) => {
    setEditingId(product.id);
    setName(product.name || "");
    setDescription(product.description || "");
    setPrice(Number(product.price || 0));
    setStock(Number(product.stock || 0));
    setCategoryId(Number(product.categoryId || product.category?.id || 1));
    setImage(product.image || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleResetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice(0);
    setStock(0);
    setCategoryId(1);
    setImage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || price <= 0 || stock < 0 || !categoryId) {
      showToaster(
        "Nama, deskripsi, harga, stok, dan categoryId wajib diisi",
        "error"
      );
      return;
    }

    const payload = {
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      image,
      categoryId: Number(categoryId),
    };

    setSubmitLoading(true);

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        showToaster("Produk berhasil diperbarui", "success");
      } else {
        await api.post("/products", payload);
        showToaster("Produk berhasil ditambahkan ke database", "success");
      }

      handleResetForm();
      await loadProducts();
    } catch (err: any) {
      console.error("SUBMIT PRODUCT ERROR:", err);
      showToaster(
        err.response?.data?.message || "Gagal menyimpan produk ke database",
        "error"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    const confirmDelete = window.confirm(
      "Yakin ingin menghapus produk ini dari database?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/products/${id}`);
      showToaster("Produk berhasil dihapus", "success");
      await loadProducts();
    } catch (err: any) {
      console.error("DELETE PRODUCT ERROR:", err);
      showToaster(
        err.response?.data?.message || "Gagal menghapus produk",
        "error"
      );
    }
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 text-slate-900 sm:px-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Hammer className="text-teal-600" size={24} />
          Product Management
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Tambah, edit, upload gambar, dan hapus produk langsung ke database.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        <div className="h-fit space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider">
              <Sparkles size={16} className="text-teal-600" />
              {editingId ? "Edit Product" : "Create Product"}
            </h3>

            {editingId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="rounded bg-slate-100 px-2 py-1 font-mono text-[10px] font-bold uppercase text-slate-500 hover:bg-slate-200"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block font-mono text-xs font-semibold uppercase tracking-widest text-slate-700">
                Product Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Sneakers Premium"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-xs font-semibold uppercase tracking-widest text-slate-700">
                Product Category
              </label>

              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <p className="text-[10px] text-slate-400">
                Pilih kategori produk.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block font-mono text-xs font-semibold uppercase tracking-widest text-slate-700">
                  Price
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={price || ""}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="250000"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-xs font-semibold uppercase tracking-widest text-slate-700">
                  Stock
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  placeholder="10"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-xs font-semibold uppercase tracking-widest text-slate-700">
                Description
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi produk..."
                rows={4}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-2">
              <label className="mb-1 block font-mono text-xs font-semibold uppercase tracking-widest text-slate-700">
                Product Image
              </label>

              <div className="relative cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center transition-all hover:bg-slate-100">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                />

                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="rounded-full border border-slate-100 bg-white p-2.5 text-slate-500 shadow-sm">
                    <Camera size={16} />
                  </div>

                  <span className="block text-xs font-semibold text-slate-700">
                    {isUploading ? "Uploading..." : "Click to Upload Image"}
                  </span>

                  <span className="font-mono text-[10px] text-slate-400">
                    Field name: image | JPG, JPEG, PNG, WEBP
                  </span>
                </div>
              </div>

              {image && (
                <div className="pt-2">
                  <span className="mb-1 block font-mono text-[10px] text-slate-400">
                    Image Preview:
                  </span>

                  <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    <img
                      src={image}
                      alt="Upload Preview"
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />

                    <button
                      type="button"
                      onClick={() => setImage("")}
                      className="absolute right-2 top-2 rounded-lg border border-slate-200 bg-white/90 p-1 text-rose-600 transition-colors hover:bg-white"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitLoading || isUploading}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-transparent bg-slate-900 py-3 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-75"
            >
              <Save size={14} />
              {submitLoading
                ? "Saving..."
                : editingId
                ? "Update Product"
                : "Create Product"}
            </button>
          </form>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400">
              Total Products: {products.length}
            </span>

            <button
              type="button"
              onClick={loadProducts}
              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 shadow-sm hover:bg-slate-50"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slate-900" />
              <p className="mt-4 text-xs text-slate-500">
                Loading Mohon Bersabar...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center">
              <EyeOff size={32} className="mb-3 text-slate-400" />
              <h4 className="text-sm font-semibold text-slate-800">
                Product database is empty
              </h4>
              <p className="mt-1 max-w-sm text-xs text-slate-500">
                Belum ada produk di database. Tambahkan produk pertama dari form
                sebelah kiri.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product: any) => (
                <div
                  key={product.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-slate-300 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <Plus size={16} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-bold text-slate-900">
                        {product.name}
                      </h4>

                      <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold uppercase">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">
                          {getProductCategoryName(product)}
                        </span>

                        <span className="text-slate-400">|</span>

                        <span
                          className={
                            product.stock > 0
                              ? "text-teal-600"
                              : "text-rose-600"
                          }
                        >
                          Stock: {product.stock}
                        </span>

                        <span className="text-slate-400">|</span>

                        <span className="text-slate-800">
                          {formatIDR(product.price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleEditSetup(product)}
                      className="rounded-lg border border-slate-200 p-2 text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                    >
                      <Edit2 size={12} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      className="rounded-lg border border-slate-200 p-2 text-rose-600 shadow-sm transition-colors hover:bg-rose-50"
                    >
                      <Trash2 size={12} />
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
