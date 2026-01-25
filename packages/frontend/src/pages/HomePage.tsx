/**
 * Home Page - Informative landing page
 * Clean, content-focused design
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { PublicLayout } from '../components/PublicLayout'

export function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  return (
    <PublicLayout>
      <div style={{ background: 'white', color: '#1a4d8f' }}>
        {/* Navigation */}
        <nav 
          className="flex items-center justify-between px-8 py-6"
          style={{ borderBottom: '1px solid #1a4d8f' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center" style={{ background: '#1a4d8f' }}>
              <span style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>F</span>
            </div>
            <span style={{ fontWeight: 600, fontSize: '1.125rem', color: '#1a4d8f' }}>FeAI</span>
          </div>
          
          <div className="flex items-center gap-6">
            {user && (
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  color: 'white',
                  background: '#1a4d8f',
                  border: '1px solid #1a4d8f',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#0d2a4d'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#1a4d8f'
                }}
              >
                Dashboard
              </button>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main className="px-8 py-16">
          <article className="max-w-3xl mx-auto">
            
            {/* Introduction */}
            <header style={{ marginBottom: '3rem' }}>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 600, color: '#1a4d8f', marginBottom: '1.5rem', lineHeight: 1.3 }}>
                AI-Assisted Finite Element Analysis for Metamaterial Design
              </h1>
              <p style={{ fontSize: '1.125rem', color: '#1a4d8f', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                FeAI is a browser-based platform that combines finite element analysis with 
                natural language AI assistance, specifically designed for researchers and engineers 
                working with metamaterials and architected structures.
              </p>
            </header>

            {/* What is FeAI */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a4d8f', marginBottom: '1rem' }}>
                What is FeAI?
              </h2>
              <p style={{ fontSize: '1rem', color: '#1a4d8f', lineHeight: 1.8, marginBottom: '1rem' }}>
                Traditional finite element software requires significant expertise to set up 
                simulations—defining geometry, meshing, applying boundary conditions, and 
                interpreting results. FeAI simplifies this process by allowing you to describe 
                what you want to analyze in plain English. The AI assistant interprets your 
                request, generates the appropriate geometry, configures the simulation, and 
                presents the results in an understandable format.
              </p>
              <p style={{ fontSize: '1rem', color: '#1a4d8f', lineHeight: 1.8 }}>
                The platform runs entirely in your web browser—no software installation, 
                license management, or server configuration required. The finite element 
                solver executes locally using WebAssembly technology, meaning your simulation 
                data stays on your machine rather than being uploaded to external servers.
              </p>
            </section>

            {/* Focus on Metamaterials */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a4d8f', marginBottom: '1rem' }}>
                Metamaterial Design Focus
              </h2>
              <p style={{ fontSize: '1rem', color: '#1a4d8f', lineHeight: 1.8, marginBottom: '1rem' }}>
                Metamaterials are engineered structures that derive their mechanical properties 
                from their architecture rather than their chemical composition. By carefully 
                designing the geometry of a repeating unit cell, engineers can create materials 
                with unusual properties—negative Poisson's ratio (auxetic behavior), ultra-low 
                density with high stiffness, or programmable deformation characteristics.
              </p>
              <p style={{ fontSize: '1rem', color: '#1a4d8f', lineHeight: 1.8, marginBottom: '1rem' }}>
                FeAI is built specifically for this workflow. You can describe a unit cell 
                geometry—a lattice structure, a chiral pattern, a re-entrant honeycomb—and 
                the platform will generate the 3D model, apply periodic boundary conditions 
                appropriate for homogenization, run the finite element analysis, and compute 
                effective elastic properties like the homogenized stiffness tensor.
              </p>
              <p style={{ fontSize: '1rem', color: '#1a4d8f', lineHeight: 1.8 }}>
                This enables rapid iteration: propose a design modification, see the impact 
                on effective properties within seconds, and refine until you achieve target 
                material behavior. The AI assistant can suggest modifications based on your 
                goals—"make this structure more auxetic" or "increase the stiffness-to-weight 
                ratio while maintaining isotropy."
              </p>
            </section>

            {/* Technical Capabilities */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a4d8f', marginBottom: '1rem' }}>
                Technical Capabilities
              </h2>
              <p style={{ fontSize: '1rem', color: '#1a4d8f', lineHeight: 1.8, marginBottom: '1rem' }}>
                The finite element solver supports linear static analysis for stress, strain, 
                and displacement fields. Material models include isotropic linear elasticity, 
                suitable for metals, polymers, and ceramics in their elastic regime. The mesh 
                generator creates tetrahedral elements with adaptive refinement near geometric 
                features that concentrate stress.
              </p>
              <p style={{ fontSize: '1rem', color: '#1a4d8f', lineHeight: 1.8, marginBottom: '1rem' }}>
                For metamaterial analysis, the platform implements periodic boundary conditions 
                that allow simulation of an effectively infinite periodic structure using only 
                a single unit cell. This is the standard approach for computational homogenization, 
                where six independent load cases (three normal, three shear) are applied to 
                extract the full elasticity tensor of the effective medium.
              </p>
              <p style={{ fontSize: '1rem', color: '#1a4d8f', lineHeight: 1.8 }}>
                Results visualization includes color-mapped stress and displacement fields, 
                deformed shape plots with adjustable scale factors, and numerical output of 
                maximum values and their locations. Results can be exported for further 
                analysis or documentation.
              </p>
            </section>

            {/* Use Cases */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a4d8f', marginBottom: '1rem' }}>
                Intended Use Cases
              </h2>
              <p style={{ fontSize: '1rem', color: '#1a4d8f', lineHeight: 1.8, marginBottom: '1rem' }}>
                <strong>Academic research:</strong> Graduate students and researchers exploring 
                new metamaterial topologies can use FeAI for rapid screening of design concepts 
                before committing to detailed analysis in commercial FEA software or experimental 
                fabrication.
              </p>
              <p style={{ fontSize: '1rem', color: '#1a4d8f', lineHeight: 1.8, marginBottom: '1rem' }}>
                <strong>Education:</strong> Students learning finite element methods or 
                metamaterial mechanics can interact with the AI to understand how different 
                boundary conditions, mesh densities, and geometric parameters affect results, 
                building intuition without getting lost in software complexity.
              </p>
              <p style={{ fontSize: '1rem', color: '#1a4d8f', lineHeight: 1.8 }}>
                <strong>Design exploration:</strong> Engineers evaluating architected materials 
                for additive manufacturing applications can quickly assess whether a candidate 
                geometry meets stiffness, strength, or weight targets before detailed design 
                optimization.
              </p>
            </section>

            {/* Limitations */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a4d8f', marginBottom: '1rem' }}>
                Current Limitations
              </h2>
              <p style={{ fontSize: '1rem', color: '#1a4d8f', lineHeight: 1.8, marginBottom: '1rem' }}>
                FeAI is designed for preliminary analysis and design exploration, not for 
                final certification or safety-critical applications. The current version 
                supports only linear static analysis—nonlinear material behavior, large 
                deformations, dynamic/vibration analysis, and thermal problems are not 
                yet implemented.
              </p>
              <p style={{ fontSize: '1rem', color: '#1a4d8f', lineHeight: 1.8 }}>
                Mesh resolution and problem size are constrained by browser memory and 
                computational limits. Complex geometries with fine features may require 
                simplification. For production engineering analysis with regulatory requirements, 
                results should be validated against established commercial software.
              </p>
            </section>

            {/* Waitlist CTA */}
            {!user && (
              <section style={{ 
                marginBottom: '3rem', 
                padding: '2rem', 
                border: '1px solid #1a4d8f', 
                background: '#f8fafc' 
              }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1a4d8f', marginBottom: '1rem' }}>
                  Request Access
                </h2>
                <p style={{ fontSize: '1rem', color: '#1a4d8f', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                  FeAI is currently in development. If you're interested in using the platform 
                  for metamaterial research or education, you can join the waitlist. We'll 
                  notify you when access becomes available and may reach out to understand 
                  your use case to help prioritize features.
                </p>
                <button
                  onClick={() => window.open('https://forms.gle/g8X1huDK5cLN6D6n6', '_blank')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    color: 'white',
                    background: '#1a4d8f',
                    border: '1px solid #1a4d8f',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#0d2a4d'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#1a4d8f'
                  }}
                >
                  Join the Waitlist
                </button>
              </section>
            )}

            {/* Contact */}
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1a4d8f', marginBottom: '1rem' }}>
                Contact
              </h2>
              <p style={{ fontSize: '1rem', color: '#1a4d8f', lineHeight: 1.8 }}>
                For questions about FeAI, collaboration inquiries, or feedback, contact{' '}
                <a 
                  href="mailto:finite.element.ai@gmail.com" 
                  style={{ color: '#1a4d8f', textDecoration: 'underline' }}
                >
                  finite.element.ai@gmail.com
                </a>.
              </p>
            </section>

          </article>
        </main>

        {/* Footer */}
        <footer className="px-8 py-4" style={{ borderTop: '1px solid #1a4d8f' }}>
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center" style={{ background: '#1a4d8f' }}>
                <span style={{ color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>F</span>
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1a4d8f' }}>FeAI</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/terms')}
                style={{ fontSize: '0.75rem', color: '#1a4d8f', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Terms
              </button>
              <button
                onClick={() => navigate('/privacy')}
                style={{ fontSize: '0.75rem', color: '#1a4d8f', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Privacy
              </button>
              <span style={{ fontSize: '0.75rem', color: '#1a4d8f' }}>
                © 2024 FeAI
              </span>
            </div>
          </div>
        </footer>
      </div>
    </PublicLayout>
  )
}
