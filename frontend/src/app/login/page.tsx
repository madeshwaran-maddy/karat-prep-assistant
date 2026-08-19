"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "Invalid email or password.");
      }

      const user = data.user;
      const token = `candidate-${user.id}`;

      document.cookie = `auth_token=${token}; path=/; SameSite=Lax;`;
      document.cookie = `user_role=${user.role}; path=/; SameSite=Lax;`;
      document.cookie = `user_name=${encodeURIComponent(user.name)}; path=/; SameSite=Lax;`;
      document.cookie = `language_selected=${encodeURIComponent(user.languageSelected || "java")}; path=/; SameSite=Lax;`;

      setError("");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold">Login</h1>
        <p className="mb-6 text-sm text-slate-500">
          Sign in with your registered candidate account.
        </p>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="mb-3 w-full rounded border p-3"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="mb-4 w-full rounded border p-3"
        />

        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

        <button
          onClick={handleLogin}
          className="w-full rounded bg-blue-600 p-3 font-semibold text-white"
        >
          Sign In
        </button>

        <p className="mt-4 text-sm text-slate-600">
          Don’t have an account?{" "}
          <button
            onClick={() => router.push("/signup")}
            className="font-semibold text-blue-600"
          >
            Sign Up
          </button>
        </p>
      </div>
    </main>
  );
}