"use client";
import { useState, useEffect } from "react";
import axios from "axios";

interface Retailer {
  _id: string;
  username: string;
  teamsSold: string[];
  totalWinningTickets: number;
  totalWinningPaid: number;
}

const Dashboard = () => {
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [filteredRetailers, setFilteredRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectedRetailer, setSelectedRetailer] = useState<string>("all");

  // 🔹 Fetch Retailers Data
  useEffect(() => {
    const fetchRetailers = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_LINK}/getretailers`
        );

        // 🔹 Process Retailer Data
        const processedRetailers = response.data.map((retailer: any) => ({
          _id: retailer._id,
          username: retailer.username,
          teamsSold: retailer.teamsold || [], // Array of team IDs
          totalWinningTickets: retailer.payments.length, // Count of winning tickets
          totalWinningPaid: retailer.payments.reduce(
            (sum: number, payment: any) => sum + (payment.winningAmount || 0),
            0
          ), // Sum of winning amounts
        }));

        setRetailers(processedRetailers);
        setFilteredRetailers(processedRetailers);
      } catch (err) {
        console.error("Error fetching retailers:", err);
        setError("Failed to load retailer data.");
      } finally {
        setLoading(false);
      }
    };

    fetchRetailers();
  }, []);

  // 🔹 Handle Filter Change
  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.value;
    setSelectedRetailer(selected);

    if (selected === "all") {
      setFilteredRetailers(retailers);
    } else {
      setFilteredRetailers(
        retailers.filter((retailer) => retailer._id === selected)
      );
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">🏪 Retailer Dashboard</h1>

      {/* 🔹 Filter Dropdown */}
      <div className="mb-6 flex justify-center">
        <select
          className="p-2 rounded-lg bg-gray-800 text-white border border-gray-600"
          value={selectedRetailer}
          onChange={handleFilterChange}
        >
          <option value="all">All Retailers</option>
          {retailers.map((retailer) => (
            <option key={retailer._id} value={retailer._id}>
              {retailer.username}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-yellow-400 text-center">Loading...</p>}
      {error && <p className="text-red-400 text-center">{error}</p>}

      {/* 🔹 Retailer List */}
      {!loading && !error && filteredRetailers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRetailers.map((retailer) => (
            <div
              key={retailer._id}
              className="p-4 bg-gray-800 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-bold text-blue-400">{retailer.username}</h2>
              <p className="text-gray-300">👥 Teams Sold: {retailer.teamsSold.length}</p>
              <p className="text-green-400">🏆 Winning Tickets: {retailer.totalWinningTickets}</p>
              <p className="text-yellow-400">💰 Total Winning Paid: ₹{retailer.totalWinningPaid}</p>
            </div>
          ))}
        </div>
      )}

      {/* 🔹 No Retailers Found */}
      {!loading && !error && filteredRetailers.length === 0 && (
        <p className="text-center text-gray-400">No retailers found.</p>
      )}
    </div>
  );
};

export default Dashboard;
