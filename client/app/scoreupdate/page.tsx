"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { matches } from "../../utils/data/matches";
import { useRouter } from "next/navigation";

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
  const router= useRouter();
  // ✅ Find nearest match (handle 3:30pm and 7:30pm logic)
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login"); // Redirect to login if not logged in
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let nearestMatch = null;
    let nearestDateDiff = Infinity;

    for (const match of matches) {
      const matchDate = new Date(match.matchDate.split("-").reverse().join("-"));
      const diff = matchDate.getTime() - today.getTime();
      if (diff >= 0 && diff < nearestDateDiff) {
        nearestDateDiff = diff;
        nearestMatch = match;
        const now = new Date();
        if (match.matchTime === "3:30pm" && now.getHours() >= 19) {
          const sameDayEveningMatch = matches.find(
            (m) => m.matchDate === match.matchDate && m.matchTime === "7:30pm"
          );
          if (sameDayEveningMatch) nearestMatch = sameDayEveningMatch;
        }
      }
    }

    if (nearestMatch) setCurrentMatch(nearestMatch);
    else {
      setError("No upcoming matches found.");
      setLoading(false);
    }
  }, []);

  // ✅ Fetch players for that match
  useEffect(() => {
    if (!currentMatch) return;
    const fetchPlayers = async () => {
      const token = localStorage.getItem("token"); // Retrieve JWT from local storage
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/matchplayer`, {
          team1: currentMatch.team1,
          team2: currentMatch.team2,
          matchDate: currentMatch.matchDate,
          matchTime: currentMatch.matchTime,
        },{
          headers: {
            Authorization: `Bearer ${token}`, // Send JWT in Authorization header
          },validateStatus: () => true});
          if (response.status === 403) {
            setIsAuthorized(false);
            setError('❌ Unauthorized Access: Admin or Updater role required.');
            return;
          }
        if (!response.data.match || !response.data.match.players) {
          setError("No players found for this match.");
          setLoading(false);
          return;
        }
        const playerList = Object.keys(response.data.match.players);
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

  // ✅ Role authorization
  useEffect(() => {
    const role = localStorage.getItem("role");
    setIsAuthorized(role === "admin" || role === "updater");
  }, []);

  // ✅ POINTING SYSTEM MAP
  const POINTS_MAP: { [key: string]: number } = {
    "1 Run": 1,
    "4 Run": 8,
    "6 Run": 12,
    "Wicket": 25,
    "Dot Ball": 1,
    "Catch": 8,
    "Stumping": 12,
  };

  // ✅ Function to update score and also call backend for each run (1, 4, 6)
// ✅ Function to update score and also call backend for each run (1, 4, 6)
const updateScore = async (player: string, action: string) => {
  let addedPoints = POINTS_MAP[action] || 0;
  let newScore = scores[player] + addedPoints;

  const updatedPlayers = { ...scores, [player]: newScore };

  try {
    // ✅ Update player score and team rank
    await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/update-score`, {
      team1: currentMatch.team1,
      team2: currentMatch.team2,
      matchDate: currentMatch.matchDate,
      matchTime: currentMatch.matchTime,
      players: updatedPlayers,
    });

    await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/update-rank`, {
      team1: currentMatch.team1,
      team2: currentMatch.team2,
      matchDate: currentMatch.matchDate,
      matchTime: currentMatch.matchTime,
      players: updatedPlayers,
    });

    // ✅ Special backend tracking for runs (1, 4, 6)
    if (["1 Run", "4 Run", "6 Run"].includes(action)) {
      const run = parseInt(action.split(" ")[0]); // Extract the number part (1, 4, 6)

      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/track-run`, {
        team1: currentMatch.team1,
        team2: currentMatch.team2,
        matchDate: currentMatch.matchDate,
        matchTime: currentMatch.matchTime,
        player,
        run, // Send the run value for backend processing
      });

      console.log("Run tracking response:", res.data.run); // Bonus points if milestone achieved

      // ✅ Now update state again with both added run & backend milestone run if any
      setScores((prevScores) => ({
        ...prevScores,
        [player]: newScore + res.data.run, // Add actual run + bonus/milestone run
      }));
    }
    else{
      // ✅ Update state immediately for responsiveness
        setScores((prevScores) => ({
          ...prevScores,
          [player]: newScore,
        }));
    }

  } catch (error) {
    console.error("Error updating scores:", error);
  }
};

// ✅ Function to mark match as completed
const completeMatch = async () => {
  try {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/match-completed`, {
      team1: currentMatch.team1,
      team2: currentMatch.team2,
      matchDate: currentMatch.matchDate,
      matchTime: currentMatch.matchTime,
    });
    console.log('Match completion response:', res.data);
    alert('✅ Match marked as completed!');
  } catch (error) {
    console.error('Error marking match as completed:', error);
    alert('❌ Failed to mark match as completed. Try again.');
  }
};



  // ✅ Conditional Rendering
  if (isAuthorized === null || loading) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white"><h2 className="text-xl font-bold">⏳ Loading...</h2></div>;
  if (!isAuthorized) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white"><h2 className="text-xl font-bold">🚫 Unauthorized Access</h2></div>;
  if (error) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white"><h2 className="text-xl font-bold">❌ {error}</h2></div>;

  return (
    <div className="p-2 bg-gray-900 text-white shadow-lg overflow-auto h-screen flex flex-col">
      <div className="relative mb-4">
        <h2 className="text-2xl font-bold text-center">Score Table</h2>
        <button
          className="absolute right-0 top-0 bg-blue-500 hover:bg-blue-700 hover:cursor-pointer text-white font-bold py-2 px-4 rounded-md"
          onClick={completeMatch}
        >
          Match Completed
        </button>
      </div>


  
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
                    {["1 Run", "4 Run", "6 Run", "Wicket", "Dot Ball", "Catch", "Stumping"].map((action) => (
                      <button
                        key={action}
                        className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                        onClick={() => updateScore(player, action)}
                      >
                        {action}
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
