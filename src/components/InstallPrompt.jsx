import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

// Use sessionStorage — shows each browser session, not permanently dismissed
const DISMISSED_KEY = 'myogen_install_dismissed_session';

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase()) && !window.MSStream;
}

function isInStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [iosMode, setIosMode] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) return;
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    if (isIOS()) {
      setIosMode(true);
      const t = setTimeout(() => setVisible(true), 4000);
      return () => clearTimeout(t);
    }

    const onPrompt = (e) => {
      e.preventDefault();
      window.__myogenInstallPrompt = e;
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  function dismiss() {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  }

  async function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    window.__myogenInstallPrompt = null;
    setDeferredPrompt(null);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Install Myogen app"
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: 420,
        zIndex: 9997,
        backgroundColor: '#0F0F0F',
        border: '1px solid rgba(0,240,255,0.18)',
        borderRadius: 20,
        padding: '20px 20px 18px',
        boxShadow: '0 0 60px rgba(0,240,255,0.07), 0 20px 60px rgba(0,0,0,0.7)',
      }}
    >
      {/* Dismiss */}
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          position: 'absolute', top: 12, right: 12,
          background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer',
          color: '#71717A', display: 'flex', padding: 6, borderRadius: 8,
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
      >
        <X size={14} />
      </button>

      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        {/* App icon */}
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          background: 'rgba(0,240,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(0,240,255,0.2)',
        }}>
          {iosMode
            ? <Share size={22} style={{ color: '#00F0FF' }} />
            : <Download size={22} style={{ color: '#00F0FF' }} />}
        </div>

        {/* Text */}
        <div style={{ flex: 1, paddingRight: 24 }}>
          <p style={{
            fontFamily: 'Manrope, sans-serif', fontWeight: 700,
            fontSize: 15, marginBottom: 3, color: '#FAFAFA',
          }}>
            Install Myogen
          </p>
          <p style={{ color: '#A1A1AA', fontSize: 12, lineHeight: 1.6, margin: 0 }}>
            {iosMode
              ? <>Tap <strong style={{ color: '#FAFAFA' }}>Share</strong> then <strong style={{ color: '#FAFAFA' }}>Add to Home Screen</strong></>
              : 'Fast, always one tap away from your home screen.'}
          </p>
        </div>
      </div>

      {/* Install button — non-iOS only */}
      {!iosMode && (
        <button
          onClick={install}
          style={{
            marginTop: 16,
            width: '100%',
            backgroundColor: '#00F0FF',
            color: '#050505',
            fontWeight: 700,
            fontSize: 14,
            border: 'none',
            borderRadius: 12,
            padding: '11px 0',
            cursor: 'pointer',
            fontFamily: 'Manrope, sans-serif',
            letterSpacing: '0.2px',
          }}
        >
          Install App
        </button>
      )}
    </div>
  );
}
