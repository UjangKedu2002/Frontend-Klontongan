import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useApp } from "../context/AppContext";
import {
  Users2,
  Shield,
  RefreshCw,
  Mail,
  Calendar,
  EyeOff,
} from "lucide-react";

type UserData = {
  id: number | string;
  name: string;
  email: string;
  role: "ADMIN" | "USER" | string;
  createdAt?: string;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  const { showToaster } = useApp();

  const loadUsers = async () => {
    setLoading(true);

    try {
      const res = await api.get("/auth/users");

      const userList = res.data?.users;

      if (Array.isArray(userList)) {
        setUsers(userList);
      } else {
        setUsers([]);
      }
    } catch (err: any) {
      console.error("LOAD USERS ERROR:", err);
      showToaster(
        err.response?.data?.message || "Gagal memuat data user dari backend",
        "error"
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const formatDate = (date?: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 text-slate-900 sm:px-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Users2 className="text-teal-600" size={24} />
            Registered Users
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Data user asli dari database backend.
          </p>
        </div>

        <button
          type="button"
          onClick={loadUsers}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50"
          title="Reload users"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {loading ? (
        <div className="mx-auto flex min-h-[30vh] max-w-7xl flex-col items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slate-900" />

          <p className="mt-4 text-xs text-slate-500">
            Loading Mohon Bersabar...
          </p>
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <EyeOff size={34} className="mb-3 text-slate-400" />

          <h4 className="text-sm font-semibold text-slate-800">
            Belum Ada User
          </h4>

          <p className="mt-1 max-w-sm text-xs text-slate-500">
            Tidak ada data user yang ditemukan dari backend.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                User Directory
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                Total user: {users.length}
              </p>
            </div>

            <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-teal-700">
              Database Synced
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-white font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-slate-500">
                      #{user.id}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 font-bold uppercase text-slate-600">
                          {user.name?.charAt(0) || "U"}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            {user.name || "Unknown User"}
                          </p>

                          <p className="font-mono text-[10px] text-slate-400">
                            Profile account
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-600">
                        <Mail size={12} className="text-slate-400" />
                        {user.email}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${
                          user.role === "ADMIN"
                            ? "border-rose-200 bg-rose-50 text-rose-700"
                            : "border-teal-200 bg-teal-50 text-teal-700"
                        }`}
                      >
                        <Shield size={10} />
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                        <Calendar size={12} className="text-slate-400" />
                        {formatDate(user.createdAt)}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-emerald-700">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
