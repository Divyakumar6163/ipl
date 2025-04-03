"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import IPL_TEAMS from "@/utils/data/shortname";

interface Question {
  text: string;
  response: string;
  option: string;
  points: number;
  _id: string;
}

interface ContestData {
  contest_id: string;
  matchDate: string;
  matchTime: string;
  selectedQuestions: Question[];
  team1: string;
  team2: string;
  matchCompletion?: boolean;
  _id: string;
}

interface BackendQuestion {
  text: string;
  yesOption: string;
  noOption: string;
  yesPoints: number;
  noPoints: number;
  answer: string;
  _id: string;
}

const ContestDetails: React.FC = () => {
  const params = useParams();
  const contestID = params.contestID as string;
  const [contestData, setContestData] = useState<ContestData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalScore, setTotalScore] = useState<number | null>(null);

  useEffect(() => {
    if (!contestID) return;

    const fetchContestData = async () => {
      try {
        console.log("Fetching Contest:", contestID);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_LINK}/contest/${contestID}`
        );

        setContestData(response.data.contest);

        if (response.data.contest.matchCompletion === true) {
          console.log("Match Completed. Fetching correct answers...");

          const formData = {
            team1: response.data.contest?.team1 || "",
            team2: response.data.contest?.team2 || "",
            matchDate: response.data.contest?.matchDate || "",
            matchTime: response.data.contest?.matchTime || "",
          };

          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_LINK}/getcontest`,
            formData
          );

          console.log("Fetched correct answers:", res.data);

          const Questions: BackendQuestion[] = res.data.questions;

          let score = 0;

          response.data.contest.selectedQuestions.forEach((userQuestion:Question) => {
            const correctQuestion = Questions.find(
              (q) => q.text === userQuestion.text
            );

            if (correctQuestion && correctQuestion.answer === userQuestion.option) {
              score += userQuestion.points;
            }
          });

          setTotalScore(score);
        }
      } catch (err) {
        setError("Failed to fetch contest data");
      } finally {
        setLoading(false);
      }
    };

    fetchContestData();
  }, [contestID]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      {contestData ? (
        <>
          {/* Match Card */}
          <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 space-y-4 text-center">
            {/* Team Names & Logos */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Image
                  src={IPL_TEAMS[contestData.team1]?.logo}
                  alt={contestData.team1}
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <span className="font-bold text-xl">
                  {IPL_TEAMS[contestData.team1]?.short || "Team 1"}
                </span>
              </div>

              <span className="text-gray-400 font-semibold text-lg">VS</span>

              <div className="flex items-center space-x-2">
                <Image
                  src={IPL_TEAMS[contestData.team2]?.logo}
                  alt={contestData.team2}
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <span className="font-bold text-xl">
                  {IPL_TEAMS[contestData.team2]?.short || "Team 2"}
                </span>
              </div>
            </div>

            {/* Date & Time */}
            <div className="text-gray-400 font-medium">
              {new Date(contestData.matchDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
              })}{" "}
              | {contestData.matchTime || "Time Not Available"}
            </div>

            {/* Total Score */}
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-yellow-400">
                Total Score: {totalScore !== null ? totalScore : "Calculating..."}
              </h3>
            </div>
          </div>

          {/* Questions List */}
          <div className="shadow-lg w-full max-w-md mt-6">
            <h2 className="text-xl font-bold text-center text-white mb-4">
              Your Contest
            </h2>
            <div className="space-y-4">
              {contestData.selectedQuestions.map((question, index) => (
                <div
                  key={question._id}
                  className="bg-gray-700 p-4 rounded-lg shadow-md"
                >
                  <p className="text-lg font-semibold text-gray-100">
                    {index + 1}. {question.text}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-300">
                      Selected:{" "}
                      <span className="font-bold text-blue-400">
                        {question.option}
                      </span>
                    </span>
                    <span className="text-gray-300">
                      Points:{" "}
                      <span className="font-bold text-green-400">
                        {question.points}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
};

export default ContestDetails;
