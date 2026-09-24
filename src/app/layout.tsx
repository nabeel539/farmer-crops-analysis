import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/components/providers/AppProviders';

export const metadata: Metadata = {
  title: 'Krishi AgriTech | Farmer & Wheat Crop Monitoring System',
  description: 'Comprehensive wheat farming lifecycle management: Seed distribution, GPS parcel verification, crop cycle stages, field activities, harvest tracking, and flour milling analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground antialiased selection:bg-primary/20">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

