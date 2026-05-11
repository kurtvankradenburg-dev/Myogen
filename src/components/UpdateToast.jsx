import { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { onUpdateReady } from '../sw-register';

export default function UpdateToast() {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    onUpdateReady(() => {
      setVisible(true);
      timerRef.current = setTimeout(() => {
        window.location.reload();
      }, 8000);
    });
    return () => clearTimeout(timerRef.current);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        backgroundColor: '#0F0F0F',
        border: '1px solid rgba(0,240,255,0.25)',
        borderRadius: 16,
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: '0 0 40px rgba(0,240,255,0.1), 0 12px 40px rgba(0,0,0,0.6)',
        width: 'calc(100% - 32px)',
        maxWidth: 380,
        animation: 'slideDown 0.35s ease-out',
      }}
    >
      <RefreshCw
        size={18}
        style={{ color: '#00F0FF', flexShrink: 0, animation: 'spin 1.5s linear infinite' }}
      />
      <span
        style={{
          flex: 1,
          fontFamily: 'Manrope, sans-serif',
          fontSize: 13,
          fontWeight: 600,
          color: '#FAFAFA',
        }}
      >
        New version available
      </span>
      <button
        onClick={() => window.location.reload()}
        style={{
          backgroundColor: '#00F0FF',
          color: '#050505',
          border: 'none',
          borderRadius: 10,
          padding: '7px 16px',
          fontFamily: 'Manrope, sans-serif',
          fontWeight: 700,
          fontSize: 12,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Refresh
      </button>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
