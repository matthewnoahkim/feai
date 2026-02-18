import Link from 'next/link';
import { Logo } from '@/components/Logo';

export const dynamic = 'force-dynamic';

export default function AboutPage() {
  return (
    <div className="public-theme">
      <div className="min-h-screen" style={{ background: 'white', color: '#1a4d8f' }}>
        <nav className="flex items-center justify-between px-8 py-6" style={{ borderBottom: '1px solid #1a4d8f' }}>
          <Link href="/" className="logo-link flex items-center gap-2 no-underline" style={{ textDecoration: 'none' }}>
            <Logo size="md" />
            <span style={{ fontWeight: 600, fontSize: '1.125rem', color: '#1a4d8f' }}>FEAI</span>
          </Link>
          <div className="flex items-center gap-8" style={{ fontSize: '0.9375rem' }}>
            <Link href="/products" style={{ color: '#1a4d8f', textDecoration: 'none', opacity: 0.9 }}>Products</Link>
            <Link href="/support" style={{ color: '#1a4d8f', textDecoration: 'none', opacity: 0.9 }}>Support</Link>
            <Link href="/learn" style={{ color: '#1a4d8f', textDecoration: 'none', opacity: 0.9 }}>Learn</Link>
            <Link href="/about" style={{ color: '#1a4d8f', textDecoration: 'none', opacity: 0.9, fontWeight: 600 }}>About</Link>
          </div>
        </nav>
        <main className="max-w-3xl mx-auto px-8 py-16">
          <h1 className="mb-6" style={{ fontSize: '2.5rem', fontWeight: 300 }}>About</h1>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, opacity: 0.85 }}>
            FEAI provides free engineering simulation software for students, teachers, and academic researchers.
            We specialize in surrogate modelling and Finite Element solvers that use artificial intelligence to increase efficiency and accessibility.
          </p>

          <section className="mt-12 pt-8" style={{ borderTop: '1px solid #1a4d8f' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>Summer 2026 Internships</h2>
            <p style={{ fontSize: '1rem', lineHeight: 1.8, opacity: 0.85 }}>
              We are hiring interns for Summer 2026. Apply via our application form:{' '}
              <a
                href="https://forms.gle/tFHsxQYN1adkFQkr7"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#1a4d8f', textDecoration: 'underline' }}
              >
                Application form
              </a>
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
