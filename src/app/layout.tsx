import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Lora, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/components/providers/AppProviders';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

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
    <html lang="en" className={`h-full ${plusJakartaSans.variable} ${lora.variable} ${ibmPlexMono.variable}`}>
      <body className={`min-h-full flex flex-col font-sans bg-background text-foreground antialiased selection:bg-primary/20 ${plusJakartaSans.className}`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}


