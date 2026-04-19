import { Dna } from 'lucide-react';

export default function EmailVerified({ error = false }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#050505',
      fontFamily: 'Manrope, sans-serif',
      padding: '24px',
    }}>
      <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '56px' }}>
          <Dna strokeWidth={1.5} style={{ color: '#00F0FF', width: 24, height: 24 }} />
          <span style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '3px', color: '#FAFAFA' }}>MYOGEN</span>
        </div>

        {/* Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          {error ? (
            /* Error — broken envelope */
            <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="48" cy="48" r="47" stroke="rgba(255,59,48,0.2)" strokeWidth="1"/>
              <rect x="16" y="28" width="64" height="44" rx="6" fill="rgba(255,59,48,0.06)" stroke="rgba(255,59,48,0.3)" strokeWidth="1.5"/>
              <path d="M16 34 L48 56 L80 34" stroke="rgba(255,59,48,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="36" y1="42" x2="60" y2="66" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round"/>
              <line x1="60" y1="42" x2="36" y2="66" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            /* Success — envelope with checkmark */
            <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="48" cy="48" r="47" stroke="rgba(0,240,255,0.15)" strokeWidth="1"/>
              <circle cx="48" cy="48" r="47" stroke="rgba(0,240,255,0.06)" strokeWidth="16"/>
              <rect x="14" y="28" width="68" height="46" rx="6" fill="rgba(0,240,255,0.06)" stroke="rgba(0,240,255,0.3)" strokeWidth="1.4"/>
              <path d="M14 36 L48 58 L82 36" stroke="rgba(0,240,255,0.3)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 74 L38 52" stroke="rgba(0,240,255,0.15)" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M82 74 L58 52" stroke="rgba(0,240,255,0.15)" strokeWidth="1.2" strokeLinecap="round"/>
              {/* Checkmark badge */}
              <circle cx="70" cy="30" r="14" fill="#050505" stroke="rgba(0,240,255,0.25)" strokeWidth="1"/>
              <circle cx="70" cy="30" r="13" fill="rgba(0,240,255,0.1)"/>
              <path d="M64 30 L68 34 L76 26" stroke="#00F0FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: '22px',
          fontWeight: 700,
          color: '#FAFAFA',
          marginBottom: '12px',
          marginTop: 0,
          letterSpacing: '-0.3px',
        }}>
          {error ? 'Link Expired' : 'Your email has been verified.'}
        </h1>

        {/* Subtext */}
        <p style={{
          fontSize: '15px',
          color: '#A1A1AA',
          lineHeight: 1.7,
          margin: '0 auto',
          maxWidth: '300px',
        }}>
          {error
            ? 'This verification link is invalid or has expired. Return to the app and sign up again.'
            : 'You can now close this window.'}
        </p>

      </div>
    </div>
  );
}
