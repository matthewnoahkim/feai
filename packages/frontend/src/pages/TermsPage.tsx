/**
 * Terms of Service Page
 * White/navy blue theme matching homepage
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PublicLayout } from '../components/PublicLayout'

export function TermsPage() {
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
              Terms of Service
            </h1>
            
            <div className="text-base space-y-6" style={{ color: '#1a4d8f' }}>
              <section>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a4d8f', marginBottom: '0.75rem' }}>
                  1. Acceptance of Terms
                </h2>
                <p style={{ lineHeight: 1.7 }}>
                  By accessing and using FeAI, you accept and agree to be bound by the terms and 
                  provision of this agreement.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a4d8f', marginBottom: '0.75rem' }}>
                  2. Use License
                </h2>
                <p style={{ lineHeight: 1.7 }}>
                  FeAI grants you a limited, non-exclusive, non-transferable license to access and use 
                  the software for your personal or internal business purposes, subject to these Terms 
                  of Service.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a4d8f', marginBottom: '0.75rem' }}>
                  3. User Accounts
                </h2>
                <p style={{ lineHeight: 1.7 }}>
                  You are responsible for maintaining the confidentiality of your account and password. 
                  You agree to accept responsibility for all activities that occur under your account.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a4d8f', marginBottom: '0.75rem' }}>
                  4. User Content
                </h2>
                <p style={{ lineHeight: 1.7 }}>
                  You retain all rights to the CAD designs and projects you create using FeAI. We do not 
                  claim ownership of your content. However, by using the service, you grant us permission 
                  to store and process your content to provide the service.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a4d8f', marginBottom: '0.75rem' }}>
                  5. Disclaimer
                </h2>
                <p style={{ lineHeight: 1.7 }}>
                  FeAI is provided "as is" without warranty of any kind, express or implied. We do not 
                  warrant that the service will be uninterrupted, timely, secure, or error-free.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a4d8f', marginBottom: '0.75rem' }}>
                  6. Limitation of Liability
                </h2>
                <p style={{ lineHeight: 1.7 }}>
                  In no event shall FeAI be liable for any damages (including, without limitation, 
                  damages for loss of data or profit) arising out of the use or inability to use the service.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a4d8f', marginBottom: '0.75rem' }}>
                  7. Changes to Terms
                </h2>
                <p style={{ lineHeight: 1.7 }}>
                  We reserve the right to modify these terms at any time. Your continued use of FeAI 
                  after changes constitutes acceptance of the new terms.
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
