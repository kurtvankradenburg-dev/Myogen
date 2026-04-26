import { useEffect, useRef, useState } from 'react';
import { getAuthToken } from '../authToken';
import { Dna, Check, Crown, ArrowLeft, Scan, Zap, Brain } from 'lucide-react';

const PAYPAL_CLIENT_ID = 'AblZ4yl5au3t1cJDheYA0Dyl55sHj1sIaXJZfQu0XM8X3twE3wb2B-USrj1A3FLgsdCvmZd_bu2-O53P';
const PAYPAL_PLAN_ID = 'P-2JK35030PU796203TNHEA72Y';

const FREE_FEATURES = [
  { text: '1 physique analysis/month — Overall score only', icon: Scan, included: true },
  { text: '15 AI Knowledge Engine messages/month', icon: Brain, included: true },
  { text: 'Quizzes — Premium only', icon: Zap, included: false },
  { text: 'Full analysis breakdown — Premium only', icon: Check, included: false },
];

const PREMIUM_FEATURES = [
  'Unlimited physique analyses every month',
  'Full physique scores: Mass, Aesthetic, Overall',
  'Individual muscle group scores (6 groups)',
  'Body fat % estimate + Vascularity rating',
  'Key Strengths & Key Weaknesses breakdown',
  'Expert AI written feedback per analysis',
  'Follow-up Q&A — ask about your physique',
  'Unlimited AI Knowledge Engine messages',
  'Access to all science quizzes',
];

export default function Premium({ navigate, isPremium, setIsPremium, user, page }) {
  const paypalRef = useRef(null);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState('');

  useEffect(() => {
    const existing = document.querySelector('#paypal-sdk-script');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = 'paypal-sdk-script';
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
    script.setAttribute('data-sdk-integration-source', 'button-factory');
    script.async = true;
    script.onload = () => setPaypalLoaded(true);
    script.onerror = () => setPaypalError('Failed to load PayPal. Please check your connection.');
    document.body.appendChild(script);
    return () => script.remove();
  }, []);

  useEffect(() => {
    if (!paypalLoaded || !paypalRef.current || !window.paypal) return;
    paypalRef.current.innerHTML = '';
    try {
      window.paypal.Buttons({
        style: { shape: 'pill', color: 'gold', layout: 'vertical', label: 'subscribe' },
        createSubscription: (data, actions) => actions.subscription.create({ plan_id: PAYPAL_PLAN_ID }),
        onApprove: async (data) => {
          try {
            const token = await getAuthToken();
            if (!token) {
              setPaypalError('Could not verify your session. Please sign in and try again.');
              return;
            }
            const res = await fetch('/api/activate-premium', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ subscriptionId: data.subscriptionID }),
            });
            const result = await res.json();
            if (!res.ok) {
              setPaypalError(result.error || 'Could not activate premium. Please contact support.');
              return;
            }
            setIsPremium(true);
            navigate('dashboard');
          } catch {
            setPaypalError('Could not reach the server to activate premium. Please try again.');
          }
        },
        onError: (err) => {
          console.error('PayPal error:', err);
          setPaypalError('PayPal encountered an error. Please try again.');
        },
      }).render(`#paypal-button-container-${PAYPAL_PLAN_ID}`);
    } catch (e) {
      setPaypalError('Could not render PayPal buttons.');
    }
  }, [paypalLoaded]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#050505' }}>
      {/* Navigation */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(user ? 'dashboard' : 'landing')}>
            <Dna className="h-8 w-8" strokeWidth={1.5} style={{ color: '#00F0FF' }} />
            <span className="font-bold text-xl tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>MYOGEN</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <button className="btn-ghost text-sm" onClick={() => navigate('dashboard')}>Dashboard</button>
            ) : (
              <>
                <button className="btn-ghost text-sm" onClick={() => navigate('auth')}>Sign In</button>
                <button className="btn-primary text-sm px-5 py-2" onClick={() => navigate('auth')}>Get Started</button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate(user ? 'dashboard' : 'landing')}
            className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
            style={{ color: '#A1A1AA', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = '#FAFAFA'}
            onMouseLeave={e => e.currentTarget.style.color = '#A1A1AA'}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="text-center mb-12">
            <span className="label-overline mb-4 block" style={{ color: '#00F0FF' }}>Pricing</span>
            <h1 className="font-bold text-4xl sm:text-5xl tracking-tight mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Choose Your Plan
            </h1>
            <p className="max-w-2xl mx-auto" style={{ color: '#A1A1AA' }}>
              Start free and upgrade when you need unlimited access to all features.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="card-glow p-8">
              <div className="mb-6">
                <h3 className="font-bold text-xl mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Free</h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-4xl" style={{ fontFamily: 'Manrope, sans-serif' }}>$0</span>
                  <span style={{ color: '#A1A1AA' }}>/month</span>
                </div>
              </div>
              <p className="text-sm mb-6" style={{ color: '#A1A1AA' }}>
                Perfect for getting started with evidence-based physique education.
              </p>
              <ul className="space-y-3 mb-8">
                {FREE_FEATURES.map((f) => (
                  <li key={f.text} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: '#18181B' }}>
                      <f.icon className="h-3 w-3" style={{ color: f.included ? '#A1A1AA' : '#A1A1AA' }} />
                    </div>
                    <span style={{ color: f.included ? '#FAFAFA' : '#A1A1AA' }}>{f.text}</span>
                  </li>
                ))}
              </ul>
              <button
                className="w-full py-4 rounded-xl text-sm font-medium transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#FAFAFA', cursor: 'default' }}
                disabled
              >
                {isPremium ? 'Downgrade Not Available' : 'Current Plan'}
              </button>
            </div>

            {/* Premium Tier */}
            <div className="card-glow p-8 relative overflow-hidden" style={{ borderColor: 'rgba(0,240,255,0.3)' }}>
              <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
                style={{ background: 'radial-gradient(circle at center, rgba(0,240,255,0.12) 0%, transparent 70%)', opacity: 0.3 }} />
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(0,240,255,0.1)', color: '#00F0FF' }}>
                  Most Popular
                </span>
              </div>

              <div className="relative z-10">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-5 w-5" style={{ color: '#00F0FF' }} />
                    <h3 className="font-bold text-xl" style={{ fontFamily: 'Manrope, sans-serif' }}>Premium</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold text-4xl" style={{ fontFamily: 'Manrope, sans-serif' }}>$14.99</span>
                    <span style={{ color: '#A1A1AA' }}>/month</span>
                  </div>
                </div>
                <p className="text-sm mb-6" style={{ color: '#A1A1AA' }}>Full access to all features with unlimited usage.</p>
                <ul className="space-y-3 mb-8">
                  {PREMIUM_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(0,240,255,0.1)' }}>
                        <Check className="h-3 w-3" style={{ color: '#00F0FF' }} />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {isPremium ? (
                  <button className="w-full py-4 rounded-xl text-sm font-medium" disabled
                    style={{ background: 'rgba(0,240,255,0.1)', color: '#00F0FF', cursor: 'default', border: '1px solid rgba(0,240,255,0.2)' }}>
                    Current Plan
                  </button>
                ) : (
                  <div>
                    {paypalError && (
                      <p className="text-sm text-center mb-3" style={{ color: '#FF3B30' }}>{paypalError}</p>
                    )}
                    {!paypalLoaded && !paypalError && (
                      <div className="text-center py-4 text-sm" style={{ color: '#A1A1AA' }}>
                        <div className="w-5 h-5 border-2 rounded-full animate-spin mx-auto mb-2"
                          style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#00F0FF' }} />
                        Loading PayPal...
                      </div>
                    )}
                    <div id={`paypal-button-container-${PAYPAL_PLAN_ID}`} ref={paypalRef} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-sm mb-2" style={{ color: '#A1A1AA' }}>
              All plans include access to our AI Knowledge Engine for unlimited scientific questions.
            </p>
            <p className="text-xs" style={{ color: '#A1A1AA' }}>
              Secure payment powered by PayPal. Educational use only — not medical advice.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
