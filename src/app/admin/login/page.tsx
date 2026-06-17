"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // Success is handled by layout.tsx redirect
  };

  return (
    <div className="w-full h-[80vh] flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm terminal-border p-8 bg-black/50"
      >
        <h1 className="text-2xl font-bold tracking-tighter mb-2">SYS.ADMIN</h1>
        <p className="text-xs font-mono text-gray-500 mb-8 uppercase tracking-widest">
          Auth Required
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono text-gray-400">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border border-gray-800 p-2 text-sm font-mono focus:outline-none focus:border-white transition-colors"
              required
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono text-gray-400">PASSCODE</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent border border-gray-800 p-2 text-sm font-mono focus:outline-none focus:border-white transition-colors"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-xs font-mono border border-red-900 bg-red-950/30 p-2">
              ERROR: {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 border border-gray-800 hover:border-white hover:bg-white hover:text-black transition-all p-3 text-sm font-mono uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? "AUTHENTICATING..." : "EXECUTE"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
