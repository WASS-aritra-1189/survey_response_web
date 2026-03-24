import axios from 'axios';
import { API_BASE_URL } from './api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('surveyMasterToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. Please try again.'));
    }

    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    const { status, data } = error.response;

    if (status === 401) {
      localStorage.removeItem('surveyMasterToken');
      localStorage.removeItem('surveyMaster');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(new Error('Session expired. Please log in again.'));
    }

    if (status === 403) {
      return Promise.reject(new Error('You do not have permission to perform this action.'));
    }

    if (status === 404) {
      return Promise.reject(new Error('The requested resource was not found.'));
    }

    if (status >= 500) {
      return Promise.reject(new Error('Server error. Please try again later.'));
    }

    const message =
      data?.message ||
      data?.error ||
      data?.errors?.[0]?.message ||
      data?.errors?.[0] ||
      (status === 400 ? 'Invalid request. Please check your inputs and try again.' : `Request failed with status ${status}`);
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;
