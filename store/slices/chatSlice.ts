import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import { apiRequest } from "./authSlice"; // reuse your apiRequest
import { BASE_API_URL } from "./authSlice";
import { sendPrompt } from "./promptSlice";

// -------------------- Types --------------------

// ---------------- PROMPT ----------------
export interface IPrompt {
  _id: string;
  investorId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------- CHART ----------------
export interface IChartValues {
  labels: string[];
  data: number[];
}

// ---------------- AI COMPONENT SCHEMA ----------------
export interface IAIComponent {
  type: string;
  props?: Record<string, any>;
  children?: IAIComponent[] | string;
}

// ---------------- AI RESPONSE ----------------
export interface IAIResponse {
  _id: string;
  responseType: string;
  text: string;
  component: IAIComponent | null | "";
  chartValues: IChartValues;
  additionalInfo: string;
  investorID: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------- MESSAGE ----------------
export interface IMessage {
  _id: string;
  investorId: string;
  chatId: string;
  prompt: IPrompt;
  aiResponse: IAIResponse;
  createdAt: string;
  updatedAt: string;
}

// ---------------- CHAT ----------------
export interface IChat {
  _id: string;
  chatId: string;
  title: string;
  messages: IMessage[];
  createdAt: string;
  updatedAt: string;
}


// -----------initial State ----------------
interface ChatState {
  chats: IChat[];
  preview: IAIComponent | null; // 🔥 latest component
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  preview: null,
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
      const result = await apiRequest<IChat[] | IChat>(url, "GET", undefined, true);

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
export const deleteChat = createAsyncThunk<{ chatId?: string; deleteAll?: boolean }, { chatId?: string; deleteAll?: boolean|string }>(
  "chat/deleteChat",
  async ({ chatId, deleteAll }, { rejectWithValue }) => {
    try {
      await apiRequest<any>("/api/chat/delete", "DELETE", { chatId, deleteAll }, true);
      toast.success("Chat deleted successfully");
      // API may return data: null — rely on the request args, not the payload
      return { chatId, deleteAll: deleteAll === true || deleteAll === "true" };
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
      const result = await apiRequest<IChat>("/api/chat/update", "PATCH", { chatId, title }, true);
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
      // createChat
      const result = await apiRequest<{
        chat: IChat;
        history: any;
      }>("/api/chat/create", "POST", undefined, true);

      toast.success("Chat created successfully");
      return { 
        chat: { ...result.data.chat, chatId: result.data.chat.chatId || result.data.chat._id },
        history: result.data.history 
      };
    } catch (error: any) {
      if (!/401|access token missing|unauthorized/i.test(error?.message || "")) toast.error(error.message || "Failed to create chat");
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
  if (state.error && !/access token missing|401|unauthorized/i.test(state.error)) toast.error(state.error);
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,

  reducers: {
  clearChats: (state) => {
    state.chats = [];
    state.preview = null;
  },
  clearPreview: (state) => {
    state.preview = null;
  }
},
  extraReducers: (builder) => {
    // Common pending/rejected handlers
    [fetchChat, deleteChat, updateChatTitle, createChat].forEach((thunk) => {
      builder.addCase(thunk.pending, handlePending);
      builder.addCase(thunk.rejected, handleRejected);
    });

    // Fulfilled handlers
  builder.addCase(fetchChat.fulfilled, (state, action) => {
  state.loading = false;
  state.chats = action.payload;

  // 🔥 find latest ai component
  const lastChat = action.payload.at(-1);
  const lastMessage = lastChat?.messages?.at(-1);
  state.preview = lastMessage?.aiResponse?.component || null;
});

    builder.addCase(deleteChat.fulfilled, (state, action: PayloadAction<{ chatId?: string; deleteAll?: boolean }>) => {
      state.loading = false;
      if (action.payload.deleteAll) {
        state.chats = [];
        state.preview = null;
        return;
      }
      state.chats = state.chats.filter(
        (chat) => chat.chatId !== action.payload.chatId && chat._id !== action.payload.chatId
      );
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

    builder.addCase(sendPrompt.fulfilled, (state, action) => {
      const data = action.payload.data;
      if (!data) return;
      const targetChatId = data.chat?._id || (data.chat as any)?.chatId;
      if (!targetChatId) return;

      const formattedMessage: IMessage = {
        _id: data.message?._id || `msg_${Date.now()}`,
        investorId: data.message?.investorId || "",
        chatId: targetChatId,
        prompt: {
          _id: (data.prompt as any)?._id || `p_${Date.now()}`,
          investorId: data.prompt?.investorId || "",
          text: (action.meta.arg as any).prompt,
          createdAt: data.prompt?.createdAt || new Date().toISOString(),
          updatedAt: data.prompt?.updatedAt || new Date().toISOString(),
        },
        aiResponse: {
          _id: data.aiResponse?._id || `ai_${Date.now()}`,
          responseType: data.aiResponse?.responseType || "text",
          text: data.aiResponse?.text || "",
          component: (data.aiResponse?.component as any) || null,
          chartValues: data.aiResponse?.chartValues || { labels: [], data: [] },
          additionalInfo: data.aiResponse?.additionalInfo || "",
          investorID: data.aiResponse?.investorID || "",
          createdAt: data.aiResponse?.createdAt || new Date().toISOString(),
          updatedAt: data.aiResponse?.updatedAt || new Date().toISOString(),
        },
        createdAt: data.message?.createdAt || new Date().toISOString(),
        updatedAt: data.message?.updatedAt || new Date().toISOString(),
      };

      const existingChat = state.chats.find(
        (c) => c._id === targetChatId || c.chatId === targetChatId
      );

      if (existingChat) {
        if (!existingChat.messages) existingChat.messages = [];
        if (!existingChat.messages.some((m) => m._id === formattedMessage._id)) {
          existingChat.messages.push(formattedMessage);
        }
      } else if (data.chat) {
        state.chats.push({
          _id: targetChatId,
          chatId: targetChatId,
          title: data.chat.title || "New Chat",
          messages: [formattedMessage],
          createdAt: data.chat.createdAt || new Date().toISOString(),
          updatedAt: data.chat.updatedAt || new Date().toISOString(),
        });
      }

      if (data.aiResponse?.component) {
        state.preview = (data.aiResponse.component as any) || null;
      }
    });
  },
});

export const { clearChats,clearPreview } = chatSlice.actions;
export default chatSlice.reducer;
