/**
 * Privacy Policy Page
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'

export function PrivacyPage() {
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
          <h1 className="font-serif text-4xl text-cad-text mb-8">Privacy Policy</h1>
          
          <div className="font-sans text-base text-gray-700 space-y-6">
            <section>
              <h2 className="font-serif text-2xl text-cad-text mb-3">1. Information We Collect</h2>
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
              <h2 className="font-serif text-2xl text-cad-text mb-3">2. How We Use Your Information</h2>
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
              <h2 className="font-serif text-2xl text-cad-text mb-3">3. Data Storage</h2>
              <p>
                Your project data is stored securely in our database. We use industry-standard 
                security measures to protect your information. Your CAD designs remain your property.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-cad-text mb-3">4. Third-Party Services</h2>
              <p>
                We use Google OAuth for authentication. When you sign in, you're subject to 
                Google's privacy policy. We do not share your personal information with other 
                third parties without your consent.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-cad-text mb-3">5. Cookies and Local Storage</h2>
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
              <h2 className="font-serif text-2xl text-cad-text mb-3">6. Your Rights</h2>
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
              <h2 className="font-serif text-2xl text-cad-text mb-3">7. Data Retention</h2>
              <p>
                We retain your account information and projects for as long as your account is active. 
                If you delete your account, we will delete your personal data within 30 days.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-cad-text mb-3">8. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any 
                changes by posting the new policy on this page.
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

