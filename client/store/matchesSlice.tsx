import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Match {
  team1: string;
  team2: string;
  matchDate: string;
}

interface MatchesState {
  upcoming: Match[];
  selectedMatch: Match | null; // New state for storing clicked match
}

const initialState: MatchesState = {
  upcoming: [],
  selectedMatch: null,
};

const matchesSlice = createSlice({
  name: "matches",
  initialState,
  reducers: {
    setUpcomingMatches: (state, action: PayloadAction<Match[]>) => {
      state.upcoming = action.payload;
    },
    selectMatch: (state, action: PayloadAction<Match>) => {
      state.selectedMatch = action.payload; // Store selected match
    },
  },
});

export const { setUpcomingMatches, selectMatch } = matchesSlice.actions;
export default matchesSlice.reducer;
