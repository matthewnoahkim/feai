import Link from 'next/link'
import { Logo } from '@/components/Logo'

// Shared nav + footer for the public marketing pages (home, technical approach).

export function LandingNav({ current }: { current?: 'technical' }) {
  return (
    <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
      <Link href="/" className="logo-link flex items-center gap-3">
        <span className="logo-chip"><Logo size="sm" /></span>
        <span className="text-sm font-semibold tracking-[0.2em]">FEAI</span>
      </Link>
      <nav className="flex items-center gap-6 text-sm" style={{ color: 'var(--l-muted)' }}>
        <Link
          href="/technical-approach"
          className="hidden sm:inline hover:underline"
          style={current === 'technical' ? { color: 'var(--l-text)', textDecoration: 'underline' } : undefined}
        >
          Technical approach
        </Link>
        <Link href="/login" className="hidden sm:inline hover:underline">Sign in</Link>
        <Link href="/dashboard" className="l-btn l-btn-primary !px-4 !py-2 text-sm">Open editor</Link>
      </nav>
    </header>
  )
}

export function LandingFooter() {
  return (
    <footer className="border-t px-6 py-8" style={{ borderColor: 'var(--l-border)' }}>
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-3">
          <span className="logo-chip"><Logo size="sm" /></span>
          <span className="text-sm font-semibold tracking-[0.2em]">FEAI</span>
        </div>
        <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--l-muted)' }}>
          <a href="mailto:matthew@feai.app" className="hover:underline">Contact</a>
          <Link href="/terms" className="hover:underline">Terms</Link>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
        </div>
        <span className="l-mono text-xs" style={{ color: 'var(--l-dim)' }}>© 2026 FEAI</span>
      </div>
    </footer>
  )
}
