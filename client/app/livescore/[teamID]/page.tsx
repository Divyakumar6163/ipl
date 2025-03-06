"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Image from "next/image";
import IPL_TEAMS from "@/utils/data/shortname";
import IPL_PLAYERS from "@/utils/data/iplplayer";

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
  const [teamRank, setTeamRank] = useState<number | null>(null);
  const params = useParams();
  const teamID = params.teamID as string;

  useEffect(() => {
    if (!teamID) return;

    const fetchMatchDetails = async () => {
      try {
        // 🔹 Fetch match details
        const matchResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_LINK}/getTeam/${teamID}`,
          { headers: { "Content-Type": "application/json" } }
        );

        const matchData = matchResponse.data[0];
        setMatchDetails(matchData);

        // 🔹 Function to fetch player scores and rank
        const fetchScoresAndRank = async () => {
          try {
            // 🔹 Fetch player scores
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

            // 🔹 Update scores with backend data
            const updatedScores = matchData.players.map((player: string) => ({
              name: player,
              totalScore: scoreData[player] || 0,
              image: IPL_PLAYERS[player]?.image || "/default-player.png",
            }));

            setPlayerScores(updatedScores);
            console.log("Scores updated:", updatedScores);

            // 🔹 Fetch team rank
            const rankResponse = await axios.post(
              `${process.env.NEXT_PUBLIC_BACKEND_LINK}/getrank`,
              {
                team1: matchData.team1,
                team2: matchData.team2,
                matchDate: matchData.matchDate,
              }
            );

            const rankData = rankResponse.data.rankings;
            const teamRankData = rankData.find((team: any) => team.teamId === teamID);
            setTeamRank(teamRankData ? teamRankData.rank : null);
          } catch (error) {
            console.error("Error fetching scores or rank:", error);
          }
        };

        // Fetch scores & rank immediately and every 10 seconds
        fetchScoresAndRank();
        const interval = setInterval(fetchScoresAndRank, 10000);
        return () => clearInterval(interval);
      } catch (error) {
        console.error("Error fetching match details:", error);
      }
    };

    fetchMatchDetails();
  }, [teamID]);

  // 🔢 Calculate total score of all players
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
            <div className="flex items-center justify-center space-x-6  px-4 pt-4 rounded-lg shadow-lg">
              {/* Team 1 */}
              <div className="flex items-center space-x-2">
                {IPL_TEAMS[matchDetails.team1]?.logo && (
                  <Image
                    src={IPL_TEAMS[matchDetails.team1]?.logo}
                    alt={matchDetails.team1}
                    width={45}
                    height={45}
                    className="object-contain"
                  />
                )}
                <div className="text-center text-xl font-bold text-white">
                  {IPL_TEAMS[matchDetails.team1]?.short || "Team 1"}
                </div>
              </div>

              {/* VS */}
              <div className="text-center text-lg font-semibold text-gray-400">VS</div>

              {/* Team 2 */}
              <div className="flex items-center space-x-2">
                {IPL_TEAMS[matchDetails.team2]?.logo && (
                  <Image
                    src={IPL_TEAMS[matchDetails.team2]?.logo}
                    alt={matchDetails.team2}
                    width={45}
                    height={45}
                    className="object-contain"
                  />
                )}
                <div className="text-center text-xl font-bold text-white">
                  {IPL_TEAMS[matchDetails.team2]?.short || "Team 2"}
                </div>
              </div>
            </div>

            <h3 className="text-md md:text-lg font-medium text-gray-300">
              {new Date(matchDetails.matchDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
              })}
            </h3>
            <h2 className="text-lg md:text-xl font-bold text-yellow-400">
              Rank: {teamRank !== null ? teamRank : "Calculating..."}
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
                    src={player.image}
                    alt={player.name}
                    width={48}
                    height={48}
                    className="rounded-full border-2 border-yellow-400 object-cover"
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
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-300 text-2xl md:text-4xl font-bold animate-pulse  px-6 py-3 rounded-lg shadow-lg">
            Loading match details...
          </p>
        </div>
      )}
    </div>
  );
}
