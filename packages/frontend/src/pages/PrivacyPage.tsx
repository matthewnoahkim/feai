/**
 * Privacy Policy Page
 * White/navy blue theme matching homepage
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PublicLayout } from '../components/PublicLayout'

export function PrivacyPage() {
  const navigate = useNavigate()

  return (
    <PublicLayout>
      <div className="min-h-screen flex flex-col" style={{ background: 'white', color: '#1a4d8f' }}>
        {/* Navigation */}
        <nav 
          className="flex items-center justify-between px-8 py-6"
          style={{ borderBottom: '1px solid #1a4d8f' }}
        >
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
            style={{ 
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <div 
              className="w-8 h-8 flex items-center justify-center"
              style={{ background: '#1a4d8f' }}
            >
              <span style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>F</span>
            </div>
            <span style={{ fontWeight: 600, fontSize: '1.125rem', color: '#1a4d8f' }}>FeAI</span>
          </button>
        </nav>

        {/* Content */}
        <main className="flex-1 px-8 py-12">
          <div className="max-w-3xl mx-auto">
            <h1 
              style={{ 
                fontSize: '2.25rem', 
                fontWeight: 600, 
                color: '#1a4d8f', 
                marginBottom: '2rem'
              }}
            >
              Privacy Policy
            </h1>
            
            <div className="text-base space-y-6" style={{ color: '#1a4d8f' }}>
              <section>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a4d8f', marginBottom: '0.75rem' }}>
                  1. Information We Collect
                </h2>
                <p style={{ lineHeight: 1.7 }}>
                  When you sign in with Google, we collect:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-1" style={{ lineHeight: 1.7 }}>
                  <li>Your Google account email address</li>
                  <li>Your name</li>
                  <li>Your profile picture (optional)</li>
                </ul>
                <p className="mt-3" style={{ lineHeight: 1.7 }}>
                  We also collect information about your CAD projects and designs that you create 
                  and save within FeAI.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a4d8f', marginBottom: '0.75rem' }}>
                  2. How We Use Your Information
                </h2>
                <p style={{ lineHeight: 1.7 }}>
                  We use your information to:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-1" style={{ lineHeight: 1.7 }}>
                  <li>Provide and maintain the FeAI service</li>
                  <li>Authenticate your account</li>
                  <li>Save and sync your CAD projects</li>
                  <li>Improve our service</li>
                </ul>
              </section>

              <section>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a4d8f', marginBottom: '0.75rem' }}>
                  3. Data Storage
                </h2>
                <p style={{ lineHeight: 1.7 }}>
                  Your project data is stored securely in our database. We use industry-standard 
                  security measures to protect your information. Your CAD designs remain your property.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a4d8f', marginBottom: '0.75rem' }}>
                  4. Third-Party Services
                </h2>
                <p style={{ lineHeight: 1.7 }}>
                  We use Google OAuth for authentication. When you sign in, you're subject to 
                  Google's privacy policy. We do not share your personal information with other 
                  third parties without your consent.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a4d8f', marginBottom: '0.75rem' }}>
                  5. Cookies and Local Storage
                </h2>
                <p style={{ lineHeight: 1.7 }}>
                  We use cookies and browser local storage to:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-1" style={{ lineHeight: 1.7 }}>
                  <li>Keep you signed in</li>
                  <li>Remember your preferences</li>
                  <li>Improve performance</li>
                </ul>
              </section>

              <section>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a4d8f', marginBottom: '0.75rem' }}>
                  6. Your Rights
                </h2>
                <p style={{ lineHeight: 1.7 }}>
                  You have the right to:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-1" style={{ lineHeight: 1.7 }}>
                  <li>Access your personal data</li>
                  <li>Request deletion of your account and data</li>
                  <li>Export your CAD projects</li>
                  <li>Opt out of our service at any time</li>
                </ul>
              </section>

              <section>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a4d8f', marginBottom: '0.75rem' }}>
                  7. Data Retention
                </h2>
                <p style={{ lineHeight: 1.7 }}>
                  We retain your account information and projects for as long as your account is active. 
                  If you delete your account, we will delete your personal data within 30 days.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a4d8f', marginBottom: '0.75rem' }}>
                  8. Changes to This Policy
                </h2>
                <p style={{ lineHeight: 1.7 }}>
                  We may update this privacy policy from time to time. We will notify you of any 
                  changes by posting the new policy on this page.
                </p>
              </section>

              <div className="pt-6" style={{ borderTop: '1px solid #1a4d8f' }}>
                <p style={{ fontSize: '0.875rem', color: '#1a4d8f' }}>
                  Last updated: December 20, 2024
                </p>
              </div>
            </div>
          </div>
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
