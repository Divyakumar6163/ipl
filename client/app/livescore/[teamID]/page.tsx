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
  const [prize, setPrize] = useState<number | null>(null);
  const [teamRank, setTeamRank] = useState<number | null>(null);
  const [isMatchCompleted, setIsMatchCompleted] = useState<boolean | null>(false);
  const params = useParams();
  const teamID = params.teamID as string;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!teamID) return;

    const fetchMatchDetails = async () => {
      try {
        const matchResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_LINK}/getTeam/${teamID}`,
          { headers: { "Content-Type": "application/json" } }
        );

        const matchData = matchResponse.data[0];
        setMatchDetails(matchData);

        if (matchData.matchCompletion) {
          handleFinalFetch(matchData);
          return;
        }

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
                contestPrice: matchData.price,
              }
            );

            const scoreData = scoreResponse.data.players;
            const matchCompleted = scoreResponse.data.match?.matchCompletion;

            const updatedScores = matchData.players.map((player: string) => ({
              name: player,
              totalScore: scoreData[player] || 0,
              image:
                IPL_PLAYERS[player]?.image ||
                "https://banner2.cleanpng.com/20180516/zq/avcl9cqnd.webp",
            }));

            setPlayerScores(updatedScores);

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
            const teamRankData = rankData.find((team: any) => team.teamId === teamID);
            setTeamRank(teamRankData ? teamRankData.rank : null);

            if (matchCompleted) {
              handleFinalFetch(matchData);
            }
          } catch (error) {
            console.error("Error fetching scores or rank:", error);
          }
        };

        fetchScoresAndRank();
        intervalRef.current = setInterval(fetchScoresAndRank, 10000);
      } catch (error) {
        console.error("Error fetching match details:", error);
      }
    };

    fetchMatchDetails();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [teamID]);

  const handleFinalFetch = async (matchData: Match) => {
    setIsMatchCompleted(true);
    if (intervalRef.current) clearInterval(intervalRef.current);

    try {
      const finalRankResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_LINK}/getrank`,
        {
          team1: matchData.team1,
          team2: matchData.team2,
          matchDate: matchData.matchDate,
          matchTime: matchData.matchTime,
          contestPrice: matchData.price,
        }
      );
      const finalRankData = finalRankResponse.data.rankings;
      const finalTeamRank = finalRankData.find((team: any) => team.teamId === teamID);
      setTeamRank(finalTeamRank ? finalTeamRank.rank : null);

      const finalScoreResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_LINK}/getscore`,
        {
          team1: matchData.team1,
          team2: matchData.team2,
          matchDate: matchData.matchDate,
          matchTime: matchData.matchTime,
          players: matchData.players,
          contestPrice: matchData.price,
        }
      );
      const finalScoreData = finalScoreResponse.data.players;
      const updatedFinalScores = matchData.players.map((player: string) => ({
        name: player,
        totalScore: finalScoreData[player] || 0,
        image:
          IPL_PLAYERS[player]?.image ||
          "https://banner2.cleanpng.com/20180516/zq/avcl9cqnd.webp",
      }));
      setPlayerScores(updatedFinalScores);

      const prizeResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_LINK}/getprize`,
        {
          team1: matchData.team1,
          team2: matchData.team2,
          matchDate: matchData.matchDate,
          matchTime: matchData.matchTime,
          contestPrice: matchData.price,
          teamID: teamID,
          rank: finalTeamRank?.rank,
        }
      );
      console.log("Prize Response:", prizeResponse.data.prize);
      setPrize(prizeResponse.data.prize || 0);
    } catch (error) {
      console.error("Error in final fetch:", error);
    }
  };

  const totalScore = playerScores.reduce((sum, player) => sum + player.totalScore, 0);
  console.log("Total Prize:", prize);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      {isMatchCompleted && prize !== null && (
        <div className="p-6 w-full max-w-md text-center">
        {prize > 0 ? (
          <>
            <h2 className="text-3xl font-extrabold text-green-400 mb-2">
               Congratulations!
            </h2>
            <p className="text-lg font-medium text-white">
              Your Team won <span className="font-bold text-yellow-400">₹{prize}</span>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-extrabold text-red-400 mb-2">
              Better Luck Next Time!
            </h2>
            <p className="text-m font-medium text-gray-300">
              Keep playing to win exciting prizes!
            </p>
          </>
        )}
      </div>
      
      )}
  
      {matchDetails ? (
        <>
          {/* Match Card */}
          <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 space-y-4 text-center">
            {/* Team Names & Logos */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Image
                  src={IPL_TEAMS[matchDetails.team1]?.logo}
                  alt={matchDetails.team1}
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <span className="font-bold text-xl">{IPL_TEAMS[matchDetails.team1]?.short || "Team 1"}</span>
              </div>
  
              <span className="text-gray-400 font-semibold text-lg">VS</span>
  
              <div className="flex items-center space-x-2">
                <Image
                  src={IPL_TEAMS[matchDetails.team2]?.logo}
                  alt={matchDetails.team2}
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <span className="font-bold text-xl">{IPL_TEAMS[matchDetails.team2]?.short || "Team 2"}</span>
              </div>
            </div>
  
            {/* Date & Time */}
            <div className="text-gray-400 font-medium">
              {new Date(matchDetails.matchDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
              })}{" "}
              | {matchDetails.matchTime || "Time Not Available"}
            </div>
  
            {/* Rank & Score */}
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-yellow-400">
                {teamRank !== null ? `Rank: ${teamRank}` : totalScore !== 0 ? "Calculating..." : "To be Started"}
              </h2>
              <h3 className="text-lg font-semibold text-yellow-400">
                Total Score: {totalScore}
              </h3>
            </div>
          </div>
  
          {/* Players Section */}
          {/* { ( */}
            <div className="w-full max-w-2xl mt-5">
             { playerScores.length>0 && <h2 className="text-2xl font-bold text-center mb-2">Your Team</h2>}
              <div className="space-y-4">
                {playerScores.map((player, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-md"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={player.image}
                        alt={player.name}
                        width={50}
                        height={50}
                        className="rounded-full border-2 border-yellow-400 object-cover"
                      />
                      <span className="text-m font-semibold">{player.name}</span>
                    </div>
                    <span className="text-lg font-bold text-yellow-400">⭐ {player.totalScore}</span>
                  </div>
                ))}
              </div>
            </div>
         {/* ) : null} */}
        </>
      ) : (
        // Loader if match details are not available yet
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-300 text-xl md:text-2xl font-bold animate-pulse">
            Loading match details...
          </p>
        </div>
      )}
    </div>
  );
  
}
