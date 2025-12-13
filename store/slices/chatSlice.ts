import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import { apiRequest } from "./authSlice"; // reuse your apiRequest
import { BASE_API_URL } from "./authSlice";

// -------------------- Types --------------------

export interface IChat {
  _id: string;
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
      const result = await apiRequest<IChat[]>(url, "GET");
      return result.data;
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
      return result.data;
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
      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update chat title");
    }
  }
);


// -------------------- Create new chat --------------------
export const createChat = createAsyncThunk<
  { chat: IChat; history: any }, // returned data type
  void
>(
  "chat/createChat",
  async (_, { rejectWithValue }) => {
    try {
      const result = await apiRequest<{
        chat: IChat;
        history: any;
      }>(`${BASE_API_URL}/chat/create`, "POST"); // adjust URL if needed

      toast.success("Chat created successfully");
      return result.data;
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
    [fetchChat, deleteChat, updateChatTitle].forEach((thunk) => {
      builder.addCase(thunk.pending, handlePending);
      builder.addCase(thunk.rejected, handleRejected);
    });

    // Fulfilled handlers
    builder.addCase(fetchChat.fulfilled, (state, action: PayloadAction<IChat[]>) => {
      state.loading = false;
    
       if (!Array.isArray(action.payload)) {
    state.chats = [action.payload];
  } 
  // If list of chats fetched
  else {
    state.chats = action.payload;
  }

    });

    builder.addCase(deleteChat.fulfilled, (state, action: PayloadAction<IChat>) => {
      state.loading = false;
      state.chats = state.chats.filter((chat) => chat._id !== action.payload._id);
    });

    builder.addCase(updateChatTitle.fulfilled, (state, action: PayloadAction<IChat>) => {
      state.loading = false;
      state.chats = state.chats.map((chat) =>
        chat._id === action.payload._id ? action.payload : chat
      )
      builder.addCase(createChat.pending, handlePending);
builder.addCase(createChat.rejected, handleRejected);
builder.addCase(createChat.fulfilled, (state, action: PayloadAction<{ chat: IChat; history: any }>) => {
  state.loading = false;
  // add the new chat to the list
  state.chats = [...state.chats, action.payload.chat];
});
    });
  },
});

export const { clearChats } = chatSlice.actions;
export default chatSlice.reducer;
