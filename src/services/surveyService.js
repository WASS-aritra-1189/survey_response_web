import axiosInstance from '../config/axiosInstance';

export const surveyService = {
  getMysurveys: async (params = {}) => {
    const response = await axiosInstance.get('/surveys/my-surveys', { params });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch surveys');
    }

    return response.data.data;
  },
};
