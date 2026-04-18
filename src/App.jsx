import { useState, useEffect } from 'react';
import './styles/global.css';
import { auth, isFirebaseConfigured } from './firebase';
import { onAuthStateChanged, getRedirectResult, signOut } from 'firebase/auth';
import { getAuthToken } from './authToken';

import Splash from './components/Splash';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import PhysiqueAnalysis from './pages/PhysiqueAnalysis';
import KnowledgeCentre from './pages/KnowledgeCentre';
import Quizzes from './pages/Quizzes';
import Premium from './pages/Premium';
import ReauthModal from './components/ReauthModal';
import Account from './pages/Account';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookieBanner, { hasConsent } from './components/CookieBanner';
import InstallPrompt from './components/InstallPrompt';
import { initAnalytics } from './analytics';

const PERMANENT_PREMIUM_EMAIL = 'kurtvankradenburg@gmail.com';
const INACTIVITY_LIMIT_MS = 90 * 24 * 60 * 60 * 1000;

const PAGE_TITLES = {
  landing:   'Myogen | Home',
  auth:      'Myogen | Sign In',
  signup:    'Myogen | Create Account',
  dashboard: 'Myogen | Dashboard',
  physique:  'Myogen | Physique Analyzer',
  knowledge: 'Myogen | Knowledge Centre',
  quizzes:   'Myogen | Study Quizzes',
  premium:   'Myogen | Pricing',
  account:   'Myogen | Account',
  privacy:   'Myogen | Privacy Policy',
};

function mapFirebaseUser(firebaseUser) {
  const isGoogle = firebaseUser.providerData?.[0]?.providerId === 'google.com';
  return {
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
    email: firebaseUser.email,
    uid: firebaseUser.uid,
    google: isGoogle,
    emailVerified: firebaseUser.emailVerified,
  };
}

export default function App() {
  const [showSplash, setShowSplash]       = useState(true);
  const [page, setPage]                   = useState('landing');
  const [user, setUser]                   = useState(null);
  const [isPremium, setIsPremium]         = useState(false);
  const [apiKey, setApiKey]               = useState('');
  const [authChecked, setAuthChecked]     = useState(false);
  const [showReauth, setShowReauth]       = useState(false);
  const [googleAuthError, setGoogleAuthError] = useState('');

  useEffect(() => {
    document.title = PAGE_TITLES[page] || 'Myogen';
  }, [page]);

  useEffect(() => {
    if (hasConsent()) initAnalytics();
  }, []);

  useEffect(() => {
    // Demo mode when Firebase isn't configured
    if (!isFirebaseConfigured || !auth) {
      const savedUser = localStorage.getItem('myogen_user');
      if (savedUser) {
        try {
          const u = JSON.parse(savedUser);
          setUser(u);
          checkPremium(u);
          checkInactivity(u);
        } catch {}
      }
      setAuthChecked(true);
      setTimeout(() => setShowSplash(false), 2000);
      return;
    }

    // Process the result when the page returns from a Google redirect sign-in.
    // onAuthStateChanged below also fires, but getRedirectResult surfaces errors.
    getRedirectResult(auth).catch(err => {
      if (err.code && err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setGoogleAuthError(err.message || 'Google sign-in failed. Please try again.');
        setPage('auth');
      }
    });

    // Firebase auth state listener — handles session restore + all changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const isGoogle = firebaseUser.providerData?.[0]?.providerId === 'google.com';

        // Gmail-only enforcement for Google sign-ins
        if (isGoogle) {
          const email = firebaseUser.email?.toLowerCase() || '';
          if (!email.endsWith('@gmail.com') && !email.endsWith('@googlemail.com')) {
            await signOut(auth);
            setGoogleAuthError('Only personal Gmail accounts (@gmail.com) are supported.');
            setPage('auth');
            setAuthChecked(true);
            return;
          }
        }

        // Block email/password users who haven't verified their email
        if (!isGoogle && !firebaseUser.emailVerified) {
          setAuthChecked(true);
          return;
        }

        const u = mapFirebaseUser(firebaseUser);
        setUser(u);
        localStorage.setItem('myogen_user', JSON.stringify(u));
        checkPremium(u);
        checkInactivity(u);
        setPage(prev => ['landing', 'auth', 'signup'].includes(prev) ? 'dashboard' : prev);
      } else {
        setUser(null);
        setIsPremium(false);
        localStorage.removeItem('myogen_user');
        localStorage.removeItem('myogen_premium');
      }
      setAuthChecked(true);
    });

    setTimeout(() => setShowSplash(false), 2000);
    return () => unsubscribe();
  }, []);

  async function checkPremium(u) {
    if (!u) return;
    if (u.email?.toLowerCase() === PERMANENT_PREMIUM_EMAIL) {
      setIsPremium(true);
      return;
    }
    const cached = localStorage.getItem('myogen_premium') === 'true';
    setIsPremium(cached);
    try {
      const token = await getAuthToken();
      if (token) {
        const res = await fetch('/api/user-status', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setIsPremium(data.isPremium);
          localStorage.setItem('myogen_premium', data.isPremium ? 'true' : 'false');
        }
      }
    } catch {}
  }

  function checkInactivity(u) {
    if (!u) return;
    const lastActive = localStorage.getItem('myogen_last_active');
    if (lastActive) {
      const elapsed = Date.now() - parseInt(lastActive, 10);
      if (elapsed > INACTIVITY_LIMIT_MS) {
        setShowReauth(true);
        return;
      }
    }
    localStorage.setItem('myogen_last_active', String(Date.now()));
  }

  function recordActivity() {
    localStorage.setItem('myogen_last_active', String(Date.now()));
  }

  function navigate(target) {
    const authRequired = ['dashboard', 'physique', 'knowledge', 'quizzes', 'account'];
    if (authRequired.includes(target) && !user) {
      setPage('auth');
      return;
    }
    recordActivity();
    setPage(target);
    window.scrollTo(0, 0);
  }

  function handleSetUser(u) {
    setUser(u);
    if (u) {
      localStorage.setItem('myogen_user', JSON.stringify(u));
      checkPremium(u);
      recordActivity();
    }
  }

  function handleSetIsPremium(val) {
    if (user?.email?.toLowerCase() === PERMANENT_PREMIUM_EMAIL) return;
    setIsPremium(val);
    localStorage.setItem('myogen_premium', val ? 'true' : 'false');
  }

  function handleReauthSuccess() {
    setShowReauth(false);
    recordActivity();
  }

  async function handleReauthLogout() {
    setShowReauth(false);
    setUser(null);
    setIsPremium(false);
    localStorage.removeItem('myogen_user');
    localStorage.removeItem('myogen_last_active');
    if (auth) await signOut(auth);
    setPage('auth');
  }

  const commonProps = {
    navigate,
    user,
    setUser: handleSetUser,
    isPremium: isPremium || user?.email?.toLowerCase() === PERMANENT_PREMIUM_EMAIL,
    setIsPremium: handleSetIsPremium,
    apiKey,
    setApiKey,
    page,
  };

  if (!authChecked) return <Splash />;

  const renderPage = () => {
    switch (page) {
      case 'landing':   return <Landing {...commonProps} />;
      case 'auth':      return <Auth navigate={navigate} setUser={handleSetUser} googleAuthError={googleAuthError} clearGoogleAuthError={() => setGoogleAuthError('')} />;
      case 'dashboard': return <Dashboard {...commonProps} />;
      case 'physique':  return <PhysiqueAnalysis {...commonProps} />;
      case 'knowledge': return <KnowledgeCentre {...commonProps} />;
      case 'quizzes':   return <Quizzes {...commonProps} />;
      case 'premium':   return <Premium {...commonProps} />;
      case 'account':   return <Account {...commonProps} />;
      case 'privacy':   return <PrivacyPolicy navigate={navigate} />;
      default:          return <Landing {...commonProps} />;
    }
  };

  return (
    <>
      {showSplash && <Splash />}
      <div style={{ visibility: showSplash ? 'hidden' : 'visible' }}>
        {renderPage()}
      </div>
      {showReauth && user && (
        <ReauthModal
          user={user}
          onSuccess={handleReauthSuccess}
          onLogout={handleReauthLogout}
        />
      )}
      <CookieBanner
        onAccept={initAnalytics}
        onPrivacyClick={() => navigate('privacy')}
      />
      <InstallPrompt />
    </>
  );
}
