import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useApp } from "../context/AppContext";
import { UserPlus, User, Mail, Lock, LogIn, ArrowLeft } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToaster } = useApp();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToaster("Please fill in all standard credentials", "error");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", { name, email, password });
      showToaster(
        "Account successfully persisted inside PostgreSQL Neon Cloud Database! Please authenticate.",
        "success"
      );
      navigate("/login");
    } catch (err: any) {
      console.error(err);
      const message =
        err.response?.data?.message ||
        "Registration failed. Try again with unique details.";
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
          <Link
            to="/login"
            className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-full mb-3 text-indigo-400 border border-white/10">
            <UserPlus size={24} />
          </div>
          <h2 className="text-xl font-bold font-display tracking-tight text-white">
            Create Customer Profile
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Register user credentials targeting PostgreSQL Neon storage
          </p>
        </div>

        {/* Form panel */}
        <form onSubmit={handleRegister} className="p-8 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-2">
              Display Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                <User size={16} />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Indonesian Shopper"
                className="block w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans"
              />
            </div>
          </div>

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
                placeholder="customer@neon.com"
                className="block w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-2">
              Secret Password
            </label>
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
                className="block w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-550 transition-all font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all cursor-pointer"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent align-[-0.125em]"></span>
            ) : (
              <>
                <UserPlus size={16} />
                Register to Prisma Cloud
              </>
            )}
          </button>

          <div className="pt-2 text-center text-xs text-slate-400">
            Already have a registered account profile?{" "}
            <Link
              to="/login"
              className="text-indigo-400 hover:text-indigo-300 font-bold transition-all"
            >
              Login here <LogIn size={12} className="inline ml-1" />
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
