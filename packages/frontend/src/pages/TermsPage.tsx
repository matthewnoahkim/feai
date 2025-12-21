/**
 * Terms of Service Page
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'

export function TermsPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-cad-border">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 flex items-center justify-center bg-cad-accent">
            <span className="text-white font-serif font-bold text-sm">F</span>
          </div>
          <span className="font-serif font-semibold text-cad-text text-lg">FeAI</span>
        </button>
        
        {/* Invisible spacer to match HomePage nav height */}
        <button className="px-4 py-2 text-sm font-sans text-white bg-transparent opacity-0 cursor-default border border-transparent leading-none">Spacer</button>
      </nav>

      {/* Content */}
      <main className="flex-1 px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl text-cad-text mb-8">Terms of Service</h1>
          
          <div className="font-sans text-base text-gray-700 space-y-6">
            <section>
              <h2 className="font-serif text-2xl text-cad-text mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using FeAI, you accept and agree to be bound by the terms and 
                provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-cad-text mb-3">2. Use License</h2>
              <p>
                FeAI is provided as open-source software under the MIT License. Permission is granted 
                to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of 
                the software, subject to the conditions of the MIT License.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-cad-text mb-3">3. User Accounts</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account and password. 
                You agree to accept responsibility for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-cad-text mb-3">4. User Content</h2>
              <p>
                You retain all rights to the CAD designs and projects you create using FeAI. We do not 
                claim ownership of your content. However, by using the service, you grant us permission 
                to store and process your content to provide the service.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-cad-text mb-3">5. Disclaimer</h2>
              <p>
                FeAI is provided "as is" without warranty of any kind, express or implied. We do not 
                warrant that the service will be uninterrupted, timely, secure, or error-free.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-cad-text mb-3">6. Limitation of Liability</h2>
              <p>
                In no event shall FeAI be liable for any damages (including, without limitation, 
                damages for loss of data or profit) arising out of the use or inability to use the service.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-cad-text mb-3">7. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Your continued use of FeAI 
                after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Last updated: December 20, 2024
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-4 border-t border-cad-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center bg-cad-accent">
              <span className="text-white font-serif font-bold text-sm">F</span>
            </div>
            <span className="font-serif font-semibold text-cad-text text-lg">FeAI</span>
          </div>
          
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/terms')}
              className="font-sans text-xs text-gray-500 hover:text-cad-accent transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => navigate('/privacy')}
              className="font-sans text-xs text-gray-500 hover:text-cad-accent transition-colors"
            >
              Privacy Policy
            </button>
            <p className="font-sans text-xs text-gray-500">
              © 2024 FeAI. Open source under MIT license.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

