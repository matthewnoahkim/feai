import Link from 'next/link';

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

export default function TermsPage() {
  return (
    <div className="public-theme">
      <div className="min-h-screen" style={{ background: 'white', color: '#1a4d8f' }}>
        {/* Navigation */}
        <nav className="flex items-center justify-between px-8 py-6" style={{ borderBottom: '1px solid #1a4d8f' }}>
          <Link href="/" className="logo-link flex items-center gap-2 no-underline">
            <div className="w-8 h-8 flex items-center justify-center" style={{ background: '#1a4d8f' }}>
              <span style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>F</span>
            </div>
            <span style={{ fontWeight: 600, fontSize: '1.125rem', color: '#1a4d8f' }}>FEAI</span>
          </Link>
        </nav>

        {/* Content */}
        <main className="max-w-3xl mx-auto px-8 py-16">
          <h1 className="mb-8" style={{ fontSize: '2.5rem', fontWeight: 300 }}>
            Terms of Service
          </h1>
          
          <div className="space-y-8" style={{ fontSize: '1rem', lineHeight: 1.8, opacity: 0.85 }}>
            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using FEAI, you accept and agree to be bound by the terms 
                and provisions of this agreement. If you do not agree to abide by these terms, 
                please do not use this service.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                2. Description of Service
              </h2>
              <p>
                FEAI provides AI-assisted finite element analysis tools for engineering 
                simulation and metamaterial design. The service is provided &ldquo;as is&rdquo; and is 
                intended for educational and research purposes.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                3. User Responsibilities
              </h2>
              <p>
                Users are responsible for maintaining the confidentiality of their account 
                information and for all activities that occur under their account. Users 
                agree to use the service only for lawful purposes.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                4. Intellectual Property
              </h2>
              <p>
                Users retain ownership of their designs and data. FEAI retains ownership 
                of the platform, algorithms, and underlying technology.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                5. Limitation of Liability
              </h2>
              <p>
                FEAI and its developers shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages resulting from your use of 
                the service. Engineering decisions should be validated independently.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                6. Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these terms at any time. Continued use of 
                the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                7. Contact
              </h2>
              <p>
                For questions about these terms, please contact us at{' '}
                <a href="mailto:matthew@feai.app">matthew@feai.app</a>.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8" style={{ borderTop: '1px solid #1a4d8f' }}>
            <Link 
              href="/"
              style={{ 
                color: '#1a4d8f', 
                textDecoration: 'none',
                fontSize: '0.875rem',
              }}
            >
              ← Back to Home
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
