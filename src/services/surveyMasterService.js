import axiosInstance from '../config/axiosInstance';

export const surveyMasterService = {
  login: async (loginId, password) => {
    const response = await axiosInstance.post('/survey-masters/login', {
      loginId,
      password,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Login failed');
    }

    return response.data.data;
  },
};
