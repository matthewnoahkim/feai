import LoginClient from './LoginClient';

// Force dynamic rendering to prevent SSR issues with SessionProvider
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return <LoginClient />;
}
