"use client";

import { useState } from "react";
import { OdooUser } from "@/lib/types";

interface LoginScreenProps {
  onLogin: (user: OdooUser) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur de connexion");
        return;
      }

      onLogin(data);
    } catch {
      setError("Impossible de se connecter au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-bg via-cyan-50 to-sky-100 relative overflow-hidden">
      {/* Background decorative shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-200/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-sky-200/20 to-transparent rounded-full translate-y-1/3 -translate-x-1/4" />

      <div className="bg-white rounded-2xl shadow-xl shadow-sky-900/10 p-8 w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="w-16 h-16 bg-gradient-to-br from-sky-dark to-sky-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-primary/30">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-sky-darker">
            Sky Easy Inputs
          </h1>
          <p className="text-sky-primary/70 mt-2 text-sm">
            Saisissez vos opportunités CRM par chat intelligent
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-sky-darker/80 mb-1"
            >
              Email professionnel
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@entreprise.com"
              className="w-full px-4 py-3 rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-primary/40 focus:border-sky-primary outline-none transition text-sky-darker placeholder-sky-300 bg-sky-bg/30"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-gradient-to-r from-sky-dark to-sky-primary text-white py-3 rounded-xl font-medium hover:from-sky-darker hover:to-sky-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-sky-primary/25"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Connexion...
              </span>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        {/* Footer badges */}
        <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-sky-100">
          <span className="text-xs text-sky-primary/50 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Sécurisé
          </span>
          <span className="text-xs text-sky-primary/50 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            IA Intégrée
          </span>
        </div>
      </div>
    </div>
  );
}
