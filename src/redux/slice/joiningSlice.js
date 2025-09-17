


// indentSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchJoiningDataApi, postJoiningDataApi } from "../api/joiningApi";

export const joiningDataSlice = createAsyncThunk(
  "post/joining",
  async (rowData, { rejectWithValue }) => {
    try {
      const data = await postJoiningDataApi(rowData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to post indent data");
    }
  }
);


export const enquiryDataForJoining = createAsyncThunk(
  'fetch/joining',
  async () => {
    const joining = await fetchJoiningDataApi();
    return joining;
  }
);

const joiningSlice = createSlice({
  name: "joiningData",
  initialState: {
    joiningData: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(joiningDataSlice.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(joiningDataSlice.fulfilled, (state, action) => {
  state.loading = false;
  state.joiningData.push(action.payload); // ✅ single object
})

          .addCase(joiningDataSlice.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          })
       .addCase(enquiryDataForJoining.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(enquiryDataForJoining.fulfilled, (state, action) => {
        state.loading = false;
        state.joiningData=action.payload;
      })
      .addCase(enquiryDataForJoining.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default joiningSlice.reducer;
