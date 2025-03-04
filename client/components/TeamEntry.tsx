"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useRouter } from "next/navigation";

const players = [
  "Virat Kohli", "MS Dhoni", "Rohit Sharma", "KL Rahul", "David Warner",
  "Hardik Pandya", "Jasprit Bumrah", "Shikhar Dhawan", "Rishabh Pant", "Ravindra Jadeja"
];

export default function Home() {
  const selectedMatch = useSelector((state: RootState) => state.matches.selectedMatch);
  const router = useRouter();
  const [formData, setFormData] = useState({
    team1: selectedMatch?.team1 || "",
    team2: selectedMatch?.team2 || "",
    matchDate: selectedMatch?.matchDate || "",
    selectedPlayers: [] as string[],
  });

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // ✅ Check Authorization
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      router.push("/login"); // Redirect to login if not logged in
      return;
    }

    if (role !== "admin" && role !== "retailer") {
      setIsAuthorized(false); // Show unauthorized message
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  const handlePlayerChange = (index: number, value: string) => {
    const updatedPlayers = [...formData.selectedPlayers];
    updatedPlayers[index] = value;
    setFormData({ ...formData, selectedPlayers: updatedPlayers });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const matchData = {
      team1: formData.team1,
      team2: formData.team2,
      matchDate: formData.matchDate,
      players: formData.selectedPlayers,
    };

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/makeTeam`, matchData, {
        headers: { "Content-Type": "application/json" },
        responseType: "blob",
      });

      if (response.status === 200) {
        alert("Match details saved successfully!");

        const pdfBlob = new Blob([response.data], { type: "application/pdf" });
        const pdfUrl = window.URL.createObjectURL(pdfBlob);

        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = "Match_Invoice.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setFormData({ team1: "", team2: "", matchDate: "", selectedPlayers: [] });
        router.push("/");
      } else {
        alert("Failed to save match details.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
    }
  };

  if (isAuthorized === false) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <h2 className="text-xl font-bold align-middle justify-center text-center">🚫 You are not authorized to access this page.</h2>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-4">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
        {/* Team & Match Date Display */}
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center bg-gray-800 p-4 rounded-md shadow-lg w-full">
            <div className="flex items-center space-x-4">
              <div className="text-center md:text-2xl text-sm font-bold text-white px-6 py-1 rounded-md shadow-md">
                {formData.team1 || "Team 1"}
              </div>

              <div className="text-center text-lg font-semibold text-gray-300">VS</div>

              <div className="text-center md:text-2xl text-sm font-bold text-white px-6 py-1 rounded-md shadow-md">
                {formData.team2 || "Team 2"}
              </div>
            </div>

            {/* Match Date Below Team Names */}
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
            </div>
          </div>
        </div>

        {/* Player Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col">
              <label className="block text-sm mb-2 md:text-lg">🎯 Select Player {i + 1}:</label>
              <select
                name={`player${i}`}
                value={formData.selectedPlayers[i] || ""}
                onChange={(e) => handlePlayerChange(i, e.target.value)}
                required
                className="w-full px-3 py-2 rounded-md bg-gray-700 text-white text-sm md:text-lg"
              >
                <option value="">--Select Player--</option>
                {players
                  .filter(
                    (player) =>
                      !formData.selectedPlayers.includes(player) || formData.selectedPlayers[i] === player
                  )
                  .map((player) => (
                    <option key={player} value={player}>
                      {player}
                    </option>
                  ))}
              </select>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-2">
          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-6 rounded-md transition w-full sm:w-auto shadow-md"
          >
            💾 Save Match Details
          </button>
        </div>
      </form>
    </div>
  );
}
