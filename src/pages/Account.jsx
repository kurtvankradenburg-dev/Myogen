import { useState, useEffect } from 'react';
import {
  Dna, Scan, Brain, Zap, Crown, LogOut, Key, ChevronRight,
  LayoutDashboard, Mail, Shield, Activity, User, Settings,
  Download, Share2, FileText, Lock, RefreshCw, AlertTriangle,
} from 'lucide-react';
import { auth } from '../firebase';
import { signOut, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { getAuthToken } from '../authToken';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', p: 'dashboard' },
  { icon: Scan,            label: 'Analyzer',  p: 'physique'  },
  { icon: Zap,             label: 'Quizzes',   p: 'quizzes'   },
  { icon: Brain,           label: 'Knowledge', p: 'knowledge' },
];

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase()) && !window.MSStream;
}
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function UsageBar({ used, limit, label, color = '#00F0FF' }) {
  const pct = limit === Infinity ? 0 : Math.min((used / limit) * 100, 100);
  const isOver = used >= limit && limit !== Infinity;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: '#A1A1AA' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: isOver ? '#FF3B30' : '#FAFAFA' }}>
          {limit === Infinity ? '∞ unlimited' : `${used} / ${limit}`}
        </span>
      </div>
      {limit !== Infinity && (
        <div style={{ height: 6, borderRadius: 9999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: 9999,
            background: isOver ? '#FF3B30' : color,
            transition: 'width 0.4s ease',
          }} />
        </div>
      )}
    </div>
  );
}

export default function Account({ navigate, user, setUser, isPremium, setIsPremium }) {
  const [showPasswordForm, setShowPasswordForm]   = useState(false);
  const [canInstall, setCanInstall]               = useState(false);
  const [currentPassword, setCurrentPassword]    = useState('');
  const [newPassword, setNewPassword]             = useState('');
  const [confirmPassword, setConfirmPassword]     = useState('');
  const [passwordMsg, setPasswordMsg]             = useState('');
  const [passwordError, setPasswordError]         = useState('');
  const [showCurrent, setShowCurrent]             = useState(false);
  const [showNew, setShowNew]                     = useState(false);
  const [cancelConfirm, setCancelConfirm]         = useState(false);
  const [cancelLoading, setCancelLoading]         = useState(false);
  const [cancelError, setCancelError]             = useState('');
  const [cancelDone, setCancelDone]               = useState(false);
  const [usage, setUsage]                         = useState(null);

  const ios        = isIOS();
  const standalone = isStandalone();
  const isGoogleUser = user?.google;

  useEffect(() => {
    setCanInstall(!!window.__myogenInstallPrompt);
    const handler = (e) => {
      e.preventDefault();
      window.__myogenInstallPrompt = e;
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    getAuthToken().then(token => {
      if (!token) return;
      fetch('/api/user-status', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setUsage(d); })
        .catch(() => {});
    });
  }, []);

  async function handleInstall() {
    const prompt = window.__myogenInstallPrompt;
    if (!prompt) return;
    prompt.prompt();
    await prompt.userChoice;
    window.__myogenInstallPrompt = null;
    setCanInstall(false);
  }

  async function handleSignOut() {
    try { if (auth) await signOut(auth); } catch {}
    localStorage.removeItem('myogen_user');
    localStorage.removeItem('myogen_last_active');
    setUser(null);
    navigate('landing');
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');
    if (newPassword !== confirmPassword) { setPasswordError('New passwords do not match.'); return; }
    if (newPassword.length < 6) { setPasswordError('Password must be at least 6 characters.'); return; }
    if (!auth?.currentUser) { setPasswordError('Not signed in.'); return; }
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setPasswordMsg('Password updated successfully.');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (err) {
      const msg =
        err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential' ? 'Current password is incorrect.'
        : err.code === 'auth/too-many-requests' ? 'Too many attempts. Please wait and try again.'
        : err.message || 'Failed to update password.';
      setPasswordError(msg);
    }
  }

  async function handleCancelSubscription() {
    setCancelLoading(true);
    setCancelError('');
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/cancel-premium', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cancellation failed');
      setIsPremium(false);
      localStorage.setItem('myogen_premium', 'false');
      setCancelConfirm(false);
      setCancelDone(true);
      setUsage(u => u ? { ...u, isPremium: false } : u);
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setCancelLoading(false);
    }
  }

  const chatLimit     = isPremium ? Infinity : (usage?.chatLimit     ?? 15);
  const analysisLimit = isPremium ? Infinity : (usage?.analysisLimit ?? 1);
  const chatUsed      = usage?.chatCount     ?? 0;
  const analysisUsed  = usage?.analysisCount ?? 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#050505', overflowX: 'hidden' }}>
      {/* Nav */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 px-4 py-4" style={{ maxWidth: '100vw' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => navigate('dashboard')}>
            <Dna className="h-7 w-7" strokeWidth={1.5} style={{ color: '#00F0FF' }} />
            <span className="font-bold text-lg tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>MYOGEN</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map(({ icon: Icon, label, p }) => (
              <button key={p} onClick={() => navigate(p)} className="btn-ghost text-sm flex items-center gap-2" style={{ color: '#A1A1AA' }}>
                <Icon className="h-4 w-4" />{label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {!isPremium && (
              <button className="btn-primary text-sm px-3 py-2" onClick={() => navigate('premium')}>
                <Crown className="h-4 w-4" /> Upgrade
              </button>
            )}
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: 'rgba(0,240,255,0.15)', color: '#00F0FF', border: '2px solid #00F0FF' }}>
              {(user?.name?.[0] || 'U').toUpperCase()}
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-4 max-w-2xl mx-auto pb-28 md:pb-16" style={{ width: '100%' }}>
        <h1 className="font-bold text-2xl mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>Account</h1>
        <p className="text-sm mb-8" style={{ color: '#A1A1AA' }}>Manage your profile, subscription and settings</p>

        {/* ── Profile ── */}
        <div className="card-glow p-5 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
              style={{ background: 'rgba(0,240,255,0.15)', color: '#00F0FF', border: '2px solid rgba(0,240,255,0.4)' }}>
              {(user?.name?.[0] || 'U').toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p className="font-semibold" style={{ fontFamily: 'Manrope, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</p>
              <p className="text-sm" style={{ color: '#A1A1AA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
              <p className="text-xs mt-1" style={{ color: isGoogleUser ? '#34d399' : '#A1A1AA' }}>
                {isGoogleUser ? '● Signed in with Google' : '● Email & Password'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Usage This Month ── */}
        <div className="card-glow p-5 mb-4">
          <p className="font-semibold mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>Usage this month</p>

          <UsageBar
            label="AI messages"
            used={chatUsed}
            limit={chatLimit}
          />
          <UsageBar
            label="Physique analyses"
            used={analysisUsed}
            limit={analysisLimit}
          />

          {/* Quizzes */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
            <span style={{ fontSize: 13, color: '#A1A1AA' }}>Study quizzes</span>
            {isPremium ? (
              <span style={{ fontSize: 13, fontWeight: 600, color: '#00F0FF' }}>∞ unlimited</span>
            ) : (
              <button
                onClick={() => navigate('premium')}
                style={{ fontSize: 12, color: '#00F0FF', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Crown style={{ width: 12, height: 12 }} /> Premium only
              </button>
            )}
          </div>

          {!isPremium && (
            <button
              onClick={() => navigate('premium')}
              className="btn-primary w-full mt-5 py-3 text-sm"
              style={{ borderRadius: 12 }}
            >
              <Crown className="h-4 w-4" /> Upgrade to Premium — Unlimited everything
            </button>
          )}
        </div>

        {/* ── Subscription ── */}
        <div className="card-glow p-5 mb-4">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isPremium ? 16 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: isPremium ? 'rgba(0,240,255,0.1)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Crown style={{ width: 20, height: 20, color: isPremium ? '#00F0FF' : '#A1A1AA' }} />
              </div>
              <div>
                <p className="font-semibold">Subscription</p>
                <p style={{ fontSize: 13, color: isPremium ? '#00F0FF' : '#A1A1AA' }}>
                  {isPremium ? 'Myogen Premium — Active' : 'Free Plan'}
                </p>
              </div>
            </div>
            {!isPremium && (
              <button className="btn-primary text-sm px-3 py-2" onClick={() => navigate('premium')}>Upgrade</button>
            )}
          </div>

          {isPremium && !cancelDone && (
            <>
              <p style={{ fontSize: 12, color: '#71717A', marginBottom: 12 }}>
                Your subscription renews monthly via PayPal. You can cancel at any time — you keep access until the end of your current billing period.
              </p>
              {!cancelConfirm ? (
                <button
                  onClick={() => { setCancelConfirm(true); setCancelError(''); }}
                  style={{ fontSize: 13, color: '#FF3B30', background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', width: '100%' }}
                >
                  Cancel subscription
                </button>
              ) : (
                <div style={{ background: 'rgba(255,59,48,0.07)', border: '1px solid rgba(255,59,48,0.2)', borderRadius: 12, padding: 16 }}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    <AlertTriangle style={{ width: 18, height: 18, color: '#FF3B30', flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 13, color: '#FAFAFA' }}>
                      Are you sure? Your Premium access will end at the close of your current billing period and you won't be charged again.
                    </p>
                  </div>
                  {cancelError && (
                    <p style={{ fontSize: 12, color: '#FF3B30', marginBottom: 10 }}>{cancelError}</p>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={handleCancelSubscription}
                      disabled={cancelLoading}
                      style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#FF3B30', background: 'rgba(255,59,48,0.12)', border: '1px solid rgba(255,59,48,0.3)', borderRadius: 10, padding: '9px 0', cursor: cancelLoading ? 'not-allowed' : 'pointer', opacity: cancelLoading ? 0.7 : 1 }}
                    >
                      {cancelLoading ? 'Cancelling…' : 'Yes, cancel'}
                    </button>
                    <button
                      onClick={() => { setCancelConfirm(false); setCancelError(''); }}
                      style={{ flex: 1, fontSize: 13, color: '#A1A1AA', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 0', cursor: 'pointer' }}
                    >
                      Keep Premium
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {cancelDone && (
            <div style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '10px 14px' }}>
              <p style={{ fontSize: 13, color: '#22c55e' }}>Subscription cancelled. You'll retain access until the end of this billing period.</p>
            </div>
          )}
        </div>

        {/* ── Email ── */}
        <div className="card-glow p-5 mb-4">
          <div className="flex items-center gap-3">
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Mail style={{ width: 20, height: 20, color: '#A1A1AA' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p className="font-semibold">Email</p>
              <p style={{ fontSize: 13, color: '#A1A1AA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
            </div>
          </div>
        </div>

        {/* ── Password (email users) ── */}
        {!isGoogleUser && (
          <div className="card-glow p-5 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Key style={{ width: 20, height: 20, color: '#A1A1AA' }} />
                </div>
                <div>
                  <p className="font-semibold">Password</p>
                  <p style={{ fontSize: 13, color: '#A1A1AA' }}>••••••••••••</p>
                </div>
              </div>
              <button onClick={() => { setShowPasswordForm(!showPasswordForm); setPasswordMsg(''); setPasswordError(''); }}
                style={{ fontSize: 13, color: '#00F0FF', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                {showPasswordForm ? 'Cancel' : 'Change'} <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            {showPasswordForm && (
              <form onSubmit={handlePasswordChange} className="mt-5 space-y-3">
                <div className="relative">
                  <input type={showCurrent ? 'text' : 'password'} placeholder="Current password" value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)} className="input-style w-full" required />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#A1A1AA', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showCurrent ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <input type={showNew ? 'text' : 'password'} placeholder="New password" value={newPassword}
                    onChange={e => setNewPassword(e.target.value)} className="input-style w-full" minLength={6} required />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#A1A1AA', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showNew ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input type="password" placeholder="Confirm new password" value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)} className="input-style w-full" minLength={6} required />
                {passwordError && <p style={{ fontSize: 12, color: '#FF3B30' }}>{passwordError}</p>}
                {passwordMsg   && <p style={{ fontSize: 12, color: '#22c55e'  }}>{passwordMsg}</p>}
                <button type="submit" className="btn-primary text-sm px-5 py-2">Update Password</button>
              </form>
            )}
          </div>
        )}

        {/* ── Security (Google) ── */}
        {isGoogleUser && (
          <div className="card-glow p-5 mb-4">
            <div className="flex items-center gap-3">
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield style={{ width: 20, height: 20, color: '#A1A1AA' }} />
              </div>
              <div>
                <p className="font-semibold">Security</p>
                <p style={{ fontSize: 13, color: '#A1A1AA' }}>Password managed by Google</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Install App ── */}
        {!standalone && (
          <div className="card-glow p-5 mb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,240,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {ios ? <Share2 style={{ width: 20, height: 20, color: '#00F0FF' }} /> : <Download style={{ width: 20, height: 20, color: '#00F0FF' }} />}
                </div>
                <div>
                  <p className="font-semibold">Install App</p>
                  <p style={{ fontSize: 13, color: '#A1A1AA' }}>{ios ? 'Add to your home screen' : 'Get the full app experience'}</p>
                </div>
              </div>
              {ios ? (
                <span style={{ fontSize: 11, color: '#A1A1AA', textAlign: 'right', flexShrink: 0, maxWidth: 110 }}>
                  Safari → Share → Add to Home Screen
                </span>
              ) : canInstall ? (
                <button className="btn-primary text-sm px-3 py-2 flex-shrink-0" onClick={handleInstall}>
                  <Download className="h-4 w-4" /> Install
                </button>
              ) : (
                <span style={{ fontSize: 11, color: '#A1A1AA', textAlign: 'right', flexShrink: 0, maxWidth: 120 }}>
                  Chrome menu (⋮) → Add to Home Screen
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Legal & Policies ── */}
        <div className="card-glow p-5 mb-4">
          <p className="font-semibold mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>Legal</p>
          {[
            { icon: Lock,     label: 'Privacy Policy',    page: 'privacy' },
            { icon: FileText, label: 'Terms of Service',  page: 'terms'   },
            { icon: RefreshCw,label: 'Refund Policy',     page: 'refund'  },
          ].map(({ icon: Icon, label, page }) => (
            <button
              key={page}
              onClick={() => navigate(page)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: page === 'refund' ? 'none' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon style={{ width: 16, height: 16, color: '#A1A1AA', flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: '#FAFAFA' }}>{label}</span>
              </div>
              <ChevronRight style={{ width: 16, height: 16, color: '#A1A1AA', flexShrink: 0 }} />
            </button>
          ))}
        </div>

        {/* ── Sign Out ── */}
        <button onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-xl text-sm font-medium mt-2 transition-all"
          style={{ border: '1px solid rgba(255,59,48,0.3)', color: '#FF3B30', background: 'rgba(255,59,48,0.05)', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,59,48,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,59,48,0.05)'}>
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none' }}>
        <div className="flex items-center justify-around">
          {[
            { icon: Activity, label: 'Home',     p: 'dashboard' },
            { icon: Scan,     label: 'Analyzer', p: 'physique'  },
            { icon: Zap,      label: 'Quizzes',  p: 'quizzes'   },
            { icon: Brain,    label: 'Knowledge',p: 'knowledge' },
            { icon: User,     label: 'Account',  p: 'account'   },
          ].map(({ icon: Icon, label, p }) => (
            <button key={p} onClick={() => navigate(p)}
              style={{ color: p === 'account' ? '#00F0FF' : '#A1A1AA', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <Icon style={{ width: 20, height: 20 }} />
              <span style={{ fontSize: 10 }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
