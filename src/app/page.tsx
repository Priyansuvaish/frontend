"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
// @ts-ignore
import {jwtDecode } from "jwt-decode";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.access_token) {
        setSuccess("Login successful!");
        localStorage.setItem("access_token", data.access_token);
        // Decode JWT and get roles
        const decoded: any = jwtDecode (data.access_token);
        const roles = decoded?.realm_access?.roles || [];
        if (roles.includes("User")) {
          router.push("/User");
        } else if (roles.includes("Employee")) {
          router.push("/Employee");
        } else if (roles.includes("Manager")) {
          router.push("/Manager");
        } else if (roles.includes("HR")) {
          router.push("/HR");
        } else {
          setError("No valid role found in token.");
        }
      } else {
        setError(data.error_description || data.error || "Login failed.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-sm flex flex-col gap-6"
      >
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">Login</h1>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        {success && <div className="text-green-600 text-sm text-center">{success}</div>}
        <div>
          <label htmlFor="username" className="block text-gray-700 dark:text-gray-200 mb-1">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            autoComplete="username"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-gray-700 dark:text-gray-200 mb-1">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            autoComplete="current-password"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
