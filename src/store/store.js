import { configureStore } from '@reduxjs/toolkit';
import surveyMasterAuthReducer from './surveyMasterAuthSlice';
import surveyReducer from './surveySlice';

export const store = configureStore({
  reducer: {
    surveyMasterAuth: surveyMasterAuthReducer,
    surveys: surveyReducer,
  },
});

export default store;
