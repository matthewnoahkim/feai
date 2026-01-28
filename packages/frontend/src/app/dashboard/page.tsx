import DashboardClient from './DashboardClient';

// Force dynamic rendering to prevent SSR issues with SessionProvider
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return <DashboardClient />;
}
