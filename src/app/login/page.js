"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        setMessage("✅ Login successful! Redirecting...");
        setTimeout(() => router.push("/"), 1000);
      } else {
        if (data.error === "User not found") {
          setMessage("❌ User not found. Please sign up.");
          setShowSignup(true);
        } else {
          setMessage(`❌ ${data.error || "Login failed"}`);
        }
      }
    } catch (error) {
      setMessage("❌ Network error. Please try again.");
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-12">
        <div className="w-full max-w-md bg-gray-900 text-white p-8 rounded-xl shadow-lg border border-cyan-700">
          <h1 className="text-3xl font-bold text-cyan-400 mb-6 text-center">
            🔐 Login to CryptoTracker
          </h1>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <input
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 rounded-lg transition duration-300"
            >
              Login
            </button>
          </form>

          {message && (
            <p className="mt-4 text-sm text-center text-red-400">{message}</p>
          )}

          <div className="mt-4 text-center text-sm">
            {showSignup ? (
              <Link href="/signup" className="text-cyan-400 hover:underline">
                👉 Create your account here
              </Link>
            ) : (
              <Link href="/signup" className="text-gray-400 hover:text-cyan-400">
                Don't have an account? Sign up
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}