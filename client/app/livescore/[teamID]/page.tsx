"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

interface Match {
  _id: string;
  team1: string;
  team2: string;
  matchDate: string;
  players: string[];
}

interface Player {
  name: string;
  totalScore: number;
  image?: string;
}

export default function SelectedPlayers() {
  const [matchDetails, setMatchDetails] = useState<Match | null>(null);
  const [playerScores, setPlayerScores] = useState<Player[]>([]);
  const params = useParams();
  const teamID = params.teamID as string;

  useEffect(() => {
    if (!teamID) return;

    const fetchMatchDetails = async () => {
      try {
        // Fetch match details
        const matchResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_LINK}/getTeam/${teamID}`,
          { headers: { "Content-Type": "application/json" } }
        );

        const matchData = matchResponse.data[0];
        setMatchDetails(matchData);

        // Fetch player scores every 10 seconds
        const fetchScores = async () => {
          try {
            const scoreResponse = await axios.post(
              `${process.env.NEXT_PUBLIC_BACKEND_LINK}/getscore`,
              {
                team1: matchData.team1,
                team2: matchData.team2,
                matchDate: matchData.matchDate,
                players: matchData.players,
              }
            );

            const scoreData = scoreResponse.data.players;

            // Update scores with backend data
            const updatedScores = matchData.players.map((player: string) => ({
              name: player,
              totalScore: scoreData[player] || 0,
              image: `/images/players/${player}.jpg`,
            }));

            setPlayerScores(updatedScores);
            console.log("Scores updated:", updatedScores);
          } catch (error) {
            console.error("Error fetching scores:", error);
          }
        };

        // Fetch scores immediately and then every 10 seconds
        fetchScores();
        const interval = setInterval(fetchScores, 10000);
        return () => clearInterval(interval);
      } catch (error) {
        console.error("Error fetching match details:", error);
      }
    };

    fetchMatchDetails();
  }, [teamID]);

  // Calculate total score of all players
  const totalScore = playerScores.reduce(
    (sum, player) => sum + player.totalScore,
    0
  );

  return (
    <div className="flex flex-col items-center p-5 bg-gray-900 min-h-screen text-white">
      {matchDetails ? (
        <>
          {/* 🔹 Match Info at the Top (Centered) */}
          <div className="mb-8 p-4 bg-gray-800 rounded-md shadow-lg w-full max-w-lg text-center flex flex-col items-center space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              {matchDetails.team1} vs {matchDetails.team2}
            </h2>
            <h3 className="text-md md:text-lg font-medium text-gray-300">
              {new Date(matchDetails.matchDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
              })}
            </h3>
            <h2 className="text-lg md:text-xl font-bold text-yellow-400">
              Rank: 1
            </h2>
            <h3 className="text-lg md:text-xl font-semibold text-yellow-400">
              Total Score: {totalScore}
            </h3>
          </div>

          {/* 🔹 Selected Players Section */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">
            Your Players
          </h2>
          <div className="w-full max-w-2xl">
            {playerScores.map((player, idx) => (
              <div
                key={idx}
                className="bg-gray-800 p-4 rounded-lg shadow-md flex items-center justify-between w-full mb-4"
              >
                {/* Left Side: Player Image and Name */}
                <div className="flex items-center space-x-4">
                  <img
                    src={player.image || "/default-player.png"}
                    alt={player.name}
                    className="w-12 h-12 rounded-full border-2 border-yellow-400"
                  />
                  <h3 className="text-lg font-semibold">{player.name}</h3>
                </div>

                {/* Right Side: Player Score */}
                <div className="text-lg font-bold text-yellow-400">
                  ⭐ {player.totalScore}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-gray-400">Loading match details...</p>
      )}
    </div>
  );
}
