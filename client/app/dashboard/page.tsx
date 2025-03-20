"use client";
import { useState, useEffect } from "react";
import axios from "axios";

interface Retailer {
  _id: string;
  username: string;
  teamsSold: { teamID: string; price: number }[];
  totalWinningTickets: number;
  totalWinningPaid: number;
  winningTeams: string[];
}

const Dashboard = () => {
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [retailersTeamSold, setRetailersTeamSold] = useState<Retailer[]>([]);
  const [retailersWinning, setRetailersWinning] = useState<Retailer[]>([]);
  const [filteredTeamsRetailers, setFilteredTeamsRetailers] = useState<Retailer[]>([]);
  const [filteredWinningRetailers, setFilteredWinningRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [selectedTab, setSelectedTab] = useState<"teams" | "winning">("teams");

  const [selectedRetailerTeams, setSelectedRetailerTeams] = useState<string>("all");
  const [selectedRetailerWinning, setSelectedRetailerWinning] = useState<string>("all");

  const [expandedTeamsSold, setExpandedTeamsSold] = useState<{ [key: string]: boolean }>({});
  const [expandedWinningTeams, setExpandedWinningTeams] = useState<{ [key: string]: boolean }>({});

  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  useEffect(() => {
    const fetchRetailers = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/getretailers`);
        console.log(response.data);
        const processedRetailers = response.data.map((retailer: any) => ({
          _id: retailer._id,
          username: retailer.username,
          teamsSold: retailer.teamsSold || [], 
          totalWinningTickets: retailer.totalWinningTickets ? retailer.totalWinningTickets.length : 0,
          totalWinningPaid: retailer.totalWinningPaid ? retailer.totalWinningPaid : 0,
          winningTeams: retailer.winningTeams ? retailer.winningTeams: [],
        }));
        
        console.log(processedRetailers);

        setRetailers(processedRetailers);
        setRetailersTeamSold(processedRetailers);
        setRetailersWinning(processedRetailers);
        setFilteredTeamsRetailers(processedRetailers);
        setFilteredWinningRetailers(processedRetailers);
      } catch (err) {
        console.error("Error fetching retailers:", err);
        setError("Failed to load retailer data.");
      } finally {
        setLoading(false);
      }
    };

    fetchRetailers();
  }, []);

  const toggleTeamsSold = (id: string) => {
    setExpandedTeamsSold((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleWinningTeams = (id: string) => {
    setExpandedWinningTeams((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTeamsFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.value;
    setSelectedRetailerTeams(selected);

    setFilteredTeamsRetailers(
      selected === "all" ? retailersTeamSold : retailersTeamSold.filter((retailer) => retailer._id === selected)
    );
  };

  const handleWinningFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.value;
    setSelectedRetailerWinning(selected);

    setFilteredWinningRetailers(
      selected === "all" ? retailersWinning : retailersWinning.filter((retailer) => retailer._id === selected)
    );
  };

  
  const handleDateFilter = async () => {
    if (!fromDate || !toDate) return;

    setLoading(true);
    setError("");
    try {
      if(selectedTab==="teams") {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/getsoldteam`, {
          fromDate,
          toDate,
          retailers,
        });
        setRetailersTeamSold(response.data);
        setFilteredTeamsRetailers(response.data);
        console.log(response.data);
      }
      else{
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/getwinningteam`, {
          fromDate,
          toDate,
          retailers,
        });
        setRetailersWinning(response.data);
        setFilteredWinningRetailers(response.data);
        console.log(response.data);
      }
    } catch (err) {
      console.error("Error filtering retailers by date:", err);
      setError("Failed to filter retailers by date.");
    } finally {
      setLoading(false);
    }
  };
console.log(filteredWinningRetailers)
  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">Retailer Dashboard</h1>


      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          className={`p-2 rounded-lg ${selectedTab === "teams" ? "bg-blue-500" : "bg-gray-700"}`}
          onClick={() => setSelectedTab("teams")}
        >
          Teams Sold
        </button>
        <button
          className={`p-2 rounded-lg ${selectedTab === "winning" ? "bg-blue-500" : "bg-gray-700"}`}
          onClick={() => setSelectedTab("winning")}
        >
          Winning Information
        </button>
      </div>

      {/* Teams Sold Tab */}
      {selectedTab === "teams" && (
        <>
          {/* Filters */}
          <div className="mb-6 flex flex-wrap justify-center gap-4">
            <select className="p-2 bg-gray-800" value={selectedRetailerTeams} onChange={handleTeamsFilterChange}>
              <option value="all">All Retailers</option>
              {retailers.map((retailer) => (
                <option key={retailer._id} value={retailer._id}>
                  {retailer.username}
                </option>
              ))}
            </select>
            
            {/* Date Filters */}
            <input
              type="date"
              className="p-2 rounded-lg bg-gray-800 text-white border border-gray-600"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <input
              type="date"
              className="p-2 rounded-lg bg-gray-800 text-white border border-gray-600"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
            <button
              className="p-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600"
              onClick={handleDateFilter}
            >
              Apply Filter
            </button>            
          </div>

          {/* Teams Sold Data */}
          {filteredTeamsRetailers.map((retailer) => {
            // Calculate total price for each retailer
            const totalRetailerSales = retailer.teamsSold.reduce((sum, team) => sum + team.price, 0);

            return (
              <div key={retailer._id} className="p-4 mb-4 bg-gray-800 rounded-lg">
                <h2 className="text-xl font-bold">{retailer.username}</h2>
               <p className="mt-3 font-bold text-green-400">Total Sale: ₹{totalRetailerSales}</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-white">Teams Sold: {retailer.teamsSold.length}</p>
                  <button className="px-2 py-1 text-white rounded-lg" onClick={() => toggleTeamsSold(retailer._id)}>
                    {expandedTeamsSold[retailer._id] ? "🔼" : "🔽"}
                  </button>
                </div>
               {/* Display total price per retailer */}
                {expandedTeamsSold[retailer._id] && (
                  <div className="mt-2 p-3 bg-gray-700 rounded-lg">
                    {retailer.teamsSold.length > 0 ? (
                      <>
                        <ul className="list-inside text-gray-300">
                          {retailer.teamsSold.map((team, index) => (
                            <li key={index}>
                              🏷️ {team.teamID} - ₹{team.price}
                            </li>
                          ))}
                        </ul>
                       
                      </>
                    ) : (
                      <p className="text-gray-400">No teams sold.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

        </>
      )}

      {/* Winning Information Tab */}
      {selectedTab === "winning" && (
        <>
          {/* Filters */}
          <div className="mb-6 flex flex-wrap justify-center gap-4">
            <select className="p-2 bg-gray-800" value={selectedRetailerWinning} onChange={handleWinningFilterChange}>
              <option value="all">All Retailers</option>
              {retailers.map((retailer) => (
                <option key={retailer._id} value={retailer._id}>
                  {retailer.username}
                </option>
              ))}
            </select>
            {/* Date Filters */}
        <input
          type="date"
          className="p-2 rounded-lg bg-gray-800 text-white border border-gray-600"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <input
          type="date"
          className="p-2 rounded-lg bg-gray-800 text-white border border-gray-600"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
        <button
          className="p-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600"
          onClick={handleDateFilter}
        >
          Apply Filter
        </button>
          </div>

          {/* Winning Data */}
          {filteredWinningRetailers.map((retailer) => (
            <div key={retailer._id} className="p-4 mb-4 bg-gray-800 rounded-lg">
              <h2 className="text-xl font-bold">{retailer.username}</h2>
              <div className="flex justify-between items-center mt-2">
                <p className="text-white">Winning Tickets: {retailer.totalWinningTickets}</p>
                <button className="px-2 py-1 text-white rounded-lg" onClick={() => toggleWinningTeams(retailer._id)}>
                  {expandedWinningTeams[retailer._id] ? "🔼" : "🔽"}
                </button>
              </div>
              {expandedWinningTeams[retailer._id] && (
                <div className="mt-2 p-3 bg-gray-700 rounded-lg">
                  {retailer.winningTeams.length > 0 ? (
                    <ul className="list-inside text-gray-300">
                      {retailer.winningTeams.map((teamId, index) => (
                        <li key={index}>🥇 {teamId}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400">No winning teams.</p>
                  )}
                </div>
              )}
              <p className="text-white mt-2">Total Winning Paid: ₹{retailer.totalWinningPaid}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Dashboard;
