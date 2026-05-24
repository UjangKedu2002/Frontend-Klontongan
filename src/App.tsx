/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";

// Import pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminUsers from "./pages/AdminUsers";

// Lucide Icons
import {
  ShoppingBag,
  ShoppingCart,
  Receipt,
  Settings,
  User as UserIcon,
  LogOut,
  BarChart3,
  Hammer,
  Truck,
  Users2,
  AlertTriangle,
  CloudLightning,
  CheckCircle2,
  Lock,
} from "lucide-react";

// Route Guards
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useApp();
  if (!token || user?.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const UserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useApp();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  // Admin tries to access shopping pages -> redirect to admin dashboard
  if (user?.role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <>{children}</>;
};

// Global Floating Toast Container Component
const FloatingToaster: React.FC = () => {
  const { toast } = useApp();
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-pulse shadow-[0_0_25px_rgba(79,70,229,0.25)] border border-white/20 py-3 px-4 rounded-xl flex items-center gap-2 max-w-sm text-xs font-semibold backdrop-blur-md bg-slate-900/90 text-white">
      {toast.type === "success" && <span className="text-emerald-400">●</span>}
      {toast.type === "error" && <span className="text-rose-500">●</span>}
      {toast.type === "info" && <span className="text-indigo-400">●</span>}
      <span className="font-sans tracking-wide">{toast.message}</span>
    </div>
  );
};

// Developer Runtime Endpoint Setting Overlay Panel
const EndpointPanel: React.FC = () => {
  const { apiUrl, updateApiUrl, backendConnected } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [tempUrl, setTempUrl] = useState(apiUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateApiUrl(tempUrl);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 glass-panel-heavy rounded-2xl p-5 z-40 text-left text-xs text-white space-y-4 shadow-2xl"></div>
      )}
    </div>
  );
};

// Global System Layout Component (Header navigators and responsive structures)
const PlatformLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, logout, cartCount } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoggedOut = () => {
    logout();
    navigate("/login");
  };

  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute top-[40%] right-[10%] w-[40%] h-[40%] bg-teal-500/5 rounded-full blur-[110px] pointer-events-none z-0"></div>

      {/* Dynamic Navigation Platform */}
      <header className="sticky top-0 z-30 bg-slate-950/45 backdrop-blur-md border-b border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo Launcher brand */}
            <Link
              to={user?.role === "ADMIN" ? "/admin/dashboard" : "/"}
              className="flex items-center gap-2 group"
            >
              <div className="p-2 bg-indigo-600/10 rounded-xl text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-600/20 group-hover:border-indigo-400/40 duration-200">
                <ShoppingBag size={18} />
              </div>
              <span className="font-display font-extrabold tracking-tight text-white text-base sm:text-lg">
                Klontongan{" "}
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-black italic">
                  All Brand Product Fashion
                </span>
              </span>
            </Link>

            {/* In-view links layout */}
            {user?.role === "ADMIN" ? (
              // Admin Sidebar indicators translated into Top Link rails to make design exceptionally sleek
              <nav className="hidden md:flex items-center gap-2 text-xs">
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    location.pathname === "/admin/dashboard"
                      ? "bg-white/10 text-white border border-white/15"
                      : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                  }`}
                >
                  <BarChart3 size={14} className="text-indigo-400" />
                  Dashboard
                </Link>
                <Link
                  to="/admin/products"
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    location.pathname === "/admin/products"
                      ? "bg-white/10 text-white border border-white/15"
                      : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                  }`}
                >
                  <Hammer size={14} className="text-indigo-400" />
                  Tambah Product
                </Link>
                <Link
                  to="/admin/orders"
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    location.pathname === "/admin/orders"
                      ? "bg-white/10 text-white border border-white/15"
                      : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                  }`}
                >
                  <Truck size={14} className="text-indigo-400" />
                  Order
                </Link>
                <Link
                  to="/admin/users"
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    location.pathname === "/admin/users"
                      ? "bg-white/10 text-white border border-white/15"
                      : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                  }`}
                >
                  <Users2 size={14} className="text-indigo-400" />
                  Pengguna Aktif
                </Link>
              </nav>
            ) : (
              // Normal Customer links context
              <nav className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Link
                  to="/"
                  className="hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-lg transition-all duration-250"
                >
                  Dashboard
                </Link>
                {user && (
                  <Link
                    to="/my-orders"
                    className="hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-lg transition-all duration-250 flex items-center gap-1"
                  >
                    <Receipt size={14} className="text-indigo-400" />
                    My Purchase Receipts
                  </Link>
                )}
              </nav>
            )}
          </div>

          {/* Right Action buttons grouping */}
          <div className="flex items-center gap-3">
            {/* Direct endpoint config widget */}
            <EndpointPanel />

            {/* Shopping cart trigger */}
            {user?.role !== "ADMIN" && (
              <Link
                to="/cart"
                className="relative p-2 hover:bg-white/10 border border-transparent hover:border-white/10 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
                title="View database cart"
              >
                <ShoppingCart size={18} className="text-indigo-400" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-indigo-600 text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Auth panel wrapper */}
            {user ? (
              <div className="flex items-center gap-3 border-l border-white/15 pl-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-200 line-clamp-1">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-mono text-indigo-400 font-semibold uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLoggedOut}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-rose-400 border border-white/10 transition-colors cursor-pointer"
                  title="Disconnect Gateway Secure Session"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:scale-[1.02]"
              >
                <UserIcon size={14} />
                <span>Portal LogIn</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation sidebar tabs helper context */}
        {user?.role === "ADMIN" ? (
          <div className="md:hidden bg-slate-950/80 border-t border-white/10 flex text-[11px] font-bold text-slate-400 backdrop-blur-md">
            <Link
              to="/admin/dashboard"
              className="flex-1 text-center py-2.5 hover:bg-white/5 border-r border-white/10"
            >
              Stats
            </Link>
            <Link
              to="/admin/products"
              className="flex-1 text-center py-2.5 hover:bg-white/5 border-r border-white/10"
            >
              SKU CRUD
            </Link>
            <Link
              to="/admin/orders"
              className="flex-1 text-center py-2.5 hover:bg-white/5 border-r border-white/10"
            >
              Order
            </Link>
            <Link
              to="/admin/users"
              className="flex-1 text-center py-2.5 hover:bg-white/5"
            >
              Users
            </Link>
          </div>
        ) : (
          <div className="md:hidden bg-slate-950/80 border-t border-white/10 flex text-[11px] font-bold text-slate-400 backdrop-blur-md">
            <Link
              to="/"
              className="flex-1 text-center py-2.5 hover:bg-white/5 border-r border-white/10"
            >
              Browse Catalog
            </Link>
            {user && (
              <Link
                to="/my-orders"
                className="flex-1 text-center py-2.5 hover:bg-white/5"
              >
                My Orders
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Main page content wrapper */}
      <main className="flex-grow relative z-10 w-full">{children}</main>

      {/* Humble Footer */}
      <footer className="relative z-10 bg-slate-950/80 border-t border-white/10 py-6 text-center text-[10px] text-slate-500 font-mono tracking-wider uppercase backdrop-blur-md">
        <span>© 2026 Created by Ujang Kedu</span>
      </footer>
    </div>
  );
};

// Router Assembly with context wrapping
export function AppRoutes() {
  const { user } = useApp();

  return (
    <BrowserRouter>
      <PlatformLayout>
        <Routes>
          {/* Main User catalog */}
          <Route path="/" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />

          {/* Auth routing */}
          <Route
            path="/login"
            element={
              user?.role === "ADMIN" ? (
                <Navigate to="/admin/dashboard" replace />
              ) : user?.role === "USER" ? (
                <Navigate to="/" replace />
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" replace /> : <Register />}
          />

          {/* User Protected Cart checkouts and transactions history */}
          <Route
            path="/cart"
            element={
              <UserRoute>
                <Cart />
              </UserRoute>
            }
          />
          <Route
            path="/my-orders"
            element={
              <UserRoute>
                <MyOrders />
              </UserRoute>
            }
          />

          {/* Admin Protected executive pages */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <AdminProducts />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminOrders />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />

          {/* Global Fallback wildcard routing handler */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PlatformLayout>
      <FloatingToaster />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
