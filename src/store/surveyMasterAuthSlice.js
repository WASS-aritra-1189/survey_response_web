import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  surveyMaster: null,
  accessToken: null,
  loading: false,
  error: null,
};

const surveyMasterAuthSlice = createSlice({
  name: 'surveyMasterAuth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    loginSuccess: (state, action) => {
      state.surveyMaster = action.payload.surveyMaster;
      state.accessToken = action.payload.accessToken;
      state.loading = false;
      state.error = null;
      localStorage.setItem('surveyMasterToken', action.payload.accessToken);
      localStorage.setItem('surveyMaster', JSON.stringify(action.payload.surveyMaster));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.surveyMaster = null;
      state.accessToken = null;
      localStorage.removeItem('surveyMasterToken');
      localStorage.removeItem('surveyMaster');
    },
    restoreFromStorage: (state) => {
      const token = localStorage.getItem('surveyMasterToken');
      const master = localStorage.getItem('surveyMaster');
      if (token && master) {
        try {
          state.accessToken = token;
          state.surveyMaster = JSON.parse(master);
        } catch {
          localStorage.removeItem('surveyMasterToken');
          localStorage.removeItem('surveyMaster');
        }
      }
    },
  },
});

export const { setLoading, setError, loginSuccess, loginFailure, logout, restoreFromStorage } = surveyMasterAuthSlice.actions;
export default surveyMasterAuthSlice.reducer;
