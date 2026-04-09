import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../config/axiosInstance';
import '../styles/SurveyForm.css';

function AudioRecorder({ questionId, onAudioReady }) {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        onAudioReady(questionId, blob);
        streamRef.current?.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setRecording(true);
    } catch {
      alert('Microphone access denied.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const clearRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    onAudioReady(questionId, null);
  };

  return (
    <div className="sf-audio">
      {!audioBlob ? (
        <button
          type="button"
          className={`sf-audio-btn ${recording ? 'sf-audio-stop' : 'sf-audio-start'}`}
          onClick={recording ? stopRecording : startRecording}
        >
          {recording ? '⏹ Stop Recording' : '🎙 Record Audio'}
        </button>
      ) : (
        <div className="sf-audio-preview">
          <audio controls src={audioUrl} className="sf-audio-player" />
          <button type="button" className="sf-audio-clear" onClick={clearRecording}>
            ✕ Remove
          </button>
        </div>
      )}
      {recording && <span className="sf-audio-indicator">● Recording...</span>}
    </div>
  );
}

export default function SurveyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken, surveyMaster } = useSelector((state) => state.surveyMasterAuth);

  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [answers, setAnswers] = useState({});
  const [audioBlobs, setAudioBlobs] = useState({});
  const [location, setLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken) { navigate('/login', { replace: true }); return; }
    axiosInstance
      .get(`/surveys/public/${id}`)
      .then((res) => { setSurvey(res.data.data); setLoading(false); })
      .catch(() => { setError('Failed to load survey.'); setLoading(false); });
  }, [id, accessToken, navigate]);

  const handleAudioReady = (questionId, blob) => {
    setAudioBlobs((prev) => ({ ...prev, [questionId]: blob }));
  };

  const getLocation = () => {
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }); setGettingLocation(false); },
      () => { setError('Failed to get location.'); setGettingLocation(false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const handleAnswer = (questionId, value) => {
    setSuccessMsg('');
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleCheckbox = (questionId, optionText, checked) => {
    setSuccessMsg('');
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      return { ...prev, [questionId]: checked ? [...current, optionText] : current.filter((v) => v !== optionText) };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (survey.requiresLocationValidation && !location) {
      setError('Please capture your location before submitting.'); return;
    }
    for (const q of survey.questions) {
      if (q.isRequired && !answers[q.id]) {
        setError(`Please answer: ${q.questionText}`); return;
      }
    }

    const responses = survey.questions.map((q) => ({
      questionId: q.id,
      answer: Array.isArray(answers[q.id]) ? answers[q.id].join(', ') : answers[q.id] || '',
    }));

    setSubmitting(true);
    try {
      // Step 1: submit the response
      const res = await axiosInstance.post('/survey-responses/private', {
        surveyId: id,
        accessToken: survey.accessToken,
        responses,
        ...(location ?? {}),
      });

      const responseId = res.data?.data?.id ?? res.data?.id;

      // Step 2: upload audio per question if any
      if (responseId) {
        const audioEntries = Object.entries(audioBlobs).filter(([, blob]) => blob);
        for (const [questionId, blob] of audioEntries) {
          try {
            const formData = new FormData();
            formData.append('audio', blob, `${questionId}.webm`);
            formData.append('surveyId', id);
            formData.append('responseId', responseId);
            formData.append('questionId', questionId);
            formData.append('accessToken', survey.accessToken);
            await axiosInstance.post('/survey-responses/audio', formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
          } catch {
            // audio upload failure is non-fatal
          }
        }
      }

      setSuccessMsg('Response submitted successfully! You can submit another response below.');
      setAnswers({});
      setAudioBlobs({});
      setLocation(null);
      // scroll to top of form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Failed to submit survey.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="sf-center"><div className="sf-spinner" /><p>Loading survey...</p></div>;

  if (!survey) return (
    <div className="sf-center">
      <p className="sf-error-text">{error || 'Survey not found.'}</p>
      <button className="sf-btn-secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
    </div>
  );

  return (
    <div className="sf-container">
      <div className="sf-header">
        <button className="sf-btn-back" onClick={() => navigate('/dashboard')}>← Back</button>
        <div className="sf-header-info">
          <span className="sf-badge-private">🔒 Private Survey</span>
          <span className="sf-master-id">Collecting as: {surveyMaster?.loginId}</span>
        </div>
      </div>

      <div className="sf-card">
        <div className="sf-card-header">
          <h1 className="sf-title">{survey.title}</h1>
          {survey.description && <p className="sf-description">{survey.description}</p>}
        </div>

        <div className="sf-card-body">
          {survey.requiresLocationValidation && (
            <div className="sf-location-box">
              <p className="sf-location-label">📍 Location Required *</p>
              {location ? (
                <div className="sf-location-info">
                  <span>Lat: {location.latitude.toFixed(6)}</span>
                  <span>Lng: {location.longitude.toFixed(6)}</span>
                </div>
              ) : <p className="sf-location-hint">Capture your location to proceed.</p>}
              <button
                type="button"
                className={`sf-btn-location ${location ? 'sf-btn-secondary' : 'sf-btn-primary'}`}
                onClick={getLocation}
                disabled={gettingLocation}
              >
                {gettingLocation ? 'Getting location...' : location ? 'Update Location' : 'Capture Location'}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="sf-form">
            {survey.questions?.map((q, i) => (
              <div key={q.id} className="sf-question">
                <label className="sf-question-label">
                  {i + 1}. {q.questionText}
                  {q.isRequired && <span className="sf-required"> *</span>}
                </label>

                {q.type === 'text' && (
                  <input className="sf-input" type="text" placeholder="Your answer"
                    value={answers[q.id] || ''} onChange={(e) => handleAnswer(q.id, e.target.value)} required={q.isRequired} />
                )}
                {q.type === 'textarea' && (
                  <textarea className="sf-textarea" rows={4} placeholder="Your answer"
                    value={answers[q.id] || ''} onChange={(e) => handleAnswer(q.id, e.target.value)} required={q.isRequired} />
                )}
                {q.type === 'rating' && (
                  <div className="sf-rating">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button"
                        className={`sf-rating-btn ${answers[q.id] === n ? 'sf-rating-active' : ''}`}
                        onClick={() => handleAnswer(q.id, n)}>{n}</button>
                    ))}
                  </div>
                )}
                {q.type === 'single_choice' && (
                  <div className="sf-options">
                    {q.options?.map((opt) => (
                      <label key={opt.id} className="sf-option">
                        <input type="radio" name={q.id} value={opt.optionText}
                          checked={answers[q.id] === opt.optionText} onChange={() => handleAnswer(q.id, opt.optionText)} />
                        <span>{opt.optionText}</span>
                      </label>
                    ))}
                  </div>
                )}
                {q.type === 'multiple_choice' && (
                  <div className="sf-options">
                    {q.options?.map((opt) => (
                      <label key={opt.id} className="sf-option">
                        <input type="checkbox" checked={(answers[q.id] || []).includes(opt.optionText)}
                          onChange={(e) => handleCheckbox(q.id, opt.optionText, e.target.checked)} />
                        <span>{opt.optionText}</span>
                      </label>
                    ))}
                  </div>
                )}
                {q.type === 'date' && (
                  <input className="sf-input" type="date" value={answers[q.id] || ''}
                    onChange={(e) => handleAnswer(q.id, e.target.value)} required={q.isRequired} />
                )}

                {/* Per-question audio recorder */}
                <AudioRecorder questionId={q.id} onAudioReady={handleAudioReady} />
              </div>
            ))}

            {successMsg && (
              <div className="sf-success-banner">
                <span className="sf-success-icon-sm">✓</span>
                <span>{successMsg}</span>
              </div>
            )}

            {error && <p className="sf-error-text">{error}</p>}

            <button type="submit" className="sf-btn-submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Response'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
