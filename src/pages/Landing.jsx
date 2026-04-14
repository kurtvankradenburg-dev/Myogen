import { Activity, Brain, Dna, Scan, Zap, ChevronRight, Check, ArrowRight } from 'lucide-react';

export default function Landing({ navigate }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#050505' }}>
      {/* Navigation */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <Dna className="h-8 w-8 text-primary" strokeWidth={1.5} style={{ color: '#00F0FF' }} />
            <span className="font-bold text-xl tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>MYOGEN</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm transition-colors" style={{ color: '#A1A1AA' }}
              onMouseEnter={e => e.target.style.color = '#FAFAFA'} onMouseLeave={e => e.target.style.color = '#A1A1AA'}>
              Features
            </a>
            <a href="#science" className="text-sm transition-colors" style={{ color: '#A1A1AA' }}
              onMouseEnter={e => e.target.style.color = '#FAFAFA'} onMouseLeave={e => e.target.style.color = '#A1A1AA'}>
              Science
            </a>
            <button className="text-sm transition-colors" style={{ color: '#A1A1AA', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => e.target.style.color = '#FAFAFA'} onMouseLeave={e => e.target.style.color = '#A1A1AA'}
              onClick={() => navigate('premium')}>
              Pricing
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-ghost text-sm" onClick={() => navigate('auth')}>Sign In</button>
            <button className="btn-primary text-sm px-5 py-2" onClick={() => navigate('auth')}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1726195221528-fe5c989b4512?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxhdGhsZXRlJTIwc3ByaW50aW5nJTIwYmlvbWVjaGFuaWNzJTIwZGFyayUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzY4MjIzODMxfDA&ixlib=rb-4.1.0&q=85"
            alt="Athletic biomechanics"
            className="w-full h-full object-cover"
            style={{ opacity: 0.3 }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, #050505, rgba(5,5,5,0.8), #050505)' }} />
        </div>

        {/* Hero Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.12) 0%, transparent 70%)', opacity: 0.5 }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fade-in"
            style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
            <span className="label-overline">Evidence-Based Physique Analysis</span>
          </div>

          <h1 className="font-extrabold text-5xl sm:text-6xl lg:text-7xl mb-6 tracking-tight animate-slide-up"
            style={{ fontFamily: 'Manrope, sans-serif' }}>
            Understand Your<br />
            <span className="text-gradient glow-text">Body's Blueprint</span>
          </h1>

          <p className="text-lg max-w-2xl mx-auto mb-10 animate-slide-up animate-delay-100" style={{ color: '#A1A1AA' }}>
            Science-driven physique analysis and education platform.
            Master human biology, biomechanics, and optimize your training with AI-powered insights.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animate-delay-200">
            <button className="btn-primary px-8 py-4 text-base" onClick={() => navigate('auth')}>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <button className="btn-outline px-8 py-4 text-base" onClick={() => navigate('auth')}>
              Sign up with Email <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm animate-fade-in animate-delay-300"
            style={{ color: '#A1A1AA' }}>
            {['PubMed-backed science', 'Educational, not medical', 'Privacy-first analysis'].map(t => (
              <div key={t} className="flex items-center gap-2">
                <Check className="h-4 w-4" style={{ color: '#00F0FF' }} />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="label-overline mb-4 block" style={{ color: '#00F0FF' }}>Core Features</span>
            <h2 className="font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Science Meets Precision
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Scan, title: 'Physique Analyzer', desc: 'Upload your photo for AI-powered structural analysis. Get insights on shoulder width, limb proportions, muscle balance, and biomechanical considerations.', action: 'physique', link: 'Try Analysis' },
              { icon: Brain, title: 'Knowledge Engine', desc: 'Ask questions about human biology, biomechanics, and exercise science. Get detailed, evidence-based explanations from our AI expert.', action: 'knowledge', link: 'Start Learning' },
              { icon: Zap, title: 'Study Quizzes', desc: 'Test and reinforce your knowledge with scientifically-designed quizzes covering all aspects of human physiology and training science.', action: 'quizzes', link: 'Take a Quiz' },
            ].map(({ icon: Icon, title, desc, action, link }) => (
              <div key={title} className="card-glow p-8 group cursor-pointer" onClick={() => navigate('auth')}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors"
                  style={{ background: 'rgba(0, 240, 255, 0.1)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 240, 255, 0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)'}>
                  <Icon className="h-6 w-6" strokeWidth={1.5} style={{ color: '#00F0FF' }} />
                </div>
                <h3 className="font-bold text-xl mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>{title}</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#A1A1AA' }}>{desc}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: '#00F0FF' }}>
                  {link} <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Science Section */}
      <section id="science" className="py-24 px-6" style={{ background: 'rgba(24, 24, 27, 0.3)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="label-overline mb-4 block" style={{ color: '#00F0FF' }}>Scientific Foundation</span>
              <h2 className="font-bold text-3xl sm:text-4xl tracking-tight mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Full-Body Understanding
              </h2>
              <p className="mb-8" style={{ color: '#A1A1AA' }}>
                Myogen covers the complete spectrum of human physiology — from skeletal muscle biology to cardiovascular systems, biomechanics to endocrine function.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Activity, title: 'Muscular System', desc: 'Fiber types, hypertrophy mechanisms, length-tension relationships' },
                  { icon: Brain, title: 'Neuromuscular Science', desc: 'Motor unit recruitment, neural adaptations, coordination' },
                  { icon: Dna, title: 'Biomechanics', desc: 'Moment arms, joint mechanics, structural optimization' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4 p-4 rounded-xl transition-colors"
                    style={{ background: 'rgba(10, 10, 10, 0.5)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(10, 10, 10, 0.8)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(10, 10, 10, 0.5)'}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(0, 240, 255, 0.1)' }}>
                      <Icon className="h-5 w-5" strokeWidth={1.5} style={{ color: '#00F0FF' }} />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>{title}</h4>
                      <p className="text-sm" style={{ color: '#A1A1AA' }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1716996236807-a45afca9957a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwxfHxodW1hbiUyMGFuYXRvbXklMjBtdXNjbGUlMjBzdHJ1Y3R1cmUlMjBhcnRpc3RpYyUyMGRhcmslMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc2ODIyMzgyOHww&ixlib=rb-4.1.0&q=85"
                alt="Anatomical muscle structure"
                className="rounded-2xl shadow-2xl w-full"
              />
              <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(to top, rgba(5,5,5,0.8), transparent, transparent)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Ready to Understand Your<br />
            <span className="text-gradient">Body's Potential?</span>
          </h2>
          <p className="mb-10 max-w-2xl mx-auto" style={{ color: '#A1A1AA' }}>
            Join Myogen today and start your journey into evidence-based physique analysis and human biology education.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="btn-primary px-8 py-4 text-base" onClick={() => navigate('auth')}>
              Get Started Free
            </button>
            <button className="btn-outline px-8 py-4 text-base" onClick={() => navigate('premium')}>
              View Pricing
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Dna className="h-6 w-6" strokeWidth={1.5} style={{ color: '#00F0FF' }} />
              <span className="font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>MYOGEN</span>
            </div>
            <p className="text-sm text-center" style={{ color: '#A1A1AA' }}>
              Educational platform only. Not medical advice. Consult healthcare professionals for personal health decisions.
            </p>
            <div className="flex items-center gap-6 text-sm" style={{ color: '#A1A1AA' }}>
              <a href="#" style={{ color: '#A1A1AA' }}
                onMouseEnter={e => e.target.style.color = '#FAFAFA'} onMouseLeave={e => e.target.style.color = '#A1A1AA'}>
                Privacy
              </a>
              <a href="#" style={{ color: '#A1A1AA' }}
                onMouseEnter={e => e.target.style.color = '#FAFAFA'} onMouseLeave={e => e.target.style.color = '#A1A1AA'}>
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
