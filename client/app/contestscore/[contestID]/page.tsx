const MatchNotCompleted = () => {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="p-6 bg-gray-800 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold">⚠ Match is Not Completed Yet</h2>
          <p className="text-gray-400 mt-2">Please try again later.</p>
        </div>
      </div>
    );
  };
  
  export default MatchNotCompleted;
  