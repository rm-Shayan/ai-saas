import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import { apiRequest } from "./authSlice";

/* ===================== TYPES ===================== */

export interface IPromptRequest {
  prompt: string;
}

export interface IPromptObject {
  investorId: string;
  text: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IAiComponent {
  name: string;
  props: any;
}

export interface IAiResponse {
  responseType: string;
  text: string;
  component: IAiComponent;
  chartValues?: { labels: string[]; data: number[] };
  additionalInfo?: string;
  investorID?: string;
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IChat {
  _id: string;
  investorId?: string;
  title: string;
  messages: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface IMessage {
  _id: string;
  investorId?: string;
  chatId: string;
  prompt: string;
  aiResponse: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface IRedisChat {
  chatId: string;
  investorId: string;
  title: string;
  messages: string[];
  createdAt: string;
}

export interface IHistory {
  _id: string;
  investorId: string;
  chats: string[];
}

/* ---------- INNER DATA TYPE ---------- */
export interface PromptResponseData {
  prompt: IPromptObject;
  aiResponse: IAiResponse;
  chat: IChat;
  message: IMessage;
  redisChat?: IRedisChat;
  history?: IHistory;
}

/* ---------- GENERIC API RESPONSE ---------- */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/* ===================== SLICE STATE ===================== */

interface PromptState {
  loading: boolean;
  error: string | null;
  prompt: IPromptObject | null;
  aiResponse: IAiResponse | null;
  preview: IAiComponent | null;
  chat: IChat | null;
  message: IMessage | null;
  redisChat: IRedisChat | null;
  history: IHistory | null;
}

const initialState: PromptState = {
  loading: false,
  error: null,
  prompt: null,
  aiResponse: null,

  preview: null, // 👈 NEW

  chat: null,
  message: null,
  redisChat: null,
  history: null,
};


/* ===================== THUNK ===================== */

export const sendPrompt = createAsyncThunk<
  ApiResponse<PromptResponseData>, // ✅ fulfilled type
  IPromptRequest,
  { rejectValue: string }
>(
  "prompt/sendPrompt",
  async (payload, thunkAPI) => {
    if (!payload.prompt.trim()) {
      return thunkAPI.rejectWithValue("Prompt cannot be empty.");
    }

    try {
      // ❗ sirf INNER data type pass hota hai
      const response = await apiRequest<PromptResponseData>(
        "/api/prompt",
        "POST",
        { prompt: payload.prompt },
        true
      );

      return response; // ✅ ApiResponse<PromptResponseData>
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.message || "Failed to get AI response."
      );
    }
  }
);

/* ===================== SLICE ===================== */

const promptSlice = createSlice({
  name: "prompt",
  initialState,
  reducers: {
    clearPromptState: (state) => {
      state.loading = false;
      state.error = null;
      state.prompt = null;
      state.aiResponse = null;
      state.chat = null;
      state.message = null;
      state.redisChat = null;
      state.history = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendPrompt.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.preview = null; // 🧹 OLD component removed
      })
      .addCase(sendPrompt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unknown error occurred";
        toast.error(state.error);
      })
      .addCase(sendPrompt.fulfilled, (state, action) => {
        state.loading = false;

        const data = action.payload.data;

        state.prompt = data.prompt;
        state.aiResponse = data.aiResponse;
        state.chat = data.chat;
        state.message = data.message;
        state.redisChat = data.redisChat ?? null;
        state.history = data.history ?? null;
         state.preview = data?.aiResponse?.component?? null;

      });
  },
});

export const { clearPromptState } = promptSlice.actions;
export default promptSlice.reducer;
