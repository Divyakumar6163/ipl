"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(false); // Track login state
  const router = useRouter();

  // ✅ Check if user is already logged in (On Page Load)
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       verifyToken(token);
//     }
//   }, []);

  // 🔹 Verify Token and Auto Login if Valid
  const verifyToken = async (token: string) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/verifyToken`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        router.push("/");
      }
    } catch (error) {
      console.error("Invalid token, logging out.");
      localStorage.removeItem("token"); // Clear token if invalid
    }
  };

  // 🔹 Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLogin(true); // Start login process

    try {
        console.log("Login Started");
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/login`, { username, password });
        console.log(response.status);
      if (response.status === 200) {
        console.log(response.data.token);
        localStorage.setItem("token", response.data.token); // Store JWT
        localStorage.setItem("role", response.data.role); // Store role
        setIsLogin(false); // Reset login state
        router.push("/"); // Redirect after login
      }
    } catch (error) {
      setError("Invalid username or password");
      setIsLogin(false); // Reset login state
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-96">
        <h2 className="text-3xl font-bold text-center mb-6">🔐 Login</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleLogin} className="flex flex-col">
          <label className="mb-2 text-lg">📧 Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-3 rounded bg-gray-700 text-white mb-4"
            required
          />

          <label className="mb-2 text-lg">🔑 Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded bg-gray-700 text-white mb-6"
            required
          />

          <button
            type="submit"
            className="bg-yellow-500 text-gray-900 font-bold py-3 rounded-md transition hover:bg-yellow-600"
            disabled={isLogin} // Disable button when logging in
          >
            {isLogin ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
