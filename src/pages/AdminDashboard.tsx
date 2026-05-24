import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useApp } from "../context/AppContext";
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  ListOrdered,
  RefreshCw,
  CheckCircle,
} from "lucide-react";

type OrderStatusItem = {
  status: "PENDING" | "PAID" | "SHIPPED" | "COMPLETED";
  count: number;
};

type MonthlyRevenueItem = {
  month: string;
  revenue: number;
};

type DashboardStatsView = {
  revenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  orderStatuses: OrderStatusItem[];
  monthlyRevenue: MonthlyRevenueItem[];
};

type BackendDashboardResponse = {
  success: boolean;
  data: {
    revenue: number;
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    orderStatus: {
      pending: number;
      paid: number;
      shipped: number;
      completed: number;
    };
    monthlyRevenue: {
      month: number;
      revenue: number;
    }[];
  };
};

const monthNames = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStatsView | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToaster } = useApp();

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const normalizeDashboardData = (
    payload: BackendDashboardResponse["data"]
  ): DashboardStatsView => {
    return {
      revenue: payload.revenue || 0,
      totalOrders: payload.totalOrders || 0,
      totalUsers: payload.totalUsers || 0,
      totalProducts: payload.totalProducts || 0,
      orderStatuses: [
        {
          status: "PENDING",
          count: payload.orderStatus?.pending || 0,
        },
        {
          status: "PAID",
          count: payload.orderStatus?.paid || 0,
        },
        {
          status: "SHIPPED",
          count: payload.orderStatus?.shipped || 0,
        },
        {
          status: "COMPLETED",
          count: payload.orderStatus?.completed || 0,
        },
      ],
      monthlyRevenue: Array.isArray(payload.monthlyRevenue)
        ? payload.monthlyRevenue.map((item) => ({
            month: monthNames[item.month] || `Month ${item.month}`,
            revenue: item.revenue || 0,
          }))
        : [],
    };
  };

  const loadStats = async () => {
    setLoading(true);

    try {
      const res = await api.get<BackendDashboardResponse>("/dashboard");

      if (!res.data.success || !res.data.data) {
        throw new Error("Invalid dashboard response from backend");
      }

      const normalized = normalizeDashboardData(res.data.data);
      setStats(normalized);
    } catch (err: any) {
      console.error("LOAD DASHBOARD ERROR:", err);

      showToaster(
        err.response?.data?.message ||
          "Gagal memuat dashboard admin dari backend",
        "error"
      );

      setStats({
        revenue: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalProducts: 0,
        orderStatuses: [
          { status: "PENDING", count: 0 },
          { status: "PAID", count: 0 },
          { status: "SHIPPED", count: 0 },
          { status: "COMPLETED", count: 0 },
        ],
        monthlyRevenue: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const activeRevenue = stats?.revenue || 0;

  const maxMonthlyRevenue =
    stats && stats.monthlyRevenue.length > 0
      ? Math.max(...stats.monthlyRevenue.map((item) => item.revenue), 1)
      : 1;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent shadow-[0_0_20px_rgba(99,102,241,0.2)]" />
        <p className="mt-4 font-mono text-xs text-slate-400">
          Loading Mohon Bersabar...
        </p>
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto max-w-7xl space-y-8 px-4 py-8 text-slate-100 sm:px-6">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
            <BarChart3 className="text-indigo-400" size={24} />
            Admin Dashboard
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Data statistik real-time.
          </p>
        </div>

        <button
          onClick={loadStats}
          className="flex cursor-pointer items-center gap-1.5 self-start rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-200 shadow-sm transition-colors hover:bg-white/10 sm:self-center"
        >
          <RefreshCw size={14} />
          Reload Data
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-lg transition-all duration-300 hover:border-indigo-500/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="block font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
                Total Revenue
              </span>
              <span className="block text-xl font-bold tracking-tight text-white">
                {formatIDR(activeRevenue)}
              </span>
              <span className="block font-mono text-[10px] font-bold text-indigo-400">
                Paid, shipped, completed
              </span>
            </div>

            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-indigo-400">
              <DollarSign size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-lg transition-all duration-300 hover:border-indigo-500/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="block font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
                Total Orders
              </span>
              <span className="block text-xl font-bold tracking-tight text-white">
                {stats?.totalOrders || 0} orders
              </span>
              <span className="block font-mono text-[10px] text-slate-400">
                All order records
              </span>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-indigo-400">
              <ListOrdered size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-lg transition-all duration-300 hover:border-indigo-500/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="block font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
                Total Products
              </span>
              <span className="block text-xl font-bold tracking-tight text-white">
                {stats?.totalProducts || 0} products
              </span>
              <span className="block font-mono text-[10px] text-slate-400">
                Product inventory
              </span>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-indigo-400">
              <ShoppingBag size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-lg transition-all duration-300 hover:border-indigo-500/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="block font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
                Total Users
              </span>
              <span className="block text-xl font-bold tracking-tight text-white">
                {stats?.totalUsers || 0} users
              </span>
              <span className="block font-mono text-[10px] text-slate-400">
                Registered accounts
              </span>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-indigo-400">
              <Users size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-[0_0_30px_rgba(79,70,229,0.1)] lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                Pendapatan Bulanan
              </h3>
              <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                Pendapatan Tahunan
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-indigo-300">
              <TrendingUp size={12} />
              Statistik
            </span>
          </div>

          {stats?.monthlyRevenue.length ? (
            <div className="flex min-h-[220px] items-end justify-between gap-6 px-4 pt-8">
              {stats.monthlyRevenue.map((item, index) => {
                const pct = maxMonthlyRevenue
                  ? (item.revenue / maxMonthlyRevenue) * 100
                  : 0;

                return (
                  <div
                    key={`${item.month}-${index}`}
                    className="group flex flex-1 flex-col items-center gap-3"
                  >
                    <div className="relative flex h-36 w-full flex-col justify-end overflow-hidden rounded-2xl border border-white/5 bg-white/5">
                      <div
                        style={{ height: `${pct}%` }}
                        className="relative flex w-full justify-center rounded-t-lg bg-indigo-500/70 transition-all duration-300 group-hover:bg-indigo-400"
                      >
                        <span className="pointer-events-none absolute -top-10 scale-95 whitespace-nowrap rounded border border-white/10 bg-slate-950/90 px-2 py-0.5 font-mono text-[9px] font-bold text-indigo-300 opacity-0 shadow-lg backdrop-blur-md transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
                          {formatIDR(item.revenue)}
                        </span>
                      </div>
                    </div>

                    <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-[220px] items-center justify-center text-center">
              <p className="max-w-sm text-sm text-slate-400">
                Belum ada revenue bulanan. Data akan muncul setelah ada order
                dengan status PAID, SHIPPED, atau COMPLETED.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-[0_0_30px_rgba(79,70,229,0.1)]">
          <div>
            <div className="border-b border-white/10 pb-4">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                Order Status
              </h3>
              <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                Distribution counts from database
              </p>
            </div>

            <div className="space-y-4 pt-6">
              {stats?.orderStatuses.map((item) => {
                const width = stats.totalOrders
                  ? Math.min((item.count / stats.totalOrders) * 100, 100)
                  : 0;

                return (
                  <div key={item.status} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-300">
                        {item.status}
                      </span>

                      <span className="rounded-lg border border-white/10 bg-white/10 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-300">
                        {item.count} orders
                      </span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full border border-white/5 bg-white/5">
                      <div
                        style={{ width: `${width}%` }}
                        className={`h-full ${
                          item.status === "PAID" || item.status === "COMPLETED"
                            ? "bg-indigo-500"
                            : item.status === "PENDING"
                            ? "bg-amber-400"
                            : item.status === "SHIPPED"
                            ? "bg-blue-500"
                            : "bg-slate-500"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-1.5 border-t border-white/10 pt-4 text-center font-mono text-[10px] text-slate-500">
            <CheckCircle size={14} className="text-emerald-400" />
            <span>Koneksi berhasil terhubung</span>
          </div>
        </div>
      </div>
    </div>
  );
}
