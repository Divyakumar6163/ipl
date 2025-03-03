"use client";
import { useState } from "react";
import axios from "axios";

const teams = [
  "Mumbai Indians", "Chennai Super Kings", "Royal Challengers Bangalore",
  "Delhi Capitals", "Kolkata Knight Riders", "Rajasthan Royals",
  "Sunrisers Hyderabad", "Punjab Kings", "Lucknow Super Giants", "Gujarat Titans"
];

const players = [
  "Virat Kohli", "MS Dhoni", "Rohit Sharma", "KL Rahul", "David Warner",
  "Hardik Pandya", "Jasprit Bumrah", "Shikhar Dhawan", "Rishabh Pant", "Ravindra Jadeja"
];

export default function Home() {
  const [formData, setFormData] = useState({
    team1: "",
    team2: "",
    matchDate: "",
    selectedPlayers: [] as string[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
        <h2 className="text-3xl font-bold text-center mb-6">Make Your Team</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Team Selection */}
          <div className="flex flex-col">
            <label className="block text-lg mb-2">Select Team 1:</label>
            <select 
              name="team1" 
              value={formData.team1} 
              onChange={handleChange} 
              required 
              className="w-full p-3 rounded-md bg-gray-700 text-white"
            >
              <option value="">--Select Team--</option>
              {teams.map(team => <option key={team} value={team}>{team}</option>)}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="block text-lg mb-2">Select Team 2:</label>
            <select 
              name="team2" 
              value={formData.team2} 
              onChange={handleChange} 
              required 
              className="w-full p-3 rounded-md bg-gray-700 text-white"
            >
              <option value="">--Select Team--</option>
              {teams.filter(team => team !== formData.team1).map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>

          {/* Match Date */}
          <div className="col-span-1 sm:col-span-2 flex flex-col">
            <label className="block text-lg mb-2">Match Date:</label>
            <input 
              type="date" 
              name="matchDate" 
              value={formData.matchDate} 
              onChange={handleChange} 
              required 
              className="w-full p-3 rounded-md bg-gray-700 text-white"
            />
          </div>

          {/* Player Selection */}
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex flex-col">
              <label className="block text-lg mb-2">Select Player {i + 1}:</label>
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

          <div className="col-span-1 sm:col-span-2 flex justify-center">
            <button 
              type="submit" 
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-6 rounded-md transition w-full sm:w-auto"
            >
              Save Match Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
