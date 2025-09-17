// indentSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchEnquiryData, fetchIndentDataforEnquiry, postFindEnquiryApi } from "../api/findEnquiryApi";

// Pass tasksData from component
export const enquiryDataSlice = createAsyncThunk(
  "post/enquiry",
  async (rowData, { rejectWithValue }) => {
    try {
      const data = await postFindEnquiryApi(rowData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to post indent data");
    }
  }
);

export const indentForEnquiry = createAsyncThunk(
  "fetch/indentenquiry",

  async () => {
    const indent = await fetchIndentDataforEnquiry();
    console.log(indent);
    
    return indent;
  }
);

export const enquiryDetails = createAsyncThunk(
  "fetch/enquiry",

  async () => {
    const enquiry = await fetchEnquiryData();
   
    
    return enquiry;
  }
);


const enquirySlice = createSlice({
  name: "enquiry",
  initialState: {
    enquiry: [],
    indentEnquiry: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(enquiryDataSlice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(enquiryDataSlice.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload is an array of inserted rows
        state.enquiry.push(...action.payload);
      })
      .addCase(enquiryDataSlice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
       .addCase(indentForEnquiry.pending, (state) => {
              state.loading = true;
              state.error = null;
            })
            .addCase(indentForEnquiry.fulfilled, (state, action) => {
              state.loading = false;
              state.indentEnquiry=action.payload;
            })
            .addCase(indentForEnquiry.rejected, (state, action) => {
              state.loading = false;
              state.error = action.payload;
            })
             .addCase(enquiryDetails.pending, (state) => {
              state.loading = true;
              state.error = null;
            })
            .addCase(enquiryDetails.fulfilled, (state, action) => {
              state.loading = false;
              state.enquiry=action.payload;
            })
            .addCase(enquiryDetails.rejected, (state, action) => {
              state.loading = false;
              state.error = action.payload;
            });
      
  },
});

export default enquirySlice.reducer;
