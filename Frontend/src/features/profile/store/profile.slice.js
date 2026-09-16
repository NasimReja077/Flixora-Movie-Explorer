import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchUserProfile = createAsyncThunk(
  "profile/fetchUserProfile",
  async (userId, { rejectWithValue }) => {   
     try {     
          const response = await fetch(`/api/users/${userId}`);
          if (!response.ok) {
               throw new Error("Failed to fetch user profile");
          }
          const data = await response.json();
          return data;
     }
     catch (error) {
          return rejectWithValue(error.message);
     }
};

const profileSlice = createSlice({
  name: "profile",
  initialState: {},
  reducers: {},
  extraReducers: (builder) => {}})

  const initialState = {
    profile: null,
    loading: false,
    error: null,
  };

  const profileSlice = createSlice({
    name: "profile",
    initialState,
     reducers: {},
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


export const {  , } = profileSlice.actions;
export default profileSlice.reducer;