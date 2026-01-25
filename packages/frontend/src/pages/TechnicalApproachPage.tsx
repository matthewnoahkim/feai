/**
 * Technical Approach Page - How FeAI works
 * Explains the science behind AI-assisted FEA
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PublicLayout } from '../components/PublicLayout'

export function TechnicalApproachPage() {
  const navigate = useNavigate()

  return (
    <PublicLayout>
      <div className="min-h-screen" style={{ background: 'white', color: '#1a4d8f' }}>
        {/* Navigation */}
        <nav className="flex items-center justify-between px-8 py-6" style={{ borderBottom: '1px solid #1a4d8f' }}>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <div className="w-8 h-8 flex items-center justify-center" style={{ background: '#1a4d8f' }}>
              <span style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>F</span>
            </div>
            <span style={{ fontWeight: 600, fontSize: '1.125rem', color: '#1a4d8f' }}>FeAI</span>
          </button>
          
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              color: '#1a4d8f',
              background: 'transparent',
              border: '1px solid #1a4d8f',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1a4d8f'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#1a4d8f'
            }}
          >
            ← Back to Home
          </button>
        </nav>

        {/* Hero */}
        <section className="px-8 py-20">
          <div className="max-w-3xl mx-auto">
            <div 
              className="inline-block mb-6 px-4 py-2"
              style={{ 
                border: '1px solid #1a4d8f',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}
            >
              Technical Deep Dive
            </div>
            
            <h1 
              className="mb-8"
              style={{ 
                fontSize: 'clamp(2rem, 5vw, 3rem)', 
                fontWeight: 300,
                lineHeight: 1.2
              }}
            >
              How FeAI delivers <span style={{ fontWeight: 600 }}>accurate</span> finite element analysis
            </h1>
            
            <p style={{ fontSize: '1.2rem', lineHeight: 1.8, opacity: 0.85 }}>
              Unlike general-purpose AI models that hallucinate physics, FeAI combines 
              specialized training with rigorous numerical methods.
            </p>
          </div>
        </section>

        {/* The Problem */}
        <section className="px-8 py-16" style={{ background: '#f8fafc' }}>
          <div className="max-w-3xl mx-auto">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              The Problem with Generic AI
            </h2>
            
            <p style={{ fontSize: '1.05rem', lineHeight: 1.9, marginBottom: '1.5rem' }}>
              Large language models like GPT-4 or Claude are trained on internet text. When asked 
              to perform engineering calculations, they often produce plausible-looking but 
              <strong> physically incorrect</strong> results. They might:
            </p>
            
            <ul style={{ fontSize: '1.05rem', lineHeight: 2, marginLeft: '1.5rem', marginBottom: '1.5rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>• Invent material properties that don't exist</li>
              <li style={{ marginBottom: '0.5rem' }}>• Violate conservation laws (energy, momentum)</li>
              <li style={{ marginBottom: '0.5rem' }}>• Apply formulas incorrectly or use wrong units</li>
              <li style={{ marginBottom: '0.5rem' }}>• Produce stress values off by orders of magnitude</li>
            </ul>
            
            <p style={{ fontSize: '1.05rem', lineHeight: 1.9 }}>
              This isn't a bug—it's fundamental. These models optimize for <em>plausibility</em>, 
              not <em>physical correctness</em>.
            </p>
          </div>
        </section>

        {/* Our Approach */}
        <section className="px-8 py-16">
          <div className="max-w-3xl mx-auto">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              The FeAI Approach
            </h2>
            
            <p style={{ fontSize: '1.05rem', lineHeight: 1.9, marginBottom: '2rem' }}>
              FeAI doesn't ask AI to calculate stress tensors. Instead, we use AI where it 
              excels—understanding intent and generating structured output—while relying on 
              proven numerical methods for the physics.
            </p>
            
            <div className="space-y-8">
              {/* Component 1 */}
              <div className="p-6" style={{ border: '1px solid #1a4d8f' }}>
                <div className="flex items-start gap-4">
                  <div 
                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center"
                    style={{ background: '#1a4d8f', color: 'white', fontWeight: 600 }}
                  >
                    1
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                      Natural Language → Parametric Geometry
                    </h3>
                    <p style={{ fontSize: '1rem', lineHeight: 1.8, opacity: 0.85 }}>
                      A fine-tuned model interprets your description and generates precise geometric 
                      parameters. "Create a re-entrant honeycomb with 30° angle" becomes exact 
                      coordinates, not approximations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Component 2 */}
              <div className="p-6" style={{ border: '1px solid #1a4d8f' }}>
                <div className="flex items-start gap-4">
                  <div 
                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center"
                    style={{ background: '#1a4d8f', color: 'white', fontWeight: 600 }}
                  >
                    2
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                      Validated Material Database
                    </h3>
                    <p style={{ fontSize: '1rem', lineHeight: 1.8, opacity: 0.85 }}>
                      Material properties come from peer-reviewed sources and industry standards, 
                      not AI generation. Every Young's modulus, Poisson's ratio, and yield strength 
                      is traceable to published data.
                    </p>
                  </div>
                </div>
              </div>

              {/* Component 3 */}
              <div className="p-6" style={{ border: '1px solid #1a4d8f' }}>
                <div className="flex items-start gap-4">
                  <div 
                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center"
                    style={{ background: '#1a4d8f', color: 'white', fontWeight: 600 }}
                  >
                    3
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                      WebAssembly FEA Solver
                    </h3>
                    <p style={{ fontSize: '1rem', lineHeight: 1.8, opacity: 0.85 }}>
                      The actual finite element computation uses a compiled solver running locally 
                      in your browser. This is real numerical linear algebra—sparse matrix assembly, 
                      conjugate gradient solvers, stress recovery—not AI inference.
                    </p>
                  </div>
                </div>
              </div>

              {/* Component 4 */}
              <div className="p-6" style={{ border: '1px solid #1a4d8f' }}>
                <div className="flex items-start gap-4">
                  <div 
                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center"
                    style={{ background: '#1a4d8f', color: 'white', fontWeight: 600 }}
                  >
                    4
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                      AI-Assisted Interpretation
                    </h3>
                    <p style={{ fontSize: '1rem', lineHeight: 1.8, opacity: 0.85 }}>
                      After computation, AI helps interpret results: identifying stress concentrations, 
                      suggesting design improvements, and explaining findings in context. The numbers 
                      are exact; the AI adds understanding.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Training Data */}
        <section className="px-8 py-16" style={{ background: '#f8fafc' }}>
          <div className="max-w-3xl mx-auto">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              Trained on Scientific Literature
            </h2>
            
            <p style={{ fontSize: '1.05rem', lineHeight: 1.9, marginBottom: '1.5rem' }}>
              The geometry-generation model is fine-tuned on:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="p-4" style={{ background: 'white', border: '1px solid rgba(26, 77, 143, 0.2)' }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Academic Papers</strong>
                <span style={{ fontSize: '0.95rem', opacity: 0.8 }}>
                  Metamaterial research from journals like Advanced Materials, JMPS, and Nature
                </span>
              </div>
              <div className="p-4" style={{ background: 'white', border: '1px solid rgba(26, 77, 143, 0.2)' }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Verified Simulations</strong>
                <span style={{ fontSize: '0.95rem', opacity: 0.8 }}>
                  Thousands of validated FEA results with known analytical solutions
                </span>
              </div>
              <div className="p-4" style={{ background: 'white', border: '1px solid rgba(26, 77, 143, 0.2)' }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Textbook Problems</strong>
                <span style={{ fontSize: '0.95rem', opacity: 0.8 }}>
                  Classic mechanics problems with closed-form solutions for benchmarking
                </span>
              </div>
              <div className="p-4" style={{ background: 'white', border: '1px solid rgba(26, 77, 143, 0.2)' }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Engineering Standards</strong>
                <span style={{ fontSize: '0.95rem', opacity: 0.8 }}>
                  ASTM, ISO, and ASME specifications for materials and testing
                </span>
              </div>
            </div>
            
            <p style={{ fontSize: '1.05rem', lineHeight: 1.9 }}>
              This focused training means the model understands metamaterial terminology 
              and can translate domain-specific requests into valid geometry.
            </p>
          </div>
        </section>

        {/* Validation */}
        <section className="px-8 py-16">
          <div className="max-w-3xl mx-auto">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              Continuous Validation
            </h2>
            
            <p style={{ fontSize: '1.05rem', lineHeight: 1.9, marginBottom: '1.5rem' }}>
              Every update to FeAI is tested against a benchmark suite including:
            </p>
            
            <ul style={{ fontSize: '1.05rem', lineHeight: 2.2, marginLeft: '1.5rem', marginBottom: '1.5rem' }}>
              <li>
                <strong>Patch tests</strong> — verifying the solver satisfies basic FEA requirements
              </li>
              <li>
                <strong>Analytical solutions</strong> — cantilever beams, pressurized cylinders, 
                Hertzian contact where exact answers exist
              </li>
              <li>
                <strong>Commercial software comparison</strong> — cross-validation with ANSYS and 
                Abaqus on identical geometries
              </li>
              <li>
                <strong>Convergence studies</strong> — ensuring results improve with mesh refinement
              </li>
            </ul>
            
            <p style={{ fontSize: '1.05rem', lineHeight: 1.9 }}>
              Results that deviate beyond acceptable tolerances prevent deployment.
            </p>
          </div>
        </section>

        {/* Limitations */}
        <section className="px-8 py-16" style={{ background: '#f8fafc' }}>
          <div className="max-w-3xl mx-auto">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              What FeAI Doesn't Do
            </h2>
            
            <p style={{ fontSize: '1.05rem', lineHeight: 1.9, marginBottom: '1.5rem' }}>
              Transparency about limitations is essential for responsible use:
            </p>
            
            <ul style={{ fontSize: '1.05rem', lineHeight: 2.2, marginLeft: '1.5rem' }}>
              <li>
                <strong>Not for certification</strong> — Results are for exploration, not regulatory submission
              </li>
              <li>
                <strong>Linear static only</strong> — No nonlinear materials, large deformations, 
                dynamics, or thermal coupling (yet)
              </li>
              <li>
                <strong>Mesh size limits</strong> — Browser memory constrains problem size to 
                ~100k elements
              </li>
              <li>
                <strong>Simplified loading</strong> — Complex contact, moving loads, and fatigue 
                are not supported
              </li>
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section 
          className="px-8 py-20"
          style={{ background: '#1a4d8f', color: 'white' }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 
              className="mb-6"
              style={{ fontSize: '1.75rem', fontWeight: 300 }}
            >
              Interested in the details?
            </h2>
            <p 
              className="mb-10"
              style={{ fontSize: '1.1rem', opacity: 0.85, lineHeight: 1.7 }}
            >
              Join the waitlist to get early access and see the technical approach in action.
            </p>
            <button
              onClick={() => window.open('https://forms.gle/g8X1huDK5cLN6D6n6', '_blank')}
              style={{
                padding: '1rem 3rem',
                fontSize: '1rem',
                color: '#1a4d8f',
                background: 'white',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f0f4f8'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Join the Waitlist
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-8 py-8" style={{ borderTop: '1px solid #1a4d8f' }}>
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center" style={{ background: '#1a4d8f' }}>
                  <span style={{ color: 'white', fontWeight: 600, fontSize: '0.7rem' }}>F</span>
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>FeAI</span>
              </div>
              
              <div className="flex items-center gap-6" style={{ fontSize: '0.875rem' }}>
                <a 
                  href="mailto:finite.element.ai@gmail.com"
                  style={{ color: '#1a4d8f', textDecoration: 'none', opacity: 0.7 }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                >
                  Contact
                </a>
                <button
                  onClick={() => navigate('/terms')}
                  style={{ 
                    color: '#1a4d8f', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    opacity: 0.7,
                    fontSize: '0.875rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                >
                  Terms
                </button>
                <button
                  onClick={() => navigate('/privacy')}
                  style={{ 
                    color: '#1a4d8f', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    opacity: 0.7,
                    fontSize: '0.875rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                >
                  Privacy
                </button>
              </div>
              
              <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                © 2024 FeAI
              </span>
            </div>
          </div>
        </footer>
      </div>
    </PublicLayout>
  )
}
