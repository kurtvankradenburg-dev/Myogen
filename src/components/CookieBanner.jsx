import { useState, useEffect } from 'react';

const CONSENT_KEY = 'myogen_cookie_consent';

export function hasConsent() {
  return sessionStorage.getItem(CONSENT_KEY) === 'true';
}

export default function CookieBanner({ onAccept, onPrivacyClick }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasConsent()) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function handleAccept() {
    sessionStorage.setItem(CONSENT_KEY, 'true');
    setVisible(false);
    onAccept?.();
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      backgroundColor: '#111111',
      borderTop: '1px solid rgba(255,255,255,0.12)',
      padding: '14px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
    }}>
      <p style={{ color: '#A1A1AA', fontSize: '13px', flex: 1, minWidth: '220px', lineHeight: 1.5 }}>
        This app uses cookies and Google Analytics (via Firebase) to understand usage and improve the experience.
      </p>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexShrink: 0 }}>
        <button
          onClick={onPrivacyClick}
          style={{
            background: 'none',
            border: 'none',
            color: '#00F0FF',
            fontSize: '13px',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Privacy Policy
        </button>
        <button
          onClick={handleAccept}
          style={{
            backgroundColor: '#00F0FF',
            color: '#050505',
            fontWeight: '600',
            fontSize: '13px',
            border: 'none',
            borderRadius: '999px',
            padding: '8px 20px',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
