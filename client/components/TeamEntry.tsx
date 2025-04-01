"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import Image from "next/image";
import IPL_TEAMS from "@/utils/data/shortname";
import IPL_PLAYERS from "@/utils/data/iplplayer";
import { IoWalletOutline } from "react-icons/io5";
type HomeProps = {
  setOption: (value: string) => void; // Function to update option
  option: string; // Current option value
};
export default function Home({ option,setOption}: HomeProps) {
  const selectedMatch = useSelector((state: RootState) => state.matches.selectedMatch);
  const router = useRouter();
  const [wallet, setWallet] = useState<number>(0);
  const [contestPrice, setContestPrice] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    team1: selectedMatch?.team1 || "",
    team2: selectedMatch?.team2 || "",
    matchDate: selectedMatch?.matchDate || "",
    matchTime: selectedMatch?.matchTime || "",
    selectedPlayers: [] as string[],
  });

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // ✅ Fetch wallet amount
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const retailerID = localStorage.getItem("retailerID");
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/getwallet`, { retailerID });
        setWallet(response.data.wallet);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch wallet balance:", error);
      }
    };
    fetchWallet();
  }, []);

  // ✅ Check Authorization
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      router.push("/login"); // Redirect if not logged in
      return;
    }
    if (role !== "admin" && role !== "retailer") {
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  const handlePlayerChange = (index: number, value: string) => {
    const updatedPlayers = [...formData.selectedPlayers];
    updatedPlayers[index] = value;
    setFormData({ ...formData, selectedPlayers: updatedPlayers });
  };

  // ✅ Submit Form Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!contestPrice) {
      alert("⚠️ Please select a contest entry fee!");
      return;
    }
  
    // ✅ Wallet Balance Check
    if (wallet < contestPrice) {
      alert("⚠️ Insufficient balance! Please add funds.");
      return;
    }
  
    const matchData = {
      team1: formData.team1,
      team2: formData.team2,
      matchDate: formData.matchDate,
      matchTime: formData.matchTime,
      players: formData.selectedPlayers,
      price: contestPrice,
    };
  
    try {
      const token = localStorage.getItem("token"); // Retrieve JWT from local storage

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_LINK}/makeTeam`,
        matchData,
        {
          headers: { "Content-Type": "application/json" , Authorization: `Bearer ${token}`,},validateStatus: () => true,
          responseType: "blob", // Expect binary PDF data
        }
      );
      
      if (response.status === 403) {
        setIsAuthorized(false);
        return;
      }
      if (response.status === 200) {
        // ✅ Fix for Extracting Match ID (Handles `headers` issue)
        const matchId =
          response.headers["match-id"] ||
          // response.headers.get?.("match-id") || 
          new TextDecoder().decode(response.data).match(/"matchId":"(.*?)"/)?.[1];
  
        console.log("✅ Match ID Received:", matchId);
  
        if (!matchId) {
          alert("❌ Error: Match ID missing from response.");
          return;
        }
  
        // ✅ Deduct Contest Price from Wallet
        setWallet((prev) => prev - contestPrice);
  
        // ✅ Update Sold Status
        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/updatesold`, {
          teamID: matchId,
          price: contestPrice,
          retailerID: localStorage.getItem("retailerID"),
        });
  
        // ✅ Download PDF
        const pdfBlob = new Blob([response.data], { type: "application/pdf" });
        const downloadUrl = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `Match_Receipt_${matchId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
  
        // ✅ Reset Form & Redirect
        setFormData({ team1: "", team2: "", matchDate: "", matchTime: "", selectedPlayers: [] });
        router.push("/");
      } else {
        alert("❌ Failed to save match details.");
      }
    } catch (error) {
      console.error("🚨 Error:", error);
      alert("❌ Something went wrong. Please try again.");
    }
  };
  
 
  const handleAction = (type: "team" | "contest") => {
    console.log("handleAction", type);
    setOption(type);
  };

  if (isAuthorized === false) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <h2 className="text-xl font-bold text-center p-6">🚫 You are not authorized to access this page.</h2>
      </div>
    );
  }
  if (isAuthorized === null || loading) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white"><h2 className="text-xl font-bold">⏳ Loading...</h2></div>;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-4 relative">

  {/* ✅ Wallet Wrapper at Top, Aligned Right */}
  <div className="flex justify-end items-center w-full mb-1">
    <div className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg shadow-lg font-bold flex items-center space-x-2">
      <IoWalletOutline className="text-xl" />
      <span>₹{wallet.toLocaleString('en-IN')}</span>
    </div>
  </div>
     {/* Tab Buttons */}
     <div className="flex justify-center mt-6">
  <div className="flex bg-[#374151] rounded-lg w-full md:w-1/2 justify-center items-center">
  <button
        className={`w-1/2 py-2 text-white rounded-md transition-all duration-300 
                    hover:bg-blue-500 hover:shadow-md 
                    focus:bg-blue-600 focus:shadow-lg 
                    ${option === "team" ? "border-2 border-light-blue-400" : ""}`}
        onClick={() => handleAction("team")}
      >
        Make Team
      </button>
      <button
        className={`w-1/2 py-2 text-white rounded-md transition-all duration-300 
                    hover:bg-green-500 hover:shadow-md 
                    focus:bg-green-600 focus:shadow-lg 
                    ${option === "contest" ? "border-2 border-light-blue-400" : ""}`}
        onClick={() => handleAction("contest")}
      >
        Contest
      </button>
  </div>
</div>

  {/* ✅ Form Centered Vertically */}
  <div className="flex-grow flex items-center justify-center">
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 w-full p-3 max-w-4xl">

      {/* Team & Match Date/Time */}
      <div className="flex flex-col items-center bg-gray-800 p-4 rounded-md shadow-lg w-full">
        <div className="flex items-center justify-center space-x-6 px-4 pt-1">
          {/* Team 1 */}
          <div className="flex items-center space-x-2">
            {IPL_TEAMS[formData.team1]?.logo && (
              <Image src={IPL_TEAMS[formData.team1].logo} alt={formData.team1} width={45} height={45} />
            )}
            <span className="text-xl font-bold">{IPL_TEAMS[formData.team1]?.short}</span>
          </div>
          <span className="text-lg font-semibold text-gray-400">VS</span>
          {/* Team 2 */}
          <div className="flex items-center space-x-2">
            {IPL_TEAMS[formData.team2]?.logo && (
              <Image src={IPL_TEAMS[formData.team2].logo} alt={formData.team2} width={45} height={45} />
            )}
            <span className="text-xl font-bold">{IPL_TEAMS[formData.team2]?.short}</span>
          </div>
        </div>

        {/* Match Date & Time */}
        <div className="mt-2 text-sm font-small text-gray-300 px-4 py-2 rounded-md shadow-md">
              {formData.matchDate
                ? (() => {
                    const [day, month, year] = formData.matchDate.split("-").map(Number);
                    return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    });
                  })()
                : "Not Selected"}
              {" "} | {formData.matchTime || "Time Not Available"}
            </div>
      </div>

      {/* ✅ Contest Selection */}
      <div className="flex flex-col">
        <label className="block text-sm mb-2 md:text-lg">💰 Select Contest (Entry Fee)</label>
        <select
          value={contestPrice || ""}
          onChange={(e) => setContestPrice(Number(e.target.value))}
          required
          className="w-full px-3 py-2 rounded-md bg-gray-700 text-white text-sm md:text-lg"
        >
          <option value="">--Select Contest--</option>
          <option value="50">₹50</option>
          <option value="100">₹100</option>
          <option value="200">₹200</option>
        </select>
      </div>

      {/* ✅ Player Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[0, 1, 2, 3].map((i) => {
          const filteredPlayers = Object.keys(IPL_PLAYERS).filter(
            (player) =>
              (IPL_PLAYERS[player].team === IPL_TEAMS[formData.team1]?.short ||
                IPL_PLAYERS[player].team === IPL_TEAMS[formData.team2]?.short) &&
              (!formData.selectedPlayers.includes(player) || formData.selectedPlayers[i] === player)
          );
          return (
            <div key={i} className="flex flex-col">
              <label className="block text-sm mb-2 md:text-lg">🎯 Select Player {i + 1}</label>
              <select
                value={formData.selectedPlayers[i] || ""}
                onChange={(e) => handlePlayerChange(i, e.target.value)}
                required
                className="w-full px-3 py-2 rounded-md bg-gray-700 text-white"
              >
                <option value="">--Select Player--</option>
                {filteredPlayers.map((player) => (
                  <option key={player} value={player}>{player}</option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      {/* ✅ Submit Button */}
      <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-6 rounded-md w-full">
        💾 Save Match Details
      </button>
      
    </form>
  </div>
</div>

  );
}
