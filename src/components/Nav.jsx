import { useState } from 'react';
import MyogenLogo from './MyogenLogo';

const tabs = [
  { id: 'physique', label: 'Analyzer', icon: '⬡' },
  { id: 'quizzes', label: 'Quizzes', icon: '◈' },
  { id: 'knowledge', label: 'Knowledge', icon: '⚡' },
];

export default function Nav({ page, navigate, isPremium, theme, setTheme, user }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleBack() {
    navigate('dashboard');
  }

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  const isDashboard = page === 'dashboard';

  return (
    <>
      <nav className="nav">
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!isDashboard && (
            <button className="nav-back" onClick={handleBack} title="Back to Dashboard">
              ←
            </button>
          )}
          <div
            className="nav-logo"
            onClick={() => navigate('dashboard')}
          >
            <MyogenLogo size={24} />
            <span className="nav-logo-text">MYOGEN</span>
          </div>
        </div>

        {/* Center tabs */}
        <div className="nav-center">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab${page === tab.id ? ' active' : ''}`}
              onClick={() => navigate(tab.id)}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right */}
        <div className="nav-right">
          {!isPremium && (
            <button className="nav-upgrade" onClick={() => navigate('premium')}>
              ✦ Upgrade
            </button>
          )}
          <button className="nav-theme-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? '☀' : '☽'}
          </button>
          <button
            className="nav-hamburger"
            onClick={() => setMobileOpen(o => !o)}
            style={{ display: 'flex' }}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`nav-mobile-menu${mobileOpen ? ' open' : ''}`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-mobile-tab${page === tab.id ? ' active' : ''}`}
            onClick={() => {
              navigate(tab.id);
              setMobileOpen(false);
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
        {!isPremium && (
          <button
            className="nav-mobile-tab"
            style={{ color: 'var(--accent)' }}
            onClick={() => {
              navigate('premium');
              setMobileOpen(false);
            }}
          >
            ✦ Upgrade to Premium
          </button>
        )}
      </div>
    </>
  );
}
