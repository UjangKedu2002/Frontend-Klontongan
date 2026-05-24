import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useApp } from "../context/AppContext";
import { Shield, Mail, Lock, LogIn, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, showToaster } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToaster("Please fill in all standard credentials", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });

      const { token, user } = res.data;
      login(token, user);

      if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      console.error(err);
      const message =
        err.response?.data?.message || "Invalid email or password combination.";
      showToaster(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12 relative z-10">
      <div className="w-full max-w-md glass-panel rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(79,70,229,0.15)] border border-white/10">
        {/* Header decoration */}
        <div className="bg-white/5 border-b border-white/10 text-slate-100 px-8 py-8 text-center relative">
          <div className="absolute top-4 right-4 text-[9px] font-mono font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/20 px-2.5 py-0.5 rounded uppercase tracking-wider">
            SECURE ACCESS
          </div>
          <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-full mb-3 text-indigo-400 border border-white/10">
            <Shield size={24} />
          </div>
          <h2 className="text-xl font-bold font-display tracking-tight text-white">
            Account Gateway
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Sign in to connect PostgreSQL DB via ExpressJS Auth Engine
          </p>
        </div>

        {/* Form panel */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="block w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                Password
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent align-[-0.125em]"></span>
            ) : (
              <>
                <LogIn size={16} />
                Access Authorized Portal
              </>
            )}
          </button>

          <div className="pt-2 text-center text-xs text-slate-400">
            Don't have a secure customer account yet?{" "}
            <Link
              to="/register"
              className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
            >
              Self Register Now <ArrowRight size={12} className="inline" />
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
