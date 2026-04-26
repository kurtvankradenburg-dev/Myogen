import { ArrowLeft, Dna } from 'lucide-react';

export default function RefundPolicy({ navigate }) {
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
          Refund Policy
        </h1>
        <p style={{ color: '#A1A1AA', fontSize: '13px', marginBottom: '48px' }}>Last updated: April 2026</p>

        <Section title="Our commitment">
          We want you to feel confident subscribing to Myogen Premium. If you are not satisfied, we will do our best
          to make it right.
        </Section>

        <Section title="7-day money-back guarantee">
          If you subscribe to Myogen Premium and are not happy with the service for any reason, you may request a
          full refund within 7 days of your first payment. No questions asked. To request a refund, email us at{' '}
          <a href="mailto:support@myogen.app" style={{ color: '#00F0FF' }}>support@myogen.app</a> with the subject
          line "Refund Request" and include the email address associated with your account.
        </Section>

        <Section title="Renewals">
          After the initial 7-day period, subscription renewals are non-refundable. You may cancel your subscription
          at any time from your Account page to prevent future charges. Cancellation takes effect at the end of the
          current billing cycle — you retain Premium access until that date.
        </Section>

        <Section title="How refunds are processed">
          Approved refunds are returned to your original PayPal payment method. Processing time is typically 3–5
          business days, though it may take longer depending on your bank or PayPal account.
        </Section>

        <Section title="Exceptions">
          We reserve the right to refuse refund requests where there is evidence of abuse of this policy (e.g.
          repeated subscribe-and-refund cycles). Accounts suspended for violating our Terms of Service are not
          eligible for refunds.
        </Section>

        <Section title="Contact" last>
          For refund requests or questions, email us at{' '}
          <a href="mailto:support@myogen.app" style={{ color: '#00F0FF' }}>
            support@myogen.app
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
