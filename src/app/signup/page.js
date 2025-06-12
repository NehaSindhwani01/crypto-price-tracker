"use client";

import { useState } from "react";
import Link from "next/link";

function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("✅ Account created successfully! Redirecting...");
      setShowLogin(false);
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } else {
      if (data.error === "User already exists") {
        setMessage("❌ User already exists. Please log in instead.");
        setShowLogin(true);
      } else {
        setMessage("❌ " + data.error || "Signup failed.");
        setShowLogin(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md bg-gray-900 text-white p-8 rounded-xl shadow-lg border border-cyan-700">
        <h1 className="text-3xl font-bold text-cyan-400 mb-6 text-center">
          ✨ Create CryptoTracker Account
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
          />
          <button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 rounded-lg transition duration-300"
          >
            Signup
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-center text-red-400">{message}</p>
        )}

        {showLogin && (
          <div className="mt-4 text-center">
            <Link
              href="/login"
              className="text-cyan-400 hover:underline font-medium"
            >
              👉 Already have an account? Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Signup;
