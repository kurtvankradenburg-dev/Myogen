import { useState } from 'react';
import { Dna, Scan, Brain, Zap, Crown, LogOut, Key, ChevronRight, LayoutDashboard, Mail, Shield } from 'lucide-react';
import { supabase } from '../supabase';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', p: 'dashboard' },
  { icon: Scan, label: 'Analyzer', p: 'physique' },
  { icon: Zap, label: 'Quizzes', p: 'quizzes' },
  { icon: Brain, label: 'Knowledge', p: 'knowledge' },
];

export default function Account({ navigate, user, setUser, isPremium }) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const isGoogleUser = user?.google;

  async function handleSignOut() {
    try {
      if (supabase) await supabase.auth.signOut();
    } catch {}
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
    if (!supabase) { setPasswordError('Not signed in.'); return; }

    try {
      // Verify current password by re-signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signInError) { setPasswordError('Current password is incorrect.'); return; }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;

      setPasswordMsg('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#050505' }}>
      {/* Nav */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('dashboard')}>
            <Dna className="h-8 w-8" strokeWidth={1.5} style={{ color: '#00F0FF', transform: 'rotate(45deg)' }} />
            <span className="font-bold text-xl tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>MYOGEN</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map(({ icon: Icon, label, p }) => (
              <button key={p} onClick={() => navigate(p)} className="btn-ghost text-sm flex items-center gap-2"
                style={{ color: '#A1A1AA' }}>
                <Icon className="h-4 w-4" />{label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {!isPremium && (
              <button className="btn-primary text-sm px-4 py-2" onClick={() => navigate('premium')}>
                <Crown className="h-4 w-4" /> Upgrade
              </button>
            )}
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ background: 'rgba(0,240,255,0.15)', color: '#00F0FF', border: '2px solid #00F0FF' }}>
              {(user?.name?.[0] || 'U').toUpperCase()}
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-28 px-6 max-w-2xl mx-auto pb-16">
        <h1 className="font-bold text-3xl mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>Account</h1>
        <p className="text-sm mb-10" style={{ color: '#A1A1AA' }}>Manage your profile and subscription</p>

        {/* Profile card */}
        <div className="card-glow p-6 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
              style={{ background: 'rgba(0,240,255,0.15)', color: '#00F0FF', border: '2px solid rgba(0,240,255,0.4)' }}>
              {(user?.name?.[0] || 'U').toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>{user?.name || 'User'}</p>
              <p className="text-sm" style={{ color: '#A1A1AA' }}>{user?.email}</p>
              <p className="text-xs mt-1" style={{ color: isGoogleUser ? '#34d399' : '#A1A1AA' }}>
                {isGoogleUser ? '● Signed in with Google' : '● Email & Password'}
              </p>
            </div>
          </div>
        </div>

        {/* Plan */}
        <div className="card-glow p-6 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: isPremium ? 'rgba(0,240,255,0.1)' : 'rgba(255,255,255,0.05)' }}>
                <Crown className="h-5 w-5" style={{ color: isPremium ? '#00F0FF' : '#A1A1AA' }} />
              </div>
              <div>
                <p className="font-semibold">Current Plan</p>
                <p className="text-sm" style={{ color: isPremium ? '#00F0FF' : '#A1A1AA' }}>
                  {isPremium ? 'Myogen Premium' : 'Free Plan — 1 analysis/month, 15 AI messages'}
                </p>
              </div>
            </div>
            {!isPremium ? (
              <button className="btn-primary text-sm px-4 py-2" onClick={() => navigate('premium')}>Upgrade</button>
            ) : (
              <span className="text-xs px-3 py-1 rounded-full"
                style={{ background: 'rgba(0,240,255,0.1)', color: '#00F0FF', border: '1px solid rgba(0,240,255,0.2)' }}>
                Active
              </span>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="card-glow p-6 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <Mail className="h-5 w-5" style={{ color: '#A1A1AA' }} />
            </div>
            <div>
              <p className="font-semibold">Email Address</p>
              <p className="text-sm" style={{ color: '#A1A1AA' }}>{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Password — email users only */}
        {!isGoogleUser && (
          <div className="card-glow p-6 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Key className="h-5 w-5" style={{ color: '#A1A1AA' }} />
                </div>
                <div>
                  <p className="font-semibold">Password</p>
                  <p className="text-sm" style={{ color: '#A1A1AA' }}>••••••••••••</p>
                </div>
              </div>
              <button onClick={() => { setShowPasswordForm(!showPasswordForm); setPasswordMsg(''); setPasswordError(''); }}
                className="text-sm flex items-center gap-1"
                style={{ color: '#00F0FF', background: 'none', border: 'none', cursor: 'pointer' }}>
                {showPasswordForm ? 'Cancel' : 'Change'} <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {showPasswordForm && (
              <form onSubmit={handlePasswordChange} className="mt-5 space-y-3">
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    placeholder="Current password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="input-style w-full"
                    required
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                    style={{ color: '#A1A1AA', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showCurrent ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    placeholder="New password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="input-style w-full"
                    minLength={6}
                    required
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                    style={{ color: '#A1A1AA', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showNew ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="input-style w-full"
                  minLength={6}
                  required
                />
                {passwordError && <p className="text-xs" style={{ color: '#FF3B30' }}>{passwordError}</p>}
                {passwordMsg && <p className="text-xs" style={{ color: '#22c55e' }}>{passwordMsg}</p>}
                <button type="submit" className="btn-primary text-sm px-5 py-2">Update Password</button>
              </form>
            )}
          </div>
        )}

        {/* Security info for Google users */}
        {isGoogleUser && (
          <div className="card-glow p-6 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <Shield className="h-5 w-5" style={{ color: '#A1A1AA' }} />
              </div>
              <div>
                <p className="font-semibold">Security</p>
                <p className="text-sm" style={{ color: '#A1A1AA' }}>Password managed by Google</p>
              </div>
            </div>
          </div>
        )}

        {/* Sign Out */}
        <button onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-xl text-sm font-medium mt-6 transition-all"
          style={{ border: '1px solid rgba(255,59,48,0.3)', color: '#FF3B30', background: 'rgba(255,59,48,0.05)', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,59,48,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,59,48,0.05)'}>
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}
