import Link from 'next/link';
import HomeClient from '@/components/landing/HomeClient';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <div className="public-theme">
      <div className="min-h-screen relative flex flex-col" style={{ background: 'white', color: '#1a4d8f' }}>
        <div 
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0z' fill='none' stroke='%231a4d8f' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
            opacity: 0.03,
            zIndex: 0
          }}
        />
        
        {/* Navigation */}
        <nav className="flex items-center justify-between px-8 py-6 relative z-10" style={{ borderBottom: '1px solid #1a4d8f', background: 'white' }}>
          <Link href="/" className="logo-link flex items-center gap-2 no-underline" style={{ textDecoration: 'none' }}>
            <div className="w-8 h-8 flex items-center justify-center" style={{ background: '#1a4d8f' }}>
              <span style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>F</span>
            </div>
            <span style={{ fontWeight: 600, fontSize: '1.125rem', color: '#1a4d8f' }}>FEAI</span>
          </Link>
          <div className="flex items-center gap-8" style={{ fontSize: '0.9375rem' }}>
            <Link href="/products" style={{ color: '#1a4d8f', textDecoration: 'none', opacity: 0.9 }}>Products</Link>
            <Link href="/support" style={{ color: '#1a4d8f', textDecoration: 'none', opacity: 0.9 }}>Support</Link>
            <Link href="/learn" style={{ color: '#1a4d8f', textDecoration: 'none', opacity: 0.9 }}>Learn</Link>
            <Link href="/about" style={{ color: '#1a4d8f', textDecoration: 'none', opacity: 0.9 }}>About</Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="flex-1 px-8 py-24 relative flex flex-col justify-center">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div 
              className="inline-block mb-6 px-4 py-2"
              style={{ 
                border: '1px solid #1a4d8f',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}
            >
              Engineering Simulation Software
            </div>
            
            <h1 
              className="mb-8"
              style={{ 
                fontSize: 'clamp(2.5rem, 6vw, 4rem)', 
                fontWeight: 300,
                lineHeight: 1.1,
                letterSpacing: '-0.02em'
              }}
            >
              Finite Element Analysis<br />
              <span style={{ fontWeight: 600 }}>assisted with AI.</span>
            </h1>
            
            <p 
              className="max-w-2xl mx-auto mb-12"
              style={{ 
                fontSize: '1.25rem', 
                lineHeight: 1.7,
                opacity: 0.8
              }}
            >
              Surrogate modelling for metamaterial design.
            </p>
            
            <HomeClient variant="primary" />
          </div>
        </section>

        {/* Footer */}
        <footer className="px-8 py-8 relative z-10" style={{ borderTop: '1px solid #1a4d8f', background: 'white' }}>
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center" style={{ background: '#1a4d8f' }}>
                  <span style={{ color: 'white', fontWeight: 600, fontSize: '0.7rem' }}>F</span>
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>FEAI</span>
              </div>
              
              <div className="flex items-center gap-6" style={{ fontSize: '0.875rem' }}>
                <a 
                  href="mailto:matthew@feai.app"
                  style={{ color: '#1a4d8f', textDecoration: 'none', opacity: 0.7 }}
                >
                  Contact
                </a>
                <Link
                  href="/terms"
                  style={{ 
                    color: '#1a4d8f', 
                    opacity: 0.7,
                    textDecoration: 'none',
                  }}
                >
                  Terms
                </Link>
                <Link
                  href="/privacy"
                  style={{ 
                    color: '#1a4d8f', 
                    opacity: 0.7,
                    textDecoration: 'none',
                  }}
                >
                  Privacy
                </Link>
              </div>
              
              <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                © 2024 FEAI
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
