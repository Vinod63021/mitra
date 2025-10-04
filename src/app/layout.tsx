import type { Metadata } from 'next';
import { Belleza, Alegreya } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

// Define fonts using next/font
const belleza = Belleza({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-belleza',
});

const alegreya = Alegreya({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
  variable: '--font-alegreya',
});

export const metadata: Metadata = {
  title: 'PCOS Digital Twin',
  description: 'Your Personalized Health Companion for PCOS Management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Fonts links are managed by next/font, no need for direct <link> tags unless for fonts not handled by next/font */}
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased",
          belleza.variable,
          alegreya.variable
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
