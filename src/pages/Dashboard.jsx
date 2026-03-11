import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setSurveys, fetchSurveysFailure, clearError } from '../store/surveySlice';
import { logout } from '../store/surveyMasterAuthSlice';
import { surveyService } from '../services/surveyService';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { surveys, total, loading, error } = useSelector((state) => state.surveys);
  const { surveyMaster } = useSelector((state) => state.surveyMasterAuth);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    dispatch(setLoading(true));
    try {
      const data = await surveyService.getMysurveys();
      dispatch(setSurveys(data));
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch surveys';
      dispatch(fetchSurveysFailure(errorMessage));
    }
  };

  const handleRetry = () => {
    dispatch(clearError());
    fetchSurveys();
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleViewSurvey = (publicUrl) => {
    window.open(publicUrl, '_blank');
  };

  const handleCollectResponses = (publicUrl) => {
    window.open(publicUrl, '_blank');
  };

  const getStatusBadgeClass = (status) => {
    return status === 'ACTIVE' ? 'badge-active' : 'badge-inactive';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard</h1>
          <p className="welcome-text">Welcome, {surveyMaster?.loginId}</p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Logout
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <div className="error-content">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
            </svg>
            <span>{error}</span>
          </div>
          <button onClick={handleRetry} className="btn-retry">
            Retry
          </button>
        </div>
      )}

      <div className="surveys-section">
        <div className="section-header">
          <h2>My Surveys</h2>
          <span className="survey-count">{total} surveys</span>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading surveys...</p>
          </div>
        ) : surveys.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11H7v6h2v-6zm4-7H11v13h2V4zm4 3h-2v10h2V7z" />
            </svg>
            <h3>No surveys yet</h3>
            <p>Create your first survey to get started</p>
            <button className="btn-create-survey-empty">+ Create Survey</button>
          </div>
        ) : (
          <div className="surveys-grid">
            {surveys.map((survey) => (
              <div key={survey.id} className="survey-card">
                <div className="card-header">
                  <h3 className="survey-title">{survey.title}</h3>
                  <span className={`status-badge ${getStatusBadgeClass(survey.status)}`}>
                    {survey.status}
                  </span>
                </div>

                <p className="survey-description">
                  {survey.description || 'No description provided'}
                </p>

                <div className="survey-meta">
                  <div className="meta-item">
                    <span className="meta-label">Responses</span>
                    <span className="meta-value">{survey.totalResponses}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Target</span>
                    <span className="meta-value">{survey.target}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Progress</span>
                    <span className="meta-value">
                      {Math.round((survey.totalResponses / survey.target) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min((survey.totalResponses / survey.target) * 100, 100)}%`,
                    }}
                  ></div>
                </div>

                <div className="survey-devices">
                  {survey.deviceType.map((device) => (
                    <span key={device} className="device-tag">
                      {device}
                    </span>
                  ))}
                </div>

                <div className="survey-dates">
                  <small>Created: {formatDate(survey.createdAt)}</small>
                  <small>Updated: {formatDate(survey.updatedAt)}</small>
                </div>

                <div className="card-actions">
                  <button 
                    onClick={() => handleViewSurvey(survey.publicUrl)}
                    className="btn-action btn-view"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => handleCollectResponses(survey.publicUrl)}
                    className="btn-action btn-collect"
                  >
                    Collect Responses
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
