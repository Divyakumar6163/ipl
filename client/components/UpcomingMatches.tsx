"use client";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { selectMatch } from "../store/matchesSlice";
import { matches } from "../utils/data/matches";
import { useRouter } from "next/navigation";
export default function UpcomingMatches() {
  const [upcoming, setUpcoming] = useState(matches);
  const dispatch = useDispatch();
const router = useRouter();
  useEffect(() => {
    const today = new Date();

    // Filter matches that are in the future
    const filteredMatches = matches.filter((match) => {
      const matchDate = new Date(match.matchDate.split("-").reverse().join("-"));
      return matchDate >= today;
    });

    // Get the next three upcoming matches
    setUpcoming(filteredMatches.slice(0, 3));
  }, []);

  const handleMatchClick = (match:any) => {
    dispatch(selectMatch(match));
    router.push("/teamEntry");
    
  };

  return (
    <div className="flex flex-col items-center p-8 bg-gray-900 min-h-screen">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center mt-5">
        🔥 Upcoming Matches
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {upcoming.map((match, index) => (
          <div
            key={index}
            onClick={() => handleMatchClick(match)}
            className="cursor-pointer bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg w-full flex flex-col items-center transition transform hover:scale-105 md:mt-20"
          >
            <div className="flex flex-col items-center text-center">
              <h3 className="text-lg font-semibold text-white mb-2">{match.team1}</h3>
              <span className="text-2xl font-bold text-gray-300 mb-2">VS</span>
              <h3 className="text-lg font-semibold text-white">{match.team2}</h3>
            </div>
            <p className="text-md text-gray-400 mt-4">📅 {match.matchDate}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
