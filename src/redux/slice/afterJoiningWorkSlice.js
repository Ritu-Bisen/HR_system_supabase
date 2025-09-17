// indentSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchAfterJoiningData, postAfterJoiningDataApi } from "../api/afterJoiningWorkApi";

export const afterJoiningDataSlice = createAsyncThunk(
  'fetch/joining',
  async () => {
    const joining = await fetchAfterJoiningData();
    return joining;
  }
);

export const afterJoiningDataPost = createAsyncThunk(
  "post/joining",
  async (rowData, { rejectWithValue }) => {
    try {
      const data = await postAfterJoiningDataApi(rowData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to post indent data");
    }
  }
);

const afterJoiningSlice = createSlice({
  name: "afterJoining",
  initialState: {
    afterJoining: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(afterJoiningDataPost.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(afterJoiningDataPost.fulfilled, (state, action) => {
            state.loading = false;
            // action.payload is an array of inserted rows
            state.afterJoining.push(...action.payload);
          })
          .addCase(afterJoiningDataPost.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          })
       .addCase(afterJoiningDataSlice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(afterJoiningDataSlice.fulfilled, (state, action) => {
        state.loading = false;
        state.afterJoining=action.payload;
      })
      .addCase(afterJoiningDataSlice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default afterJoiningSlice.reducer;
