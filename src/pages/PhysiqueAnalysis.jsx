import { useState, useRef, useEffect } from 'react';
import { Dna, Scan, Brain, Zap, ArrowLeft, Upload, AlertTriangle, Check, Crown, X, LayoutDashboard, Send, Lock } from 'lucide-react';
import { getAuthToken } from '../authToken';

const MOBILE_NAV_ITEMS = [
  { Icon: LayoutDashboard, label: 'Dashboard', p: 'dashboard' },
  { Icon: Scan, label: 'Analyzer', p: 'physique' },
  { Icon: Zap, label: 'Quizzes', p: 'quizzes' },
  { Icon: Brain, label: 'Knowledge', p: 'knowledge' },
];

const ANGLES = ['front', 'back', 'side', 'all'];

function getScoreColor(score) {
  if (score >= 75) return '#22c55e';
  if (score >= 50) return '#00F0FF';
  if (score >= 30) return '#eab308';
  return '#ef4444';
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

// Resize image client-side before upload to stay within server limits
function resizeImageForUpload(dataUrl) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const MAX = 1024;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        const ratio = Math.min(MAX / width, MAX / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// Single image slot for the 'all' mode
function ImageSlot({ label, image, onFile, onRemove }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-center capitalize" style={{ color: '#A1A1AA' }}>{label}</p>
      {image ? (
        <div className="relative">
          <img src={image} alt={label} className="w-full h-32 object-contain rounded-xl" style={{ background: '#18181B' }} />
          <button onClick={onRemove}
            className="absolute top-1 right-1 p-1 rounded-lg"
            style={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', color: '#FAFAFA' }}>
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <label className="block rounded-xl p-4 text-center cursor-pointer transition-colors h-32 flex flex-col items-center justify-center"
          style={{ border: '2px dashed rgba(255,255,255,0.1)' }}
          onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(0,240,255,0.5)'; }}
          onDragLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; onFile(e.dataTransfer.files[0]); }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,240,255,0.4)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => onFile(e.target.files[0])} />
          <Upload className="h-6 w-6 mb-1" style={{ color: '#A1A1AA' }} />
          <p className="text-xs" style={{ color: '#A1A1AA' }}>Upload</p>
        </label>
      )}
    </div>
  );
}

export default function PhysiqueAnalysis({ navigate, isPremium, user, page }) {
  const [singleImage, setSingleImage] = useState(null);
  const [multiImages, setMultiImages] = useState({ front: null, back: null, side: null });
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [photoAngle, setPhotoAngle] = useState('front');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [analysisCount, setAnalysisCount] = useState(0);

  // Premium Q&A chat state
  const [qaMessages, setQaMessages] = useState([]);
  const [qaInput, setQaInput] = useState('');
  const [qaLoading, setQaLoading] = useState(false);
  const qaEndRef = useRef();
  const fileRef = useRef();

  const isAllMode = photoAngle === 'all';
  const hasImages = isAllMode
    ? (multiImages.front && multiImages.back && multiImages.side)
    : singleImage !== null;
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

  useEffect(() => {
    qaEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [qaMessages, qaLoading]);

  function validateFile(file) {
    if (!file) return false;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please upload a JPEG, PNG, or WEBP image.');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be under 10MB.');
      return false;
    }
    return true;
  }

  function handleSingleFile(file) {
    if (!validateFile(file)) return;
    const reader = new FileReader();
    reader.onload = e => { setSingleImage(e.target.result); setResults(null); setError(''); setQaMessages([]); };
    reader.readAsDataURL(file);
  }

  function handleMultiFile(angleKey, file) {
    if (!validateFile(file)) return;
    const reader = new FileReader();
    reader.onload = e => {
      setMultiImages(prev => ({ ...prev, [angleKey]: e.target.result }));
      setResults(null);
      setError('');
      setQaMessages([]);
    };
    reader.readAsDataURL(file);
  }

  async function handleAnalyze() {
    if (!hasImages || !consent || loading || !canAnalyze) return;
    setLoading(true);
    setResults(null);
    setError('');
    setQaMessages([]);

    try {
      // Resize images before upload
      let imagesToSend;
      if (isAllMode) {
        imagesToSend = await Promise.all([
          resizeImageForUpload(multiImages.front),
          resizeImageForUpload(multiImages.back),
          resizeImageForUpload(multiImages.side),
        ]);
      } else {
        imagesToSend = [await resizeImageForUpload(singleImage)];
      }

      const token = await getAuthToken();
      const res = await fetch('/api/analyze-physique', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ images: imagesToSend, angle: photoAngle }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Server returned an unexpected response. Please try again.');
      }

      if (res.status === 403) {
        setAnalysisCount(1);
        setError(data.error || 'Monthly limit reached.');
        return;
      }
      if (!res.ok) throw new Error(data.error || `Analysis failed (${res.status})`);

      setResults(data.scores);
      if (!isPremium) setAnalysisCount(prev => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function sendQaMessage() {
    if (!qaInput.trim() || qaLoading || !results) return;
    const msg = qaInput.trim();
    const userMsg = { role: 'user', content: msg };
    setQaMessages(prev => [...prev, userMsg]);
    setQaInput('');
    setQaLoading(true);

    const scoresContext = `Physique analysis scores — Aesthetic: ${results.aesthetic}/100, Mass: ${results.mass}/100, Symmetry: ${results.symmetry}/100, Proportions: ${results.proportions}/100, Conditioning: ${results.conditioning}/100, Est. Body Fat: ${results.bodyFatEst}%, Vascularity: ${results.vascularity}/100, Shoulders: ${results.shoulders}/100, Chest: ${results.chest}/100, Back: ${results.back}/100, Arms: ${results.arms}/100, Core: ${results.core}/100, Legs: ${results.legs}/100.`;
    const systemPrompt = `You are Myogen's physique analysis AI. The user's physique was just analyzed with these results: ${scoresContext}\n\nAnswer their questions about their physique with expert, science-based advice. Reference specific scores when relevant. Be direct, actionable, and educational. Not medical advice.`;

    try {
      const token = await getAuthToken();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: [...qaMessages, userMsg].map(m => ({ role: m.role, content: m.content })),
          systemPrompt,
          maxTokens: 600,
        }),
      });

      let data;
      try { data = await res.json(); } catch { throw new Error('Unexpected server response.'); }

      if (!res.ok) throw new Error(data.error || 'Chat failed');
      setQaMessages(prev => [...prev, { role: 'assistant', content: data.content || '' }]);
    } catch (err) {
      setQaMessages(prev => [...prev, { role: 'assistant', content: `⚠ ${err.message}` }]);
    } finally {
      setQaLoading(false);
    }
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
            <p style={{ color: '#A1A1AA' }}>AI-powered physique analysis using real computer vision — no guesswork.</p>
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
                  <span className="text-sm">Analyses this month: <span className="font-bold">{analysisCount} / 1</span></span>
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
              <div className="flex gap-2 mb-6 flex-wrap">
                {ANGLES.map(a => (
                  <button key={a} onClick={() => { setPhotoAngle(a); setSingleImage(null); setMultiImages({ front: null, back: null, side: null }); setResults(null); setError(''); setQaMessages([]); }}
                    className="flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all"
                    style={{
                      background: photoAngle === a ? 'rgba(0,240,255,0.15)' : '#18181B',
                      color: photoAngle === a ? '#00F0FF' : '#A1A1AA',
                      border: photoAngle === a ? '1px solid rgba(0,240,255,0.3)' : '1px solid transparent',
                      cursor: 'pointer',
                      minWidth: '60px',
                    }}>
                    {a === 'all' ? 'All Views' : a}
                  </button>
                ))}
              </div>

              {isAllMode ? (
                /* 3-slot upload for 'all' mode */
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {(['front', 'back', 'side']).map(key => (
                    <ImageSlot
                      key={key}
                      label={key}
                      image={multiImages[key]}
                      onFile={f => handleMultiFile(key, f)}
                      onRemove={() => setMultiImages(prev => ({ ...prev, [key]: null }))}
                    />
                  ))}
                </div>
              ) : (
                /* Single upload */
                singleImage ? (
                  <div className="relative mb-6">
                    <img src={singleImage} alt="Preview" className="w-full h-64 object-contain rounded-xl" style={{ background: '#18181B' }} />
                    <button onClick={() => { setSingleImage(null); setResults(null); setError(''); setQaMessages([]); }}
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
                    onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; handleSingleFile(e.dataTransfer.files[0]); }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,240,255,0.4)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  >
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => handleSingleFile(e.target.files[0])} />
                    <Upload className="h-12 w-12 mx-auto mb-4" style={{ color: '#A1A1AA' }} />
                    <p className="mb-2" style={{ color: '#A1A1AA' }}>Click to upload or drag and drop</p>
                    <p className="text-xs" style={{ color: '#A1A1AA' }}>JPEG, PNG, or WEBP (max 10MB)</p>
                  </label>
                )
              )}

              {isAllMode && (
                <p className="text-xs mb-4 text-center" style={{ color: '#A1A1AA' }}>
                  Upload all 3 views for a comprehensive analysis
                </p>
              )}

              {/* Consent */}
              <div className="flex items-start gap-3 mt-4 p-4 rounded-xl" style={{ background: 'rgba(24,24,27,0.5)' }}>
                <input type="checkbox" id="consent" checked={consent} onChange={e => setConsent(e.target.checked)}
                  className="mt-1 cursor-pointer" style={{ accentColor: '#00F0FF' }} />
                <label htmlFor="consent" className="text-sm cursor-pointer" style={{ color: '#A1A1AA' }}>
                  I consent to having this image analyzed by AI for educational purposes. I understand this is not medical advice.
                </label>
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                  {error}
                </div>
              )}

              <button
                className="btn-primary w-full mt-6 py-4 text-base"
                style={{ borderRadius: '12px' }}
                onClick={handleAnalyze}
                disabled={!hasImages || !consent || loading || !canAnalyze}
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
                  {isPremium ? (
                    <>
                      {/* Premium: Mass + Aesthetic + Overall */}
                      <div className="flex justify-center gap-8 mb-8 pb-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <RatingCircle score={results.mass} label="Mass" size="large" />
                        <RatingCircle score={results.aesthetic} label="Aesthetic" size="large" />
                        <RatingCircle score={results.overall} label="Overall" size="large" />
                      </div>

                      {/* Muscle Groups */}
                      <div className="grid grid-cols-3 gap-6 mb-8">
                        {[
                          { key: 'shoulders', label: 'Shoulders' }, { key: 'chest', label: 'Chest' }, { key: 'back', label: 'Back' },
                          { key: 'arms', label: 'Arms' }, { key: 'core', label: 'Core' }, { key: 'legs', label: 'Legs' },
                        ].map(({ key, label }) => (
                          <RatingCircle key={key} score={results[key] || 0} label={label} />
                        ))}
                      </div>

                      {/* Stats row */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {[
                          { label: 'Est. Body Fat', value: `${results.bodyFatEst}%` },
                          { label: 'Vascularity', value: `${results.vascularity}/100` },
                          { label: 'Symmetry', value: `${results.symmetry}/100` },
                          { label: 'Conditioning', value: `${results.conditioning}/100` },
                        ].map(({ label, value }) => (
                          <div key={label} className="p-3 rounded-xl text-center" style={{ background: '#18181B' }}>
                            <p className="text-xs mb-1" style={{ color: '#A1A1AA' }}>{label}</p>
                            <p className="font-bold text-sm" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#00F0FF' }}>{value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Key Strengths */}
                      {results.keyStrengths && (
                        <div className="p-4 rounded-xl mb-3" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                          <p className="text-xs font-semibold mb-1" style={{ color: '#22c55e' }}>Key Strengths</p>
                          <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>{results.keyStrengths}</p>
                        </div>
                      )}

                      {/* Key Weaknesses */}
                      {results.keyWeaknesses && (
                        <div className="p-4 rounded-xl mb-3" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                          <p className="text-xs font-semibold mb-1" style={{ color: '#ef4444' }}>Key Weaknesses</p>
                          <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>{results.keyWeaknesses}</p>
                        </div>
                      )}

                      {/* Physical Maturity */}
                      {results.physicalMaturity && (
                        <div className="p-4 rounded-xl mb-3" style={{ background: 'rgba(0,240,255,0.04)', border: '1px solid rgba(0,240,255,0.12)' }}>
                          <p className="text-xs font-semibold mb-1" style={{ color: '#00F0FF' }}>Physical Maturity</p>
                          <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>{results.physicalMaturity}</p>
                        </div>
                      )}

                      {/* Expert Feedback */}
                      {results.feedback && (
                        <div className="p-4 rounded-xl mb-4" style={{ background: '#18181B', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <p className="text-xs font-semibold mb-1" style={{ color: '#00F0FF' }}>Expert Analysis</p>
                          <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>{results.feedback}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Free: Overall only */}
                      <div className="flex justify-center mb-8 pb-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <RatingCircle score={results.overall} label="Overall" size="large" />
                      </div>

                      {/* Upgrade prompt */}
                      <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(0,240,255,0.04)', border: '1px solid rgba(0,240,255,0.12)' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <Lock className="h-4 w-4" style={{ color: '#00F0FF' }} />
                          <p className="text-sm font-medium" style={{ color: '#00F0FF' }}>Full Analysis Locked</p>
                        </div>
                        <p className="text-xs mb-3" style={{ color: '#A1A1AA' }}>
                          Upgrade to Premium to unlock Mass, Aesthetic, and Overall ratings, individual muscle group scores, body fat %, vascularity, key strengths and weaknesses, expert feedback, and follow-up Q&A.
                        </p>
                        <button className="btn-primary w-full py-3" style={{ borderRadius: '10px' }} onClick={() => navigate('premium')}>
                          <Crown className="h-4 w-4" /> Upgrade to Premium
                        </button>
                      </div>
                    </>
                  )}

                  {results.note && (
                    <div className="p-3 rounded-xl mb-3 text-sm" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)', color: '#eab308' }}>
                      {results.note}
                    </div>
                  )}
                  <p className="text-xs flex items-center gap-2" style={{ color: '#A1A1AA' }}>
                    <Check className="h-4 w-4" style={{ color: '#22c55e' }} />
                    AI analysis complete
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Scan className="h-16 w-16 mx-auto mb-4" style={{ color: 'rgba(161,161,170,0.2)' }} />
                  <p className="text-sm" style={{ color: '#A1A1AA' }}>Upload a photo and click "Analyze Physique" to get your AI ratings</p>
                </div>
              )}
            </div>
          </div>

          {/* Premium Q&A — shown after analysis, premium only */}
          {results && isPremium && (
            <div className="mt-8 card-glow p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="h-5 w-5" style={{ color: '#00F0FF' }} />
                <h3 className="font-bold text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>Ask About Your Physique</h3>
                <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                  style={{ background: 'rgba(0,240,255,0.1)', color: '#00F0FF' }}>
                  <Crown className="h-3 w-3" /> Premium
                </span>
              </div>
              <p className="text-sm mb-4" style={{ color: '#A1A1AA' }}>Ask the AI specific questions about your physique, weak points, and how to improve.</p>

              {/* Messages */}
              {qaMessages.length > 0 && (
                <div className="mb-4 space-y-4 max-h-72 overflow-y-auto">
                  {qaMessages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="max-w-2xl rounded-xl px-4 py-3 text-sm leading-relaxed"
                        style={{
                          background: msg.role === 'user' ? 'rgba(0,240,255,0.1)' : '#18181B',
                          border: msg.role === 'user' ? '1px solid rgba(0,240,255,0.2)' : '1px solid rgba(255,255,255,0.08)',
                          color: '#FAFAFA',
                          whiteSpace: 'pre-wrap',
                        }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {qaLoading && (
                    <div className="flex gap-2 items-center px-4 py-3 rounded-xl w-fit"
                      style={{ background: '#18181B', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                          style={{ background: '#00F0FF', animationDelay: `${i * 150}ms` }} />
                      ))}
                    </div>
                  )}
                  <div ref={qaEndRef} />
                </div>
              )}

              {/* Input */}
              <div className="flex gap-3 items-end">
                <textarea
                  value={qaInput}
                  onChange={e => setQaInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendQaMessage(); } }}
                  placeholder="e.g. How do I improve my chest? What should I prioritize?"
                  className="flex-1 input-style resize-none"
                  style={{ minHeight: '48px', maxHeight: '120px', paddingTop: '12px', paddingBottom: '12px' }}
                  rows={1}
                  disabled={qaLoading}
                />
                <button
                  onClick={sendQaMessage}
                  disabled={!qaInput.trim() || qaLoading}
                  className="btn-primary p-3 flex-shrink-0"
                  style={{ borderRadius: '12px' }}>
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

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
