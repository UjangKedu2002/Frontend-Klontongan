import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useApp } from "../context/AppContext";
import {
  Receipt,
  Calendar,
  CreditCard,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  XCircle,
  ExternalLink,
} from "lucide-react";

type OrderItem = {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product?: {
    id: number;
    name: string;
    image?: string;
    price?: number;
  };
};

type Order = {
  id: number;
  orderCode: string;
  totalPrice: number;
  status: string;
  paymentUrl?: string;
  paymentToken?: string;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
  items?: OrderItem[];
};

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<
    Record<string | number, boolean>
  >({});
  const [checkingStatus, setCheckingStatus] = useState<Record<string, boolean>>(
    {}
  );

  const { showToaster, token } = useApp();

  const loadOrders = async () => {
    if (!token) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const res = await api.get("/checkout/my-orders");

      const orderList = res.data?.orders;

      if (Array.isArray(orderList)) {
        setOrders(orderList);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      console.error("LOAD ORDERS ERROR:", err);
      showToaster(
        err.response?.data?.message || "Gagal memuat riwayat order",
        "error"
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [token]);

  const toggleExpand = async (order: Order) => {
    const orderId = order.id;
    const isNowExpanded = !expandedOrders[orderId];

    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: isNowExpanded,
    }));

    if (isNowExpanded && !order.items) {
      try {
        const res = await api.get(`/checkout/my-orders/${orderId}`);

        const fullOrder = res.data?.order;

        if (!fullOrder) {
          throw new Error("Order detail tidak ditemukan dari backend");
        }

        setOrders((prevOrders) =>
          prevOrders.map((item) =>
            item.id === orderId ? { ...item, ...fullOrder } : item
          )
        );
      } catch (err: any) {
        console.error("LOAD ORDER DETAIL ERROR:", err);
        showToaster(
          err.response?.data?.message || "Gagal memuat detail order",
          "error"
        );
      }
    }
  };

  const handleCheckStatus = async (orderCode: string) => {
    setCheckingStatus((prev) => ({
      ...prev,
      [orderCode]: true,
    }));

    try {
      const res = await api.get(`/payment/status/${orderCode}`);

      const updatedOrder = res.data?.order;
      const transactionStatus = res.data?.transaction?.transaction_status;

      if (!updatedOrder) {
        throw new Error("Status order tidak ditemukan dari backend");
      }

      showToaster(
        `Status pembayaran: ${updatedOrder.status}${
          transactionStatus ? ` (${transactionStatus})` : ""
        }`,
        "info"
      );

      setOrders((prev) =>
        prev.map((order) =>
          order.orderCode === orderCode
            ? { ...order, status: updatedOrder.status }
            : order
        )
      );
    } catch (err: any) {
      console.error("CHECK PAYMENT STATUS ERROR:", err);
      showToaster(
        err.response?.data?.message || "Gagal mengecek status pembayaran",
        "error"
      );
    } finally {
      setCheckingStatus((prev) => ({
        ...prev,
        [orderCode]: false,
      }));
    }
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const getStatusBadge = (status: string) => {
    const currentStatus = status?.toUpperCase();

    switch (currentStatus) {
      case "PAID":
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
            <CheckCircle size={12} />
            {currentStatus}
          </span>
        );

      case "PENDING":
        return (
          <span className="inline-flex animate-pulse items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
            <Clock size={12} />
            PENDING
          </span>
        );

      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-300">
            <RefreshCw size={12} />
            SHIPPED
          </span>
        );

      case "CANCELLED":
      case "FAILED":
      case "EXPIRED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-400">
            <XCircle size={12} />
            {currentStatus}
          </span>
        );

      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">
            <AlertTriangle size={12} />
            {status || "UNKNOWN"}
          </span>
        );
    }
  };

  if (!token) {
    return (
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="mb-3 inline-block rounded-full border border-white/10 bg-white/5 p-4 text-slate-400">
          <Receipt size={36} className="text-indigo-400" />
        </div>

        <h3 className="text-lg font-bold text-white">Login Required</h3>

        <p className="mx-auto mb-6 mt-1 max-w-sm text-xs text-slate-400">
          Silakan login terlebih dahulu untuk melihat riwayat order.
        </p>

        <Link
          to="/login"
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-indigo-500"
        >
          Login Sekarang
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="relative z-10 mx-auto flex min-h-[50vh] max-w-4xl flex-col items-center justify-center px-4 py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent shadow-[0_0_20px_rgba(99,102,241,0.2)]" />
        <p className="mt-4 font-mono text-xs text-slate-400">
          Loading Mohon bersabar...
        </p>
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
            <Receipt className="text-indigo-400" size={24} />
            My Orders
          </h1>

          <p className="mt-1 text-xs text-slate-400">
            Riwayat order, detail transaksi, dan akses pembayaran Midtrans.
          </p>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 shadow-sm transition-colors hover:bg-white/10"
          title="Reload orders"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="glass-panel rounded-3xl border border-white/10 px-4 py-16 text-center shadow-[0_0_30px_rgba(79,70,229,0.15)]">
          <div className="mb-3 inline-block rounded-full border border-white/10 bg-white/5 p-4 text-slate-400">
            <Receipt size={36} className="text-indigo-400" />
          </div>

          <h3 className="text-lg font-bold text-white">No Orders Found</h3>

          <p className="mx-auto mb-6 mt-1 max-w-sm text-xs text-slate-400">
            Belum ada order yang tercatat di database untuk akun kamu.
          </p>

          <Link
            to="/"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:bg-indigo-500"
          >
            Start Shopping Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrders[order.id];

            return (
              <div
                key={order.id}
                className="glass-panel overflow-hidden rounded-3xl border border-white/10 text-white transition-all duration-300 hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]"
              >
                <div
                  onClick={() => toggleExpand(order)}
                  className="flex cursor-pointer select-none flex-wrap items-center justify-between gap-4 bg-white/5 p-5 transition-colors duration-200 hover:bg-white/10 sm:p-6"
                >
                  <div className="min-w-[200px] space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white">
                        {order.orderCode}
                      </span>

                      {getStatusBadge(order.status)}
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-indigo-400" />
                        {new Date(order.createdAt).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
                        Total
                      </p>

                      <p className="text-base font-bold tracking-tight text-white">
                        {formatIDR(order.totalPrice)}
                      </p>
                    </div>

                    <div className="text-slate-400">
                      {isExpanded ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="space-y-6 border-t border-white/10 bg-white/5 p-5 text-slate-200 sm:p-6">
                    <div className="space-y-3.5">
                      <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-indigo-300">
                        Order Items
                      </h4>

                      {!order.items ? (
                        <div className="py-4 text-center font-mono text-xs text-slate-500">
                          Loading Mohon Bersabar...
                        </div>
                      ) : order.items.length === 0 ? (
                        <div className="py-4 text-center font-mono text-xs text-slate-500">
                          Tidak ada item di order ini.
                        </div>
                      ) : (
                        <div className="divide-y divide-white/10">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-4 py-3"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/10">
                                  {item.product?.image ? (
                                    <img
                                      src={item.product.image}
                                      alt={item.product.name}
                                      className="h-full w-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <Receipt
                                      size={14}
                                      className="text-indigo-400"
                                    />
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-xs font-bold text-white">
                                    {item.product?.name || "Product"}
                                  </p>

                                  <p className="font-mono text-[10px] text-slate-400">
                                    {item.quantity} x {formatIDR(item.price)}
                                  </p>
                                </div>
                              </div>

                              <span className="shrink-0 font-mono text-xs font-bold text-white">
                                {formatIDR(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5 text-xs">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCheckStatus(order.orderCode);
                          }}
                          disabled={checkingStatus[order.orderCode]}
                          className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 font-bold text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
                        >
                          <RefreshCw
                            size={12}
                            className={
                              checkingStatus[order.orderCode]
                                ? "animate-spin"
                                : ""
                            }
                          />
                          Check Payment Status
                        </button>

                        {order.status?.toUpperCase() === "PENDING" &&
                          order.paymentUrl && (
                            <a
                              href={order.paymentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-500"
                            >
                              <ExternalLink size={12} />
                              Open Midtrans
                            </a>
                          )}
                      </div>

                      {order.status?.toUpperCase() === "PENDING" && (
                        <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[10px] font-semibold text-amber-200">
                          <CreditCard size={12} />
                          Pilih Virtual Account jika QRIS melebihi limit.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
