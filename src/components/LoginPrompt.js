"use client";
import { useRouter } from "next/navigation";

export default function LoginPrompt({ message, onClose }) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 md:w-1/3">
        <h2 className="text-xl font-bold mb-4">Login Required</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => {
              router.push("/login");
              onClose();
            }}
            className="px-4 py-2 bg-cyan-600 text-white rounded"
          >
            Login
          </button>
          <button
            onClick={() => {
              router.push("/signup");
              onClose();
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}