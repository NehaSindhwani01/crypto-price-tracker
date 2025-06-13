"use client";
import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-400">
          Something went wrong!
        </h2>
        <p className="mb-6">{error.message}</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-cyan-600 rounded-md mr-2"
        >
          Try again
        </button>
        <button
          onClick={() => window.location.href = "/"}
          className="px-4 py-2 bg-gray-600 rounded-md"
        >
          Go home
        </button>
      </div>
    </div>
  );
}