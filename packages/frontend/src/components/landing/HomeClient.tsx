'use client';

import Link from 'next/link';

interface HomeClientProps {
  variant: 'primary' | 'secondary';
}

const baseStyle = {
  padding: '1rem 3rem',
  fontSize: '1rem',
  cursor: 'pointer',
  fontWeight: 500,
  transition: 'all 0.2s',
  textDecoration: 'none',
  display: 'inline-block',
};

export default function HomeClient({ variant }: HomeClientProps) {
  if (variant === 'primary') {
    return (
      <Link
        href="/dashboard"
        style={{
          ...baseStyle,
          color: 'white',
          background: '#1a4d8f',
          border: 'none',
        }}
      >
        Dashboard
      </Link>
    );
  }

  return (
    <Link
      href="/dashboard"
      style={{
        ...baseStyle,
        color: '#1a4d8f',
        background: 'white',
        border: 'none',
      }}
    >
      Dashboard
    </Link>
  );
}
