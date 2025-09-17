// indentSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchIndentData, postIndentDataApi } from "../api/indentApi";

// Pass tasksData from component
export const indentDataSlice = createAsyncThunk(
  "post/indent",
  async (rowData, { rejectWithValue }) => {
    try {
      const data = await postIndentDataApi(rowData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to post indent data");
    }
  }
);

export const indentDetails = createAsyncThunk(
  'fetch/indent',
  async () => {
    const indent = await fetchIndentData();
    return indent;
  }
);

const indentSlice = createSlice({
  name: "indent",
  initialState: {
    indent: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(indentDataSlice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(indentDataSlice.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload is an array of inserted rows
       if (action.payload) {
    // If it's an array
    if (Array.isArray(action.payload)) {
      state.indent.push(...action.payload);
    } else {
      // If it's a single object
      state.indent.push(action.payload);
    }
  }
      })
      .addCase(indentDataSlice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
       .addCase(indentDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(indentDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.indent=action.payload;
      })
      .addCase(indentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default indentSlice.reducer;
