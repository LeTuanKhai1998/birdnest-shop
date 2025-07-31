import type { Metadata } from 'next';
import './fonts.css';
import './globals.css';
import { ResponsiveNavbar } from '@/components/ResponsiveNavbar';
import { Providers } from '@/components/Providers';
import { HydrationSafe } from '@/components/HydrationSafe';
import { MaintenanceMode } from '@/components/MaintenanceMode';
import { UserProvider } from '@/contexts/UserContext';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Birdnest Shop - Premium Bird\'s Nest Products',
  description: 'Discover high-quality bird\'s nest products from Kien Giang. Premium refined nest, raw nest, and feather-removed nest with worldwide shipping.',
  keywords: 'bird nest, bird\'s nest, kien giang, refined nest, raw nest, premium, natural, health',
  authors: [{ name: 'Birdnest Shop' }],
  openGraph: {
    title: 'Birdnest Shop - Premium Bird\'s Nest Products',
    description: 'Discover high-quality bird\'s nest products from Kien Giang',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="font-sans" data-scroll-behavior="smooth">
      <body>
        <Providers>
          <UserProvider>
            <HydrationSafe>
              <MaintenanceMode />
              <ResponsiveNavbar />
            </HydrationSafe>
            {children}
            <Footer />
          </UserProvider>
        </Providers>
      </body>
    </html>
  );
}
