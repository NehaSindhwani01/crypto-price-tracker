"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const Navbar = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setLoggedIn(!!token);
    };
    
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    // Force full page reload to reset all states
    window.location.href = "/";
  };

  return (
    <nav className="bg-gray-900/80 backdrop-blur-md border-b border-cyan-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-cyan-400 hover:text-cyan-300 transition-all duration-300">
          ₿ CryptoTracker
        </Link>

        <div className="flex gap-4 md:gap-6 items-center text-sm md:text-base font-medium">
          <Link href="/" className="text-white hover:text-cyan-300 transition duration-200">
            Home
          </Link>

          {loggedIn ? (
            <>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md transition shadow-sm hover:shadow-md"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white hover:text-cyan-300 transition duration-200">
                Login
              </Link>
              <Link href="/signup" className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-1.5 rounded-md transition shadow-sm hover:shadow-md">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;