import { ArrowLeft, Dna } from 'lucide-react';

export default function PrivacyPolicy({ navigate }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#050505', color: '#FAFAFA', fontFamily: 'Inter, sans-serif' }}>
      <nav style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <button
          onClick={() => navigate('landing')}
          style={{
            background: 'none',
            border: 'none',
            color: '#A1A1AA',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            padding: 0,
          }}
        >
          <ArrowLeft size={15} />
          Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Dna style={{ color: '#00F0FF', width: 20, height: 20 }} strokeWidth={1.5} />
          <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, letterSpacing: '-0.025em' }}>MYOGEN</span>
        </div>
      </nav>

      <main style={{ maxWidth: '700px', margin: '0 auto', padding: '56px 24px 80px' }}>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.875rem', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.025em' }}>
          Privacy Policy
        </h1>
        <p style={{ color: '#A1A1AA', fontSize: '13px', marginBottom: '48px' }}>Last updated: April 2026</p>

        <Section title="What data we collect">
          We collect usage data — such as pages visited and how you interact with the app — along with basic device
          and browser information (e.g. browser type, screen size, operating system). We do not collect your name,
          physical location, or payment details directly through analytics.
        </Section>

        <Section title="How we use it">
          Usage data is used solely to understand how people use Myogen and to improve the app. We do not sell or
          share your data with advertisers or unrelated third parties.
        </Section>

        <Section title="Third-party services">
          We use <Strong>Google Analytics</Strong>, provided through <Strong>Firebase</Strong> (by Google), to
          collect and analyse usage data. Google may process this data in accordance with{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#00F0FF' }}
          >
            Google's Privacy Policy
          </a>
          . We also use Firebase for backend infrastructure and authentication.
        </Section>

        <Section title="Where data is processed">
          Data may be processed internationally, including in the United States, by Google and Firebase services.
        </Section>

        <Section title="Your rights">
          Analytics are only activated after you click "Accept" on the cookie notice — no tracking occurs before
          you give consent. You may contact us at any time to request deletion of your data or to ask questions
          about how your information is handled.
        </Section>

        <Section title="Contact" last>
          For privacy-related enquiries, email us at{' '}
          <a href="mailto:privacy@myogen.app" style={{ color: '#00F0FF' }}>
            privacy@myogen.app
          </a>
          .
        </Section>
      </main>
    </div>
  );
}

function Section({ title, children, last }) {
  return (
    <section style={{ marginBottom: last ? 0 : '36px' }}>
      <h2 style={{
        fontFamily: 'Manrope, sans-serif',
        fontSize: '1rem',
        fontWeight: 600,
        marginBottom: '10px',
        letterSpacing: '-0.015em',
      }}>
        {title}
      </h2>
      <p style={{ color: '#A1A1AA', lineHeight: 1.75, fontSize: '14px' }}>{children}</p>
    </section>
  );
}

function Strong({ children }) {
  return <strong style={{ color: '#FAFAFA', fontWeight: 500 }}>{children}</strong>;
}
