/**
 * Terms of Service Page
 * Dark-first modern developer tool theme
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PublicLayout } from '../components/PublicLayout'

export function TermsPage() {
  const navigate = useNavigate()

  return (
    <PublicLayout>
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--public-bg)' }}>
      {/* Navigation */}
      <nav 
        className="flex items-center justify-between px-8 py-6"
        style={{ 
          borderBottom: '1px solid var(--public-border)',
          background: 'var(--public-bg)'
        }}
      >
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
          style={{ 
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity var(--public-transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <div 
            className="w-8 h-8 flex items-center justify-center"
            style={{ background: 'var(--public-accent)' }}
          >
            <span style={{ color: 'var(--public-text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>F</span>
          </div>
          <span style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--public-text-primary)' }}>FeAI</span>
        </button>
        
        {/* Invisible spacer to match HomePage nav height */}
        <button 
          className="px-4 py-2 text-sm font-sans bg-transparent opacity-0 cursor-default border border-transparent leading-none"
          style={{ color: 'var(--public-text-primary)' }}
        >
          Spacer
        </button>
      </nav>

      {/* Content */}
      <main className="flex-1 px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 
            style={{ 
              fontSize: '2.25rem', 
              fontWeight: 700, 
              color: 'var(--public-text-primary)', 
              marginBottom: '2rem',
              letterSpacing: '-0.01em'
            }}
          >
            Terms of Service
          </h1>
          
          <div className="font-sans text-base space-y-6" style={{ color: 'var(--public-text-secondary)' }}>
            <section>
              <h2 
                style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 600, 
                  color: 'var(--public-text-primary)', 
                  marginBottom: '0.75rem',
                  letterSpacing: '-0.01em'
                }}
              >
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using FeAI, you accept and agree to be bound by the terms and 
                provision of this agreement.
              </p>
            </section>

            <section>
              <h2 
                style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 600, 
                  color: 'var(--public-text-primary)', 
                  marginBottom: '0.75rem',
                  letterSpacing: '-0.01em'
                }}
              >
                2. Use License
              </h2>
              <p>
                FeAI is provided as open-source software under the MIT License. Permission is granted 
                to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of 
                the software, subject to the conditions of the MIT License.
              </p>
            </section>

            <section>
              <h2 
                style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 600, 
                  color: 'var(--public-text-primary)', 
                  marginBottom: '0.75rem',
                  letterSpacing: '-0.01em'
                }}
              >
                3. User Accounts
              </h2>
              <p>
                You are responsible for maintaining the confidentiality of your account and password. 
                You agree to accept responsibility for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 
                style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 600, 
                  color: 'var(--public-text-primary)', 
                  marginBottom: '0.75rem',
                  letterSpacing: '-0.01em'
                }}
              >
                4. User Content
              </h2>
              <p>
                You retain all rights to the CAD designs and projects you create using FeAI. We do not 
                claim ownership of your content. However, by using the service, you grant us permission 
                to store and process your content to provide the service.
              </p>
            </section>

            <section>
              <h2 
                style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 600, 
                  color: 'var(--public-text-primary)', 
                  marginBottom: '0.75rem',
                  letterSpacing: '-0.01em'
                }}
              >
                5. Disclaimer
              </h2>
              <p>
                FeAI is provided "as is" without warranty of any kind, express or implied. We do not 
                warrant that the service will be uninterrupted, timely, secure, or error-free.
              </p>
            </section>

            <section>
              <h2 
                style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 600, 
                  color: 'var(--public-text-primary)', 
                  marginBottom: '0.75rem',
                  letterSpacing: '-0.01em'
                }}
              >
                6. Limitation of Liability
              </h2>
              <p>
                In no event shall FeAI be liable for any damages (including, without limitation, 
                damages for loss of data or profit) arising out of the use or inability to use the service.
              </p>
            </section>

            <section>
              <h2 
                style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 600, 
                  color: 'var(--public-text-primary)', 
                  marginBottom: '0.75rem',
                  letterSpacing: '-0.01em'
                }}
              >
                7. Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these terms at any time. Your continued use of FeAI 
                after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <div className="pt-6" style={{ borderTop: '1px solid var(--public-border)' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--public-text-tertiary)' }}>
                Last updated: December 20, 2024
              </p>
            </div>
          </div>
        </div>
      </main>

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

