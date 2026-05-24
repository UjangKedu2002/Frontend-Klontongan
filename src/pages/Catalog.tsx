import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useApp } from "../context/AppContext";
import { Product } from "../types";
import { Search, Filter, ShoppingBag, Eye, Info, Inbox } from "lucide-react";

const fixedCategories = [
  "Fashion",
  "Electronic",
  "Gaming",
  "Home & Living",
  "Beauty & Health",
];

const getCategoryName = (product: any) => {
  if (product.category?.name) return product.category.name;

  const categoryMap: Record<number, string> = {
    1: "Fashion",
    2: "Electronic",
    3: "Gaming",
    4: "Home & Living",
    5: "Beauty & Health",
  };

  return categoryMap[Number(product.categoryId)] || "General";
};

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<number>(50000000);

  const { addToCart, showToaster, backendConnected } = useApp();

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
        err.response?.data?.message ||
          "Gagal mengambil data produk dari backend",
        "error"
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    return ["all", ...fixedCategories];
  }, []);

  const filteredProducts = products.filter((product: any) => {
    const productName = product.name || "";
    const productDescription = product.description || "";
    const productCategory = getCategoryName(product);

    const matchesSearch =
      productName.toLowerCase().includes(search.toLowerCase()) ||
      productDescription.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || productCategory === selectedCategory;

    const matchesPrice = Number(product.price || 0) <= priceRange;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  return (
    <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="glass-panel relative mb-10 overflow-hidden rounded-3xl border border-white/10 p-8 shadow-[0_0_50px_rgba(79,70,229,0.15)] sm:p-12">
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-indigo-600 opacity-35 blur-[130px]" />
        <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-purple-600 opacity-20 blur-[90px]" />

        <div className="relative z-10 max-w-2xl">
          <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            Temukan Produk Favoritmu dengan Mudah!
          </h1>

          <p className="mb-6 text-sm leading-relaxed text-slate-400 sm:text-base">
            Setiap produk dipilih dengan kualitas terbaik untuk memberikan
            pengalaman belanja yang praktis dan terpercaya.
          </p>
        </div>
      </div>

      {backendConnected === false && (
        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/15 p-4 text-amber-200 backdrop-blur-md">
          <Info className="mt-0.5 shrink-0 text-amber-400" size={18} />
          <div>
            <h4 className="text-sm font-semibold">
              Local Server Connection Status: Inactive
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              Tidak bisa connect ke backend{" "}
              <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-[11px] text-amber-300">
                https://backend-klontongan-production.up.railway.app/api
              </code>
              . Pastikan backend ExpressJS aktif.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="glass-panel h-fit space-y-6 rounded-3xl border border-white/10 p-6 lg:col-span-1">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white">
              <Filter size={16} className="text-indigo-400" />
              Filter
            </h3>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
                setPriceRange(50000000);
              }}
              className="cursor-pointer font-mono text-xs font-bold text-indigo-400 transition-colors hover:text-indigo-300"
            >
              RESET
            </button>
          </div>

          <div className="space-y-2">
            <label className="block font-mono text-xs font-bold uppercase tracking-widest text-slate-400">
              Search
            </label>

            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-slate-500"
                size={16}
              />

              <input
                type="text"
                placeholder="Nama, Deskripsi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-mono text-xs font-bold uppercase tracking-widest text-slate-400">
              Kategori
            </label>

            <div className="flex max-h-48 flex-col gap-1.5 overflow-y-auto pr-1">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full cursor-pointer rounded-xl px-3 py-2 text-left text-xs transition-all duration-200 ${
                    selectedCategory === category
                      ? "border border-indigo-500/30 bg-indigo-600 font-bold text-white shadow-[0_0_15px_rgba(79,70,229,0.25)]"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {category === "all" ? "All Categories" : category}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400">
                Harga Maksimal
              </label>

              <span className="font-mono text-xs font-bold text-indigo-400">
                {formatIDR(priceRange)}
              </span>
            </div>

            <input
              type="range"
              min="1000"
              max="50000000"
              step="50000"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-indigo-500 focus:outline-none"
            />

            <div className="flex justify-between font-mono text-[10px] text-slate-500">
              <span>Rp 1.000</span>
              <span>Rp 50M</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="glass-panel flex flex-col items-center justify-center rounded-3xl border border-white/10 py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent shadow-[0_0_20px_rgba(99,102,241,0.2)]" />
              <p className="mt-4 font-mono text-xs font-medium text-slate-400">
                Loading Mohon Bersabar...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="glass-panel flex flex-col items-center justify-center rounded-3xl border border-white/10 px-6 py-24 text-center">
              <div className="mb-4 rounded-full border border-white/10 bg-white/5 p-4 text-slate-400 shadow-inner">
                <Inbox size={32} className="text-indigo-400" />
              </div>

              <h3 className="text-lg font-bold text-white">
                No Products Registered
              </h3>

              <p className="mt-1 mb-6 max-w-sm text-xs leading-relaxed text-slate-400">
                Produk tidak ditemukan. Cek filter, kategori, harga, atau
                pastikan data produk sudah tersimpan di database.
              </p>

              <Link
                to="/login"
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-indigo-500 hover:shadow-[0_0_15px_rgba(79,70,229,0.3)]"
              >
                Access Admin Portal to Setup Inventory
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product: any) => {
                const categoryName = getCategoryName(product);

                return (
                  <div
                    key={product.id}
                    className="glass-panel group flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 transition-all duration-300 hover:border-indigo-500/50 hover:shadow-[0_0_25px_rgba(99,102,241,0.15)]"
                  >
                    <div className="relative aspect-[4/3] shrink-0 overflow-hidden border-b border-white/5 bg-white/5">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center font-mono text-xs text-slate-500">
                          <ShoppingBag
                            size={24}
                            className="mb-2 text-indigo-400 opacity-50"
                          />
                          No product image
                        </div>
                      )}

                      <span className="absolute left-3 top-3 rounded bg-slate-950/80 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-indigo-300 shadow-lg backdrop-blur-md">
                        {categoryName}
                      </span>

                      {product.stock <= 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/75 text-xs font-medium uppercase tracking-widest text-rose-400 backdrop-blur-sm">
                          SOLD OUT
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex-1">
                        <h4 className="mb-1 line-clamp-1 text-base font-bold text-white transition-colors group-hover:text-indigo-300">
                          {product.name}
                        </h4>

                        <p className="mb-4 min-h-[2rem] line-clamp-2 text-xs leading-relaxed text-slate-400">
                          {product.description ||
                            "No supplemental details registered."}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500">
                              Pricing
                            </p>

                            <span className="text-base font-bold tracking-tight text-white">
                              {formatIDR(product.price)}
                            </span>
                          </div>

                          <div className="text-right">
                            <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500">
                              Inventory
                            </p>

                            <span
                              className={`font-mono text-[11px] ${
                                product.stock > 5
                                  ? "text-slate-400"
                                  : "font-bold text-amber-500"
                              }`}
                            >
                              {product.stock > 0
                                ? `${product.stock} units`
                                : "Out of Stock"}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-5 gap-2">
                          <Link
                            to={`/product/${product.id}`}
                            className="col-span-1 flex items-center justify-center rounded-xl border border-white/10 text-slate-400 transition-all hover:bg-white/10 hover:text-white"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </Link>

                          <button
                            type="button"
                            disabled={product.stock <= 0}
                            onClick={() => addToCart(product.id)}
                            className="col-span-4 flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/10 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/25 disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-slate-500"
                          >
                            <ShoppingBag
                              size={14}
                              className="shrink-0 text-white"
                            />
                            <span>Buy Now</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
