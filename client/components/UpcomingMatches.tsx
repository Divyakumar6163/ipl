"use client";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { selectMatch } from "../store/matchesSlice";
import { matches } from "../utils/data/matches";
import { useRouter } from "next/navigation";

export default function UpcomingMatches() {
  const [upcoming, setUpcoming] = useState(matches);
  const [isAuthorized, setIsAuthorized] = useState(true); // New state for role check
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

  useEffect(() => {
    // ✅ Check if user is logged in
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      router.push("/login"); // Redirect to login if not logged in
    } else if (role !== "admin" && role !== "retailer") {
      setIsAuthorized(false); // Set unauthorized state
    }
  }, []);

  const handleMatchClick = (match: any) => {
    const role = localStorage.getItem("role");

    if (!role || (role !== "admin" && role !== "retailer")) {
      setIsAuthorized(false); // Show unauthorized message
      return;
    }

    dispatch(selectMatch(match));
    router.push("/teamEntry");
  };

  return (
    <div className="flex-col flex items-center justify-center p-8 bg-gray-900 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-6xl">
        {isAuthorized ? (
          upcoming.map((match, index) => (
            <div
              key={index}
              onClick={() => handleMatchClick(match)}
              className="cursor-pointer bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-3 rounded-xl shadow-lg w-full flex flex-col items-center transition transform hover:scale-105 md:mt-20"
            >
              <div className="flex flex-col items-center text-center">
                <h3 className="text-lg font-semibold text-white mb-2">{match.team1}</h3>
                <span className="text-xl font-bold text-gray-300 mb-2">VS</span>
                <h3 className="text-lg font-semibold text-white">{match.team2}</h3>
              </div>
              <div className="mt-2 text-sm font-small text-gray-300 px-4 py-2 rounded-md shadow-md">
                {match.matchDate
                  ? (() => {
                      const [day, month, year] = match.matchDate.split("-").map(Number);
                      return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                      });
                    })()
                  : "Not Selected"}
              </div>
            </div>
          ))
        ) : (
          <p className="text-red-500 text-xl font-bold text-center">❌ You are not authorized to access this page.</p>
        )}
      </div>
    </div>
  );
}
