import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setError, loginSuccess, loginFailure } from '../store/surveyMasterAuthSlice';
import { surveyMasterService } from '../services/surveyMasterService';
import '../styles/Login.css';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error: storeError } = useSelector((state) => state.surveyMasterAuth);
  
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaNum1, setCaptchaNum1] = useState(Math.ceil(Math.random() * 10));
  const [captchaNum2, setCaptchaNum2] = useState(Math.ceil(Math.random() * 10));
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const generateNewCaptcha = () => {
    const num1 = Math.ceil(Math.random() * 10);
    const num2 = Math.ceil(Math.random() * 10);
    setCaptchaNum1(num1);
    setCaptchaNum2(num2);
    setCaptchaAnswer('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!loginId.trim()) {
      newErrors.loginId = 'Login ID is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!captchaAnswer) {
      newErrors.captcha = 'Please solve the captcha';
    } else if (parseInt(captchaAnswer) !== captchaNum1 + captchaNum2) {
      newErrors.captcha = 'Incorrect captcha answer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    dispatch(setLoading(true));
    setSuccessMessage('');

    try {
      const data = await surveyMasterService.login(loginId, password);
      dispatch(loginSuccess({
        surveyMaster: data.surveyMaster,
        accessToken: data.accessToken,
      }));
      setSuccessMessage('Login successful! Redirecting...');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      dispatch(loginFailure(errorMessage));
      setErrors({ submit: errorMessage });
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="login-container">
      <div className="background-decoration decoration-1"></div>
      <div className="background-decoration decoration-2"></div>
      <div className="background-decoration decoration-3"></div>

      <div className="login-card">
        <div className="login-header">
          <div className="logo-circle">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M8 12h24v16H8z" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M12 12v-2h16v2" stroke="currentColor" strokeWidth="2" />
              <circle cx="20" cy="20" r="3" fill="currentColor" />
            </svg>
          </div>
          <h1 className="login-title">Survey Portal</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="loginId" className="form-label">
              Login ID
            </label>
            <div className="input-wrapper">
              <input
                id="loginId"
                type="text"
                placeholder="Enter your login ID"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className={`form-input ${errors.loginId ? 'input-error' : ''}`}
              />
              <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 10a3 3 0 100-6 3 3 0 000 6z" fill="currentColor" />
                <path d="M3.172 5.172a4 4 0 015.656 0M16.828 5.172a4 4 0 01-5.656 0M3 17a6 6 0 0112 0" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            </div>
            {errors.loginId && <span className="error-message">{errors.loginId}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`form-input ${errors.password ? 'input-error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" />
                    <path d="M15.171 13.576l1.472 1.473a1 1 0 001.414-1.414l-14-14a1 1 0 00-1.414 1.414l1.473 1.473A10.014 10.014 0 00.458 10C1.732 14.057 5.522 17 10 17a9.958 9.958 0 004.512-1.074l1.78 1.781a1 1 0 001.414-1.414l-2.007-2.007zM10 15a5 5 0 100-10 5 5 0 000 10z" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Security Check</label>
            <div className="captcha-container">
              <div className="captcha-question">
                <span className="captcha-text">
                  {captchaNum1} + {captchaNum2} = ?
                </span>
                <button
                  type="button"
                  onClick={generateNewCaptcha}
                  className="captcha-refresh"
                  title="Generate new captcha"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36"></path>
                  </svg>
                </button>
              </div>
              <input
                type="number"
                placeholder="Answer"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                className={`captcha-input ${errors.captcha ? 'input-error' : ''}`}
              />
            </div>
            {errors.captcha && <span className="error-message">{errors.captcha}</span>}
          </div>

          {(errors.submit || storeError) && (
            <div className="error-alert">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
              </svg>
              {errors.submit || storeError}
            </div>
          )}

          {successMessage && (
            <div className="success-alert">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`submit-button ${loading ? 'loading' : ''}`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
