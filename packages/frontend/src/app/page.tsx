import Link from 'next/link';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <div className="public-theme">
      <div className="min-h-screen relative" style={{ background: 'white', color: '#1a4d8f' }}>
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center" style={{ background: '#1a4d8f' }}>
              <span style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>F</span>
            </div>
            <span style={{ fontWeight: 600, fontSize: '1.125rem', color: '#1a4d8f' }}>FEAI</span>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="px-8 py-24 relative">
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

        {/* Visual Divider */}
        <div className="flex justify-center py-12 relative z-10">
          <div className="flex items-center gap-4">
            <div style={{ width: '60px', height: '1px', background: '#1a4d8f', opacity: 0.3 }} />
            <div style={{ 
              width: '8px', 
              height: '8px', 
              background: '#1a4d8f',
              transform: 'rotate(45deg)'
            }} />
            <div style={{ width: '60px', height: '1px', background: '#1a4d8f', opacity: 0.3 }} />
          </div>
        </div>

        {/* Can AI do FEA Section */}
        <section className="px-8 py-16 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 
              className="mb-6"
              style={{ 
                fontSize: '1.75rem', 
                fontWeight: 300,
                fontStyle: 'italic'
              }}
            >
              &ldquo;Can AI do Finite Element Analysis?&rdquo;
            </h2>
            <p 
              style={{ 
                fontSize: '1.1rem', 
                lineHeight: 1.8,
                opacity: 0.85
              }}
            >
              Traditionally... <span style={{ fontWeight: 600 }}>no</span>. And regular AI{' '}
              <span style={{ fontStyle: 'italic' }}>still</span> can&apos;t. But FEAI is a specially 
              trained model that uses scientific research and data to deliver accurate results.
            </p>
            <Link
              href="/technical-approach"
              style={{
                display: 'inline-block',
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem',
                fontSize: '0.9rem',
                color: '#1a4d8f',
                background: 'transparent',
                border: '1px solid #1a4d8f',
                cursor: 'pointer',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Learn about our technical approach →
            </Link>
          </div>
        </section>

        {/* Workflow Section */}
        <section className="px-8 py-20 relative z-10" style={{ background: '#f8fafc' }}>
          <div className="max-w-4xl mx-auto">
            <h2 
              className="text-center mb-16"
              style={{ 
                fontSize: '2rem', 
                fontWeight: 300,
                letterSpacing: '-0.01em'
              }}
            >
              From idea to results in <span style={{ fontWeight: 600 }}>seconds</span>
            </h2>
            
            <div className="space-y-12">
              {/* Step 1 */}
              <div className="flex items-start gap-8">
                <div 
                  className="w-12 h-12 flex-shrink-0 flex items-center justify-center"
                  style={{ background: '#1a4d8f', color: 'white', fontWeight: 600 }}
                >
                  1
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Describe your structure
                  </h3>
                  <p style={{ fontSize: '1rem', lineHeight: 1.7, opacity: 0.8 }}>
                    &ldquo;Create an auxetic lattice with 20% porosity&rdquo; or &ldquo;Design a chiral 
                    honeycomb optimized for shear stiffness&rdquo;
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-8">
                <div 
                  className="w-12 h-12 flex-shrink-0 flex items-center justify-center"
                  style={{ background: '#1a4d8f', color: 'white', fontWeight: 600 }}
                >
                  2
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    AI generates & meshes
                  </h3>
                  <p style={{ fontSize: '1rem', lineHeight: 1.7, opacity: 0.8 }}>
                    The model interprets your request, creates precise geometry, and 
                    generates an optimized finite element mesh automatically.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-8">
                <div 
                  className="w-12 h-12 flex-shrink-0 flex items-center justify-center"
                  style={{ background: '#1a4d8f', color: 'white', fontWeight: 600 }}
                >
                  3
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Analyze & iterate
                  </h3>
                  <p style={{ fontSize: '1rem', lineHeight: 1.7, opacity: 0.8 }}>
                    View stress fields, displacement maps, and effective properties. 
                    Ask the AI to refine: &ldquo;Make it stiffer&rdquo; or &ldquo;Reduce stress concentrations.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="px-8 py-20 relative z-10" style={{ background: 'white' }}>
          <div className="max-w-5xl mx-auto">
            <h2 
              className="text-center mb-4"
              style={{ fontSize: '2rem', fontWeight: 300 }}
            >
              Built for <span style={{ fontWeight: 600 }}>researchers</span>
            </h2>
            <p 
              className="text-center max-w-2xl mx-auto mb-16"
              style={{ fontSize: '1.1rem', opacity: 0.7 }}
            >
              Whether you&apos;re exploring new topologies or teaching FEA fundamentals
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-8" style={{ background: '#f8fafc' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                  Academic Research
                </h3>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.7, opacity: 0.8 }}>
                  Rapidly screen metamaterial concepts before committing to detailed 
                  analysis or experimental fabrication.
                </p>
              </div>
              
              <div className="p-8" style={{ background: '#f8fafc' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                  Education
                </h3>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.7, opacity: 0.8 }}>
                  Build intuition about FEA without getting lost in complex softwares. 
                  See how parameters affect results instantly.
                </p>
              </div>
              
              <div className="p-8" style={{ background: '#f8fafc' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                  Design Exploration
                </h3>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.7, opacity: 0.8 }}>
                  Evaluate architected materials for additive manufacturing. Assess 
                  stiffness, strength, and weight targets quickly.
                </p>
              </div>
              
              <div className="p-8" style={{ background: '#f8fafc' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                  Concept Validation
                </h3>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.7, opacity: 0.8 }}>
                  Test mechanical hypotheses interactively. Get quick answers before 
                  investing in detailed commercial simulations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section 
          className="px-8 py-20 relative z-10"
          style={{ background: '#1a4d8f', color: 'white' }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 
              className="mb-6"
              style={{ fontSize: '2rem', fontWeight: 300 }}
            >
              Ready to explore?
            </h2>
            <p 
              className="mb-10"
              style={{ fontSize: '1.1rem', opacity: 0.85, lineHeight: 1.7 }}
            >
              Sign in to access your dashboard and start exploring 
              AI-assisted finite element analysis.
            </p>
            <HomeClient variant="secondary" />
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
                  href="mailto:finite.element.ai@gmail.com"
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
