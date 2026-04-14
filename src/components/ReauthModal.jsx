import { useState } from 'react';
import { Dna, Mail, ShieldCheck } from 'lucide-react';

export default function ReauthModal({ user, onSuccess, onLogout }) {
  const [step, setStep] = useState('prompt'); // prompt | code
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devCode, setDevCode] = useState('');

  async function sendCode() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (data.devCode) setDevCode(data.devCode); // show in dev if no SMTP
      setStep('code');
    } catch {
      setError('Could not send verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    if (!code.trim()) { setError('Enter the 6-digit code.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, code: code.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        onSuccess();
      } else {
        setError(data.error || 'Invalid code.');
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="card-glow p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(0,240,255,0.1)' }}>
            <ShieldCheck className="h-6 w-6" style={{ color: '#00F0FF' }} />
          </div>
          <div>
            <h2 className="font-bold text-xl" style={{ fontFamily: 'Manrope, sans-serif' }}>Identity Verification</h2>
            <p className="text-xs" style={{ color: '#A1A1AA' }}>3 months of inactivity detected</p>
          </div>
        </div>

        {step === 'prompt' ? (
          <>
            <p className="text-sm mb-6" style={{ color: '#A1A1AA' }}>
              For your security, we need to verify it's you. We'll send a code to <strong style={{ color: '#FAFAFA' }}>{user.email}</strong>.
            </p>
            <button className="btn-primary w-full py-4 mb-3" style={{ borderRadius: '12px' }} onClick={sendCode} disabled={loading}>
              {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><Mail className="h-4 w-4" /> Send Verification Code</>}
            </button>
            <button className="btn-ghost w-full py-3 text-sm" onClick={onLogout}>
              Sign out instead
            </button>
          </>
        ) : (
          <>
            <p className="text-sm mb-2" style={{ color: '#A1A1AA' }}>
              Enter the 6-digit code sent to <strong style={{ color: '#FAFAFA' }}>{user.email}</strong>.
            </p>
            {devCode && (
              <p className="text-xs mb-4 px-3 py-2 rounded-lg" style={{ background: 'rgba(234,179,8,0.1)', color: '#eab308' }}>
                Dev mode — no SMTP configured. Code: <strong>{devCode}</strong>
              </p>
            )}
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              className="input-style text-center text-2xl tracking-widest mb-4"
              style={{ letterSpacing: '0.3em', fontFamily: 'JetBrains Mono, monospace' }}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            />
            {error && <p className="text-sm mb-3 text-center" style={{ color: '#FF3B30' }}>{error}</p>}
            <button className="btn-primary w-full py-4 mb-3" style={{ borderRadius: '12px' }} onClick={verifyCode} disabled={loading}>
              {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : 'Verify'}
            </button>
            <button className="btn-ghost w-full py-2 text-sm" onClick={() => { setStep('prompt'); setError(''); setCode(''); }}>
              Resend code
            </button>
            <button className="btn-ghost w-full py-2 text-sm" onClick={onLogout}>Sign out</button>
          </>
        )}
      </div>
    </div>
  );
}
