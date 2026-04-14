import { useState, useEffect } from 'react';
import { Dna, Scan, Brain, Zap, LogOut, Crown, ArrowRight, Activity, ChevronRight, LayoutDashboard } from 'lucide-react';
import { getAuthToken } from '../authToken';

const DASH_MOBILE_NAV = [
  { Icon: LayoutDashboard, label: 'Dashboard', p: 'dashboard' },
  { Icon: Scan, label: 'Analyzer', p: 'physique' },
  { Icon: Zap, label: 'Quizzes', p: 'quizzes' },
  { Icon: Brain, label: 'Knowledge', p: 'knowledge' },
];

export default function Dashboard({ navigate, user, isPremium, setUser }) {
  const firstName = user?.name?.split(' ')[0] || 'there';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Fetch usage counts from server — not localStorage
  const [analysisCount, setAnalysisCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);

  useEffect(() => {
    getAuthToken().then(token => {
      if (!token) return;
      fetch('/api/user-status', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (d) {
            setAnalysisCount(d.analysisCount || 0);
            setChatCount(d.chatCount || 0);
          }
        })
        .catch(() => {});
    });
  }, []);

  function handleLogout() {
    setUser(null);
    localStorage.removeItem('myogen_user');
    navigate('landing');
  }

  const analysesLimit = isPremium ? Infinity : 1;
  const chatLimit = isPremium ? Infinity : 15;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#050505' }}>
      {/* Navigation */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('dashboard')}>
            <Dna className="h-8 w-8" strokeWidth={1.5} style={{ color: '#00F0FF' }} />
            <span className="font-bold text-xl tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>MYOGEN</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {[
              { icon: Scan, label: 'Analyzer', page: 'physique' },
              { icon: Zap, label: 'Quizzes', page: 'quizzes' },
              { icon: Brain, label: 'Knowledge', page: 'knowledge' },
            ].map(({ icon: Icon, label, page }) => (
              <button key={page} onClick={() => navigate(page)}
                className="text-sm flex items-center gap-2 transition-colors btn-ghost"
                style={{ color: '#A1A1AA' }}>
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {isPremium ? (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.2)' }}>
                <Crown className="h-4 w-4" style={{ color: '#00F0FF' }} />
                <span className="text-sm font-medium" style={{ color: '#00F0FF' }}>Premium</span>
              </div>
            ) : (
              <button className="btn-primary text-sm px-4 py-2" onClick={() => navigate('premium')}>
                <Crown className="h-4 w-4" />
                Upgrade
              </button>
            )}
            <button className="hidden md:inline-flex btn-ghost p-2" onClick={handleLogout} title="Sign out">
              <LogOut className="h-5 w-5" />
            </button>
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-base"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', color: '#FAFAFA' }}
              onClick={() => setMobileMenuOpen(o => !o)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed left-0 right-0 z-40 p-4" style={{ top: 65, background: '#0A0A0A', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {DASH_MOBILE_NAV.map(({ Icon, label, p }) => (
            <button key={p} onClick={() => { navigate(p); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
              style={{ background: p === 'dashboard' ? 'rgba(0,240,255,0.1)' : 'transparent', color: p === 'dashboard' ? '#00F0FF' : '#A1A1AA', border: 'none', cursor: 'pointer' }}>
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
          {!isPremium && (
            <button onClick={() => { navigate('premium'); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm mt-1"
              style={{ background: 'rgba(0,240,255,0.05)', color: '#00F0FF', border: '1px solid rgba(0,240,255,0.2)', cursor: 'pointer' }}>
              <Crown className="h-4 w-4" /> Upgrade to Premium
            </button>
          )}
          <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
            style={{ background: 'transparent', color: '#A1A1AA', border: 'none', cursor: 'pointer' }}>
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome */}
          <div className="mb-12">
            <h1 className="font-bold text-3xl sm:text-4xl tracking-tight mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Welcome back, {firstName}
            </h1>
            <p style={{ color: '#A1A1AA' }}>Continue your evidence-based journey into human physiology.</p>
          </div>

          {/* Usage Stats — Free Only */}
          {!isPremium && (
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {[
                { icon: Scan, label: 'Physique Analyses', used: analysisCount, limit: 1 },
                { icon: Zap, label: 'AI Messages', used: chatCount, limit: 15 },
              ].map(({ icon: Icon, label, used, limit }) => (
                <div key={label} className="card-glow p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(0,240,255,0.1)' }}>
                      <Icon className="h-5 w-5" style={{ color: '#00F0FF' }} />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: '#A1A1AA' }}>{label}</p>
                      <p className="font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>{used} / {limit}</p>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#18181B' }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min((used / limit) * 100, 100)}%`, background: '#00F0FF' }} />
                  </div>
                  <p className="text-xs mt-2" style={{ color: '#A1A1AA' }}>Resets monthly</p>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Scan, title: 'Physique Analyzer', desc: 'Upload a photo for AI-powered structural analysis and biomechanical insights.', page: 'physique', cta: 'Start Analysis' },
              { icon: Brain, title: 'Knowledge Engine', desc: 'Ask questions about human biology, biomechanics, and training science.', page: 'knowledge', cta: 'Ask a Question' },
              { icon: Zap, title: 'Study Quizzes', desc: 'Test your knowledge with scientifically-designed questions and explanations.', page: 'quizzes', cta: 'Take a Quiz' },
            ].map(({ icon: Icon, title, desc, page, cta }) => (
              <button key={page} onClick={() => navigate(page)}
                className="card-glow p-8 group text-left w-full transition-all"
                style={{ cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,240,255,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors"
                  style={{ background: 'rgba(0,240,255,0.1)' }}>
                  <Icon className="h-7 w-7" strokeWidth={1.5} style={{ color: '#00F0FF' }} />
                </div>
                <h3 className="font-bold text-xl mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>{title}</h3>
                <p className="text-sm mb-4" style={{ color: '#A1A1AA' }}>{desc}</p>
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#00F0FF' }}>
                  {cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            ))}
          </div>

          {/* Upgrade CTA — Free Only */}
          {!isPremium && (
            <div className="card-glow p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
                style={{ background: 'radial-gradient(circle at center, rgba(0,240,255,0.12) 0%, transparent 70%)', opacity: 0.4 }} />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-5 w-5" style={{ color: '#00F0FF' }} />
                    <span className="label-overline" style={{ color: '#00F0FF' }}>Unlock Full Potential</span>
                  </div>
                  <h3 className="font-bold text-2xl mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Upgrade to Premium</h3>
                  <p style={{ color: '#A1A1AA' }}>Unlimited analyses, full detailed breakdowns, and unrestricted quiz access.</p>
                </div>
                <button className="btn-primary px-8 py-4 text-base flex-shrink-0" onClick={() => navigate('premium')}>
                  View Plans <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none' }}>
        <div className="flex items-center justify-around">
          {[
            { icon: Activity, label: 'Home', page: 'dashboard' },
            { icon: Scan, label: 'Analyzer', page: 'physique' },
            { icon: Zap, label: 'Quizzes', page: 'quizzes' },
            { icon: Brain, label: 'Knowledge', page: 'knowledge' },
          ].map(({ icon: Icon, label, page }) => (
            <button key={page} onClick={() => navigate(page)}
              className="flex flex-col items-center gap-1 transition-colors"
              style={{ color: '#A1A1AA', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Icon className="h-5 w-5" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
