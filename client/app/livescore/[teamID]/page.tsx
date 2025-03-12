"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Image from "next/image";
import IPL_TEAMS from "@/utils/data/shortname";
import { useRef } from "react";
import IPL_PLAYERS from "@/utils/data/iplplayer";
interface Match {
  _id: string;
  team1: string;
  team2: string;
  matchDate: string;
  matchTime: string;
  price: number;
  matchCompletion: boolean;
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
  const [isMatchCompleted, setIsMatchCompleted] = useState<boolean | null>(false);
  const params = useParams();
  const teamID = params.teamID as string;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
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
        console.log("Match Data:", matchData);
        setMatchDetails(matchData);
  
        if (matchData.matchCompletion || isMatchCompleted) {
          console.log("Match already completed, stopping fetch cycle.");
          setIsMatchCompleted(true); // Ensure local state is updated
          if (intervalRef.current) clearInterval(intervalRef.current); // Clear interval if running
          return;
        }
  
        // ✅ Function to fetch player scores and rank
        const fetchScoresAndRank = async () => {
          try {
            const scoreResponse = await axios.post(
              `${process.env.NEXT_PUBLIC_BACKEND_LINK}/getscore`,
              {
                team1: matchData.team1,
                team2: matchData.team2,
                matchDate: matchData.matchDate,
                matchTime: matchData.matchTime,
                players: matchData.players,
              }
            );
  
            const scoreData = scoreResponse.data.players;
            const matchCompleted = scoreResponse.data.match?.matchCompletion;
  
            console.log("Match Completion:", matchCompleted);
  
            if (matchCompleted) {
              setIsMatchCompleted(true);
              if (intervalRef.current) clearInterval(intervalRef.current); // Stop further calls if match completed
              return;
            }
  
            // 🔹 Update scores with backend data
            const updatedScores = matchData.players.map((player: string) => ({
              name: player,
              totalScore: scoreData[player] || 0,
              image:
                IPL_PLAYERS[player]?.image ||
                "https://banner2.cleanpng.com/20180516/zq/avcl9cqnd.webp",
            }));
  
            setPlayerScores(updatedScores);
            console.log("Scores updated:", updatedScores);
  
            // 🔹 Fetch team rank
            let teamRankData = null;
                 // 🔹 Get Current Date in "YYYY-MM-DD" format
                 const currentDate = new Date().toISOString().split("T")[0];

                 // 🔹 Convert Match Date to "YYYY-MM-DD" format
                 const matchDateFormatted = new Date(matchData.matchDate).toISOString().split("T")[0];
     
                 // console.log("Current Date:", currentDate);
                 // console.log("Match Date:", matchDateFormatted);
             if (currentDate >= matchDateFormatted) {
            const rankResponse = await axios.post(
              `${process.env.NEXT_PUBLIC_BACKEND_LINK}/getrank`,
              {
                team1: matchData.team1,
                team2: matchData.team2,
                matchDate: matchData.matchDate,
                matchTime: matchData.matchTime,
                contestPrice: matchData.price,
              }
            );
  
            const rankData = rankResponse.data.rankings;
            teamRankData = rankData.find((team: any) => team.teamId === teamID);}
            setTeamRank(teamRankData ? teamRankData.rank : null);
          } catch (error) {
            console.error("Error fetching scores or rank:", error);
          }
        };
  
        // 🔹 Initial fetch
        fetchScoresAndRank();
  
        // ✅ Start interval only if match is not completed yet
        if (!intervalRef.current) {
          intervalRef.current = setInterval(fetchScoresAndRank, 10000);
        }
  
      } catch (error) {
        console.error("Error fetching match details:", error);
      }
    };
  
    fetchMatchDetails();
  
    // ✅ Cleanup interval on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [teamID]);

  // 🔢 Calculate total score of all players
  const totalScore = playerScores.reduce(
    (sum, player) => sum + player.totalScore,
    0
  );
  return (
    <div className="flex flex-col items-center justify-center p-5 bg-gray-900 min-h-screen text-white">
      {matchDetails ? (
        <>
          {/* 🔹 Match Info at the Top (Centered) */}
          <div className="mb-8 p-4 bg-gray-800 rounded-md shadow-lg w-full max-w-lg text-center flex flex-col items-center space-y-2">
            <div className="flex items-center justify-center space-x-6  px-4 pt-4 ">
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
            })}{" "}
            | {matchDetails.matchTime || "Time Not Available"}
          </h3>

            <h2 className="text-lg md:text-xl font-bold text-yellow-400">
              {teamRank!==null ? "Rank: ":""}{teamRank !== null ? teamRank : (totalScore!==0? "Calculating...": "To be Started")}
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
                    alt={"Player"}
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
