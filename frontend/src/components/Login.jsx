/**
 * Login Component
 *
 * Authenticates users using their username and password.
 */

import React, { useState } from "react";
import API from "../services/api";
import { User, Lock, ArrowRight } from "lucide-react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await API.post("/auth/login", { username, password });
      setLoading(false);
      onLogin(response.data);
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.error ||
          "Failed to login. Please check credentials.",
      );
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            IT Ticketing System
          </h1>
          <p className="text-xs text-slate-400">Sign in with your username</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Username
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-2.5 text-slate-500"
                size={18}
              />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-2.5 text-slate-500"
                size={18}
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Sign In"}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}
