/**
 * Home Page - Minimalistic landing page
 * Dark-first modern developer tool theme
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
      <div style={{ background: 'var(--public-bg)', color: 'var(--public-text-primary)' }}>
      {/* Navigation */}
      <nav 
        className="flex items-center justify-between px-8 py-6"
        style={{ 
          borderBottom: '1px solid var(--public-border)',
          background: 'var(--public-bg)'
        }}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 flex items-center justify-center"
            style={{ background: 'var(--public-accent)' }}
          >
            <span style={{ color: 'var(--public-text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>F</span>
          </div>
          <span style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--public-text-primary)' }}>FeAI</span>
        </div>
        
        <div className="flex items-center gap-6">
          <a 
            href="#features" 
            style={{ 
              color: 'var(--public-text-secondary)', 
              fontSize: '0.875rem',
              transition: 'color var(--public-transition-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--public-accent)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--public-text-secondary)'}
          >
            Features
          </a>
          <a 
            href="#about" 
            style={{ 
              color: 'var(--public-text-secondary)', 
              fontSize: '0.875rem',
              transition: 'color var(--public-transition-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--public-accent)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--public-text-secondary)'}
          >
            About
          </a>
          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                color: 'var(--public-text-primary)',
                background: 'var(--public-accent)',
                border: 'none',
                borderRadius: 'var(--public-radius-md)',
                cursor: 'pointer',
                transition: 'background var(--public-transition-fast)',
                fontWeight: 500
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--public-accent-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--public-accent)'}
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => window.open('https://forms.gle/g8X1huDK5cLN6D6n6', '_blank')}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                color: 'var(--public-text-primary)',
                background: 'var(--public-accent)',
                border: 'none',
                borderRadius: 'var(--public-radius-md)',
                cursor: 'pointer',
                transition: 'background var(--public-transition-fast)',
                fontWeight: 500
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--public-accent-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--public-accent)'}
            >
              Join The Waitlist
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 py-16 md:py-24" style={{ background: 'var(--public-bg)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column: Headline & CTA */}
            <div>
              <p 
                style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 500,
                  color: 'var(--public-accent)', 
                  marginBottom: '1rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                AI-native Finite Element Software
              </p>
              
              <h1 
                style={{ 
                  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', 
                  fontWeight: 700, 
                  color: 'var(--public-text-primary)', 
                  marginBottom: '1rem', 
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em'
                }}
              >
                AI-driven CAD + FE Simulation
                <br />
                <span style={{ color: 'var(--public-accent)' }}>in Your Browser</span>
              </h1>
              
              <p 
                style={{ 
                  fontSize: '1.25rem', 
                  color: 'var(--public-text-primary)', 
                  marginBottom: '2rem', 
                  lineHeight: 1.5,
                  maxWidth: '32rem',
                  fontWeight: 500
                }}
              >
                Advanced engineering, made accessible and simple.
              </p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                <button
                  onClick={() => user ? navigate('/dashboard') : window.open('https://forms.gle/g8X1huDK5cLN6D6n6', '_blank')}
                  style={{
                    padding: '0.875rem 2rem',
                    fontSize: '1rem',
                    color: 'var(--public-text-primary)',
                    background: 'var(--public-accent)',
                    border: 'none',
                    borderRadius: 'var(--public-radius-md)',
                    cursor: 'pointer',
                    transition: 'background var(--public-transition-fast)',
                    fontWeight: 600,
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--public-accent-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--public-accent)'}
                >
                  {user ? 'Go to Dashboard' : 'Join The Waitlist'}
                </button>
                <button
                  onClick={() => {
                    const featuresSection = document.getElementById('how-it-works')
                    featuresSection?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  style={{
                    padding: '0.875rem 2rem',
                    fontSize: '1rem',
                    color: 'var(--public-text-primary)',
                    background: 'transparent',
                    border: '1px solid var(--public-border)',
                    borderRadius: 'var(--public-radius-md)',
                    cursor: 'pointer',
                    transition: 'border-color var(--public-transition-fast), background var(--public-transition-fast)',
                    fontWeight: 500,
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--public-accent)'
                    e.currentTarget.style.background = 'var(--public-accent-subtle)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--public-border)'
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  See how it works
                </button>
              </div>

              {/* Credibility Bullets */}
              <div className="flex flex-col gap-3 mt-6">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--public-accent)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span style={{ fontSize: '0.9375rem', color: 'var(--public-text-secondary)' }}>
                    Runs entirely in your browser—no install required
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--public-accent)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span style={{ fontSize: '0.9375rem', color: 'var(--public-text-secondary)' }}>
                    Industry-validated FE solver under the hood
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--public-accent)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span style={{ fontSize: '0.9375rem', color: 'var(--public-text-secondary)' }}>
                    Open source—MIT licensed, fully transparent
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Product Proof Panel */}
            <div className="lg:flex lg:justify-end">
              <div
                style={{
                  width: '100%',
                  maxWidth: '600px',
                  background: 'var(--public-surface)',
                  border: '1px solid var(--public-border)',
                  borderRadius: 'var(--public-radius-lg)',
                  overflow: 'hidden',
                  boxShadow: 'var(--public-shadow-lg)'
                }}
              >
                {/* Mock UI Header */}
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--public-bg-elevated)',
                    borderBottom: '1px solid var(--public-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }} />
                  </div>
                  <div style={{ flex: 1, height: '8px', background: 'var(--public-border)', borderRadius: '4px', marginLeft: '0.5rem' }} />
                </div>
                
                {/* Mock 3D Viewport Preview */}
                <div
                  style={{
                    position: 'relative',
                    aspectRatio: '16/10',
                    background: 'linear-gradient(135deg, var(--public-bg) 0%, var(--public-surface) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {/* Mock CAD Geometry Visualization */}
                  <svg width="80%" height="80%" viewBox="0 0 200 200" style={{ opacity: 0.8 }}>
                    {/* Grid */}
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--public-border)" strokeWidth="0.5" opacity="0.3" />
                      </pattern>
                    </defs>
                    <rect width="200" height="200" fill="url(#grid)" />
                    
                    {/* Mock 3D Shape */}
                    <g transform="translate(100, 100)">
                      {/* Isometric view of a bracket-like shape */}
                      <path
                        d="M -40 -30 L 40 -30 L 40 30 L -40 30 Z M -40 -30 L -20 -50 L 20 -50 L 40 -30 M 40 30 L 20 50 L -20 50 L -40 30"
                        fill="none"
                        stroke="var(--public-accent)"
                        strokeWidth="2"
                        opacity="0.9"
                      />
                      <path
                        d="M -20 -50 L -20 50 M 20 -50 L 20 50"
                        fill="none"
                        stroke="var(--public-accent)"
                        strokeWidth="2"
                        opacity="0.6"
                      />
                      {/* Stress visualization overlay */}
                      <circle cx="0" cy="0" r="15" fill="var(--public-accent)" opacity="0.2">
                        <animate attributeName="opacity" values="0.2;0.4;0.2" dur="2s" repeatCount="indefinite" />
                      </circle>
                    </g>
                  </svg>
                  
                  {/* Mock UI Overlay Elements */}
                  <div style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: '1rem',
                    right: '1rem',
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{
                      padding: '0.375rem 0.75rem',
                      background: 'rgba(59, 130, 246, 0.15)',
                      border: '1px solid var(--public-accent)',
                      borderRadius: 'var(--public-radius-sm)',
                      fontSize: '0.75rem',
                      color: 'var(--public-accent)'
                    }}>
                      FEA Results
                    </div>
                    <div style={{
                      padding: '0.375rem 0.75rem',
                      background: 'var(--public-bg-elevated)',
                      border: '1px solid var(--public-border)',
                      borderRadius: 'var(--public-radius-sm)',
                      fontSize: '0.75rem',
                      color: 'var(--public-text-secondary)'
                    }}>
                      Stress: 245 MPa
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section 
        id="how-it-works" 
        className="px-8 py-20"
        style={{ 
          borderTop: '1px solid var(--public-border)',
          background: 'var(--public-bg-elevated)'
        }}
      >
        <div className="max-w-5xl mx-auto">
          <h2 
            style={{ 
              fontSize: '2rem', 
              fontWeight: 600, 
              color: 'var(--public-text-primary)', 
              textAlign: 'center', 
              marginBottom: '0.75rem',
              letterSpacing: '-0.02em'
            }}
          >
            How It Works
          </h2>
          <p 
            style={{ 
              fontSize: '1rem', 
              color: 'var(--public-text-secondary)', 
              textAlign: 'center', 
              marginBottom: '4rem',
              maxWidth: '32rem',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          >
            From text prompt to simulation results in four simple steps
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div>
              <div 
                className="w-14 h-14 mx-auto mb-4 flex items-center justify-center"
                style={{ 
                  border: '1px solid var(--public-border)',
                  borderRadius: 'var(--public-radius-lg)',
                  background: 'var(--public-surface)',
                  position: 'relative'
                }}
              >
                <span style={{ 
                  position: 'absolute',
                  top: '-0.5rem',
                  left: '-0.5rem',
                  width: '1.5rem',
                  height: '1.5rem',
                  background: 'var(--public-accent)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--public-text-primary)'
                }}>1</span>
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--public-accent)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--public-text-primary)', marginBottom: '0.5rem', textAlign: 'center' }}>
                Describe
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--public-text-secondary)', lineHeight: 1.6, textAlign: 'center' }}>
                Use natural language to describe your design: "Create a bracket with 50mm width, 30mm height, and 5mm thickness"
              </p>
            </div>

            {/* Step 2 */}
            <div>
              <div 
                className="w-14 h-14 mx-auto mb-4 flex items-center justify-center"
                style={{ 
                  border: '1px solid var(--public-border)',
                  borderRadius: 'var(--public-radius-lg)',
                  background: 'var(--public-surface)',
                  position: 'relative'
                }}
              >
                <span style={{ 
                  position: 'absolute',
                  top: '-0.5rem',
                  left: '-0.5rem',
                  width: '1.5rem',
                  height: '1.5rem',
                  background: 'var(--public-accent)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--public-text-primary)'
                }}>2</span>
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--public-accent)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--public-text-primary)', marginBottom: '0.5rem', textAlign: 'center' }}>
                Generate CAD
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--public-text-secondary)', lineHeight: 1.6, textAlign: 'center' }}>
                AI generates a parametric 3D model with full feature history. Edit dimensions, add features, or modify geometry
              </p>
            </div>

            {/* Step 3 */}
            <div>
              <div 
                className="w-14 h-14 mx-auto mb-4 flex items-center justify-center"
                style={{ 
                  border: '1px solid var(--public-border)',
                  borderRadius: 'var(--public-radius-lg)',
                  background: 'var(--public-surface)',
                  position: 'relative'
                }}
              >
                <span style={{ 
                  position: 'absolute',
                  top: '-0.5rem',
                  left: '-0.5rem',
                  width: '1.5rem',
                  height: '1.5rem',
                  background: 'var(--public-accent)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--public-text-primary)'
                }}>3</span>
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--public-accent)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--public-text-primary)', marginBottom: '0.5rem', textAlign: 'center' }}>
                Run Simulation
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--public-text-secondary)', lineHeight: 1.6, textAlign: 'center' }}>
                Apply loads, constraints, and materials. Run FE analysis directly in your browser
              </p>
            </div>

            {/* Step 4 */}
            <div>
              <div 
                className="w-14 h-14 mx-auto mb-4 flex items-center justify-center"
                style={{ 
                  border: '1px solid var(--public-border)',
                  borderRadius: 'var(--public-radius-lg)',
                  background: 'var(--public-surface)',
                  position: 'relative'
                }}
              >
                <span style={{ 
                  position: 'absolute',
                  top: '-0.5rem',
                  left: '-0.5rem',
                  width: '1.5rem',
                  height: '1.5rem',
                  background: 'var(--public-accent)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--public-text-primary)'
                }}>4</span>
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--public-accent)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--public-text-primary)', marginBottom: '0.5rem', textAlign: 'center' }}>
                Iterate & Export
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--public-text-secondary)', lineHeight: 1.6, textAlign: 'center' }}>
                Review stress, strain, and deformation results. Modify your design and re-simulate. Export as STEP, STL, or OBJ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        id="features" 
        className="px-8 py-20"
        style={{ 
          borderTop: '1px solid var(--public-border)',
          background: 'var(--public-bg)'
        }}
      >
        <div className="max-w-5xl mx-auto">
          <h2 
            style={{ 
              fontSize: '1.875rem', 
              fontWeight: 600, 
              color: 'var(--public-text-primary)', 
              textAlign: 'center', 
              marginBottom: '4rem',
              letterSpacing: '-0.01em'
            }}
          >
            Engineering Capabilities
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              className="text-center"
              style={{
                padding: '2rem',
                border: '1px solid var(--public-border)',
                borderRadius: 'var(--public-radius-lg)',
                background: 'var(--public-surface)',
                transition: 'transform var(--public-transition-base), border-color var(--public-transition-base), box-shadow var(--public-transition-base)',
                boxShadow: 'var(--public-shadow-sm)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.borderColor = 'var(--public-accent)'
                e.currentTarget.style.boxShadow = 'var(--public-shadow-md)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'var(--public-border)'
                e.currentTarget.style.boxShadow = 'var(--public-shadow-sm)'
              }}
            >
              <div 
                className="w-14 h-14 mx-auto mb-5 flex items-center justify-center"
                style={{ 
                  border: '1px solid var(--public-border)',
                  borderRadius: 'var(--public-radius-lg)',
                  background: 'var(--public-bg-elevated)'
                }}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--public-accent)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--public-text-primary)', marginBottom: '0.75rem', lineHeight: 1.3 }}>
                Finite Element Analysis
              </h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--public-text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Integrated structural simulation with a validated FE solver. Analyze stress, strain, and deformation interactively.
              </p>
              <button
                onClick={() => {
                  const ctaSection = document.getElementById('final-cta')
                  ctaSection?.scrollIntoView({ behavior: 'smooth' })
                }}
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--public-accent)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'color var(--public-transition-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--public-accent-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--public-accent)'}
              >
                Try it →
              </button>
            </div>
            
            <div 
              className="text-center"
              style={{
                padding: '2rem',
                border: '1px solid var(--public-border)',
                borderRadius: 'var(--public-radius-lg)',
                background: 'var(--public-surface)',
                transition: 'transform var(--public-transition-base), border-color var(--public-transition-base), box-shadow var(--public-transition-base)',
                boxShadow: 'var(--public-shadow-sm)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.borderColor = 'var(--public-accent)'
                e.currentTarget.style.boxShadow = 'var(--public-shadow-md)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'var(--public-border)'
                e.currentTarget.style.boxShadow = 'var(--public-shadow-sm)'
              }}
            >
              <div 
                className="w-14 h-14 mx-auto mb-5 flex items-center justify-center"
                style={{ 
                  border: '1px solid var(--public-border)',
                  borderRadius: 'var(--public-radius-lg)',
                  background: 'var(--public-bg-elevated)'
                }}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--public-accent)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--public-text-primary)', marginBottom: '0.75rem', lineHeight: 1.3 }}>
                Parametric CAD Modeling
              </h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--public-text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Create precise 3D models with sketches, extrusions, revolves, lofts, fillets, and patterns. Full parametric control with edit history.
              </p>
              <button
                onClick={() => {
                  const ctaSection = document.getElementById('final-cta')
                  ctaSection?.scrollIntoView({ behavior: 'smooth' })
                }}
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--public-accent)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'color var(--public-transition-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--public-accent-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--public-accent)'}
              >
                Try it →
              </button>
            </div>
            
            <div 
              className="text-center"
              style={{
                padding: '2rem',
                border: '1px solid var(--public-border)',
                borderRadius: 'var(--public-radius-lg)',
                background: 'var(--public-surface)',
                transition: 'transform var(--public-transition-base), border-color var(--public-transition-base), box-shadow var(--public-transition-base)',
                boxShadow: 'var(--public-shadow-sm)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.borderColor = 'var(--public-accent)'
                e.currentTarget.style.boxShadow = 'var(--public-shadow-md)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'var(--public-border)'
                e.currentTarget.style.boxShadow = 'var(--public-shadow-sm)'
              }}
            >
              <div 
                className="w-14 h-14 mx-auto mb-5 flex items-center justify-center"
                style={{ 
                  border: '1px solid var(--public-border)',
                  borderRadius: 'var(--public-radius-lg)',
                  background: 'var(--public-bg-elevated)'
                }}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--public-accent)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--public-text-primary)', marginBottom: '0.75rem', lineHeight: 1.3 }}>
                AI-Powered Assistance
              </h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--public-text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Natural language commands for modeling and simulation. Describe what you need—AI generates the CAD and setup.
              </p>
              <button
                onClick={() => {
                  const ctaSection = document.getElementById('final-cta')
                  ctaSection?.scrollIntoView({ behavior: 'smooth' })
                }}
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--public-accent)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'color var(--public-transition-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--public-accent-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--public-accent)'}
              >
                Try it →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / Credibility Section */}
      <section 
        className="px-8 py-16"
        style={{ 
          borderTop: '1px solid var(--public-border)',
          background: 'var(--public-bg-elevated)'
        }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="text-center">
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--public-text-primary)', marginBottom: '0.25rem' }}>
                Open Source
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--public-text-tertiary)' }}>
                MIT licensed
              </div>
            </div>
            <div className="text-center">
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--public-text-primary)', marginBottom: '0.25rem' }}>
                Runs In-Browser
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--public-text-tertiary)' }}>
                No install required
              </div>
            </div>
            <div className="text-center">
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--public-text-primary)', marginBottom: '0.25rem' }}>
                Validated FE Solver
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--public-text-tertiary)' }}>
                Industry-proven accuracy
              </div>
            </div>
            <div className="text-center">
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--public-text-primary)', marginBottom: '0.25rem' }}>
                Privacy-First
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--public-text-tertiary)' }}>
                Your data stays local
              </div>
            </div>
          </div>

          {/* Mini FAQ */}
          <div className="max-w-3xl mx-auto">
            <h3 
              style={{ 
                fontSize: '1.5rem', 
                fontWeight: 600, 
                color: 'var(--public-text-primary)', 
                textAlign: 'center',
                marginBottom: '3rem',
                letterSpacing: '-0.01em'
              }}
            >
              Common Questions
            </h3>
            <div className="space-y-6">
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--public-text-primary)', marginBottom: '0.5rem' }}>
                  How accurate are the simulation results?
                </h4>
                <p style={{ fontSize: '0.9375rem', color: 'var(--public-text-secondary)', lineHeight: 1.6 }}>
                  FeAI uses a validated open-source FE solver trusted in industry. Results are comparable to commercial FEA software for linear static analysis. For critical applications, always validate with physical testing.
                </p>
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--public-text-primary)', marginBottom: '0.5rem' }}>
                  Is my design data private?
                </h4>
                <p style={{ fontSize: '0.9375rem', color: 'var(--public-text-secondary)', lineHeight: 1.6 }}>
                  Yes. All CAD modeling and FE analysis runs locally in your browser. Your designs never leave your device unless you explicitly save them to your account (which requires authentication).
                </p>
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--public-text-primary)', marginBottom: '0.5rem' }}>
                  Who is FeAI for?
                </h4>
                <p style={{ fontSize: '0.9375rem', color: 'var(--public-text-secondary)', lineHeight: 1.6 }}>
                  Mechanical engineers, product designers, students, and makers who need quick design iteration and structural analysis without expensive software licenses or complex setup.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section 
        id="final-cta" 
        className="px-8 py-20"
        style={{ 
          borderTop: '1px solid var(--public-border)',
          background: 'var(--public-bg)'
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 
            style={{ 
              fontSize: '2.25rem', 
              fontWeight: 600, 
              color: 'var(--public-text-primary)', 
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}
          >
            Ready to start engineering?
          </h2>
          <p 
            style={{ 
              fontSize: '1.125rem', 
              color: 'var(--public-text-secondary)', 
              marginBottom: '2.5rem',
              lineHeight: 1.6,
              maxWidth: '32rem',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          >
            Join the waitlist and be among the first to create parametric CAD models with AI-powered FE analysis.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => user ? navigate('/dashboard') : window.open('https://forms.gle/g8X1huDK5cLN6D6n6', '_blank')}
              style={{
                padding: '1rem 2.5rem',
                fontSize: '1.125rem',
                color: 'var(--public-text-primary)',
                background: 'var(--public-accent)',
                border: 'none',
                borderRadius: 'var(--public-radius-md)',
                cursor: 'pointer',
                transition: 'background var(--public-transition-fast)',
                fontWeight: 600
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--public-accent-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--public-accent)'}
            >
              {user ? 'Go to Dashboard' : 'Join The Waitlist'}
            </button>
          </div>
          <p 
            style={{ 
              fontSize: '0.875rem', 
              color: 'var(--public-text-tertiary)', 
              marginTop: '1rem'
            }}
          >
            No credit card required
          </p>
        </div>
      </section>

      {/* About Section */}
      <section 
        id="about" 
        className="px-8 py-16"
        style={{ 
          borderTop: '1px solid var(--public-border)',
          background: 'var(--public-bg-elevated)'
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 
            style={{ 
              fontSize: '1.875rem', 
              fontWeight: 600, 
              color: 'var(--public-text-primary)', 
              marginBottom: '1.5rem',
              letterSpacing: '-0.01em'
            }}
          >
            About FeAI
          </h2>
          <p 
            style={{ 
              fontSize: '1rem', 
              color: 'var(--public-text-secondary)', 
              lineHeight: 1.6 
            }}
          >
            FeAI is an open-source engineering platform that combines parametric CAD modeling with 
            finite element analysis. Designed for mechanical engineers, product designers, and students, 
            it provides professional-grade simulation and design tools directly in your browser. 
            With an integrated FE solver and AI-powered assistance, FeAI makes structural analysis 
            and optimization accessible to everyone.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="px-8 py-4"
        style={{ 
          borderTop: '1px solid var(--public-border)',
          background: 'var(--public-bg)'
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 flex items-center justify-center"
              style={{ background: 'var(--public-accent)' }}
            >
              <span style={{ color: 'var(--public-text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>F</span>
            </div>
            <span style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--public-text-primary)' }}>FeAI</span>
          </div>
          
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/terms')}
              style={{
                fontSize: '0.75rem',
                color: 'var(--public-text-tertiary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color var(--public-transition-fast)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--public-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--public-text-tertiary)'}
            >
              Terms of Service
            </button>
            <button
              onClick={() => navigate('/privacy')}
              style={{
                fontSize: '0.75rem',
                color: 'var(--public-text-tertiary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color var(--public-transition-fast)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--public-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--public-text-tertiary)'}
            >
              Privacy Policy
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--public-text-tertiary)' }}>
              © 2024 FeAI. Open source under MIT license.
            </p>
          </div>
        </div>
      </footer>
      </div>
    </PublicLayout>
  )
}

