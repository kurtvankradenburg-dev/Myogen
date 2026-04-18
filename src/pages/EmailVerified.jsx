import { Dna, CheckCircle, XCircle } from 'lucide-react';

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
          <Dna strokeWidth={1.5} style={{ color: '#00F0FF', width: 26, height: 26 }} />
          <span style={{ fontWeight: 700, fontSize: '17px', letterSpacing: '2px', color: '#FAFAFA' }}>MYOGEN</span>
        </div>

        {/* Icon */}
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: error ? 'rgba(255,59,48,0.08)' : 'rgba(0,240,255,0.08)',
          border: `1px solid ${error ? 'rgba(255,59,48,0.3)' : 'rgba(0,240,255,0.3)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 32px',
        }}>
          {error
            ? <XCircle strokeWidth={1.5} style={{ color: '#FF3B30', width: 40, height: 40 }} />
            : <CheckCircle strokeWidth={1.5} style={{ color: '#00F0FF', width: 40, height: 40 }} />
          }
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#FAFAFA', marginBottom: '12px', marginTop: 0 }}>
          {error ? 'Link Expired' : 'Email Verified'}
        </h1>

        {/* Subtext */}
        <p style={{ fontSize: '15px', color: '#A1A1AA', lineHeight: 1.75, margin: 0 }}>
          {error
            ? 'This verification link is invalid or has expired.\nReturn to the app and sign up again.'
            : 'Your email has been verified.\nYou can now close this window.'
          }
        </p>

      </div>
    </div>
  );
}
