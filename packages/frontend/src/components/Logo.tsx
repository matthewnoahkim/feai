/**
 * FEAI logo (crane F). Place your logo image at public/logo.png.
 */
const LOGO_SIZES = { sm: 24, md: 32 } as const;

export function Logo({ size = 'md', className = '' }: { size?: 'sm' | 'md'; className?: string }) {
  const px = LOGO_SIZES[size];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="FEAI"
      width={px}
      height={px}
      className={className}
      style={{ width: px, height: px, objectFit: 'contain', display: 'block' }}
    />
  );
}
