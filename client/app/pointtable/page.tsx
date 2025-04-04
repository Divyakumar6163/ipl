'use client';
import { useEffect, useState } from 'react';

interface Option {
  name: string;
  minRate: number;
  maxRate: number;
}

interface Question {
  question: string;
  options: Option[];
}

const questions: Question[] = [
  {
    question: 'Q1 Who will win the match?',
    options: [
      { name: 'MI', minRate: 1.5, maxRate: 1.9 },
      { name: 'LSG', minRate: 1.9, maxRate: 2.5 },
    ],
  },
  {
    question: 'Q2 Who will be the higest run scorer?',
    options: [
      { name: 'Rishab Pant', minRate: 4.8, maxRate: 5.2 },
      { name: 'Ryan Rickelton', minRate: 5.0, maxRate: 5.5 },
      { name: 'Rohit Sharma', minRate: 3.9, maxRate: 4.8 },
      { name: 'Nicholas Pooran', minRate: 4.6, maxRate: 5.3 },
      { name: 'Aiden Markram', minRate: 6.1, maxRate: 6.5 },
      { name: 'Hardik Pandya', minRate: 6.2, maxRate: 6.5 },
    ],
  },
  {
    question: 'Q3 Who will be the highest wicket taker?',
    options: [
      { name: 'Avesh Khan', minRate: 3.9, maxRate: 4.5 },
      { name: 'Trent Boult', minRate: 4.1, maxRate: 4.4 },
      { name: 'Shardul Thakur', minRate: 3.2, maxRate: 3.7 },
      { name: 'Deepak Chahar', minRate: 3.5, maxRate: 4.2 },
    ],
  },
];

const getRandomPoint = (min: number, max: number): number => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1));
};

const FluctuatingPointsTable: React.FC = () => {
  const [points, setPoints] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const updatePoints = () => {
      const newPoints: { [key: string]: number } = {};
      questions.forEach((q) => {
        q.options.forEach((option) => {
          newPoints[option.name] = getRandomPoint(option.minRate, option.maxRate);
        });
      });
      setPoints(newPoints);
    };

    updatePoints();
    const interval = setInterval(updatePoints, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 w-full bg-gray-900 text-white shadow-lg">
      <h2 className="text-4xl font-bold text-center mb-4">Rate Table</h2>
      {questions.map((q) => (
        <div key={q.question} className="mb-4">
          <h3 className="text-lg font-semibold text-yellow-400 mb-2 px-3">{q.question}</h3>
          <table className="w-full border border-gray-700 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-800 text-white">
                <th className="p-2 border font-bold text-xl border-gray-700 w-1/2">Option</th>
                {/* <th className="p-2 border border-gray-700 w-1/3">Rate Range</th> */}
                <th className="p-2 border font-bold text-xl border-gray-700 w-1/2">Rate</th>
            </tr>
            </thead>
            <tbody>
            {q.options.map((option) => (
                <tr key={option.name} className="text-center bg-gray-700">
                <td className="p-2 border border-gray-600 w-1/2 ">{option.name}</td>
                {/* <td className="p-2 border border-gray-600 w-1/3">
                    {option.minRate} - {option.maxRate}
                </td> */}
                <td className="p-2 border border-gray-600 font-bold text-4xl text-green-400 w-1/2">
                    {points[option.name]?.toFixed(1) || option.minRate.toFixed(1)}
                </td>
                </tr>
            ))}
            </tbody>

          </table>
        </div>
      ))}
    </div>
  );
};

export default FluctuatingPointsTable;
