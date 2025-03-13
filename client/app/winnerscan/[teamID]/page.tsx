'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

interface MatchDetail {
    _id: string;
    team1: string;
    team2: string;
    matchDate: string;
    matchTime: string;
    price: number;
    matchCompletion: boolean;
    players: string[];
}

const TeamResultPage: React.FC = () => {
  const { teamID } = useParams<{ teamID: string }>();
  console.log(teamID);
  const [matchDetail, setMatchDetail] = useState<MatchDetail | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [winningAmount, setWinningAmount] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ Main flow to fetch match details, rank, and winning amount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Match Detail using teamId
        const matchResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_LINK}/getTeam/${teamID}`,
            { headers: { "Content-Type": "application/json" } }
          );
  
          const matchData = matchResponse.data[0];
          setMatchDetail(matchData);

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
          setRank(teamRankData ? teamRankData.rank : null);

        // 3. Fetch Winning Amount using matchId and teamId
        const prizeResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_LINK}/getprize`,
            {
              team1: matchData.team1,
              team2: matchData.team2,
              matchDate: matchData.matchDate,
              matchTime: matchData.matchTime,
              contestPrice: matchData.price,
              teamID: teamID,
              rank: teamRankData?.rank,
            }
          );
          console.log("Prize Response:", prizeResponse.data.prize);
          setWinningAmount(prizeResponse.data.prize || 0);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (teamID) {
      fetchData();
    }
  }, [teamID]);

  // ✅ Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading...</p>
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }
console.log(matchDetail);
console.log(rank);
console.log(winningAmount);
  // ✅ Display data
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Team Result Summary</h1>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Match Details</h2>
        {/* <p><strong>Match Name:</strong> {matchDetail?.matchName}</p>
        <p><strong>Match Date:</strong> {matchDetail?.date}</p> */}

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-yellow-300">Team Rank: <span className="text-white">{rank}</span></h3>
          <h3 className="text-lg font-semibold text-green-400 mt-2">Winning Amount: <span className="text-white">₹ {winningAmount}</span></h3>
        </div>
      </div>
    </div>
  );
};

export default TeamResultPage;
