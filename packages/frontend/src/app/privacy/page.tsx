import Link from 'next/link';

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          
          <div className="space-y-8" style={{ fontSize: '1rem', lineHeight: 1.8, opacity: 0.85 }}>
            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                1. Information We Collect
              </h2>
              <p>
                When you use FEAI, we may collect information you provide directly, such as 
                your email address when signing up, and usage data including your designs, 
                simulations, and interactions with the platform.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                2. How We Use Your Information
              </h2>
              <p>
                We use collected information to provide and improve our services, communicate 
                with you about updates, and analyze usage patterns to enhance the platform. 
                We may use anonymized data to improve our AI models.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                3. Data Storage and Security
              </h2>
              <p>
                Your data is stored securely using industry-standard encryption. We implement 
                appropriate technical and organizational measures to protect your personal 
                information against unauthorized access or disclosure.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                4. Third-Party Services
              </h2>
              <p>
                We use third-party services for authentication (Google OAuth), hosting, and 
                analytics. These services have their own privacy policies governing the use 
                of your information.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                5. Your Rights
              </h2>
              <p>
                You have the right to access, correct, or delete your personal data. You can 
                export your designs and data at any time. To exercise these rights, please 
                contact us.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                6. Cookies
              </h2>
              <p>
                We use cookies and similar technologies to maintain your session and 
                preferences. You can control cookie settings through your browser.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                7. Changes to This Policy
              </h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of 
                any significant changes by posting the new policy on this page.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                8. Contact Us
              </h2>
              <p>
                If you have questions about this privacy policy or our data practices, 
                please contact us at{' '}
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
