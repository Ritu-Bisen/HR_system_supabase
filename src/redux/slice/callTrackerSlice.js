// indentSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchEnquiryDataApi, fetchFollowUpHistoryApi, postFollowUpDataApi } from "../api/callTrackerApi";

export const enquiryDataForProcessing = createAsyncThunk(
  'fetch/enquiryforCallTracker',
  async () => {
    const enquiry = await fetchEnquiryDataApi();
    return enquiry;
  }
);

export const followUpForHistory = createAsyncThunk(
  'fetch/follow-up',
  async () => {
    const followUp = await fetchFollowUpHistoryApi();
    return followUp;
  }
);

export const followUpDataSlice = createAsyncThunk(
  "post/follow_up",
  async (rowData, { rejectWithValue }) => {
    try {
      const data = await postFollowUpDataApi(rowData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to post follow-up data");
    }
  }
);

const calltrackerSlice = createSlice({
  name: "calltracker",
  initialState: {
    calltracker: [],
    enquiryForCall: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Follow-up data
      .addCase(followUpDataSlice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(followUpDataSlice.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && Array.isArray(action.payload)) {
          // Use push to append new follow-ups
          state.calltracker.push(...action.payload);
        }
      })
      .addCase(followUpDataSlice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Enquiry data
      .addCase(enquiryDataForProcessing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(enquiryDataForProcessing.fulfilled, (state, action) => {
        state.loading = false;
        state.enquiryForCall = action.payload;
      })
      .addCase(enquiryDataForProcessing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch follow-up history
      .addCase(followUpForHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(followUpForHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.calltracker = action.payload;
      })
      .addCase(followUpForHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default calltrackerSlice.reducer;
