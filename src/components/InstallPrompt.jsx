import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

const DISMISSED_KEY = 'myogen_install_dismissed';

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
    // Never show if already installed or permanently dismissed
    if (isInStandaloneMode()) return;
    if (localStorage.getItem(DISMISSED_KEY)) return;

    if (isIOS()) {
      setIosMode(true);
      // Delay so it doesn't immediately interrupt the first visit
      const t = setTimeout(() => setVisible(true), 5000);
      return () => clearTimeout(t);
    }

    // Chrome / Edge / Android — capture the native prompt before it fires
    const onPrompt = (e) => {
      e.preventDefault();
      window.__myogenInstallPrompt = e; // share with Account page
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1');
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
        bottom: 72,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: 400,
        zIndex: 9997,
        backgroundColor: '#111111',
        border: '1px solid rgba(0,240,255,0.2)',
        borderRadius: 16,
        padding: '16px 20px',
        boxShadow: '0 0 40px rgba(0,240,255,0.08), 0 12px 40px rgba(0,0,0,0.6)',
      }}
    >
      {/* Dismiss */}
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          position: 'absolute', top: 10, right: 10,
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#71717A', display: 'flex', padding: 4, borderRadius: 4,
        }}
      >
        <X size={15} />
      </button>

      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {/* Icon */}
        <div style={{
          width: 42, height: 42, borderRadius: 10, flexShrink: 0,
          background: 'rgba(0,240,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(0,240,255,0.15)',
        }}>
          {iosMode
            ? <Share size={18} style={{ color: '#00F0FF' }} />
            : <Download size={18} style={{ color: '#00F0FF' }} />}
        </div>

        {/* Text */}
        <div style={{ flex: 1, paddingRight: 16 }}>
          <p style={{
            fontFamily: 'Manrope, sans-serif', fontWeight: 600,
            fontSize: 14, marginBottom: 4,
          }}>
            Install Myogen
          </p>
          {iosMode ? (
            <p style={{ color: '#A1A1AA', fontSize: 12, lineHeight: 1.6 }}>
              In Safari, tap the{' '}
              <strong style={{ color: '#FAFAFA' }}>Share</strong> icon (
              <Share size={10} style={{ display: 'inline', verticalAlign: 'middle', marginBottom: 1, color: '#A1A1AA' }} />
              ) at the bottom of your screen, then tap{' '}
              <strong style={{ color: '#FAFAFA' }}>Add to Home Screen</strong>.
            </p>
          ) : (
            <p style={{ color: '#A1A1AA', fontSize: 12, lineHeight: 1.6 }}>
              Get the full app experience — fast, offline-ready, and always one tap away.
            </p>
          )}
        </div>
      </div>

      {/* Install button — non-iOS only */}
      {!iosMode && (
        <button
          onClick={install}
          style={{
            marginTop: 14,
            width: '100%',
            backgroundColor: '#00F0FF',
            color: '#050505',
            fontWeight: 600,
            fontSize: 13,
            border: 'none',
            borderRadius: 999,
            padding: '9px 0',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Install App
        </button>
      )}
    </div>
  );
}
