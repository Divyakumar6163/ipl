'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import IPL_TEAMS from '@/utils/data/shortname';

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
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const retailerID= localStorage.getItem("retailerID");
  // console.log("retailerID",retailerID);
  const [matchDetail, setMatchDetail] = useState<MatchDetail | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [winningAmount, setWinningAmount] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [paying, setPaying] = useState<boolean>(false);
  const [paySuccess, setPaySuccess] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneSubmitted, setPhoneSubmitted] = useState<boolean>(false);
  const [panCard, setPanCard] = useState<string>('');
  const [askPanCard, setAskPanCard] = useState<boolean>(false);
  const router=useRouter();
  // ✅ Main flow to fetch match details, rank, and winning amount
  useEffect(() => {
      const role = localStorage.getItem('role');
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login"); 
      }
      if (role === 'admin' || role === 'retailer') {
        setIsAuthorized(true);
      } else {
        setError('❌ Unauthorized Access: Admin or Retailer role required.');
      }
    }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Match Detail using teamId
        const matchResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_LINK}/getTeam/${teamID}`,
          { headers: { "Content-Type": "application/json",}}
        );
       
        console.log(matchResponse)
        const matchData = matchResponse.data[0];
        setMatchDetail(matchData);

        // 2. Fetch Team Rank
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

        // 3. Fetch Winning Amount
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

  const handlePhoneSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!phoneNumber || phoneNumber.length < 10) {
        setError('Please enter a valid 10-digit phone number.');
        return;
      }
      setError('');

      const phoneResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_LINK}/verifyPhone`,
        { phoneNumber,teamID },
        { headers: { Authorization: `Bearer ${token}`},validateStatus: () => true, }
      );
      if (phoneResponse.status === 403) {
        setIsAuthorized(false);
        setError("❌ Unauthorized Access: Admin or Retailer role required.")
        return;
      }
      console.log(phoneResponse);
      if (phoneResponse.status === 200) {
        setPhoneSubmitted(true);
      } else if (phoneResponse.status === 300) {
        setAskPanCard(true); // ✅ Ask PAN Card if response is 300
      }
    } catch (err) {
      console.error('Phone submission error:', err);
      setError('Failed to save phone number. Please try again.');
    }
  };

  const handlePanSubmit = async () => {
    try {
      if (!panCard || panCard.length < 10) {
        setError('Please enter a valid PAN Card number.');
        return;
      }
      setError('');

      const panResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_LINK}/addCustomer`,
        { phoneNumber, panCard,teamID}
      );

      if (panResponse.status === 200) {
        setPhoneSubmitted(true); // ✅ Successfully stored phone & PAN
        setAskPanCard(false);
      }
    } catch (err) {
      console.error('PAN submission error:', err);
      setError('Failed to save PAN Card. Please try again.');
    }
  };


  // ✅ Handle Payment Button Click
  const handlePayment = async () => {
    if (!matchDetail || !winningAmount) return;
    try {
      setPaying(true);
      setPaySuccess('');
      setError('');

      // 1. Check if already paid
      const checkResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_LINK}/checkPayment`,
        { teamID, ...matchDetail }
      );

      if (checkResponse.data.status=="already-paid") {
        setError('⚠️ Payment already processed for this team.');
        setPaying(false);
        return;
      }

      // 2. Store Payment Info
      const storeResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_LINK}/storePayment`,
        {
          teamID,
          winningAmount,
          retailerID
        }
      );

      if (storeResponse.status===200) {
        setPaySuccess('✅ Payment processed successfully!');
      } else {
        setError('❌ Failed to process payment. Please try again.');
      }
    } catch (err: any) {
      console.error('Payment Error:', err);
      setError('❌ Error occurred during payment process.');
    } finally {
      setPaying(false);
    }
  };

  // ✅ Loading state
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 p-8">
        <p className="text-red-500 text-xl font-bold text-center">
          ❌ You are not authorized to access this page.
        </p>
      </div> );
  }
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-300 text-xl md:text-2xl font-bold animate-pulse">
            Loading Team Details...
          </p>
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error && !paying) {
    return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <div className="flex items-center justify-center h-full">
          <p className="text-gray-300 text-xl md:text-2xl font-bold text-center">
            {error}
          </p>
        </div>
          <button
            onClick={() => router.push('/winnerscan')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-2 rounded-lg"
          >Scan Again</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center  min-h-screen bg-gray-900 p-6 text-white">
      <h1 className="text-2xl font-bold mb-10  text-center">Payment Gateway</h1>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md space-y-6 text-center ">
        {matchDetail && (
          <>
            {/* Team Names & Logos */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Image
                  src={IPL_TEAMS[matchDetail.team1]?.logo}
                  alt={matchDetail.team1}
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <span className="font-bold text-xl">{IPL_TEAMS[matchDetail.team1]?.short || "Team 1"}</span>
              </div>

              <span className="text-gray-400 font-semibold text-lg">VS</span>

              <div className="flex items-center space-x-2">
                <Image
                  src={IPL_TEAMS[matchDetail.team2]?.logo}
                  alt={matchDetail.team2}
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <span className="font-bold text-xl">{IPL_TEAMS[matchDetail.team2]?.short || "Team 2"}</span>
              </div>
            </div>

            {/* Date & Time */}
            <div className="text-gray-400 font-medium">
              {new Date(matchDetail.matchDate).toLocaleDateString("en-GB", { day: '2-digit', month: 'short' })} | {matchDetail.matchTime}
            </div>

            {/* Rank & Winning */}
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-yellow-400">{rank !== null ? `Rank: ${rank}` : "Calculating Rank..."}</h2>
              {matchDetail.matchCompletion && <h3 className="text-lg font-semibold text-yellow-400">Winning Amount: ₹ {winningAmount}</h3>}
            </div>

            {/* Payment Button */}
            {/* {matchDetail.matchCompletion && !paySuccess && <button
              onClick={handlePayment}
              disabled={paying}
              className={`w-full py-2 px-4 rounded-lg text-white font-bold ${
                paying ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {paying ? 'Processing...' : `Pay ₹${winningAmount}`}
              <h3 className="text-lg font-semibold text-yellow-400">Winning Amount: ₹ {winningAmount}</h3>
            </button>} */}
             {!matchDetail.matchCompletion && <div className="mt-6 px-4 py-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg shadow-md text-center w-full max-w-md">
             <div className="font-semibold">⚠️ Match not yet completed</div>. Please check back later for results.
           </div>
            }

            {/* Phone Number Field */}
            {!phoneSubmitted && !askPanCard && matchDetail.matchCompletion &&(
              <div className="space-y-3 w-full">
                <input type="number" placeholder="Enter Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full p-3 rounded-md bg-gray-700 text-white" />
                <button onClick={handlePhoneSubmit} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg w-full">Submit Phone</button>
              </div>
            )}

            {/* PAN Card Field if Required */}
            {askPanCard && matchDetail.matchCompletion && (
              <div className="space-y-3 w-full">
                <input type="text" placeholder="Enter PAN Card" value={panCard} onChange={(e) => setPanCard(e.target.value)} className="w-full p-3 rounded-md bg-gray-700 text-white" />
                <button onClick={handlePanSubmit} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg w-full">Submit PAN</button>
              </div>
            )}

            {matchDetail.matchCompletion && phoneSubmitted && !paySuccess && <button onClick={handlePayment} disabled={paying} className={`w-full py-2 px-4 rounded-lg ${paying ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}`}>{paying ? 'Processing...' : `Pay ₹${winningAmount}`}</button>}


            {/* Payment status */}
            {paySuccess && (
              <div className="mt-4 flex flex-col items-center">
                <div className="text-green-500 font-semibold mb-4">{paySuccess}</div>
                <button
                  onClick={() => {
                    // Optional: Reset success message or navigate to scanner
                    setPaySuccess(""); // Reset success state if needed
                    setError(""); // Clear any previous errors
                    router.push('/winnerscan') // ✅ Redirect to scanner page (change URL as needed)
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Scan Another Payment
                </button>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-300 text-xl md:text-2xl font-bold text-center">
                    {error}
                  </p>
                </div>
              </div>
            )}

          </>
        )}
      </div>
    </div>
  );
};

export default TeamResultPage;
