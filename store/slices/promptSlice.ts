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

export interface IAIComponent {
  type: string;
  props?: Record<string, any>;
  children?: IAIComponent[] | string;
}

export interface IAiResponse {
  responseType: string;
  text: string;
  component: IAIComponent;
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
  preview?: IAIComponent | null; // optional latest component
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
  preview: IAIComponent | null;
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
  preview: null,
  chat: null,
  message: null,
  redisChat: null,
  history: null,
};

/* ===================== THUNK ===================== */

export const sendPrompt = createAsyncThunk<
  ApiResponse<PromptResponseData>,
  IPromptRequest,
  { rejectValue: string }
>(
  "prompt/sendPrompt",
  async (payload, thunkAPI) => {
    if (!payload.prompt.trim()) {
      return thunkAPI.rejectWithValue("Prompt cannot be empty.");
    }
    try {
      const response = await apiRequest<PromptResponseData>(
        "/api/prompt",
        "POST",
        { prompt: payload.prompt },
        true
      );
      return response;
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
      state.preview = null;
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
        state.preview = null; // remove old preview
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

        // always latest AI component
        state.preview = data.aiResponse?.component ?? null;
      });
  },
});

export const { clearPromptState } = promptSlice.actions;
export default promptSlice.reducer;
