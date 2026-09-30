import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getPublicProfile } from "../service/profile.api.js";

export const fetchUserProfile = createAsyncThunk(
  "profile/fetchUserProfile",
  async (userId, { rejectWithValue }) => {
    try {
      return await getPublicProfile(userId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user profile"
      );
    }
  }
);

const initialState = {
  profile: null,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfileError } = profileSlice.actions;
export default profileSlice.reducer;
