import { useState, useRef, useEffect } from 'react';
import { Dna, Scan, Brain, Zap, Crown, Send, Plus, LayoutDashboard, User } from 'lucide-react';
import { getAuthToken } from '../authToken';
import MyogenLogo from '../components/MyogenLogo';

const FREE_LIMIT = 15;

function loadChats() {
  try {
    const saved = localStorage.getItem('myogen_chats');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [{ id: 1, title: 'New chat', messages: [] }];
}

const SYSTEM_PROMPT = `You are Myogen's Scientific Knowledge Engine — an elite, multidisciplinary expert combining the knowledge of a senior biomedical researcher, PhD biomechanics specialist, neuromuscular scientist, and evidence-based strength coach.

ALWAYS be precise and scientific. Never use hashtags. Never claim to provide medical advice. Always educational.

FORMATTING: Always write in clear paragraphs separated by blank lines. Never use bullet lists unless comparing multiple items. Each paragraph should cover one idea completely. Do NOT list sources unless the user explicitly asks.

LONG ANSWER MODE (default): Comprehensive explanation with all relevant mechanisms, physiology, and biomechanics. Minimum 2 paragraphs.

SHORT ANSWER MODE: Give ONE direct, precise answer followed by ONE primary mechanistic reason. Maximum 3 sentences in a single paragraph.

TIME UNDER TENSION (TUT): You have deep expertise in TUT as a training variable. Key knowledge: TUT refers to the total duration a muscle remains under load during a set. Optimal hypertrophy TUT is typically 30-70 seconds per set. The eccentric phase (muscle lengthening) at 3-5 seconds produces the greatest mechanical tension and muscle damage — it is biomechanically the most potent phase for hypertrophy. The concentric phase at 1-2 seconds preserves motor unit recruitment rate. Longer TUT increases metabolic stress (lactate accumulation, cell swelling) and growth factor release. The three primary hypertrophy mechanisms — mechanical tension, metabolic stress, and muscle damage — are all modulated by TUT manipulation. Rep tempo notation (eccentric:iso-hold:concentric:top-hold) such as 4-1-2-0 specifies exact per-rep TUT. Brief explosive contractions (low TUT) optimize strength and power adaptations; slower controlled TUT optimizes structural and metabolic hypertrophy adaptations. Controlled eccentrics simultaneously maximize muscle damage and maintain motor unit recruitment throughout the range of motion.`;

const SUGGESTED_QUESTIONS = [
  "What's the best exercise for upper pec considering leverage?",
  "Explain the size principle of motor unit recruitment",
  "How do elbow cuffs increase motor unit recruitment?",
  "What's the optimal rep range for hypertrophy and why?",
  "Explain calcium ions in muscle contraction step by step",
  "What training split is best for maximum hypertrophy?",
  "Why is a shorter moment arm better mechanically?",
  "How do I set up the optimal cuffed cable fly for upper chest?",
];

// Render AI response with proper paragraphs
function MessageContent({ content }) {
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
  if (paragraphs.length <= 1) {
    return <span style={{ whiteSpace: 'pre-wrap' }}>{content}</span>;
  }
  return (
    <div className="space-y-3">
      {paragraphs.map((para, i) => (
        <p key={i} style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{para.trim()}</p>
      ))}
    </div>
  );
}

// Diagonal Myogen logo for AI avatar
function DnaAvatar() {
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: '#18181B', border: '1px solid rgba(0,240,255,0.2)' }}>
      <div style={{ transform: 'rotate(45deg)' }}>
        <MyogenLogo size={16} color="#00F0FF" />
      </div>
    </div>
  );
}

export default function KnowledgeCentre({ navigate, isPremium, user, page }) {
  const [chats, setChats] = useState(loadChats);
  const [activeChatId, setActiveChatId] = useState(() => loadChats()[0]?.id || 1);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [shortMode, setShortMode] = useState(false);
  const [tone, setTone] = useState('scientific');
  const [backendStatus, setBackendStatus] = useState('unknown');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Server-side chat count — not localStorage (server is the source of truth)
  const [chatCount, setChatCount] = useState(0);
  const chatEndRef = useRef();
  const textareaRef = useRef();

  const canChat = isPremium || chatCount < FREE_LIMIT;

  // Persist chats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('myogen_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setBackendStatus(d.provider ? 'ok' : 'no-key'))
      .catch(() => setBackendStatus('offline'));

    // Fetch real usage count from server (not localStorage)
    getAuthToken().then(token => {
      if (!token) return;
      fetch('/api/user-status', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setChatCount(d.chatCount || 0); })
        .catch(() => {});
    });
  }, []);

  const activeChat = chats.find(c => c.id === activeChatId);
  const messages = activeChat?.messages || [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  function newChat() {
    const newId = Date.now();
    setChats(prev => [...prev, { id: newId, title: 'New chat', messages: [] }]);
    setActiveChatId(newId);
  }

  function updateChat(id, updater) {
    setChats(prev => prev.map(c => c.id === id ? updater(c) : c));
  }

  function buildSystemPrompt() {
    const toneInstructions = {
      scientific: 'Use precise scientific terminology. Include mechanisms and molecular pathways where relevant.',
      casual: 'Be friendly and approachable while staying accurate. Use analogies.',
      brief: 'Be extremely concise. Core answer only. One sentence where possible.',
      coach: 'Be direct and motivating like an elite strength coach. Practical and action-oriented.',
    };
    const shortModeInstruction = shortMode
      ? '\n\nSHORT ANSWER MODE ACTIVE: Core answer + one reason only. NO lists. Maximum 3 sentences in one paragraph.'
      : '\n\nLONG ANSWER MODE ACTIVE: Give a thorough, comprehensive answer in multiple paragraphs.';
    return SYSTEM_PROMPT + `\n\nCurrent tone: ${tone}. ${toneInstructions[tone]}${shortModeInstruction}`;
  }

  async function sendMessage(content) {
    if (!content.trim() || isTyping || !canChat) return;

    const userMsg = { role: 'user', content: content.trim() };
    updateChat(activeChatId, c => ({
      ...c,
      title: c.messages.length === 0 ? content.trim().substring(0, 44) + (content.length > 44 ? '…' : '') : c.title,
      messages: [...c.messages, userMsg],
    }));
    setInput('');
    setIsTyping(true);

    const msgHistory = [...messages, userMsg];
    const token = await getAuthToken();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: msgHistory.map(m => ({ role: m.role, content: m.content })),
          systemPrompt: buildSystemPrompt(),
          maxTokens: shortMode ? 280 : 1400,
        }),
      });
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Server returned an unexpected response. Make sure the backend is running (npm run dev).');
      }
      if (res.status === 403) {
        // Server says limit reached — update local state to reflect real count
        setChatCount(FREE_LIMIT);
        updateChat(activeChatId, c => ({
          ...c,
          messages: [...c.messages, { role: 'assistant', content: '⚠ Monthly message limit reached. Upgrade to Premium for unlimited access.' }],
        }));
        return;
      }
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
      const cleaned = (data.content || '').replace(/#\S+/g, '').trim();
      updateChat(activeChatId, c => ({ ...c, messages: [...c.messages, { role: 'assistant', content: cleaned }] }));
      setBackendStatus('ok');
      // Increment local display count (server has already tracked the real count)
      if (!isPremium) setChatCount(prev => prev + 1);
    } catch (err) {
      const msg = err.message.includes('fetch')
        ? 'Cannot reach the Myogen backend. Make sure the server is running (npm run dev).'
        : err.message;
      updateChat(activeChatId, c => ({ ...c, messages: [...c.messages, { role: 'assistant', content: `⚠ ${msg}` }] }));
    } finally {
      setIsTyping(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  const statusColor = backendStatus === 'ok' ? '#22c55e' : backendStatus === 'offline' ? '#FF3B30' : '#eab308';
  const statusText = backendStatus === 'ok' ? '● AI Online'
    : backendStatus === 'no-key' ? '● Start Ollama: ollama serve'
    : '● Backend offline — run: npm run dev';

  const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', p: 'dashboard' },
    { icon: Scan, label: 'Analyzer', p: 'physique' },
    { icon: Zap, label: 'Quizzes', p: 'quizzes' },
    { icon: Brain, label: 'Knowledge', p: 'knowledge' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#050505' }}>
      {/* Nav */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('dashboard')}>
            <Dna className="h-8 w-8" strokeWidth={1.5} style={{ color: '#00F0FF' }} />
            <span className="font-bold text-xl tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>MYOGEN</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map(({ icon: Icon, label, p }) => (
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
            <button onClick={() => navigate('account')}
              className="hidden md:flex w-8 h-8 rounded-full items-center justify-center font-bold text-sm transition-all"
              style={{ background: 'rgba(0,240,255,0.15)', color: '#00F0FF', border: '1px solid rgba(0,240,255,0.3)', cursor: 'pointer' }}>
              {(user?.name?.[0] || 'U').toUpperCase()}
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
          {NAV_ITEMS.map(({ icon: Icon, label, p }) => (
            <button key={p} onClick={() => { navigate(p); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
              style={{ background: p === page ? 'rgba(0,240,255,0.1)' : 'transparent', color: p === page ? '#00F0FF' : '#A1A1AA', border: 'none', cursor: 'pointer' }}>
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
          <button onClick={() => { navigate('account'); setMobileMenuOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
            style={{ background: 'transparent', color: '#A1A1AA', border: 'none', cursor: 'pointer' }}>
            <User className="h-4 w-4" /> Account
          </button>
          {!isPremium && (
            <button onClick={() => { navigate('premium'); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm mt-1"
              style={{ background: 'rgba(0,240,255,0.05)', color: '#00F0FF', border: '1px solid rgba(0,240,255,0.2)', cursor: 'pointer' }}>
              <Crown className="h-4 w-4" /> Upgrade to Premium
            </button>
          )}
        </div>
      )}

      {/* Main Layout */}
      <div className="flex flex-1 pt-16" style={{ height: 'calc(100vh - 0px)' }}>
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-64 flex-shrink-0 p-4 pt-6" style={{ borderRight: '1px solid rgba(255,255,255,0.1)', background: '#0A0A0A' }}>
          <button onClick={newChat}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium mb-4 transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#FAFAFA', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Plus className="h-4 w-4" /> New Chat
          </button>

          <p className="label-overline mb-2 px-2">Recent</p>
          <div className="flex-1 overflow-y-auto space-y-1">
            {chats.slice().reverse().map(chat => (
              <button key={chat.id} onClick={() => setActiveChatId(chat.id)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors"
                style={{
                  background: chat.id === activeChatId ? 'rgba(0,240,255,0.1)' : 'transparent',
                  color: chat.id === activeChatId ? '#00F0FF' : '#A1A1AA',
                  border: 'none', cursor: 'pointer',
                }}>
                {chat.title}
              </button>
            ))}
          </div>

          {/* Settings */}
          <div className="space-y-3 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {!isPremium && (
              <div className="text-xs px-2" style={{ color: '#A1A1AA' }}>
                Messages: <span className="font-bold" style={{ color: chatCount >= FREE_LIMIT ? '#FF3B30' : '#FAFAFA' }}>{chatCount}/{FREE_LIMIT}</span>
                {chatCount >= FREE_LIMIT && (
                  <button onClick={() => navigate('premium')} className="ml-1 font-medium" style={{ color: '#00F0FF', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Upgrade
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center justify-between px-2">
              <span className="text-xs" style={{ color: '#A1A1AA' }}>Short Mode</span>
              <button onClick={() => setShortMode(!shortMode)}
                className="w-10 h-5 rounded-full transition-all relative"
                style={{ background: shortMode ? '#00F0FF' : '#27272A', border: 'none', cursor: 'pointer' }}>
                <div className="absolute top-0.5 w-4 h-4 rounded-full bg-black transition-all"
                  style={{ left: shortMode ? '20px' : '2px' }} />
              </button>
            </div>

            <div className="px-2">
              <p className="text-xs mb-1" style={{ color: '#A1A1AA' }}>Tone</p>
              <select value={tone} onChange={e => setTone(e.target.value)}
                className="w-full text-xs rounded-lg px-3 py-2"
                style={{ background: '#18181B', border: '1px solid rgba(255,255,255,0.1)', color: '#FAFAFA', cursor: 'pointer' }}>
                {[{ value: 'scientific', label: 'Scientific' }, { value: 'casual', label: 'Casual' }, { value: 'brief', label: 'Brief' }, { value: 'coach', label: 'Coach' }].map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="px-2 py-1.5 rounded-lg text-xs" style={{ background: `${statusColor}15`, color: statusColor }}>
              {statusText}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <h2 className="font-bold text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>Knowledge Engine</h2>
              <p className="text-xs" style={{ color: '#A1A1AA' }}>Biomechanics-precise answers. Zero bro-science.</p>
            </div>
            {shortMode && (
              <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(0,240,255,0.1)', color: '#00F0FF', border: '1px solid rgba(0,240,255,0.2)' }}>
                Short Mode
              </span>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: 'rgba(0,240,255,0.1)' }}>
                  <Brain className="h-8 w-8" strokeWidth={1.5} style={{ color: '#00F0FF' }} />
                </div>
                <h3 className="font-bold text-xl mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Ask Myogen</h3>
                <p className="text-sm mb-8 max-w-md" style={{ color: '#A1A1AA' }}>
                  Precise, science-based answers on biomechanics, neuromuscular science, and training.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 w-full max-w-2xl">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button key={i} onClick={() => canChat && sendMessage(q)}
                      className="text-left p-4 rounded-xl text-sm transition-all"
                      style={{ border: '1px solid rgba(255,255,255,0.1)', background: '#0A0A0A', color: '#A1A1AA', cursor: canChat ? 'pointer' : 'default' }}
                      onMouseEnter={e => { if (canChat) { e.currentTarget.style.borderColor = 'rgba(0,240,255,0.3)'; e.currentTarget.style.color = '#FAFAFA'; }}}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#A1A1AA'; }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {msg.role === 'user' ? (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{ background: 'rgba(0,240,255,0.2)', color: '#00F0FF', border: '1px solid rgba(0,240,255,0.3)' }}>
                        {(user?.name?.[0] || 'U').toUpperCase()}
                      </div>
                    ) : (
                      <DnaAvatar />
                    )}
                    <div className="max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed"
                      style={{
                        background: msg.role === 'user' ? 'rgba(0,240,255,0.1)' : '#0A0A0A',
                        border: msg.role === 'user' ? '1px solid rgba(0,240,255,0.2)' : '1px solid rgba(255,255,255,0.1)',
                        color: '#FAFAFA',
                      }}>
                      <MessageContent content={msg.content} />
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-4">
                    <DnaAvatar />
                    <div className="rounded-2xl px-4 py-3 flex gap-1.5 items-center"
                      style={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                          style={{ background: '#00F0FF', animationDelay: `${i * 150}ms` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {!canChat ? (
              <div className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: 'rgba(255,59,48,0.05)', border: '1px solid rgba(255,59,48,0.2)' }}>
                <span className="text-sm" style={{ color: '#A1A1AA' }}>Monthly message limit reached</span>
                <button className="btn-primary text-xs px-4 py-2" onClick={() => navigate('premium')}>
                  <Crown className="h-3 w-3" /> Upgrade
                </button>
              </div>
            ) : (
              <div className="flex gap-3 items-end">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about biomechanics, muscle physiology, training..."
                  className="flex-1 input-style resize-none"
                  style={{ minHeight: '52px', maxHeight: '160px', paddingTop: '14px', paddingBottom: '14px' }}
                  rows={1}
                  disabled={isTyping}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  className="btn-primary p-4 flex-shrink-0"
                  style={{ borderRadius: '12px', padding: '14px' }}>
                  <Send className="h-5 w-5" />
                </button>
              </div>
            )}
            <p className="text-xs mt-2 text-center" style={{ color: '#A1A1AA' }}>
              Educational only · Not medical advice · Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
