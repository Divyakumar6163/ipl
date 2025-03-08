"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { matches } from "../../utils/data/matches"; // Ensure this file contains match data

type PlayerScores = {
  [playerName: string]: number;
};

const ScoreTable = () => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [scores, setScores] = useState<PlayerScores>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMatch, setCurrentMatch] = useState<any>(null);

  // ✅ Find the nearest match (today or upcoming)
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize date

    let nearestMatch = null;
    let nearestDateDiff = Infinity;

    for (const match of matches) {
      const matchDate = new Date(match.matchDate.split("-").reverse().join("-")); // Convert DD-MM-YYYY to YYYY-MM-DD
      // console.log(today);
      const diff = matchDate.getTime() - today.getTime();

      if (diff >= 0 && diff < nearestDateDiff) {
        nearestDateDiff = diff;
        nearestMatch = match;

        const now = new Date();
        // console.log("Hours 1",now.getHours());
        if (match.matchTime === "3:30pm" && now.getHours() >= 19) {
          // console.log("Hours 2",now.getHours());
          const sameDayEveningMatch = matches.find(
            (m) => m.matchDate === match.matchDate && m.matchTime === "7:30pm"
          );
          if (sameDayEveningMatch) {
            nearestMatch = sameDayEveningMatch;
          }
        }
      }
    }

    if (nearestMatch) {
      setCurrentMatch(nearestMatch);
    } else {
      setError("No upcoming matches found.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentMatch) return;

    const fetchPlayers = async () => {
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/matchplayer`, {
          team1: currentMatch.team1,
          team2: currentMatch.team2,
          matchDate: currentMatch.matchDate,
          matchTime: currentMatch.matchTime
        });

        if (!response.data.match || !response.data.match.players) {
          setError("No players found for this match.");
          setLoading(false);
          return;
        }

        const playerList = Object.keys(response.data.match.players); // Extract player names
        setPlayers(playerList);
        setScores(response.data.match.players);
      } catch (err) {
        setError("Failed to fetch players. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [currentMatch]);

  // ✅ Check role before opening the page
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin" && role !== "updater") {
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
    }
  }, []);

  // ✅ Function to update the score of a player
  const updateScore = async (player: string, runs: number) => {
    const newScore = scores[player] + runs;

    // Update state immediately
    setScores((prevScores) => ({
      ...prevScores,
      [player]: newScore
    }));
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/update-score`, {
        team1: currentMatch.team1,
        team2: currentMatch.team2,
        matchDate: currentMatch.matchDate,
        matchTime: currentMatch.matchTime,
        players: { ...scores, [player]: newScore } // Send all players' scores
      });
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/update-rank`, {
        team1: currentMatch.team1,
        team2: currentMatch.team2,
        matchDate: currentMatch.matchDate,
        matchTime: currentMatch.matchTime,
        players: { ...scores, [player]: newScore }
      });
    } catch (error) {
      console.error("Error updating match scores:", error);
    }
  };

  if (isAuthorized === null || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <h2 className="text-xl font-bold">⏳ Loading...</h2>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <h2 className="text-xl font-bold">🚫 You are not authorized to access this page.</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <h2 className="text-xl font-bold">❌ {error}</h2>
      </div>
    );
  }

  return (
    <div className="p-2 bg-gray-900 text-white shadow-lg overflow-auto h-screen flex flex-col">
      <h2 className="text-2xl font-bold text-center mb-4">Score Table</h2>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full border-collapse border border-gray-700">
          <thead>
            <tr className="bg-gray-800">
              <th className="p-1.5 border border-gray-700">Player</th>
              <th className="p-1.5 border border-gray-700">Score</th>
              <th className="p-1.5 border border-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player} className="border border-gray-700 text-center">
                <td className="p-2 border border-gray-700">{player}</td>
                <td className="p-2 border border-gray-700 text-yellow-400">{scores[player]}</td>
                <td className="p-2 border border-gray-700">
                  <div className="flex flex-wrap justify-evenly gap-2">
                    {[1, 2, 3, 4, 5, 6, "Out", "Catch"].map((value) => (
                      <button
                        key={value}
                        className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                        onClick={() => updateScore(player, typeof value === "number" ? value : 0)}
                      >
                        {value} {typeof value === "number" ? "Run" : ""}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScoreTable;
