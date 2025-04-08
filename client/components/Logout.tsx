"use client";

import { useRouter } from "next/navigation";
import React from "react";

const LogoutButton: React.FC = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("retailerID");
    router.push("/login"); // Redirect to login page
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
