import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useApp } from "../context/AppContext";
import {
  Trash2,
  ShoppingBag,
  Plus,
  Minus,
  CreditCard,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

type CartItem = {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  subtotal?: number;
  product: {
    id: number;
    name: string;
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
};

type PaymentResult = {
  orderCode: string;
  paymentUrl: string;
  snapToken: string;
};

export default function Cart() {
  const { showToaster, token } = useApp();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(
    null
  );

  const totalAmount = cartItems.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const loadCart = async () => {
    if (!token) {
      setCartItems([]);
      setLoadingCart(false);
      return;
    }

    setLoadingCart(true);

    try {
      const res = await api.get("/cart");

      const items = res.data?.cartItems;

      if (Array.isArray(items)) {
        setCartItems(items);
      } else {
        setCartItems([]);
      }
    } catch (err: any) {
      console.error("LOAD CART ERROR:", err);
      showToaster(
        err.response?.data?.message || "Gagal mengambil data cart dari backend",
        "error"
      );
      setCartItems([]);
    } finally {
      setLoadingCart(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [token]);

  const handleUpdateQty = async (cartId: number, quantity: number) => {
    if (quantity < 1) return;

    const currentItem = cartItems.find((item) => item.id === cartId);

    if (!currentItem) return;

    if (quantity > currentItem.product.stock) {
      showToaster("Quantity melebihi stock produk", "info");
      return;
    }

    try {
      await api.put(`/cart/${cartId}`, {
        quantity,
      });

      await loadCart();
    } catch (err: any) {
      console.error("UPDATE CART ERROR:", err);
      showToaster(
        err.response?.data?.message || "Gagal update quantity cart",
        "error"
      );
    }
  };

  const handleRemoveItem = async (cartId: number) => {
    try {
      await api.delete(`/cart/${cartId}`);
      showToaster("Produk berhasil dihapus dari cart", "success");
      await loadCart();
    } catch (err: any) {
      console.error("REMOVE CART ERROR:", err);
      showToaster(
        err.response?.data?.message || "Gagal menghapus item cart",
        "error"
      );
    }
  };

  const handleClearCart = async () => {
    if (cartItems.length === 0) return;

    const confirmClear = window.confirm("Yakin ingin mengosongkan cart?");

    if (!confirmClear) return;

    try {
      await Promise.all(
        cartItems.map((item) => api.delete(`/cart/${item.id}`))
      );

      showToaster("Cart berhasil dikosongkan", "success");
      await loadCart();
    } catch (err: any) {
      console.error("CLEAR CART ERROR:", err);
      showToaster(
        err.response?.data?.message || "Gagal mengosongkan cart",
        "error"
      );
    }
  };

  const handleCheckout = async () => {
    if (!token) {
      showToaster("Silakan login terlebih dahulu untuk checkout", "error");
      return;
    }

    if (cartItems.length === 0) {
      showToaster("Cart masih kosong", "info");
      return;
    }

    setLoadingCheckout(true);

    try {
      const res = await api.post("/checkout");

      const order = res.data?.order;
      const snapToken = res.data?.snapToken;
      const paymentUrl = res.data?.paymentUrl;

      if (!order || !paymentUrl || !snapToken) {
        throw new Error("Response checkout tidak lengkap dari backend");
      }

      setPaymentResult({
        orderCode: order.orderCode,
        paymentUrl,
        snapToken,
      });

      showToaster("Checkout berhasil dibuat", "success");

      await loadCart();
    } catch (err: any) {
      console.error("CHECKOUT ERROR:", err);
      showToaster(
        err.response?.data?.message || "Checkout gagal diproses backend",
        "error"
      );
    } finally {
      setLoadingCheckout(false);
    }
  };

  if (!token) {
    return (
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="mb-4 inline-block rounded-full border border-white/10 bg-white/5 p-5 text-slate-400">
          <ShoppingBag size={48} className="text-indigo-400" />
        </div>

        <h3 className="text-xl font-bold tracking-tight text-white">
          Login Required
        </h3>

        <p className="mx-auto mb-6 mt-2 max-w-sm text-xs leading-relaxed text-slate-400">
          Silakan login terlebih dahulu untuk melihat dan mengelola cart kamu.
        </p>

        <Link
          to="/login"
          className="rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white transition-all hover:bg-indigo-500"
        >
          Login Sekarang
        </Link>
      </div>
    );
  }

  if (loadingCart) {
    return (
      <div className="relative z-10 flex min-h-[50vh] flex-col items-center justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <p className="mt-4 font-mono text-xs text-slate-400">
          Loading Mohon Bersabar...
        </p>
      </div>
    );
  }

  if (cartItems.length === 0 && !paymentResult) {
    return (
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="mb-4 inline-block rounded-full border border-white/10 bg-white/5 p-5 text-slate-400">
          <ShoppingBag size={48} className="text-indigo-400" />
        </div>

        <h3 className="text-xl font-bold tracking-tight text-white">
          Shopping Cart Empty
        </h3>

        <p className="mx-auto mb-6 mt-2 max-w-sm text-xs leading-relaxed text-slate-400">
          Belum ada produk di cart. Silakan pilih produk dari halaman katalog.
        </p>

        <Link
          to="/"
          className="rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white transition-all hover:bg-indigo-500"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
        <ShoppingBag className="text-indigo-400" size={24} />
        Shopping Cart
      </h1>

      {paymentResult ? (
        <div className="glass-panel mx-auto max-w-2xl space-y-6 overflow-hidden rounded-3xl border border-white/10 p-8 text-center shadow-[0_0_50px_rgba(79,70,229,0.15)]">
          <div className="mb-1 inline-flex items-center justify-center rounded-full border border-indigo-500/20 bg-indigo-500/10 p-4 text-indigo-400">
            <ShieldCheck size={36} />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Checkout Berhasil Dibuat
            </h2>

            <p className="text-sm text-slate-300">
              Order berhasil dibuat dengan kode:{" "}
              <span className="font-mono font-bold text-indigo-300">
                {paymentResult.orderCode}
              </span>
            </p>
          </div>

          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-indigo-300">
              Payment Instruction
            </h4>

            <p className="text-xs leading-relaxed text-slate-400">
              Silakan lanjutkan pembayaran melalui halaman Midtrans berikut.
              Setelah pembayaran berhasil, status order akan berubah otomatis.
            </p>

            <a
              href={paymentResult.paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-600 px-4 py-3 text-xs font-bold text-white transition-all hover:bg-indigo-500"
            >
              <CreditCard size={14} />
              Open Midtrans Payment
            </a>
          </div>

          <div className="flex justify-center gap-4 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={() => {
                setPaymentResult(null);
                loadCart();
              }}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 transition-colors hover:bg-white/10"
            >
              Back to Cart
            </button>

            <Link
              to="/my-orders"
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-500"
            >
              <span>View Orders</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="font-mono text-xs font-bold uppercase text-slate-400">
                {cartItems.length} items in cart
              </span>

              <button
                type="button"
                onClick={handleClearCart}
                className="flex cursor-pointer items-center gap-1 font-mono text-xs font-bold text-rose-400 transition-all hover:text-rose-300"
              >
                <Trash2 size={12} />
                EMPTY CART
              </button>
            </div>

            <div className="divide-y divide-white/10">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 py-5 sm:gap-6"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:h-20 sm:w-20">
                    {item.product?.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <ShoppingBag size={20} className="text-indigo-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-semibold text-white sm:text-base">
                      {item.product?.name || "Unknown Product"}
                    </h4>

                    <span className="mt-0.5 inline-block rounded border border-white/5 bg-white/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-indigo-300">
                      {item.product?.category?.name ||
                        `Category ID: ${item.product?.categoryId || "-"}`}
                    </span>

                    <p className="mt-2 font-mono text-sm font-bold text-white">
                      {formatIDR(item.product?.price || 0)}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-3">
                    <div className="flex items-center overflow-hidden rounded-lg border border-white/15 bg-white/5 text-xs">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateQty(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="px-2 py-1 text-slate-400 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Minus size={12} />
                      </button>

                      <span className="w-8 select-none px-2 text-center font-mono font-bold text-white">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateQty(item.id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.product.stock}
                        className="px-2 py-1 text-slate-400 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="cursor-pointer rounded-lg p-1 text-slate-500 transition-colors hover:bg-white/5 hover:text-rose-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="glass-panel space-y-6 rounded-3xl border border-white/10 p-6 text-slate-100 shadow-[0_0_30px_rgba(79,70,229,0.1)]">
              <h3 className="border-b border-white/10 pb-3 font-mono text-sm font-bold uppercase tracking-widest text-slate-400">
                Transaction Overview
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Products</span>
                  <span className="font-mono text-slate-200">
                    {cartItems.length} items
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Total Quantity</span>
                  <span className="font-mono text-slate-200">
                    {cartItems.reduce(
                      (total, item) => total + item.quantity,
                      0
                    )}{" "}
                    pcs
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Service Fee</span>
                  <span className="font-mono text-[10px] font-bold uppercase text-indigo-400">
                    FREE
                  </span>
                </div>
              </div>

              <div className="flex items-baseline justify-between border-t border-white/10 pt-4">
                <span className="text-sm font-semibold text-slate-300">
                  Amount Due
                </span>

                <span className="text-2xl font-bold tracking-tight text-white">
                  {formatIDR(totalAmount)}
                </span>
              </div>

              <button
                type="button"
                disabled={loadingCheckout || cartItems.length === 0}
                onClick={handleCheckout}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingCheckout ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent" />
                ) : (
                  <>
                    <CreditCard size={16} />
                    Checkout Order
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 font-mono text-[10px] text-slate-500">
                <ShieldCheck size={12} className="shrink-0 text-indigo-400" />
                <span>Connected to backend cart API</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
