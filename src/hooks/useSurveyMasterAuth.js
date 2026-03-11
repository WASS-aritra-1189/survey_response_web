import { useState } from 'react';
import { surveyMasterService } from '../services/surveyMasterService';

export const useSurveyMasterAuth = () => {
  const [surveyMaster, setSurveyMaster] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (loginId, password) => {
    setLoading(true);
    setError(null);

    try {
      const data = await surveyMasterService.login(loginId, password);
      setSurveyMaster(data.surveyMaster);
      setAccessToken(data.accessToken);
      localStorage.setItem('surveyMasterToken', data.accessToken);
      localStorage.setItem('surveyMaster', JSON.stringify(data.surveyMaster));
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setSurveyMaster(null);
    setAccessToken(null);
    localStorage.removeItem('surveyMasterToken');
    localStorage.removeItem('surveyMaster');
  };

  const restoreFromStorage = () => {
    const token = localStorage.getItem('surveyMasterToken');
    const master = localStorage.getItem('surveyMaster');
    if (token && master) {
      setAccessToken(token);
      setSurveyMaster(JSON.parse(master));
    }
  };

  return {
    surveyMaster,
    accessToken,
    loading,
    error,
    login,
    logout,
    restoreFromStorage,
  };
};
