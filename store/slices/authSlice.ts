import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";

// --- Configuration ---
 export const BASE_API_URL = process.env.NEXT_PUBLIC_PROD_URL || "";


// -------------------- Types --------------------

/** Defines the structure for an authenticated user (Investor). */
export interface IInvestorFields {
  _id: string; // MongoDB ID
  id?: string;
  name: string;
  email: string;
  password?: string; // Optional for security/omission in some payloads
  companyName?: string;
  phone?: string;
  verified?: boolean; // OTP verified flag
  avatar?: {
    url: string; // only URL, no public_id
  };
}

/** Defines the shape of the Auth Redux State. */
interface AuthState {
  authenticator: IInvestorFields | null;
  loading: boolean;
  error: string | null;
  isVerified: boolean;
   fetched:boolean;
}

// -------------------- Initial State --------------------
const initialState: AuthState = {
  authenticator: null,
  loading: false,
  error: null,
  isVerified: false,
fetched:false,
};

// -------------------- Reusable API Helper --------------------

/**
 * Generic fetch wrapper to reduce boilerplate in async thunks.
 * Handles JSON parsing, common headers, and error checking.
 */

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

export const apiRequest = async <T, D = any>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  data?: D,
  includeCredentials: boolean = true
): Promise<ApiResponse<T>> => {
  const url = endpoint.startsWith("/api") ? (BASE_API_URL ? `${BASE_API_URL}${endpoint}` : endpoint) : endpoint;

  // Check if the payload is FormData
  const isFormData = data instanceof FormData;

  const options: RequestInit = {
    method,
    headers: isFormData
      ? {} // browser sets proper multipart/form-data headers automatically
      : { "Content-Type": "application/json" }, // default JSON
    body:
      data && method !== "GET"
        ? isFormData
          ? data
          : JSON.stringify(data)
        : undefined,
    credentials: includeCredentials ? "include" : "same-origin",
  };

  const res = await fetch(url, options);

  let result: any;
  try {
    result = await res.json();
  } catch (err) {
    throw new Error(`Invalid JSON response from ${endpoint}`);
  }

  console.log("result in api", result);

  if (!res.ok) {
    throw new Error(result?.message || `Request to ${endpoint} failed with status ${res.status}`);
  }

  return result as ApiResponse<T>;
};


// -------------------- Async Thunks --------------------

// Define types for thunk arguments and return values for cleaner code
type UserAuthData = Pick<IInvestorFields, "name" | "email" | "password">;
type LoginData = Pick<IInvestorFields, "email" | "password">;
type OtpData = { email: string; otp: string };
type ForgotPasswordData = Pick<IInvestorFields, "email">;
type ResetPasswordData = { token: string; newPassword: string };

// Helper type for thunks that return a simple success message string
type ThunkMessageResult = string;


// --- AUTHENTICATION THUNKS ---
//signup
export const signupUser = createAsyncThunk<IInvestorFields, UserAuthData>(
  "auth/signupUser",
  async (data, { rejectWithValue }) => {
    try {
      const result = await apiRequest<IInvestorFields>("/api/auth/signup", "POST", data, true);
      return result.data; // unwrap the user data
    } catch (error: any) {
      return rejectWithValue(error.message || "Signup failed");
    }
  }
);

//login
export const loginUser = createAsyncThunk<IInvestorFields, LoginData>(
  "auth/loginUser",
  async (data, { rejectWithValue }) => {
    try {
      const result = await apiRequest<IInvestorFields>("/api/auth/login", "POST", data, true);
      return result.data; // unwrap
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

//refresh token
export const refreshToken = createAsyncThunk<IInvestorFields, void>(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const result = await apiRequest<IInvestorFields>("/api/auth/refresh-token", "GET", undefined, true);
      return result.data; // unwrap
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// --- OTP & VERIFICATION THUNKS ---

export const verifyOtp = createAsyncThunk<IInvestorFields, OtpData>(
  "auth/verifyOtp",
  async (data, { rejectWithValue }) => {
    try {
      const result = await apiRequest<IInvestorFields>("/api/auth/verify-otp", "POST", data, true);
      return result.data; // unwrap
    } catch (error: any) {
      return rejectWithValue(error.message || "OTP verification failed");
    }
  }
);

// reset otp
export const resetOtp = createAsyncThunk<
  ThunkMessageResult,       // return type
  ForgotPasswordData,       // payload type
  { rejectValue: string }   // rejectWithValue type
>(
  "auth/resetOtp",
  async (data, { rejectWithValue }) => {
    try {
      const result = await apiRequest<ThunkMessageResult>("/api/auth/reset-otp", "POST", data);
      return result.data; // unwrap
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to reset OTP");
    }
  }
);



// --- PASSWORD MANAGEMENT THUNKS ---

export const forgotPassword = createAsyncThunk<ThunkMessageResult, ForgotPasswordData>(
  "auth/forgotPassword",
  async (data, { rejectWithValue }) => {
    try {
      const result = await apiRequest<ThunkMessageResult>("/api/auth/forgot-password", "POST", data);
      return result.data; // unwrap
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to send forgot password request");
    }
  }
);

export const resetPassword = createAsyncThunk<ThunkMessageResult, ResetPasswordData>(
  "auth/resetPassword",
  async (data, { rejectWithValue }) => {
    try {
      const result = await apiRequest<ThunkMessageResult>("/api/auth/reset-password", "POST", data);
      return result.data; // unwrap
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to reset password");
    }
  }
);



// --- USER PROFILE THUNKS ---

export const getUser = createAsyncThunk<IInvestorFields, void>(
  "auth/getUser",
  async (_, { rejectWithValue }) => {
    try {
      const result = await apiRequest<IInvestorFields>("/api/auth/user", "GET", undefined, true);
      return result.data; // unwrap
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);


export const updateUser = createAsyncThunk<
  IInvestorFields,
  Partial<IInvestorFields>
>(
  "auth/updateUser",
  async (data, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as any);
        }
      });

      const result = await apiRequest<IInvestorFields>(
        "/api/auth/user/update",
        "PUT",
        formData,
        false
      );

      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update user");
    }
  }
);



export const deleteUser = createAsyncThunk<
  ThunkMessageResult,
  void,
  { rejectValue: string }
>(
  "auth/deleteUser",
  async (_, { rejectWithValue }) => {
    try {
      const result = await apiRequest<ThunkMessageResult>(
        "/api/auth/user/delete",
        "DELETE",
        undefined,
        true
      );
      return result.message;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete user");
    }
  }
);


export const logoutUser = createAsyncThunk<
  ThunkMessageResult,
  void,
  { rejectValue: string }
>(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const result = await apiRequest<ThunkMessageResult>(
        "/api/auth/logout",
        "POST",
        undefined,
        true
      );
      return result.message;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to logout user");
    }
  }
);

// -------------------- Slice --------------------

// Helper functions for repeated extraReducer logic
const handlePending = (state: AuthState) => {
  state.loading = true;
  state.error = null;
};

/** Shows a toast - use only for explicit user-initiated actions */
const handleRejected = (state: AuthState, action: any) => {
  state.loading = false;
  state.error = action.payload as string;
  if (state.error) {
    toast.error(state.error);
  }
};

/**
 * Silent rejection - NO toast.
 * Use for background/auto auth checks (getUser, refreshToken)
 * that fire on every page load and should NOT spam the user with errors.
 */
const handleRejectedSilent = (state: AuthState, action: any) => {
  state.loading = false;
  state.error = action.payload as string;
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /** Clears user state and shows success toast. */
    logout: (state) => {
      state.authenticator = null;
      state.isVerified = false;
      state.error = null;
      toast.success("Logged out successfully");
    },
  },
  extraReducers: (builder) => {
    // -------------------- Authentication & Session --------------------

    // User-facing actions -> show toast on failure
    [signupUser, loginUser, updateUser].forEach((thunk) => {
      builder.addCase(thunk.pending, handlePending);
      builder.addCase(thunk.rejected, handleRejected);
    });

    // Background/silent checks -> NO toast on failure (fire on every page load)
    [getUser, refreshToken].forEach((thunk) => {
      builder.addCase(thunk.pending, handlePending);
      builder.addCase(thunk.rejected, handleRejectedSilent);
    });

    builder.addCase(signupUser.fulfilled, (state, action: PayloadAction<IInvestorFields>) => {
      state.loading = false;
      const user = action.payload;
      const id = (user as any)?._id || (user as any)?.id || "";
      state.authenticator = user ? { ...user, _id: id, id: id } : null;
    });

    builder.addCase(loginUser.fulfilled, (state, action: PayloadAction<IInvestorFields>) => {
      state.loading = false;
      const user = action.payload;
      const id = (user as any)?._id || (user as any)?.id || "";
      state.authenticator = user ? { ...user, _id: id, id: id } : null;
      state.isVerified = action.payload.verified || false;
      toast.success("Login successful");
    });

    builder.addCase(refreshToken.fulfilled, (state, action: PayloadAction<IInvestorFields>) => {
      state.loading = false;
      const user = action.payload;
      const id = (user as any)?._id || (user as any)?.id || "";
      state.authenticator = user ? { ...user, _id: id, id: id } : null;
      state.isVerified = action.payload.verified || false;
      // Session refresh is silent
    });
    
    builder.addCase(getUser.fulfilled, (state, action: PayloadAction<IInvestorFields>) => {
      state.loading = false;
      const user = action.payload;
      const id = (user as any)?._id || (user as any)?.id || "";
      state.authenticator = user ? { ...user, _id: id, id: id } : null;
      state.isVerified = action.payload.verified || false;
      state.fetched = true;
    });

    builder.addCase(updateUser.fulfilled, (state, action: PayloadAction<IInvestorFields>) => {
      state.loading = false;
      const user = action.payload;
      const id = (user as any)?._id || (user as any)?.id || "";
      state.authenticator = user ? { ...user, _id: id, id: id } : null;
      toast.success("Profile updated successfully");
    });

    // -------------------- Verification & Password --------------------

    // Pending/Rejected handlers for message-returning thunks
    [verifyOtp, forgotPassword, resetOtp, resetPassword].forEach((thunk) => {
      builder.addCase(thunk.pending, handlePending);
      builder.addCase(thunk.rejected, handleRejected);
    });

    builder.addCase(verifyOtp.fulfilled, (state, action: PayloadAction<IInvestorFields>) => {
      state.loading = false;
      state.authenticator = action.payload;
      state.isVerified = true;
      toast.success("OTP verified successfully");
    });

    builder.addCase(forgotPassword.fulfilled, (state) => {
      state.loading = false;
      toast.success("Password reset link sent to your email");
    });

    builder.addCase(resetOtp.fulfilled, (state, action: PayloadAction<ThunkMessageResult>) => {
      state.loading = false;
      toast.success(action.payload);
    });

    builder.addCase(resetPassword.fulfilled, (state, action: PayloadAction<ThunkMessageResult>) => {
      state.loading = false;
      toast.success(action.payload);
    });

    builder.addCase(logoutUser.fulfilled, (state, action) => {
      state.loading = false;
      state.authenticator = null;
      state.isVerified = false;
      toast.success(action.payload);
    });

    builder.addCase(deleteUser.fulfilled, (state, action) => {
      state.loading = false;
      state.authenticator = null;
      toast.success(action.payload);
    });

    builder.addCase(logoutUser.rejected, handleRejected);
    builder.addCase(deleteUser.rejected, handleRejected);

  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;