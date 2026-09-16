import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import { BrowserSupportBanner } from '@/components/BrowserSupportBanner';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'FEAI - Finite Element Analysis Intelligence',
  description: 'Parametric CAD on a real B-rep kernel with integrated finite element analysis. Sketch, model, mesh and simulate in the browser.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <BrowserSupportBanner />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
