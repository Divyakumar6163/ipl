"use client";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { selectMatch } from "../store/matchesSlice";
import { matches } from "../utils/data/matches";
import { useRouter } from "next/navigation";
import LogoutButton from "./Logout";

export default function UpcomingMatches() {
  const [upcoming, setUpcoming] = useState(matches);
  const [isAuthorized, setIsAuthorized] = useState(true); // New state for role check
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const todayUTC = new Date();
    
    // Convert to Indian Standard Time (IST)
    const todayIST = new Date(todayUTC.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  
    // Filter matches that are in the future or the same day but later in time
    const filteredMatches = matches.filter((match) => {
      const [day, month, year] = match.matchDate.split("-").map(Number);
      const matchDate = new Date(year, month - 1, day);
  
      // Convert match date to IST (forcing midnight IST)
      const matchDateIST = new Date(matchDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  
      // If match date is in the future (IST), keep it
      if (matchDateIST > todayIST) return true;
  
      // If the match is today (IST), check the time
      if (matchDateIST.toDateString() === todayIST.toDateString()) {
        let matchTime = match.matchTime.toLowerCase().replace(/\s/g, ""); // Remove spaces and make lowercase
        let [time, period] = matchTime.split(/(am|pm)/);
        let [hours, minutes] = time.split(":").map(Number);
  
        // Convert 12-hour format to 24-hour format
        let matchHours = hours;
        if (period === "pm" && hours !== 12) matchHours += 12;
        if (period === "am" && hours === 12) matchHours = 0;
  
        // Create full match datetime in IST
        const matchDateTimeIST = new Date(matchDateIST);
        matchDateTimeIST.setHours(matchHours, minutes, 0, 0);
  
        // Compare match time with the current IST time
        return matchDateTimeIST > todayIST;
      }
  
      return false; // Otherwise, filter it out
    });
  
    // Get the next three upcoming matches
    setUpcoming(filteredMatches.slice(0, 3));
    setLoading(false);
  }, [matches]);
  

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
  if (isAuthorized === null || loading) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white"><h2 className="text-xl font-bold">⏳ Loading...</h2></div>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-8">
       <div className="absolute top-4 left-4">
        <LogoutButton />
      </div>
      {isAuthorized ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-6xl">
      {/* <LogoutButton/> */}

          {upcoming.map((match, index) => (
            <div
              key={index}
              onClick={() => handleMatchClick(match)}
              className="cursor-pointer bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-3 rounded-xl shadow-lg w-full flex flex-col items-center transition transform hover:scale-105 md:mt-20"
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-white">{match.team1}</h3>
                </div>

                <span className="text-xl font-bold text-gray-300 mb-2">VS</span>

                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-white">{match.team2}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-red-500 text-xl font-bold text-center">
          ❌ You are not authorized to access this page.
        </p>
      )}
    </div>
  );
}
