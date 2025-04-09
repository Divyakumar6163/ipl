'use client';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { IPL_TEAMS } from '@/utils/data/shortname';

const questions = [
  {
    question: 'Q1 Who will win the match?',
    options: [
      { name: 'MI', rate: 1.7 },
      { name: 'LSG', rate: 2.2 },
    ],
  },
  {
    question: 'Q2 Who will be the higest run scorer?',
    options: [
      { name: 'Rishab Pant', rate: 5.0 },
      { name: 'Ryan Rickelton', rate: 5.3 },
      { name: 'Rohit Sharma', rate: 4.2 },
      { name: 'Nicholas Pooran', rate: 5.0 },
      { name: 'Aiden Markram', rate: 6.3 },
      { name: 'Hardik Pandya', rate: 6.4 },
    ],
  },
  {
    question: 'Q3 Who will be the highest wicket taker?',
    options: [
      { name: 'Avesh Khan', rate: 4.2 },
      { name: 'Trent Boult', rate: 4.3 },
      { name: 'Shardul Thakur', rate: 3.5 },
      { name: 'Deepak Chahar', rate: 3.9 },
    ],
  },
];
const FluctuatingPointsTable: React.FC = () => {
    const params = useSearchParams();
    const mapping = ['A', 'B', 'C'];
    const amountKeys = ['amtA', 'amtB', 'amtC'];
    const individualAmounts = [
        Number(params.get('amtA')) || 0,
        Number(params.get('amtB')) || 0,
        Number(params.get('amtC')) || 0,
      ];
    const totalAmount = individualAmounts.reduce((sum, amt) => sum + amt, 0);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="w-full max-w-4xl space-y-5">
        {/* Match Header */}
        <div className="bg-gray-800 rounded-lg shadow-lg w-full p-6 space-y-4 text-center">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Image
                src={IPL_TEAMS['Mumbai Indians']?.logo}
                alt="Mumbai Indians"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="font-bold text-xl">{IPL_TEAMS['Mumbai Indians']?.short || 'Team 1'}</span>
            </div>
            <span className="text-gray-400 font-semibold text-lg">VS</span>
            <div className="flex items-center space-x-2">
              <Image
                src={IPL_TEAMS['Lucknow Super Giants']?.logo}
                alt="Lucknow Super Giants"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="font-bold text-xl">{IPL_TEAMS['Lucknow Super Giants']?.short || 'Team 2'}</span>
            </div>
          </div>

          <div className="text-gray-400 font-medium">
            {new Date('2025-03-31T00:00:00.000+00:00').toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
            })}{' '}
            | 7:30pm
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-yellow-400">Amount: ₹{totalAmount}</h2>
          </div>
        </div>

        {/* Points Section */}
        <h2 className="text-2xl font-bold text-center">Your Points</h2>
        {questions.map((q, index) => {
          const paramKey = mapping[index];
          const amtKey = amountKeys[index];
          const value = params.get(paramKey);
          const amount = Number(params.get(amtKey)) || 0;

          if (!value) return null; // Skip if no selection

          const selectedIndex = Number(value) - 1;
          const selected = q.options[selectedIndex];

          if (!selected) return null; // Skip if index is invalid

          const expected = selected.rate * amount;

          return (
            <div key={q.question} className="shadow-lg">
              <h3 className="text-lg font-semibold text-yellow-400 mb-3 px-3">{q.question}</h3>
              <table className="w-full border border-gray-700 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-700 text-white">
                    <th className="p-1 border font-bold text-xl border-gray-700 w-1/3">Option</th>
                    <th className="p-1 border font-bold text-xl border-gray-700 w-1/3">Rate</th>
                    <th className="p-1 border font-bold text-xl border-gray-700 w-1/3">Expected</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-center bg-gray-700">
                    <td className="p-1 border border-gray-600">{selected.name}</td>
                    <td className="p-1 border border-gray-600 text-2xl text-green-400 font-bold">
                      {selected.rate.toFixed(1)}
                    </td>
                    <td className="p-1 border border-gray-600 text-yellow-400 font-bold">
                      ₹{expected.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="text-right text-m font-bold text-green-400 mt-1 px-2">
                Bet Amount: ₹{amount}
              </div>
            </div>
          );
          
        })}
      </div>
    </div>
  );
};

export default FluctuatingPointsTable;
