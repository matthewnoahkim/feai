'use client';

interface HomeClientProps {
  variant: 'primary' | 'secondary';
}

export default function HomeClient({ variant }: HomeClientProps) {
  const handleClick = () => {
    window.open('https://forms.gle/g8X1huDK5cLN6D6n6', '_blank');
  };

  if (variant === 'primary') {
    return (
      <button
        onClick={handleClick}
        style={{
          padding: '1rem 3rem',
          fontSize: '1rem',
          color: 'white',
          background: '#1a4d8f',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 500,
          transition: 'all 0.2s'
        }}
      >
        Join the Waitlist
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      style={{
        padding: '1rem 3rem',
        fontSize: '1rem',
        color: '#1a4d8f',
        background: 'white',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 500,
      }}
    >
      Join the Waitlist
    </button>
  );
}
