import LandingPage from '@/components/landing/LandingPage';

// Fonts come from the system stack declared in .landing-theme (globals.css); no
// build-time font fetch, so the build never depends on network access.
export default function HomePage() {
  return (
    <div className="public-theme landing-theme">
      <LandingPage />
    </div>
  );
}
