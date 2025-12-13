import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import { apiRequest } from "./authSlice";
import { RootState } from "../store";

// -------------------- Types --------------------

export interface IHistory {
  _id: string;
  chats: string[];
}

interface HistoryState {
  history: IHistory | null;
  loading: boolean;
  error: string | null;
  fetched: boolean;
}

// -------------------- Initial State --------------------

const initialState: HistoryState = {
  history: null,
  loading: false,
  error: null,
  fetched: false,
};

// -------------------- Async Thunk --------------------

export const fetchHistory = createAsyncThunk<
  IHistory,
  void,
  { state: RootState; rejectValue: string }
>(
  "history/fetchHistory",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { history } = getState();

      // 🔥 GUARD → already fetched
      if (history.fetched && history.history) {
        return history.history;
      }

      const result = await apiRequest<IHistory>("/api/history", "GET");
      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch history");
    }
  }
);

// -------------------- Slice --------------------

const handlePending = (state: HistoryState) => {
  state.loading = true;
  state.error = null;
};

const handleRejected = (state: HistoryState, action: PayloadAction<any>) => {
  state.loading = false;
  state.error = action.payload;
  if (state.error) toast.error(state.error);
};

export const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    clearHistory: (state) => {
      state.history = null;
      state.fetched = false; // 🔥 allow refetch
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistory.pending, handlePending)
      .addCase(fetchHistory.rejected, handleRejected)
      .addCase(
        fetchHistory.fulfilled,
        (state, action: PayloadAction<IHistory>) => {
          state.loading = false;
          state.history = action.payload;
          state.fetched = true;
        }
      );
  },
});

export const { clearHistory } = historySlice.actions;
export default historySlice.reducer;
