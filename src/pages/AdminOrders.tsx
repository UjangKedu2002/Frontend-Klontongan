import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useApp } from "../context/AppContext";
import {
  Truck,
  Calendar,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  EyeOff,
} from "lucide-react";

type OrderItem = {
  id: number;
  quantity: number;
  price: number;
  product?: {
    id: number;
    name: string;
    image?: string;
  };
};

type Order = {
  id: number;
  orderCode: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  items?: OrderItem[];
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Record<number, boolean>>(
    {}
  );
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const { showToaster } = useApp();

  const loadOrders = async () => {
    setLoading(true);

    try {
      const res = await api.get("/orders");

      const orderList = res.data?.orders;

      if (Array.isArray(orderList)) {
        setOrders(orderList);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      console.error("LOAD ADMIN ORDERS ERROR:", err);
      showToaster(
        err.response?.data?.message || "Gagal mengambil data order admin",
        "error"
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const toggleExpand = async (order: Order) => {
    const orderId = order.id;
    const isExpanded = !expandedOrders[orderId];

    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: isExpanded,
    }));

    if (isExpanded && !order.items) {
      try {
        const res = await api.get(`/orders/${orderId}`);

        const orderDetail = res.data?.order;

        if (!orderDetail) {
          throw new Error("Order detail tidak ditemukan");
        }

        setOrders((prev) =>
          prev.map((item) =>
            item.id === orderId ? { ...item, ...orderDetail } : item
          )
        );
      } catch (err: any) {
        console.error("LOAD ORDER DETAIL ERROR:", err);
        showToaster(
          err.response?.data?.message || "Gagal mengambil detail order",
          "error"
        );
      }
    }
  };

  const updateStatus = async (
    orderId: number,
    nextStatus: "SHIPPED" | "COMPLETED"
  ) => {
    setUpdatingId(orderId);

    try {
      const res = await api.patch(`/orders/${orderId}/status`, {
        status: nextStatus,
      });

      const updatedOrder = res.data?.order;

      showToaster(`Status order berhasil diubah ke ${nextStatus}`, "success");

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                ...(updatedOrder || {}),
                status: updatedOrder?.status || nextStatus,
              }
            : order
        )
      );
    } catch (err: any) {
      console.error("UPDATE ORDER STATUS ERROR:", err);
      showToaster(
        err.response?.data?.message ||
          `Gagal mengubah status order ke ${nextStatus}`,
        "error"
      );
    } finally {
      setUpdatingId(null);
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

    const baseClass =
      "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider";

    switch (currentStatus) {
      case "PAID":
        return (
          <span
            className={`${baseClass} border-emerald-200 bg-emerald-50 text-emerald-700`}
          >
            PAID
          </span>
        );

      case "SHIPPED":
        return (
          <span
            className={`${baseClass} border-blue-200 bg-blue-50 text-blue-700`}
          >
            SHIPPED
          </span>
        );

      case "COMPLETED":
        return (
          <span
            className={`${baseClass} border-teal-200 bg-teal-50 text-teal-700`}
          >
            COMPLETED
          </span>
        );

      case "PENDING":
        return (
          <span
            className={`${baseClass} border-amber-200 bg-amber-50 text-amber-700`}
          >
            PENDING
          </span>
        );

      case "FAILED":
      case "CANCELLED":
      case "EXPIRED":
        return (
          <span
            className={`${baseClass} border-slate-200 bg-slate-100 text-slate-500`}
          >
            {currentStatus}
          </span>
        );

      default:
        return (
          <span
            className={`${baseClass} border-slate-200 bg-slate-50 text-slate-600`}
          >
            {status || "UNKNOWN"}
          </span>
        );
    }
  };

  const canMarkShipped = (status: string) => {
    return status?.toUpperCase() === "PAID";
  };

  const canMarkCompleted = (status: string) => {
    return status?.toUpperCase() === "SHIPPED";
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-7xl flex-col items-center justify-center px-4 py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slate-900" />
        <p className="mt-4 text-xs text-slate-500">Loading Mohon Bersabar...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 text-slate-900 sm:px-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Truck className="text-teal-600" size={24} />
            Customer Orders
          </h1>

          <p className="mt-1 text-xs text-slate-500">Kelola order customer.</p>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center">
          <EyeOff size={32} className="mb-3 text-slate-400" />

          <h4 className="text-sm font-semibold text-slate-800">
            Belum Ada Order
          </h4>

          <p className="mt-1 text-xs text-slate-500">
            Belum ada order customer yang tersimpan di database.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrders[order.id];
            const isUpdating = updatingId === order.id;

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors hover:border-slate-300"
              >
                <div
                  onClick={() => toggleExpand(order)}
                  className="flex cursor-pointer select-none flex-wrap items-center justify-between gap-4 bg-slate-50/60 p-5"
                >
                  <div className="min-w-[220px] space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900">
                        {order.orderCode}
                      </span>

                      {getStatusBadge(order.status)}
                    </div>

                    <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                      <Calendar size={12} className="text-slate-500" />
                      {new Date(order.createdAt).toLocaleString("id-ID")}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Total
                      </p>

                      <p className="text-sm font-bold tracking-tight text-slate-900">
                        {formatIDR(order.totalPrice)}
                      </p>
                    </div>

                    <div>
                      {isExpanded ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="space-y-5 border-t border-slate-200 bg-white p-5 sm:p-6">
                    <div>
                      <h4 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
                        Order Items
                      </h4>

                      {!order.items ? (
                        <p className="font-mono text-xs text-slate-400">
                          Loading order items...
                        </p>
                      ) : order.items.length === 0 ? (
                        <p className="font-mono text-xs text-slate-400">
                          Tidak ada item pada order ini.
                        </p>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-4 py-2.5 text-xs"
                            >
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-800">
                                  {item.product?.name || "Unknown Product"}
                                </p>

                                <p className="font-mono text-[10px] text-slate-400">
                                  {item.quantity} x {formatIDR(item.price)}
                                </p>
                              </div>

                              <span className="shrink-0 font-mono font-bold text-slate-900">
                                {formatIDR(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 sm:grid-cols-2">
                      <div>
                        <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Buyer
                        </span>

                        <span className="font-semibold text-slate-800">
                          {order.user?.name || "Unknown Customer"}
                        </span>
                      </div>

                      <div>
                        <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Email
                        </span>

                        <span className="font-mono text-slate-800">
                          {order.user?.email || "-"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 text-xs">
                      <span className="font-mono text-[10px] font-semibold uppercase text-slate-400">
                        Status Controls
                      </span>

                      <div className="flex gap-2.5">
                        <button
                          type="button"
                          disabled={isUpdating || !canMarkShipped(order.status)}
                          onClick={() => updateStatus(order.id, "SHIPPED")}
                          className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          Mark as SHIPPED
                        </button>

                        <button
                          type="button"
                          disabled={
                            isUpdating || !canMarkCompleted(order.status)
                          }
                          onClick={() => updateStatus(order.id, "COMPLETED")}
                          className="cursor-pointer rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          Mark as COMPLETED
                        </button>
                      </div>
                    </div>

                    {order.status?.toUpperCase() === "PENDING" && (
                      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                        Order masih PENDING.
                      </p>
                    )}
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
