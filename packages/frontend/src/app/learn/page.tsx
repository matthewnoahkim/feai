import Link from 'next/link';
import { Logo } from '@/components/Logo';

export const dynamic = 'force-dynamic';

export default function LearnPage() {
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
            <Link href="/learn" style={{ color: '#1a4d8f', textDecoration: 'none', opacity: 0.9, fontWeight: 600 }}>Learn</Link>
            <Link href="/about" style={{ color: '#1a4d8f', textDecoration: 'none', opacity: 0.9 }}>About</Link>
          </div>
        </nav>
        <main className="max-w-3xl mx-auto px-8 py-16">
          <h1 className="mb-6" style={{ fontSize: '2.5rem', fontWeight: 300 }}>Learn</h1>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, opacity: 0.85 }}>
           WIP
          </p>
          <div className="mt-12 pt-8" style={{ borderTop: '1px solid #1a4d8f' }}>
            <Link href="/" style={{ color: '#1a4d8f', textDecoration: 'none', fontSize: '0.875rem' }}>← Back to Home</Link>
          </div>
        </main>
      </div>
    </div>
  );
}
