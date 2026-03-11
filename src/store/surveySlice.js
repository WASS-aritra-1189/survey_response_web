import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  surveys: [],
  total: 0,
  loading: false,
  error: null,
};

const surveySlice = createSlice({
  name: 'surveys',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSurveys: (state, action) => {
      state.surveys = action.payload.data;
      state.total = action.payload.total;
      state.loading = false;
      state.error = null;
    },
    fetchSurveysFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setLoading, setError, setSurveys, fetchSurveysFailure, clearError } = surveySlice.actions;
export default surveySlice.reducer;
