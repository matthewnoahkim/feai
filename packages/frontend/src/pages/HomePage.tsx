/**
 * Home Page - Minimalistic landing page
 * Matches the navy/white academic theme
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-cad-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center bg-cad-accent">
            <span className="text-white font-serif font-bold text-sm">F</span>
          </div>
          <span className="font-serif font-semibold text-cad-text text-lg">FeAI</span>
        </div>
        
        <div className="flex items-center gap-6">
          <a href="#features" className="text-cad-text hover:text-cad-accent text-sm font-sans no-underline">
            Features
          </a>
          <a href="#about" className="text-cad-text hover:text-cad-accent text-sm font-sans no-underline">
            About
          </a>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm font-sans text-cad-text border border-cad-border hover:bg-gray-50 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm font-sans text-white bg-cad-accent hover:bg-cad-accent-hover transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-20">
        <div className="max-w-3xl text-center">
          <h1 className="font-serif text-5xl text-cad-text mb-6 leading-tight">
            Professional 3D CAD
            <br />
            <span className="text-cad-accent">Powered by AI</span>
          </h1>
          
          <p className="font-sans text-lg text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            Design, simulate, and analyze mechanical parts with an intuitive browser-based CAD tool. 
            Featuring AI assistance, finite element analysis, and real-time collaboration.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 text-base font-sans text-white bg-cad-accent hover:bg-cad-accent-hover transition-colors"
            >
              Start Designing
            </button>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="px-8 py-20 border-t border-cad-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl text-cad-text text-center mb-16">
            Capabilities
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center border border-cad-border">
                <svg className="w-6 h-6 text-cad-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-serif text-lg text-cad-text mb-2">Parametric Modeling</h3>
              <p className="font-sans text-sm text-gray-600">
                Create precise 3D models with extrusions, revolves, lofts, sweeps, and more.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center border border-cad-border">
                <svg className="w-6 h-6 text-cad-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-serif text-lg text-cad-text mb-2">FEA Simulation</h3>
              <p className="font-sans text-sm text-gray-600">
                Run structural analysis directly in your browser with integrated solvers.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center border border-cad-border">
                <svg className="w-6 h-6 text-cad-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-serif text-lg text-cad-text mb-2">AI Assistant</h3>
              <p className="font-sans text-sm text-gray-600">
                Get intelligent suggestions and automate repetitive modeling tasks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="px-8 py-20 border-t border-cad-border bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl text-cad-text mb-6">
            About FeAI
          </h2>
          <p className="font-sans text-base text-gray-600 leading-relaxed">
            FeAI is an open-source, browser-based CAD platform designed for engineers and designers 
            who need professional-grade tools without the complexity of traditional desktop software. 
            Built with modern web technologies and powered by AI, it brings parametric modeling 
            and simulation capabilities to everyone.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-8 border-t border-cad-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center bg-cad-accent">
              <span className="text-white font-serif font-bold text-xs">F</span>
            </div>
            <span className="font-serif text-sm text-cad-text">FeAI</span>
          </div>
          
          <p className="font-sans text-xs text-gray-500">
            © 2024 FeAI. Open source under MIT license.
          </p>
        </div>
      </footer>
    </div>
  )
}

