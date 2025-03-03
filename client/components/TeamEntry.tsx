"use client";
import { useState } from "react";
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
    const router=useRouter();
  const [formData, setFormData] = useState({
    team1: selectedMatch?.team1 || "",
    team2: selectedMatch?.team2 || "",
    matchDate: selectedMatch?.matchDate || "",
    selectedPlayers: [] as string[],
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center p-4">
      <div className="w-full max-w-4xl bg-gray-800 shadow-lg rounded-lg p-6 sm:p-8 mt-6">
        <h2 className="text-3xl font-bold text-center mb-6 md:text-4xl">🏏 Make Your Team</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
          {/* Team & Match Date Display */}
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center space-y-3 p-4 rounded-md shadow-lg">
              <div className="text-center md:text-xl text-lg font-bold text-white bg-gray-700 px-6 py-1 rounded-md shadow-md">
                🏆 {formData.team1 || "Team 1"}
              </div>

              <div className="text-center text-lg font-semibold text-gray-300 px-4  rounded-md shadow-md">
                🆚
              </div>

              <div className="text-center md:text-xl text-lg font-bold text-white bg-gray-700 px-6 py-1 rounded-md shadow-md">
                🏆 {formData.team2 || "Team 2"}
              </div>
            </div>

            <div className="mt-4 text-sm font-medium text-gray-300 bg-gray-700 px-4 py-2 rounded-md shadow-md">
              📅 Match Date: {formData.matchDate || "Not Selected"}
            </div>
          </div>

          {/* Player Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="flex flex-col">
                <label className="block text-lg mb-2">🎯 Select Player {i + 1}:</label>
                <select 
                  name={`player${i}`} 
                  value={formData.selectedPlayers[i] || ""} 
                  onChange={(e) => handlePlayerChange(i, e.target.value)} 
                  required 
                  className="w-full p-3 rounded-md bg-gray-700 text-white"
                >
                  <option value="">--Select Player--</option>
                  {players.filter(player => !formData.selectedPlayers.includes(player) || formData.selectedPlayers[i] === player)
                    .map(player => <option key={player} value={player}>{player}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-4">
            <button 
              type="submit" 
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-6 rounded-md transition w-full sm:w-auto shadow-md"
            >
              💾 Save Match Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
