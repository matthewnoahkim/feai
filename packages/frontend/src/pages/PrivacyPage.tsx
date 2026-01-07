/**
 * Privacy Policy Page
 * Dark-first modern developer tool theme
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PublicLayout } from '../components/PublicLayout'

export function PrivacyPage() {
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
            Privacy Policy
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
                1. Information We Collect
              </h2>
              <p>
                When you sign in with Google, we collect:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Your Google account email address</li>
                <li>Your name</li>
                <li>Your profile picture (optional)</li>
              </ul>
              <p className="mt-3">
                We also collect information about your CAD projects and designs that you create 
                and save within FeAI.
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
                2. How We Use Your Information
              </h2>
              <p>
                We use your information to:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Provide and maintain the FeAI service</li>
                <li>Authenticate your account</li>
                <li>Save and sync your CAD projects</li>
                <li>Improve our service</li>
              </ul>
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
                3. Data Storage
              </h2>
              <p>
                Your project data is stored securely in our database. We use industry-standard 
                security measures to protect your information. Your CAD designs remain your property.
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
                4. Third-Party Services
              </h2>
              <p>
                We use Google OAuth for authentication. When you sign in, you're subject to 
                Google's privacy policy. We do not share your personal information with other 
                third parties without your consent.
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
                5. Cookies and Local Storage
              </h2>
              <p>
                We use cookies and browser local storage to:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Keep you signed in</li>
                <li>Remember your preferences</li>
                <li>Improve performance</li>
              </ul>
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
                6. Your Rights
              </h2>
              <p>
                You have the right to:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Access your personal data</li>
                <li>Request deletion of your account and data</li>
                <li>Export your CAD projects</li>
                <li>Opt out of our service at any time</li>
              </ul>
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
                7. Data Retention
              </h2>
              <p>
                We retain your account information and projects for as long as your account is active. 
                If you delete your account, we will delete your personal data within 30 days.
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
                8. Changes to This Policy
              </h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any 
                changes by posting the new policy on this page.
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

