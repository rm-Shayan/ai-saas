import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import { apiRequest } from "./authSlice"; // reuse your apiRequest
import { BASE_API_URL } from "./authSlice";

// -------------------- Types --------------------

export interface IChat {
  _id: string;
  chatId: string;      // added to normalize
  title: string;
  messages: any[];
  createdAt: string;
  updatedAt: string;
}

interface ChatState {
  chats: IChat[];
  loading: boolean;
  error: string | null;
}

// -------------------- Initial State --------------------

const initialState: ChatState = {
  chats: [],
  loading: false,
  error: null,
};

// -------------------- Async Thunks --------------------

// Fetch chat(s)
export const fetchChat = createAsyncThunk<IChat[], { chatId?: string } | void>(
  "chat/fetchChat",
  async (payload, { rejectWithValue }) => {
    try {
      const url = payload?.chatId
        ? `/api/chat?chatId=${payload.chatId}`
        : `/api/chat`;
      const result = await apiRequest<IChat[] | IChat>(url, "GET");

      // Normalize chatId for each chat
      const normalized: IChat[] = Array.isArray(result.data)
        ? result.data.map((c) => ({
            ...c,
            chatId: c.chatId || c._id,
          }))
        : [
            {
              ...result.data,
              chatId: result.data.chatId || result.data._id,
            },
          ];

      return normalized;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch chats");
    }
  }
);


// Delete chat
export const deleteChat = createAsyncThunk<IChat, { chatId?: string; deleteAll?: boolean|string }>(
  "chat/deleteChat",
  async ({ chatId, deleteAll }, { rejectWithValue }) => {
    try {
      const result = await apiRequest<IChat>("/api/chat/delete", "DELETE", { chatId, deleteAll });
      toast.success("Chat deleted successfully");
      return { ...result.data, chatId: result.data.chatId || result.data._id };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete chat");
    }
  }
);

// Update chat title
export const updateChatTitle = createAsyncThunk<IChat, { chatId?: string; title: string }>(
  "chat/updateChatTitle",
  async ({ chatId, title }, { rejectWithValue }) => {
    try {
      const result = await apiRequest<IChat>("/api/chat/update", "PATCH", { chatId, title });
      toast.success("Chat title updated");
      return { ...result.data, chatId: result.data.chatId || result.data._id };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update chat title");
    }
  }
);

// Create new chat
export const createChat = createAsyncThunk<
  { chat: IChat; history: any },
  void
>(
  "chat/createChat",
  async (_, { rejectWithValue }) => {
    try {
      const result = await apiRequest<{
        chat: IChat;
        history: any;
      }>(`${BASE_API_URL}/chat/create`, "POST");

      toast.success("Chat created successfully");
      return { 
        chat: { ...result.data.chat, chatId: result.data.chat.chatId || result.data.chat._id },
        history: result.data.history 
      };
    } catch (error: any) {
      toast.error(error.message || "Failed to create chat");
      return rejectWithValue(error.message || "Failed to create chat");
    }
  }
);

// -------------------- Slice --------------------

const handlePending = (state: ChatState) => {
  state.loading = true;
  state.error = null;
};

const handleRejected = (state: ChatState, action: any) => {
  state.loading = false;
  state.error = action.payload as string;
  if (state.error) toast.error(state.error);
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    clearChats: (state) => {
      state.chats = [];
      toast.success("Chats cleared");
    },
  },
  extraReducers: (builder) => {
    // Common pending/rejected handlers
    [fetchChat, deleteChat, updateChatTitle, createChat].forEach((thunk) => {
      builder.addCase(thunk.pending, handlePending);
      builder.addCase(thunk.rejected, handleRejected);
    });

    // Fulfilled handlers
    builder.addCase(fetchChat.fulfilled, (state, action: PayloadAction<IChat[]>) => {
      state.loading = false;
      state.chats = action.payload;
    });

    builder.addCase(deleteChat.fulfilled, (state, action: PayloadAction<IChat>) => {
      state.loading = false;
      state.chats = state.chats.filter((chat) => chat.chatId !== action.payload.chatId);
    });

    builder.addCase(updateChatTitle.fulfilled, (state, action: PayloadAction<IChat>) => {
      state.loading = false;
      state.chats = state.chats.map((chat) =>
        chat.chatId === action.payload.chatId ? action.payload : chat
      );
    });

    builder.addCase(createChat.fulfilled, (state, action: PayloadAction<{ chat: IChat; history: any }>) => {
      state.loading = false;
      state.chats.push(action.payload.chat);
    });
  },
});

export const { clearChats } = chatSlice.actions;
export default chatSlice.reducer;
