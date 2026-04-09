import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setSurveys, fetchSurveysFailure, clearError } from '../store/surveySlice';
import { logout } from '../store/surveyMasterAuthSlice';
import { surveyService } from '../services/surveyService';

/* ── responsive hook ─────────────────────────────────────────────────────── */
function useWindowWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return w;
}

/* ── constants ───────────────────────────────────────────────────────────── */
const C = {
  blue:    '#1e40af',
  blue2:   '#0369a1',
  green:   '#48bb78',
  red:     '#e53e3e',
  grad:    'linear-gradient(135deg,#1e40af 0%,#0369a1 100%)',
  bgGrad:  'linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#1e40af 100%)',
};

/* ── helpers ─────────────────────────────────────────────────────────────── */
const pct      = (r, t) => (t > 0 ? Math.min(Math.round((r / t) * 100), 100) : 0);
const fmtDate  = (d)    => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

/* ── component ───────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const w        = useWindowWidth();

  const { surveys, total, loading, error } = useSelector((s) => s.surveys);
  const { surveyMaster }                   = useSelector((s) => s.surveyMasterAuth);

  const [copiedId,    setCopiedId]    = useState(null);
  const [hovCard,     setHovCard]     = useState(null);
  const [hovBtn,      setHovBtn]      = useState(null);

  const isPhone  = w <= 576;
  const isTablet = w > 576 && w <= 1024;

  /* fetch */
  useEffect(() => { load(); }, []);

  const load = async () => {
    dispatch(setLoading(true));
    try {
      const data = await surveyService.getMysurveys();
      dispatch(setSurveys(data));
    } catch (err) {
      dispatch(fetchSurveysFailure(err.message || 'Failed to fetch surveys'));
    }
  };

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };
  const handleCopy   = (id, url) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  /* ── styles ────────────────────────────────────────────────────────────── */
  const pad = isPhone ? '12px' : '20px';

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
      `}</style>

      {/* Page */}
      <div style={{
        width: '100%', minHeight: '100vh',
        background: C.bgGrad,
        padding: isPhone ? '12px 12px 48px' : '20px 20px 60px',
        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          flexDirection: isPhone ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isPhone ? 'stretch' : 'center',
          gap: '12px',
          background: '#fff',
          borderRadius: '12px',
          padding: isPhone ? '14px' : '18px 24px',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,.1)',
        }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{
              margin: 0,
              fontSize: isPhone ? '1.3rem' : '1.75rem',
              background: C.grad,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Dashboard
            </h1>
            <p style={{ margin: '4px 0 0', color: '#718096', fontSize: '0.875rem' }}>
              Welcome, <strong>{surveyMaster?.loginId}</strong>
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              background: `linear-gradient(135deg,#f56565 0%,${C.red} 100%)`,
              color: '#fff', border: 'none', borderRadius: '8px',
              padding: '10px 18px', fontWeight: 700, fontSize: '0.9rem',
              cursor: 'pointer', width: isPhone ? '100%' : 'auto', whiteSpace: 'nowrap',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>

        {/* ── Error banner ────────────────────────────────────────────────── */}
        {error && (
          <div style={{
            display: 'flex',
            flexDirection: isPhone ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isPhone ? 'flex-start' : 'center',
            gap: '10px',
            background: '#fff5f5', borderLeft: '4px solid #fc8181',
            borderRadius: '8px', padding: '12px 16px', marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c53030', fontSize: '0.9rem' }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
              </svg>
              <span>{error}</span>
            </div>
            <button
              onClick={() => { dispatch(clearError()); load(); }}
              style={{
                background: '#fc8181', color: '#fff', border: 'none',
                borderRadius: '6px', padding: '6px 14px', fontWeight: 700,
                cursor: 'pointer', alignSelf: isPhone ? 'flex-end' : 'auto',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Surveys section ─────────────────────────────────────────────── */}
        <div style={{
          background: '#fff', borderRadius: '12px',
          padding: isPhone ? '14px' : '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,.1)',
        }}>
          {/* section header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '8px',
            marginBottom: '20px', paddingBottom: '14px', borderBottom: '2px solid #e2e8f0',
          }}>
            <h2 style={{
              margin: 0, fontSize: isPhone ? '1.1rem' : '1.4rem',
              background: C.grad, WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              My Surveys
            </h2>
            <span style={{
              background: C.grad, color: '#fff', borderRadius: '20px',
              padding: '4px 14px', fontSize: '0.85rem', fontWeight: 700,
            }}>
              {total} survey{total !== 1 ? 's' : ''}
            </span>
          </div>

          {/* loading */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 16px', color: '#718096' }}>
              <div style={{
                width: '40px', height: '40px',
                border: '4px solid #e2e8f0', borderTopColor: C.blue,
                borderRadius: '50%', marginBottom: '12px',
                animation: 'spin 0.8s linear infinite',
              }} />
              <p style={{ margin: 0 }}>Loading surveys…</p>
            </div>
          )}

          {/* empty */}
          {!loading && surveys.length === 0 && !error && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 16px', color: '#718096', textAlign: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e0" strokeWidth="2" style={{ marginBottom: '12px' }}>
                <path d="M9 11H7v6h2v-6zm4-7H11v13h2V4zm4 3h-2v10h2V7z"/>
              </svg>
              <h3 style={{ margin: '0 0 6px', color: '#2d3748', fontSize: '1.1rem' }}>No surveys assigned</h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>You have no surveys assigned yet. Contact your administrator.</p>
            </div>
          )}

          {/* grid */}
          {!loading && surveys.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isPhone ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)',
              gap: isPhone ? '12px' : '16px',
            }}>
              {surveys.map((survey) => {
                const progress = pct(survey.totalResponses, survey.target);
                const isHov    = hovCard === survey.id;

                return (
                  <div
                    key={survey.id}
                    onMouseEnter={() => setHovCard(survey.id)}
                    onMouseLeave={() => setHovCard(null)}
                    style={{
                      background: isHov ? '#f0f4ff' : '#f8f9fa',
                      border: `1px solid ${isHov ? C.blue : '#e2e8f0'}`,
                      borderRadius: '10px',
                      padding: isPhone ? '14px' : '18px',
                      display: 'flex', flexDirection: 'column',
                      transition: 'all .25s ease',
                      transform: isHov ? 'translateY(-3px)' : 'none',
                      boxShadow: isHov ? '0 8px 24px rgba(30,64,175,.15)' : 'none',
                      minWidth: 0,
                      animation: 'fadeUp .4s ease-out',
                    }}
                  >
                    {/* title + badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: isPhone ? '0.95rem' : '1rem', fontWeight: 700, color: '#1a202c', flex: 1, lineHeight: 1.4, wordBreak: 'break-word', minWidth: 0 }}>
                        {survey.title}
                      </h3>
                      <span style={{
                        padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700,
                        whiteSpace: 'nowrap', flexShrink: 0,
                        background: survey.status === 'ACTIVE' ? '#c6f6d5' : '#fed7d7',
                        color:      survey.status === 'ACTIVE' ? '#22543d' : '#742a2a',
                      }}>
                        {survey.status}
                      </span>
                    </div>

                    {/* description */}
                    <p style={{
                      margin: '0 0 10px', color: '#718096', fontSize: '0.85rem', lineHeight: 1.5,
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                      {survey.description || 'No description provided'}
                    </p>

                    {/* meta stats */}
                    <div style={{
                      display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px',
                      marginBottom: '10px', padding: '10px',
                      background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0',
                    }}>
                      {[
                        { label: 'Responses', value: survey.totalResponses ?? 0 },
                        { label: 'Target',    value: survey.target ?? 0 },
                        { label: 'Progress',  value: `${progress}%` },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.62rem', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>
                            {label}
                          </span>
                          <span style={{
                            fontSize: isPhone ? '0.95rem' : '1.1rem', fontWeight: 700,
                            background: C.grad, WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                          }}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* progress bar */}
                    <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
                      <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg,${C.blue} 0%,${C.blue2} 100%)`, transition: 'width .3s ease' }} />
                    </div>

                    {/* device tags */}
                    {survey.deviceType?.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        {survey.deviceType.map((d) => (
                          <span key={d} style={{ background: C.grad, color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                            {d}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* dates */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
                      <small style={{ color: '#a0aec0', fontSize: '0.72rem' }}>Created: {fmtDate(survey.createdAt)}</small>
                      <small style={{ color: '#a0aec0', fontSize: '0.72rem' }}>Updated: {fmtDate(survey.updatedAt)}</small>
                    </div>

                    {/* private URL */}
                    {survey.privateUrl && (
                      <div style={{ marginBottom: '10px', padding: '8px 10px', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '8px' }}>
                        <small style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#3730a3', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px' }}>
                          🔒 Private URL
                        </small>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                          <span style={{ flex: 1, fontSize: '0.72rem', color: '#4338ca', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
                            {survey.privateUrl}
                          </span>
                          <button
                            onClick={() => handleCopy(survey.id, survey.privateUrl)}
                            style={{
                              background: copiedId === survey.id ? C.green : '#4338ca',
                              color: '#fff', border: 'none', borderRadius: '5px',
                              padding: '3px 8px', fontSize: '0.7rem', fontWeight: 700,
                              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                              transition: 'background .2s',
                            }}
                          >
                            {copiedId === survey.id ? '✓ Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* action buttons */}
                    <div style={{
                      display: 'flex',
                      flexDirection: isPhone ? 'column' : 'row',
                      gap: '8px', marginTop: 'auto', paddingTop: '8px',
                    }}>
                      {/* View */}
                      <button
                        disabled={!survey.publicUrl}
                        onClick={() => survey.publicUrl && window.open(survey.publicUrl, '_blank')}
                        onMouseEnter={() => setHovBtn(`v-${survey.id}`)}
                        onMouseLeave={() => setHovBtn(null)}
                        style={{
                          flex: 1, padding: '9px 8px', borderRadius: '6px',
                          fontSize: '0.85rem', fontWeight: 700, cursor: survey.publicUrl ? 'pointer' : 'not-allowed',
                          border: `2px solid ${C.blue}`,
                          background: hovBtn === `v-${survey.id}` ? C.blue : '#fff',
                          color:      hovBtn === `v-${survey.id}` ? '#fff' : C.blue,
                          transition: 'all .2s', opacity: survey.publicUrl ? 1 : 0.45,
                        }}
                      >
                        View
                      </button>

                      {/* Collect */}
                      <button
                        onClick={() => navigate(`/survey/private/${survey.id}`)}
                        onMouseEnter={() => setHovBtn(`c-${survey.id}`)}
                        onMouseLeave={() => setHovBtn(null)}
                        style={{
                          flex: 1, padding: '9px 8px', borderRadius: '6px',
                          fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                          border: `2px solid ${C.green}`,
                          background: hovBtn === `c-${survey.id}` ? C.green : '#fff',
                          color:      hovBtn === `c-${survey.id}` ? '#fff' : C.green,
                          transition: 'all .2s',
                        }}
                      >
                        Collect Responses
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
