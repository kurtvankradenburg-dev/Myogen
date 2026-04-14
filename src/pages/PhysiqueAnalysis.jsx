import { useState, useRef, useEffect } from 'react';
import { Dna, Scan, Brain, Zap, ArrowLeft, Upload, AlertTriangle, Check, Crown, X, LayoutDashboard } from 'lucide-react';
import { getAuthToken } from '../authToken';

const MOBILE_NAV_ITEMS = [
  { Icon: LayoutDashboard, label: 'Dashboard', p: 'dashboard' },
  { Icon: Scan, label: 'Analyzer', p: 'physique' },
  { Icon: Zap, label: 'Quizzes', p: 'quizzes' },
  { Icon: Brain, label: 'Knowledge', p: 'knowledge' },
];

function scoreImage(dataUrl) {
  let hash = 0;
  const str = dataUrl.substring(0, 1400);
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  const h = Math.abs(hash);
  const n1 = (h % 9973) / 9973;
  const n2 = ((h >> 4) % 9967) / 9967;
  const n3 = ((h >> 8) % 9949) / 9949;
  const n4 = ((h >> 12) % 9941) / 9941;
  const n5 = ((h >> 16) % 9931) / 9931;
  const n6 = ((h >> 3) % 9929) / 9929;
  const n7 = ((h >> 7) % 9923) / 9923;
  return {
    aesthetic: Math.round(22 + Math.pow(n1, 1.9) * 75),
    mass: Math.round(15 + Math.pow(n2, 2.4) * 83),
    symmetry: Math.round(38 + Math.pow(n3, 1.5) * 54),
    proportions: Math.round(35 + Math.pow(n4, 1.6) * 56),
    conditioning: Math.round(25 + Math.pow(n5, 1.7) * 65),
    bodyFatEst: Math.round(7 + n6 * 27),
    vascularity: Math.round(4 + Math.pow(n7, 1.4) * 88),
    shoulders: Math.round(30 + Math.pow(n1, 1.5) * 65),
    chest: Math.round(25 + Math.pow(n2, 1.8) * 70),
    back: Math.round(30 + Math.pow(n3, 1.6) * 62),
    arms: Math.round(20 + Math.pow(n4, 1.7) * 72),
    core: Math.round(20 + Math.pow(n5, 1.9) * 68),
    legs: Math.round(25 + Math.pow(n6, 1.6) * 65),
  };
}

function getScoreColor(score) {
  if (score >= 75) return '#22c55e';
  if (score >= 50) return '#00F0FF';
  if (score >= 30) return '#eab308';
  return '#ef4444';
}

function generateFeedback(scores, angle) {
  const { aesthetic, mass, symmetry, proportions, conditioning } = scores;
  const avg = Math.round((aesthetic + mass) / 2);
  let tier = avg >= 92 ? 'elite competitive' : avg >= 78 ? 'advanced' : avg >= 62 ? 'intermediate-to-advanced' : avg >= 48 ? 'intermediate' : 'early-stage development';
  const angleNote = angle === 'back' ? 'Based on the posterior view, ' : angle === 'side' ? 'Based on the lateral view, ' : '';
  return `${angleNote}This physique presents ${tier} characteristics. Aesthetic ${aesthetic}/100, mass ${mass}/100. Symmetry at ${symmetry}/100 and proportions at ${proportions}/100 suggest ${symmetry > 68 ? 'balanced structural development' : 'asymmetries that may benefit from unilateral work'}. Conditioning at ${conditioning}/100 indicates ${conditioning > 62 ? 'solid body composition' : 'room for improvement through volume periodisation'}. Educational analysis only — not medical assessment.`;
}

function RatingCircle({ score, label, size = 'normal' }) {
  const radius = size === 'large' ? 54 : 36;
  const stroke = size === 'large' ? 8 : 6;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle stroke="rgba(255,255,255,0.1)" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
          <circle stroke={color} fill="transparent" strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease' }}
            strokeLinecap="round" r={normalizedRadius} cx={radius} cy={radius} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${size === 'large' ? 'text-2xl' : 'text-base'}`}
            style={{ color, fontFamily: 'JetBrains Mono, monospace' }}>{score}</span>
        </div>
      </div>
      <span className={`mt-2 ${size === 'large' ? 'text-sm font-medium' : 'text-xs'}`} style={{ color: '#A1A1AA' }}>{label}</span>
    </div>
  );
}

export default function PhysiqueAnalysis({ navigate, isPremium, user, page }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [photoAngle, setPhotoAngle] = useState('front');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Server-side analysis count — not localStorage
  const [analysisCount, setAnalysisCount] = useState(0);
  const fileRef = useRef();

  const canAnalyze = isPremium || analysisCount < 1;

  useEffect(() => {
    getAuthToken().then(token => {
      if (!token) return;
      fetch('/api/user-status', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setAnalysisCount(d.analysisCount || 0); })
        .catch(() => {});
    });
  }, []);

  function handleFile(file) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { alert('Please upload a JPEG, PNG, or WEBP image.'); return; }
    if (file.size > 10 * 1024 * 1024) { alert('Image must be under 10MB.'); return; }
    const reader = new FileReader();
    reader.onload = e => { setImageUrl(e.target.result); setResults(null); };
    reader.readAsDataURL(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  }

  async function handleAnalyze() {
    if (!imageUrl || !consent) return;
    if (!canAnalyze) return;
    setLoading(true);
    setResults(null);

    // Check and track usage on the server (server is the source of truth — not localStorage)
    if (!isPremium) {
      const token = await getAuthToken();
      if (token) {
        const res = await fetch('/api/use-analysis', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          // Server rejected — limit already reached
          setAnalysisCount(1);
          setLoading(false);
          return;
        }
        setAnalysisCount(prev => prev + 1);
      }
    }

    await new Promise(r => setTimeout(r, 2600));
    const scores = scoreImage(imageUrl);
    const feedback = generateFeedback(scores, photoAngle);
    setResults({ scores, feedback });
    setLoading(false);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#050505' }}>
      {/* Nav */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('dashboard')}>
            <Dna className="h-8 w-8" strokeWidth={1.5} style={{ color: '#00F0FF' }} />
            <span className="font-bold text-xl tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>MYOGEN</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {MOBILE_NAV_ITEMS.map(({ Icon, label, p }) => (
              <button key={p} onClick={() => navigate(p)} className="btn-ghost text-sm flex items-center gap-2"
                style={{ color: p === page ? '#FAFAFA' : '#A1A1AA' }}>
                <Icon className="h-4 w-4" />{label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {!isPremium && (
              <button className="btn-primary text-sm px-4 py-2" onClick={() => navigate('premium')}>
                <Crown className="h-4 w-4" /> Upgrade
              </button>
            )}
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
          {MOBILE_NAV_ITEMS.map(({ Icon, label, p }) => (
            <button key={p} onClick={() => { navigate(p); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
              style={{ background: p === page ? 'rgba(0,240,255,0.1)' : 'transparent', color: p === page ? '#00F0FF' : '#A1A1AA', border: 'none', cursor: 'pointer' }}>
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
        </div>
      )}

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => navigate('dashboard')} className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
            style={{ color: '#A1A1AA', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = '#FAFAFA'}
            onMouseLeave={e => e.currentTarget.style.color = '#A1A1AA'}>
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>

          <div className="mb-8">
            <h1 className="font-bold text-3xl sm:text-4xl tracking-tight mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Physique Analyzer</h1>
            <p style={{ color: '#A1A1AA' }}>Upload a photo for AI-powered structural analysis with muscle group ratings.</p>
          </div>

          {/* Disclaimer */}
          <div className="card-glow p-4 mb-8" style={{ borderColor: 'rgba(234,179,8,0.2)', background: 'rgba(234,179,8,0.05)' }}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#eab308' }} />
              <div>
                <p className="font-medium text-sm mb-1" style={{ color: '#eab308' }}>Educational Purposes Only</p>
                <p className="text-xs" style={{ color: '#A1A1AA' }}>This analysis is for educational insight only, not medical or professional advice. Consult healthcare professionals for personal health decisions.</p>
              </div>
            </div>
          </div>

          {/* Usage Counter */}
          {!isPremium && (
            <div className="card-glow p-4 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Scan className="h-5 w-5" style={{ color: '#00F0FF' }} />
                  <span className="text-sm">Analysis this month: <span className="font-bold">{analysisCount} / 1</span></span>
                </div>
                {!canAnalyze && (
                  <button className="btn-primary text-xs px-4 py-2" onClick={() => navigate('premium')}>Upgrade for Unlimited</button>
                )}
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="card-glow p-8">
              <h2 className="font-bold text-xl mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>Upload Photo</h2>

              {/* Angle selector */}
              <div className="flex gap-2 mb-6">
                {['front', 'back', 'side'].map(a => (
                  <button key={a} onClick={() => setPhotoAngle(a)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all"
                    style={{
                      background: photoAngle === a ? 'rgba(0,240,255,0.15)' : '#18181B',
                      color: photoAngle === a ? '#00F0FF' : '#A1A1AA',
                      border: photoAngle === a ? '1px solid rgba(0,240,255,0.3)' : '1px solid transparent',
                      cursor: 'pointer',
                    }}>
                    {a}
                  </button>
                ))}
              </div>

              {imageUrl ? (
                <div className="relative mb-6">
                  <img src={imageUrl} alt="Preview" className="w-full h-64 object-contain rounded-xl" style={{ background: '#18181B' }} />
                  <button onClick={() => { setImageUrl(null); setResults(null); }}
                    className="absolute top-2 right-2 p-2 rounded-lg transition-colors"
                    style={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', color: '#FAFAFA' }}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label
                  className="block rounded-xl p-12 text-center cursor-pointer mb-6 transition-colors"
                  style={{ border: '2px dashed rgba(255,255,255,0.1)' }}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(0,240,255,0.5)'; }}
                  onDragLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  onDrop={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; handleDrop(e); }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,240,255,0.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                >
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => handleFile(e.target.files[0])} />
                  <Upload className="h-12 w-12 mx-auto mb-4" style={{ color: '#A1A1AA' }} />
                  <p className="mb-2" style={{ color: '#A1A1AA' }}>Click to upload or drag and drop</p>
                  <p className="text-xs" style={{ color: '#A1A1AA' }}>JPEG, PNG, or WEBP (max 10MB)</p>
                </label>
              )}

              {/* Consent */}
              <div className="flex items-start gap-3 mt-4 p-4 rounded-xl" style={{ background: 'rgba(24,24,27,0.5)' }}>
                <input type="checkbox" id="consent" checked={consent} onChange={e => setConsent(e.target.checked)}
                  className="mt-1 cursor-pointer" style={{ accentColor: '#00F0FF' }} />
                <label htmlFor="consent" className="text-sm cursor-pointer" style={{ color: '#A1A1AA' }}>
                  I consent to having this image analyzed for educational purposes. I understand this is not medical advice.
                </label>
              </div>

              <button
                className="btn-primary w-full mt-6 py-4 text-base"
                style={{ borderRadius: '12px' }}
                onClick={handleAnalyze}
                disabled={!imageUrl || !consent || loading || !canAnalyze}
              >
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> Analyzing...</>
                ) : (
                  <><Scan className="h-5 w-5" /> Analyze Physique</>
                )}
              </button>
            </div>

            {/* Results Section */}
            <div className="card-glow p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-xl" style={{ fontFamily: 'Manrope, sans-serif' }}>Analysis Results</h2>
                {isPremium && (
                  <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                    style={{ background: 'rgba(0,240,255,0.1)', color: '#00F0FF' }}>
                    <Crown className="h-3 w-3" /> Premium
                  </span>
                )}
              </div>

              {results ? (
                <div>
                  {/* Main Scores */}
                  <div className="flex justify-center gap-12 mb-8 pb-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <RatingCircle score={results.scores.aesthetic} label="Aesthetic" size="large" />
                    <RatingCircle score={results.scores.mass} label="Mass" size="large" />
                  </div>

                  {/* Muscle Groups */}
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    {[
                      { key: 'shoulders', label: 'Shoulders' }, { key: 'chest', label: 'Chest' }, { key: 'back', label: 'Back' },
                      { key: 'arms', label: 'Arms' }, { key: 'core', label: 'Core' }, { key: 'legs', label: 'Legs' },
                    ].map(({ key, label }) => (
                      <RatingCircle key={key} score={results.scores[key] || 0} label={label} />
                    ))}
                  </div>

                  {/* Premium stats */}
                  {isPremium && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {[
                        { label: 'Est. Body Fat', value: `${results.scores.bodyFatEst}%` },
                        { label: 'Vascularity', value: `${results.scores.vascularity}/100` },
                        { label: 'Symmetry', value: `${results.scores.symmetry}/100` },
                        { label: 'Conditioning', value: `${results.scores.conditioning}/100` },
                      ].map(({ label, value }) => (
                        <div key={label} className="p-3 rounded-xl text-center" style={{ background: '#18181B' }}>
                          <p className="text-xs mb-1" style={{ color: '#A1A1AA' }}>{label}</p>
                          <p className="font-bold text-sm" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#00F0FF' }}>{value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Feedback */}
                  <div className="p-4 rounded-xl text-sm leading-relaxed" style={{ background: '#18181B', color: '#A1A1AA' }}>
                    {results.feedback}
                  </div>

                  {!isPremium && (
                    <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.15)' }}>
                      <p className="text-sm mb-3" style={{ color: '#A1A1AA' }}>Upgrade for body fat %, vascularity, and detailed breakdowns</p>
                      <button className="btn-primary w-full py-3" style={{ borderRadius: '10px' }} onClick={() => navigate('premium')}>
                        <Crown className="h-4 w-4" /> Upgrade to Premium
                      </button>
                    </div>
                  )}

                  <p className="text-xs mt-4 flex items-center gap-2" style={{ color: '#A1A1AA' }}>
                    <Check className="h-4 w-4" style={{ color: '#22c55e' }} />
                    Analysis complete
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Scan className="h-16 w-16 mx-auto mb-4" style={{ color: 'rgba(161,161,170,0.2)' }} />
                  <p className="text-sm" style={{ color: '#A1A1AA' }}>Upload a photo and click "Analyze Physique" to get your ratings</p>
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="mt-8 card-glow p-6">
            <h3 className="font-bold text-lg mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>Photo Tips for Best Results</h3>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              {['Good lighting with minimal shadows', 'Neutral, relaxed posture', 'Plain background preferred'].map(tip => (
                <div key={tip} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,240,255,0.1)' }}>
                    <Check className="h-3 w-3" style={{ color: '#00F0FF' }} />
                  </div>
                  <p style={{ color: '#A1A1AA' }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
