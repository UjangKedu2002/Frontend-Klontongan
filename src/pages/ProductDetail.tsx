import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useApp } from "../context/AppContext";
import {
  ShoppingBag,
  ChevronLeft,
  Plus,
  Minus,
  Tag,
  ShieldAlert,
  Award,
  ArrowRight,
  Sparkles,
} from "lucide-react";

type ProductDetailData = {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  stock: number;
  image?: string;
  categoryId?: number;
  category?: {
    id: number;
    name: string;
  };
};

const categoryMap: Record<number, string> = {
  1: "Fashion",
  2: "Electronic",
  3: "Gaming",
  4: "Home & Living",
  5: "Beauty & Health",
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductDetailData | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductDetailData[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  const { addToCart, showToaster } = useApp();

  const getCategoryName = (product: ProductDetailData) => {
    if (product.category?.name) return product.category.name;
    if (product.categoryId) return categoryMap[product.categoryId] || "General";
    return "General";
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(num || 0));
  };

  const loadProduct = async () => {
    if (!id) return;

    setLoading(true);

    try {
      const detailRes = await api.get(`/products/${id}`);
      const productData = detailRes.data?.product;

      if (!productData) {
        throw new Error("Product detail tidak ditemukan dari backend");
      }

      setProduct(productData);
      setQty(1);

      const allProductsRes = await api.get("/products");
      const allProducts = allProductsRes.data?.products;

      if (Array.isArray(allProducts)) {
        const related = allProducts
          .filter((item: ProductDetailData) => {
            return (
              item.id !== productData.id &&
              item.categoryId === productData.categoryId
            );
          })
          .slice(0, 6);

        setRelatedProducts(related);
      } else {
        setRelatedProducts([]);
      }
    } catch (err: any) {
      console.error("LOAD PRODUCT DETAIL ERROR:", err);
      showToaster(
        err.response?.data?.message || "Gagal mengambil detail produk",
        "error"
      );
      setProduct(null);
      setRelatedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const handleDecrease = () => {
    setQty((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    if (!product) return;

    if (qty >= product.stock) {
      showToaster("Quantity tidak boleh melebihi stok produk", "info");
      return;
    }

    setQty((prev) => prev + 1);
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (product.stock <= 0) {
      showToaster("Produk sedang habis", "error");
      return;
    }

    try {
      const success = await addToCart(product.id, qty);

      if (success) {
        showToaster("Produk berhasil masuk ke cart", "success");
        navigate("/cart");
      }
    } catch (err: any) {
      console.error("ADD TO CART ERROR:", err);
      showToaster(
        err.response?.data?.message || "Gagal menambahkan produk ke cart",
        "error"
      );
    }
  };

  if (loading) {
    return (
      <div className="relative z-10 mx-auto flex min-h-[50vh] max-w-7xl flex-col items-center justify-center px-4 py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent shadow-[0_0_20px_rgba(99,102,241,0.2)]" />
        <p className="mt-4 font-mono text-xs text-slate-400">
          Loading Mohon Bersabar...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 text-center">
        <h3 className="text-xl font-bold text-white">Product Not Found</h3>
        <p className="mb-6 mt-1 text-xs text-slate-400">
          Produk tidak ditemukan di database.
        </p>

        <Link
          to="/"
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const categoryName = getCategoryName(product);

  return (
    <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 transition-colors hover:text-indigo-300"
      >
        <ChevronLeft size={14} />
        Kembali ke Dashboard
      </Link>

      <div className="glass-panel grid grid-cols-1 gap-8 overflow-hidden rounded-3xl border border-white/10 p-6 shadow-[0_0_50px_rgba(79,70,229,0.15)] sm:p-8 md:grid-cols-2">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex flex-col items-center font-mono text-xs text-slate-500">
              <ShoppingBag
                size={48}
                className="mb-3 text-indigo-400 opacity-30"
              />
              No product image
            </div>
          )}

          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-950/80 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-indigo-300 shadow-lg backdrop-blur-md">
            <Tag size={12} className="text-indigo-400" />
            {categoryName}
          </span>
        </div>

        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
              {product.name}
            </h1>

            <p className="text-3xl font-bold tracking-tight text-white">
              {formatIDR(product.price)}
            </p>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-slate-300">
              <h4 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-indigo-300">
                Product Description
              </h4>

              <p>
                {product.description || "Belum ada deskripsi untuk produk ini."}
              </p>
            </div>
          </div>

          <div className="space-y-4 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="block font-mono text-xs font-bold uppercase tracking-widest text-slate-400">
                  Quantity
                </span>

                <span className="font-mono text-[11px] text-slate-500">
                  {product.stock} stock tersedia
                </span>
              </div>

              <div className="flex shrink-0 items-center overflow-hidden rounded-lg border border-white/15 bg-white/5">
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={qty <= 1}
                  className="px-3 py-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
                >
                  <Minus size={14} />
                </button>

                <span className="w-10 select-none px-4 text-center font-mono text-xs font-bold text-white">
                  {qty}
                </span>

                <button
                  type="button"
                  onClick={handleIncrease}
                  disabled={qty >= product.stock}
                  className="px-3 py-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-transparent bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(79,70,229,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-[0_0_30px_rgba(79,70,229,0.45)] disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-slate-500 disabled:opacity-50"
            >
              <ShoppingBag size={16} />
              {product.stock > 0 ? "Add to Cart" : "Item Sold Out"}
            </button>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <div className="mb-6 flex flex-col justify-between gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-indigo-300">
              <Sparkles size={12} />
              Produk dengan Kategori yang sama
            </div>

            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Produk Serupa dari Kategori {categoryName}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Rekomendasi produk lain dengan kategori yang sama.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 transition-colors hover:text-indigo-300"
          >
            View All Products
            <ArrowRight size={14} />
          </Link>
        </div>

        {relatedProducts.length === 0 ? (
          <div className="glass-panel rounded-3xl border border-white/10 p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-indigo-400">
              <ShoppingBag size={24} />
            </div>

            <h3 className="text-sm font-bold text-white">
              Belum Ada Produk Serupa
            </h3>

            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-400">
              Saat ini belum ada produk lain pada kategori {categoryName}.
              Tambahkan produk lain dari admin dashboard agar rekomendasi
              muncul.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((item, index) => (
              <Link
                key={item.id}
                to={`/product/${item.id}`}
                className="glass-panel group overflow-hidden rounded-3xl border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(79,70,229,0.22)]"
                style={{
                  animation: `fadeInUp 0.45s ease ${index * 80}ms both`,
                }}
              >
                <div className="relative aspect-[4/3] overflow-hidden border-b border-white/10 bg-white/5">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center font-mono text-xs text-slate-500">
                      <ShoppingBag
                        size={28}
                        className="mb-2 text-indigo-400 opacity-40"
                      />
                      No Image
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-90" />

                  <span className="absolute left-3 top-3 rounded-lg border border-white/10 bg-slate-950/80 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-indigo-300 backdrop-blur-md">
                    {getCategoryName(item)}
                  </span>
                </div>

                <div className="space-y-3 p-5">
                  <div>
                    <h3 className="line-clamp-1 text-sm font-bold text-white transition-colors group-hover:text-indigo-300">
                      {item.name}
                    </h3>

                    <p className="mt-1 line-clamp-2 min-h-[2rem] text-xs leading-relaxed text-slate-400">
                      {item.description || "Tidak ada deskripsi produk."}
                    </p>
                  </div>

                  <div className="flex items-end justify-between border-t border-white/10 pt-3">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500">
                        Price
                      </p>

                      <p className="text-sm font-bold text-white">
                        {formatIDR(item.price)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500">
                        Stock
                      </p>

                      <p
                        className={`font-mono text-[10px] font-bold ${
                          item.stock > 0 ? "text-indigo-300" : "text-rose-400"
                        }`}
                      >
                        {item.stock > 0 ? `${item.stock} pcs` : "Sold Out"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-bold text-slate-300 transition-all group-hover:border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white">
                    View Detail
                    <ArrowRight
                      size={13}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(18px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}
