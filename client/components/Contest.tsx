'use client';
import { useState, useEffect } from "react";
import { FaSave } from "react-icons/fa";
import Image from "next/image";
import IPL_TEAMS from "@/utils/data/shortname";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { IoWalletOutline } from "react-icons/io5";
import axios from "axios";
import { useRouter } from "next/navigation";

const questionsDefault = [
  { text: "Do you like coding?", yesPoints: 10, noPoints: 5 },
  { text: "Have you used Next.js before?", yesPoints: 15, noPoints: 7 },
  { text: "Do you prefer TypeScript over JavaScript?", yesPoints: 12, noPoints: 10 },
  { text: "Is Tailwind CSS your go-to styling solution?", yesPoints: 8, noPoints: 6 },
  { text: "Would you recommend Next.js to others?", yesPoints: 20, noPoints: 15 },
];

type QuestionnaireProps = {
  setOption: (value: string) => void;
  option: string;
};

const Questionnaire: React.FC<QuestionnaireProps> = ({ setOption, option }) => {
  const selectedMatch = useSelector((state: RootState) => state.matches.selectedMatch);
  const [wallet, setWallet] = useState<number>(0);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router=useRouter();
  const formData = {
    team1: selectedMatch?.team1 || "",
    team2: selectedMatch?.team2 || "",
    matchDate: selectedMatch?.matchDate || "",
    matchTime: selectedMatch?.matchTime || "",}
  const [questions, setQuestions]=useState(questionsDefault);
  const [answers, setAnswers] = useState<{ [key: number]: "yes" | "no" | null }>({
    0: null,
    1: null,
    2: null,
    3: null,
    4: null,
  });
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      router.push("/login"); // Redirect if not logged in
      return;
    }
    if (role !== "admin" && role !== "retailer") {
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
    }
  }, [router]);
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const retailerID = localStorage.getItem("retailerID");
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/getwallet`, { retailerID });
        setWallet(response.data.wallet);
      } catch (error) {
        console.error("Failed to fetch wallet balance:", error);
      }
    };
    fetchWallet();
  }, []);
  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        console.log(formData)
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/getcontest`,formData); // Replace with actual match ID
        console.log(response.data);
        setQuestions(response.data.questions);
        // setMatchData(response.data);
      } catch (error) {
        console.error("Failed to fetch match data:", error);
      }
    };

    fetchMatchData();
  }, []);
  const handleSelect = (index: number, value: "yes" | "no") => {
    const currentValue = answers[index];
    const updatedAnswers = {
      ...answers,
      [index]: currentValue === value ? null : value,
    };

    const selectedCount = Object.values(updatedAnswers).filter((v) => v !== null).length;
    if (selectedCount <= 3) {
      setAnswers(updatedAnswers);
    }
  };

  const selectedCount = Object.values(answers).filter((v) => v !== null).length;
  const isValid = selectedCount === 3;
  const handleSaveContest = async () => {
    try {
        const token = localStorage.getItem("token");
      // ✅ Filter out only selected questions (3 selected ones)
      const selectedQuestions = Object.entries(answers)
        .filter(([_, value]) => value !== null) // Get only selected questions
        .map(([index, value]) => ({
          text: questions[parseInt(index)].text,
          response: value, // Yes or No
          points: value === "yes" ? questions[parseInt(index)].yesPoints : questions[parseInt(index)].noPoints,
        }));
  
      if (selectedQuestions.length !== 3) {
        alert("Please select exactly 3 questions.");
        return;
      }
  
      // ✅ Prepare Payload
      const payload = {
        matchDate: formData.matchDate,
        matchTime: formData.matchTime,
        team1: formData.team1,
        team2: formData.team2,
        selectedQuestions,
      };
  
      // ✅ Send API Request
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_LINK}/savecontest`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          validateStatus: () => true,
          responseType: "blob",
        }
      );
      console.log("Contest saved successfully:", response);
      if (response.status === 403) {
        setIsAuthorized(false);
        return;
      }
      // Step 1: Debug headers
      console.log("Response Headers:", response.headers);
      if(response.status === 200) {
      const fileName = response.headers["content-disposition"];
        const match = fileName.match(/Contest_Invoice_(.*?)\.pdf/);
        const contestId = match ? match[1] : null;
        console.log("✅ Extracted Contest ID:", contestId);
        console.log(contestId);
      if (!contestId) {
        alert("❌ Error: Contest ID missing from response.");
        return;
      }
      
      // ✅ Download PDF
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const downloadUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `Contest_Receipt_${contestId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // ✅ Redirect
      router.push("/");
    }else {
        alert("❌ Failed to save contest.");
      }
    }catch (error) {
      console.error("Failed to save contest:", error);
      alert("Error saving contest. Please try again.");
    }
  };
  
  const handleAction = (type: "team" | "contest") => {
    console.log("handleAction", type);
    setOption(type);
  };
  if (isAuthorized === false) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <h2 className="text-xl font-bold text-center p-6">🚫 You are not authorized to access this page.</h2>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="w-full md:w-1/2">
        {/* Wallet Wrapper */}
        <div className="flex justify-end items-center w-full mb-1">
          <div className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg shadow-lg font-bold flex items-center space-x-2">
            <IoWalletOutline className="text-xl" />
            <span>₹{wallet.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-[#374151] rounded-lg mt-6 mb-4">
          <button
            className={`w-1/2 py-2 text-white rounded-md transition-all duration-300 
                        hover:bg-blue-500 hover:shadow-md 
                        focus:bg-blue-600 focus:shadow-lg 
                        ${option === "team" ? "border-2 border-light-blue-400" : ""}`}
            onClick={() => handleAction("team")}
          >
            Make Team
          </button>
          <button
            className={`w-1/2 py-2 text-white rounded-md transition-all duration-300 
                        hover:bg-green-500 hover:shadow-md 
                        focus:bg-green-600 focus:shadow-lg 
                        ${option === "contest" ? "border-2 border-light-blue-400" : ""}`}
            onClick={() => handleAction("contest")}
          >
            Contest
          </button>
        </div>

        {/* Match Details */}
        <div className="flex flex-col items-center bg-gray-800 p-4 rounded-md shadow-md mb-5">
          <div className="flex items-center justify-center space-x-6">
            {/* Team 1 */}
            <div className="flex items-center space-x-2">
              {IPL_TEAMS[formData.team1]?.logo && (
                <Image src={IPL_TEAMS[formData.team1].logo} alt={formData.team1} width={45} height={45} />
              )}
              <span className="text-xl font-bold">{IPL_TEAMS[formData.team1]?.short}</span>
            </div>
            <span className="text-lg font-semibold text-gray-400">VS</span>
            {/* Team 2 */}
            <div className="flex items-center space-x-2">
              {IPL_TEAMS[formData.team2]?.logo && (
                <Image src={IPL_TEAMS[formData.team2].logo} alt={formData.team2} width={45} height={45} />
              )}
              <span className="text-xl font-bold">{IPL_TEAMS[formData.team2]?.short}</span>
            </div>
          </div>

          {/* Match Date & Time */}
          <div className="mt-2 text-sm font-small text-gray-300">
            {formData.matchDate
              ? (() => {
                  const [day, month, year] = formData.matchDate.split("-").map(Number);
                  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  });
                })()
              : "Not Selected"}
            {" "} | {formData.matchTime || "Time Not Available"}
          </div>
        </div>

        {/* Questions Section */}
        {/* <h2 className="text-lg font-semibold mt-6 mb-4 text-center">Make Your Contest</h2> */}
        <div className="space-y-4">
          {questions?.map((question, index) => (
            <div key={index} className="flex flex-col items-center">
              <p className="mb-2 font-medium">{question.text}</p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleSelect(index, "yes")}
                  className={`px-4 py-2 rounded-md w-24 text-center transition-all duration-300 
                            ${answers[index] === "yes" ? "bg-blue-500 text-white" : "bg-[#374151] hover:bg-blue-400"}`}
                >
                  Yes <br /><span className="text-sm text-gray-300">{question.yesPoints} pts</span>
                </button>
                <button
                  onClick={() => handleSelect(index, "no")}
                  className={`px-4 py-2 rounded-md w-24 text-center transition-all duration-300 
                            ${answers[index] === "no" ? "bg-red-500 text-white" : "bg-[#374151] hover:bg-red-400"}`}
                >
                  No <br /><span className="text-sm text-gray-300">{question.noPoints} pts</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <button
          className={`mt-6 w-full py-2 rounded-md flex items-center justify-center text-white text-lg gap-2 transition-all duration-300 
                    ${isValid ? "bg-yellow-500 hover:bg-yellow-600 shadow-md" : "bg-gray-400 cursor-not-allowed"}`}
          disabled={!isValid}
          onClick={handleSaveContest}
        >
          <FaSave /> Save Contest
        </button>
      </div>
    </div>
  );
};

export default Questionnaire;
