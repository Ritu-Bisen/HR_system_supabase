
import { configureStore } from "@reduxjs/toolkit";

import loginReducer from './slice/loginSlice';
import indentReducer from './slice/indentSlice';
import enquiryReducer from './slice/findEnquirySlice';
import calltrackerReducer from './slice/callTrackerSlice';
import joiningReducer from './slice/joiningSlice';
import afterJoiningReducer from './slice/afterJoiningWorkSlice'

const store = configureStore({
    reducer:{
        login:loginReducer,
        indents:indentReducer,
        enquiry:enquiryReducer,
        callTracker:calltrackerReducer,
        joining:joiningReducer,
        afterjoin:afterJoiningReducer,
    }
})

export default store;