import { useState, useEffect } from 'react';
import { Dna, ArrowLeft, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { auth, isFirebaseConfigured } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  updateProfile,
  sendEmailVerification,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default function Auth({ navigate, setUser, googleAuthError, clearGoogleAuthError }) {
  const [mode, setMode] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signUpConfirm, setSignUpConfirm] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    if (googleAuthError) {
      setError(googleAuthError);
      clearGoogleAuthError?.();
    }
  }, [googleAuthError]);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleGoogle() {
    setLoading(true);
    setError('');

    if (!isFirebaseConfigured || !auth) {
      await new Promise(r => setTimeout(r, 700));
      setUser({ name: 'Demo User', email: 'demo@myogen.app', google: true });
      navigate('dashboard');
      setLoading(false);
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged in App.jsx handles navigation
    } catch (err) {
      if (err.code === 'auth/popup-blocked') {
        // Popup was blocked — fall back to redirect
        try {
          await signInWithRedirect(auth, googleProvider);
          return; // page will navigate away; finally will still reset loading
        } catch {
          setError('Popup blocked. Please allow popups for this site and try again.');
        }
      } else if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError(err.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    if (mode === 'signup' && !form.name) { setError('Please enter your name.'); return; }
    setLoading(true);
    setError('');

    if (!isFirebaseConfigured || !auth) {
      await new Promise(r => setTimeout(r, 700));
      setUser({ name: form.name || form.email.split('@')[0], email: form.email });
      navigate('dashboard');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signup') {
        const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await updateProfile(firebaseUser, { displayName: form.name });
        await sendEmailVerification(firebaseUser);
        await signOut(auth); // force sign-out until email is verified
        setSignUpConfirm(true);
      } else {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
        const { user: firebaseUser } = await signInWithEmailAndPassword(auth, form.email, form.password);
        if (!firebaseUser.emailVerified) {
          await signOut(auth);
          setError('Please verify your email before signing in. Check your inbox for the confirmation link.');
          setLoading(false);
          return;
        }
        // onAuthStateChanged in App.jsx handles navigation
      }
    } catch (err) {
      const msg =
        err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found'
          ? 'Incorrect email or password.'
          : err.code === 'auth/email-already-in-use'
          ? 'Email already registered. Sign in instead.'
          : err.code === 'auth/weak-password'
          ? 'Password must be at least 6 characters.'
          : err.code === 'auth/invalid-email'
          ? 'Please enter a valid email address.'
          : err.code === 'auth/too-many-requests'
          ? 'Too many attempts. Please wait a moment and try again.'
          : err.message || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const isSignIn = mode === 'signin';
  const rightImage = isSignIn
    ? 'https://images.unsplash.com/photo-1630959305529-67447c685b9e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwbGFib3JhdG9yeSUyMG1pY3Jvc2NvcGUlMjBzY2llbmNlfGVufDB8fHx8MTc2ODIyMzgzM3ww&ixlib=rb-4.1.0&q=85'
    : 'https://images.unsplash.com/photo-1729339983367-770c2527ce75?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwyfHxodW1hbiUyMGFuYXRvbXklMjBtdXNjbGUlMjBzdHJ1Y3R1cmUlMjBhcnRpc3RpYyUyMGRhcmslMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc2ODIyMzgyOHww&ixlib=rb-4.1.0&q=85';

  if (signUpConfirm) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#050505' }}>
        <div className="max-w-md w-full mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(0,240,255,0.1)' }}>
            <Mail className="h-8 w-8" style={{ color: '#00F0FF' }} />
          </div>
          <h1 className="font-bold text-2xl mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>Check your email</h1>
          <p className="mb-6" style={{ color: '#A1A1AA' }}>
            We sent a confirmation link to <strong style={{ color: '#FAFAFA' }}>{form.email}</strong>.
            Click it to activate your account, then sign in.
          </p>
          <button
            className="btn-primary w-full py-4"
            style={{ borderRadius: '12px' }}
            onClick={() => { setSignUpConfirm(false); setMode('signin'); }}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#050505' }}>
      {/* Left Panel — Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12">
        <div className="max-w-md w-full mx-auto">
          <button
            onClick={() => navigate('landing')}
            className="inline-flex items-center gap-2 text-sm mb-12 transition-colors"
            style={{ color: '#A1A1AA', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = '#FAFAFA'}
            onMouseLeave={e => e.currentTarget.style.color = '#A1A1AA'}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </button>

          <div className="flex items-center gap-3 mb-8">
            <Dna className="h-8 w-8" strokeWidth={1.5} style={{ color: '#00F0FF' }} />
            <span className="font-bold text-xl tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>MYOGEN</span>
          </div>

          <h1 className="font-bold text-3xl tracking-tight mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {isSignIn ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mb-8" style={{ color: '#A1A1AA' }}>
            {isSignIn ? 'Sign in to continue your journey' : 'Start your evidence-based journey today'}
          </p>

          {/* Google Button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-4 rounded-xl flex items-center justify-center gap-3 text-sm font-medium transition-all mb-6"
            style={{ border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#FAFAFA', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-sm" style={{ background: '#050505', color: '#A1A1AA' }}>or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isSignIn && (
              <div className="space-y-2">
                <label className="block text-sm font-medium">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: '#A1A1AA' }} />
                  <input
                    name="name"
                    type="text"
                    placeholder="Your name"
                    className="input-style pl-11"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: '#A1A1AA' }} />
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="input-style pl-11"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: '#A1A1AA' }} />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-style pl-11 pr-11"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete={isSignIn ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A1A1AA', padding: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#FAFAFA'}
                  onMouseLeave={e => e.currentTarget.style.color = '#A1A1AA'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {isSignIn && (
              <label style={{
                display: 'flex', alignItems: 'center', gap: 8,
                cursor: 'pointer', userSelect: 'none',
              }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ width: 15, height: 15, accentColor: '#00F0FF', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '13px', color: '#A1A1AA' }}>Remember me</span>
              </label>
            )}

            {error && (
              <p className="text-sm text-center py-2 px-4 rounded-lg" style={{ color: '#FF3B30', background: 'rgba(255,59,48,0.1)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary w-full py-4 rounded-xl text-base"
              style={{ borderRadius: '12px' }}
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                isSignIn ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-8" style={{ color: '#A1A1AA' }}>
            {isSignIn ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(isSignIn ? 'signup' : 'signin'); setError(''); }}
              className="font-medium hover:underline"
              style={{ color: '#00F0FF', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {isSignIn ? 'Create one' : 'Sign in'}
            </button>
          </p>

          {!isSignIn && (
            <p className="text-center text-xs mt-6" style={{ color: '#A1A1AA' }}>
              By signing up, you agree to our Terms and Privacy Policy.
              Educational purposes only — not medical advice.
            </p>
          )}
        </div>
      </div>

      {/* Right Panel — Image */}
      <div className="hidden lg:block lg:flex-1 relative">
        <img
          src={rightImage}
          alt="Science lab"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #050505, rgba(5,5,5,0.5), transparent)' }} />
      </div>
    </div>
  );
}
