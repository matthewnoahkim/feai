import Link from 'next/link';

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

export default function TechnicalApproachPage() {
  return (
    <div className="public-theme">
      <div className="min-h-screen" style={{ background: 'white', color: '#1a4d8f' }}>
        {/* Navigation */}
        <nav className="flex items-center justify-between px-8 py-6" style={{ borderBottom: '1px solid #1a4d8f' }}>
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 flex items-center justify-center" style={{ background: '#1a4d8f' }}>
              <span style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>F</span>
            </div>
            <span style={{ fontWeight: 600, fontSize: '1.125rem', color: '#1a4d8f' }}>FEAI</span>
          </Link>
        </nav>

        {/* Content */}
        <main className="max-w-3xl mx-auto px-8 py-16">
          <h1 className="mb-4" style={{ fontSize: '2.5rem', fontWeight: 300 }}>
            Technical Approach
          </h1>
          <p className="mb-12" style={{ fontSize: '1.1rem', opacity: 0.7 }}>
            How FEAI combines AI with rigorous engineering simulation
          </p>
          
          <div className="space-y-12" style={{ fontSize: '1rem', lineHeight: 1.8 }}>
            <section>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                The Challenge
              </h2>
              <p style={{ opacity: 0.85 }}>
                Traditional large language models are trained on text data and lack the 
                mathematical foundations needed for accurate physics simulations. Simply 
                asking ChatGPT to &ldquo;run an FEA simulation&rdquo; will not produce reliable results.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                Our Solution
              </h2>
              <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
                FEAI uses a hybrid approach that combines:
              </p>
              <ul className="list-disc list-inside space-y-2" style={{ opacity: 0.85 }}>
                <li>
                  <strong>Natural Language Understanding</strong> - To interpret user intent 
                  and design requirements from conversational input
                </li>
                <li>
                  <strong>Parametric Geometry Generation</strong> - AI-assisted creation of 
                  metamaterial unit cells and lattice structures
                </li>
                <li>
                  <strong>Rigorous FEA Solvers</strong> - Industry-standard finite element 
                  methods for actual simulation, not AI approximations
                </li>
                <li>
                  <strong>Physics-Informed Neural Networks</strong> - For rapid preliminary 
                  screening before full FEA runs
                </li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                The AI Role
              </h2>
              <p style={{ opacity: 0.85 }}>
                The AI in FEAI does not replace the physics engine—it augments the user 
                experience. AI helps translate design intent into parameters, suggests 
                optimization directions, and interprets results. The actual simulation 
                math remains deterministic and verifiable.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                Training Data
              </h2>
              <p style={{ opacity: 0.85 }}>
                Our models are trained on peer-reviewed metamaterial research, validated 
                simulation datasets, and engineering literature. This domain-specific 
                training enables accurate geometry suggestions and meaningful design guidance.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                Validation
              </h2>
              <p style={{ opacity: 0.85 }}>
                Every simulation result can be exported and verified in commercial FEA 
                software. We provide mesh files, boundary conditions, and material 
                properties for independent validation.
              </p>
            </section>

            <section 
              className="p-6"
              style={{ background: '#f8fafc', border: '1px solid #1a4d8f' }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Key Principle
              </h3>
              <p style={{ opacity: 0.85, fontStyle: 'italic' }}>
                AI should make engineering more accessible, not replace engineering judgment. 
                FEAI accelerates exploration while maintaining scientific rigor.
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
