import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white" style={{ color: '#1a4d8f' }}>
      <div className="text-center">
        <h1 style={{ fontSize: '6rem', fontWeight: 300, marginBottom: '1rem' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '1rem' }}>Page Not Found</h2>
        <p style={{ marginBottom: '2rem', opacity: 0.7 }}>
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          style={{
            padding: '0.75rem 1.5rem',
            background: '#1a4d8f',
            color: 'white',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
