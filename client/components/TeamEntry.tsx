"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useRouter } from "next/navigation";
import Image from "next/image";
import IPL_TEAMS from "@/utils/data/shortname";
import IPL_PLAYERS from "@/utils/data/iplplayer";

export default function Home() {
  const selectedMatch = useSelector((state: RootState) => state.matches.selectedMatch);
  const router = useRouter();
  const [formData, setFormData] = useState({
    team1: selectedMatch?.team1 || "",
    team2: selectedMatch?.team2 || "",
    matchDate: selectedMatch?.matchDate || "",
    matchTime: selectedMatch?.matchTime || "",
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
      matchTime: formData.matchTime,
      players: formData.selectedPlayers,
    };
  
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_LINK}/makeTeam`,
        matchData,
        {
          headers: { "Content-Type": "application/json" },
          responseType: "blob", // ✅ Expect binary PDF data
        }
      );
      console.log(response);
      if (response.status === 200) {
        // ✅ Extract match ID from response headers
        const matchId = response.headers["match-id"]; // Ensure header name is lowercase
        console.log(matchId);
        if (!matchId) {
          console.error("Match ID not found in headers");
          alert("Error: Match ID missing from response");
          return;
        }
        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/updatesold`,{teamID:matchId,retailerID:localStorage.getItem("retailerID")});
        alert(`Match saved successfully!`);
  
        // ✅ Create a PDF Blob & trigger download
        const pdfBlob = new Blob([response.data], { type: "application/pdf" });
        const downloadUrl = window.URL.createObjectURL(pdfBlob);
  
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `Match_Invoice.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
  
        setFormData({ team1: "", team2: "", matchDate: "",matchTime:"", selectedPlayers: [] });
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
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 w-full p-3">
        {/* Team & Match Date Display */}
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center bg-gray-800 p-4 rounded-md shadow-lg w-full">
            <div className="flex items-center justify-center space-x-6  px-4 pt-4 rounded-lg shadow-lg">
                {/* Team 1 */}
                <div className="flex items-center space-x-2">
                  {IPL_TEAMS[formData.team1]?.logo && (
                    <Image
                      src={IPL_TEAMS[formData.team1]?.logo}
                      alt={formData.team1}
                      width={45}
                      height={45}
                      className="object-contain"
                    />
                  )}
                  <div className="text-center text-xl font-bold text-white">
                    {IPL_TEAMS[formData.team1]?.short || "Team 1"}
                  </div>
                </div>

                {/* VS */}
                <div className="text-center text-lg font-semibold text-gray-400">VS</div>

                {/* Team 2 */}
                <div className="flex items-center space-x-2">
                  {IPL_TEAMS[formData.team2]?.logo && (
                    <Image
                      src={IPL_TEAMS[formData.team2]?.logo}
                      alt={formData.team2}
                      width={45}
                      height={45}
                      className="object-contain"
                    />
                  )}
                  <div className="text-center text-xl font-bold text-white">
                    {IPL_TEAMS[formData.team2]?.short || "Team 2"}
                  </div>
                </div>
              </div>



            {/* Match Date & Time Below Team Names */}
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
        </div>

        {/* Player Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0, 1, 2, 3].map((i) => {
            // ✅ Filter players based on team1 & team2
            const filteredPlayers = Object.keys(IPL_PLAYERS).filter(
              (player) =>
                (IPL_PLAYERS[player].team === IPL_TEAMS[formData.team1]?.short ||
                  IPL_PLAYERS[player].team === IPL_TEAMS[formData.team2]?.short) &&
                (!formData.selectedPlayers.includes(player) || formData.selectedPlayers[i] === player)
            );

            return (
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
                  {filteredPlayers.map((player) => (
                    <option key={player} value={player}>
                      {player}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
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
