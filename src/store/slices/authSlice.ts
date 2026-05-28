import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  username: string;
  avatarUrl: string;
  role: "admin" | "user";
  status: "active" | "suspended" | "blocked";
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = { user: null, loading: false, error: null };

export const fetchCurrentUser = createAsyncThunk("auth/fetchCurrentUser", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles").select("*").eq("id", user.id).single();
  if (!profile) return null;
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    username: profile.username,
    avatarUrl: profile.avatar_url,
    role: profile.role || "user",
    status: profile.status || "active",
  } as AuthUser;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchCurrentUser.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; })
      .addCase(fetchCurrentUser.rejected, (s, a) => { s.loading = false; s.error = a.error.message || "Failed"; });
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
