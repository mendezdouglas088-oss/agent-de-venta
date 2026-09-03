"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BotMessageSquare,
  User,
  Lock,
  Eye,
  EyeOff,
  Mail,
  Phone,
} from "lucide-react";

import { apiFetch } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, phoneNumber }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not create account.");
        return;
      }

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("isAuthenticated", "true");

      await apiFetch(`/whatsapp-connections/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nameUserConnected: "" }),
      });

      router.replace("/");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-neutral-100 px-4 dark:bg-neutral-950">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white">
            <BotMessageSquare className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
            Sign up to start using your CRM.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              Email
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800">
              <Mail className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
                className="w-full bg-transparent text-sm text-neutral-700 placeholder-neutral-400 outline-none dark:text-neutral-200"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              Full Name
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800">
              <User className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Pedro Pérez"
                autoComplete="name"
                className="w-full bg-transparent text-sm text-neutral-700 placeholder-neutral-400 outline-none dark:text-neutral-200"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              Phone Number
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800">
              <Phone className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="123-456-7890"
                autoComplete="tel"
                className="w-full bg-transparent text-sm text-neutral-700 placeholder-neutral-400 outline-none dark:text-neutral-200"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              Password
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800">
              <Lock className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full bg-transparent text-sm text-neutral-700 placeholder-neutral-400 outline-none dark:text-neutral-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="shrink-0 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-rose-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-neutral-400 dark:text-neutral-500">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="font-medium text-neutral-900 hover:underline dark:text-emerald-500"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
