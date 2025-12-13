import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import { apiRequest } from "./authSlice";

// -------------------- Types --------------------

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
  type: string;
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

export interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    prompt: IPromptObject;
    aiResponse: IAiResponse;
    chat: IChat;
    message: IMessage;
    redisChat?: IRedisChat;
    history?: IHistory;
  };
}

// -------------------- Slice State --------------------

interface PromptState {
  loading: boolean;
  error: string | null;
  prompt: IPromptObject | null;
  aiResponse: IAiResponse | null;
  chat: IChat | null;
  message: IMessage | null;
  redisChat?: IRedisChat | null;
  history?: IHistory | null;
}

const initialState: PromptState = {
  loading: false,
  error: null,
  prompt: null,
  aiResponse: null,
  chat: null,
  message: null,
  redisChat: null,
  history: null,
};

// -------------------- Thunk --------------------

export const sendPrompt = createAsyncThunk<
  ApiResponse,          // Fulfilled return type
  IPromptRequest,       // Argument type
  { rejectValue: string } // rejectWithValue type
>(
  "prompt/sendPrompt",
  async (payload: IPromptRequest, thunkAPI) => {
    if (!payload.prompt.trim()) {
      return thunkAPI.rejectWithValue("Prompt cannot be empty.");
    }

    try {
      const response = await apiRequest<{ data: ApiResponse }>(
        "/api/prompt",
        "POST",
        { prompt: payload.prompt },
        true
      );

      if (!response || !response.data) {
        return thunkAPI.rejectWithValue("Invalid response from server.");
      }

      return response.data; // ApiResponse return
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to get AI response.";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);


// -------------------- Slice --------------------

const promptSlice = createSlice({
  name: "prompt",
  initialState,
  reducers: {
    clearPromptState: (state) => {
      state.prompt = null;
      state.aiResponse = null;
      state.chat = null;
      state.message = null;
      state.redisChat = null;
      state.history = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendPrompt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendPrompt.rejected, (state, action) => {
        state.loading = false;
        const error = action.payload as string | undefined;
        state.error = error ?? "Unknown error occurred";
        toast.error(state.error);
      })
      .addCase(sendPrompt.fulfilled, (state, action: PayloadAction<ApiResponse>) => {
        state.loading = false;
        const data = action.payload.data;

        state.prompt = data.prompt ?? null;
        state.aiResponse = data.aiResponse ?? null;
        state.chat = data.chat ?? null;
        state.message = data.message ?? null;
        state.redisChat = data.redisChat ?? null;
        state.history = data.history ?? null;
      });
  },
});

export const { clearPromptState } = promptSlice.actions;
export default promptSlice.reducer;
