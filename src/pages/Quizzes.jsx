import { useState } from 'react';
import { Dna, Scan, Brain, Zap, ArrowLeft, Crown, Check, X, RefreshCw, ChevronRight, Trophy, LayoutDashboard } from 'lucide-react';
import { quizCategories, quizQuestions } from '../data/quizzes';

const QUIZ_NAV_ITEMS = [
  { Icon: LayoutDashboard, label: 'Dashboard', p: 'dashboard' },
  { Icon: Scan, label: 'Analyzer', p: 'physique' },
  { Icon: Zap, label: 'Quizzes', p: 'quizzes' },
  { Icon: Brain, label: 'Knowledge', p: 'knowledge' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Track used question IDs in sessionStorage so questions never repeat in a session
function getUsedIds() {
  try { return new Set(JSON.parse(sessionStorage.getItem('myogen_used_qids') || '[]')); } catch { return new Set(); }
}
function addUsedIds(ids) {
  const all = getUsedIds();
  ids.forEach(id => all.add(id));
  // If we've used all questions, reset (full cycle complete)
  if (all.size >= quizQuestions.length) {
    sessionStorage.removeItem('myogen_used_qids');
  } else {
    sessionStorage.setItem('myogen_used_qids', JSON.stringify([...all]));
  }
}

function pickFreshQuestions(pool, count) {
  const used = getUsedIds();
  const fresh = pool.filter(q => !used.has(q.id));
  // If not enough fresh questions, use the pool minus already-seen-this-batch
  const source = fresh.length >= count ? fresh : pool;
  return shuffle(source).slice(0, Math.min(count, source.length));
}

function QuizMode({ questions, onFinish }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [results, setResults] = useState([]);

  const q = questions[idx];
  const letters = ['A', 'B', 'C', 'D'];

  function selectAnswer(optIdx) {
    if (answered) return;
    setSelected(optIdx);
    setAnswered(true);
    if (optIdx === q.correct) setScore(s => s + 1);
    setResults(prev => [...prev, { question: q.question, correct: optIdx === q.correct, selected: optIdx, correctAnswer: q.correct, explanation: q.explanation, options: q.options }]);
  }

  function nextQuestion() {
    if (idx + 1 >= questions.length) { setFinished(true); return; }
    setIdx(i => i + 1);
    setSelected(null);
    setAnswered(false);
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="card-glow p-8">
        <div className="text-center mb-8">
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center`}
            style={{ background: pct >= 70 ? 'rgba(34,197,94,0.1)' : pct >= 50 ? 'rgba(234,179,8,0.1)' : 'rgba(255,59,48,0.1)' }}>
            <Trophy className="h-10 w-10" style={{ color: pct >= 70 ? '#22c55e' : pct >= 50 ? '#eab308' : '#FF3B30' }} />
          </div>
          <h2 className="font-bold text-3xl mb-2" style={{ fontFamily: 'Manrope, sans-serif', color: pct >= 70 ? '#22c55e' : pct >= 50 ? '#eab308' : '#FF3B30' }}>
            {pct}%
          </h2>
          <p style={{ color: '#A1A1AA' }}>{score} out of {questions.length} correct</p>
        </div>

        <div className="space-y-4 mb-8 max-h-96 overflow-y-auto">
          {results.map((r, i) => (
            <div key={i} className="p-4 rounded-xl"
              style={{ background: r.correct ? 'rgba(34,197,94,0.05)' : 'rgba(255,59,48,0.05)', border: `1px solid ${r.correct ? 'rgba(34,197,94,0.2)' : 'rgba(255,59,48,0.2)'}` }}>
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0`}
                  style={{ background: r.correct ? '#22c55e' : '#FF3B30' }}>
                  {r.correct ? <Check className="h-4 w-4 text-white" /> : <X className="h-4 w-4 text-white" />}
                </div>
                <div className="text-sm">
                  <p className="font-medium mb-1">Q{i + 1}: {r.question}</p>
                  <p className="text-xs mb-1" style={{ color: '#A1A1AA' }}>
                    Your answer: <span style={{ color: r.correct ? '#22c55e' : '#FF3B30' }}>{r.options[r.selected]}</span>
                  </p>
                  {!r.correct && <p className="text-xs mb-1" style={{ color: '#A1A1AA' }}>Correct: <span style={{ color: '#22c55e' }}>{r.options[r.correctAnswer]}</span></p>}
                  {r.explanation && <p className="text-xs p-2 rounded-lg mt-2" style={{ color: '#A1A1AA', background: '#18181B' }}>{r.explanation}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button className="btn-primary flex-1 py-4" style={{ borderRadius: '12px' }} onClick={() => onFinish(false)}>
            <RefreshCw className="h-5 w-5" /> Try Again
          </button>
          <button className="btn-outline flex-1 py-4" onClick={() => onFinish(true)}>Back to Categories</button>
        </div>
      </div>
    );
  }

  const progress = (idx / questions.length) * 100;

  return (
    <div className="card-glow p-8">
      {/* Progress bar */}
      <div className="w-full h-1 rounded-full mb-6 overflow-hidden" style={{ background: '#18181B' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: '#00F0FF' }} />
      </div>

      <div className="flex items-center justify-between mb-6">
        <span className="text-sm" style={{ color: '#A1A1AA' }}>Question {idx + 1} of {questions.length}</span>
        <span className="text-sm font-medium" style={{ color: '#00F0FF', fontFamily: 'JetBrains Mono, monospace' }}>Score: {score}</span>
      </div>

      <div className="p-4 rounded-xl mb-6" style={{ background: '#18181B' }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs px-2 py-0.5 rounded-full capitalize"
            style={{ background: '#27272A', color: '#A1A1AA' }}>{q.difficulty}</span>
          <span className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: '#27272A', color: '#A1A1AA' }}>{q.category?.replace(/_/g, ' ')}</span>
        </div>
        <p className="font-medium">{q.question}</p>
      </div>

      <div className="space-y-3 mb-6">
        {q.options.map((opt, i) => {
          let bg = '#0A0A0A', borderColor = 'rgba(255,255,255,0.1)', color = '#FAFAFA';
          if (answered) {
            if (i === q.correct) { bg = 'rgba(34,197,94,0.1)'; borderColor = 'rgba(34,197,94,0.4)'; color = '#22c55e'; }
            else if (i === selected) { bg = 'rgba(255,59,48,0.1)'; borderColor = 'rgba(255,59,48,0.4)'; color = '#FF3B30'; }
          }
          return (
            <button key={i} onClick={() => selectAnswer(i)} disabled={answered}
              className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
              style={{ background: bg, border: `1px solid ${borderColor}`, color, cursor: answered ? 'default' : 'pointer' }}
              onMouseEnter={e => { if (!answered) e.currentTarget.style.borderColor = 'rgba(0,240,255,0.4)'; }}
              onMouseLeave={e => { if (!answered) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
              <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: '#27272A' }}>{letters[i]}</span>
              <span className="text-sm">{opt}</span>
            </button>
          );
        })}
      </div>

      {answered && q.explanation && (
        <div className="p-4 rounded-xl mb-4 text-sm" style={{ background: '#18181B', color: '#A1A1AA' }}>
          <span className="font-medium" style={{ color: selected === q.correct ? '#22c55e' : '#FF3B30' }}>
            {selected === q.correct ? '✓ Correct! ' : '✗ Incorrect. '}
          </span>
          {q.explanation}
        </div>
      )}

      {answered && (
        <button className="btn-primary w-full py-4" style={{ borderRadius: '12px' }} onClick={nextQuestion}>
          {idx + 1 >= questions.length ? 'See Results' : 'Next Question'}
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export default function Quizzes({ navigate, isPremium, user, page }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [quizActive, setQuizActive] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function startQuiz() {
    if (!isPremium) { navigate('premium'); return; }
    let pool = quizQuestions;
    if (selectedCategory !== 'all') pool = pool.filter(q => q.category === selectedCategory);
    if (selectedDifficulty !== 'all') pool = pool.filter(q => q.difficulty === selectedDifficulty);
    if (pool.length === 0) { alert('No questions found for this combination.'); return; }
    const picked = pickFreshQuestions(pool, 10);
    addUsedIds(picked.map(q => q.id));
    setActiveQuestions(picked);
    setQuizActive(true);
  }

  function handleCategoryClick(catId) {
    if (!isPremium) { navigate('premium'); return; }
    const pool = quizQuestions.filter(q => q.category === catId);
    const picked = pickFreshQuestions(pool, 10);
    addUsedIds(picked.map(q => q.id));
    setActiveQuestions(picked);
    setQuizActive(true);
  }

  function finishQuiz(backToCategories) {
    setQuizActive(false);
    if (!backToCategories) startQuiz();
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
            {QUIZ_NAV_ITEMS.map(({ Icon, label, p }) => (
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
          {QUIZ_NAV_ITEMS.map(({ Icon, label, p }) => (
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
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate('dashboard')} className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
            style={{ color: '#A1A1AA', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = '#FAFAFA'}
            onMouseLeave={e => e.currentTarget.style.color = '#A1A1AA'}>
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>

          <div className="mb-8">
            <h1 className="font-bold text-3xl sm:text-4xl tracking-tight mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Study Quizzes</h1>
            <p style={{ color: '#A1A1AA' }}>Test and reinforce your knowledge of human biology and biomechanics.</p>
          </div>

          {!isPremium && (
            <div className="card-glow p-6 mb-8 flex items-start gap-4">
              <Crown className="h-8 w-8 flex-shrink-0 mt-1" style={{ color: '#00F0FF' }} />
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>Premium Feature</h3>
                <p className="text-sm mb-4" style={{ color: '#A1A1AA' }}>Study Quizzes are exclusively available for Premium members. Upgrade to access unlimited quizzes.</p>
                <button className="btn-primary text-sm px-6 py-2" onClick={() => navigate('premium')}>
                  Upgrade to Premium
                </button>
              </div>
            </div>
          )}

          {quizActive ? (
            <QuizMode questions={activeQuestions} onFinish={finishQuiz} />
          ) : (
            <>
              {/* Quiz Setup */}
              <div className="card-glow p-8 mb-8">
                <h2 className="font-bold text-xl mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>Start a New Quiz</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                      disabled={!isPremium} className="input-style"
                      style={{ cursor: isPremium ? 'pointer' : 'not-allowed', opacity: isPremium ? 1 : 0.5 }}>
                      <option value="all">All Categories</option>
                      {quizCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Difficulty</label>
                    <select value={selectedDifficulty} onChange={e => setSelectedDifficulty(e.target.value)}
                      disabled={!isPremium} className="input-style"
                      style={{ cursor: isPremium ? 'pointer' : 'not-allowed', opacity: isPremium ? 1 : 0.5 }}>
                      <option value="all">All Difficulties</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <button className="btn-primary w-full py-4 text-base" style={{ borderRadius: '12px' }} onClick={startQuiz}>
                  <Zap className="h-5 w-5" />
                  {isPremium ? 'Start Quiz' : 'Premium Only — Upgrade to Start'}
                </button>
              </div>

              {/* Categories Grid */}
              <div>
                <h3 className="font-bold text-lg mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>Browse Categories</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {quizCategories.map(cat => (
                    <div key={cat.id} onClick={() => handleCategoryClick(cat.id)}
                      className="card-glow p-4 cursor-pointer transition-all relative"
                      style={{ opacity: isPremium ? 1 : 0.6 }}
                      onMouseEnter={e => { if (isPremium) e.currentTarget.style.borderColor = 'rgba(0,240,255,0.3)'; }}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                      {!isPremium && (
                        <div className="absolute top-3 right-3">
                          <Crown className="h-4 w-4" style={{ color: '#00F0FF' }} />
                        </div>
                      )}
                      <div className="text-2xl mb-2">{cat.icon}</div>
                      <h4 className="font-semibold text-sm mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>{cat.name}</h4>
                      <p className="text-xs" style={{ color: '#A1A1AA' }}>{cat.description}</p>
                      <p className="text-xs mt-2" style={{ color: '#A1A1AA' }}>
                        {quizQuestions.filter(q => q.category === cat.id).length} questions
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
