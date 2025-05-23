import React from "react";
import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import { ThemeProvider } from '@/lib/ThemeContext';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

const inter = Inter({ subsets: ["latin"] });
const firaCode = Fira_Code({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-fira-code'
});

export const metadata: Metadata = {
  title: "b3ll",
  description: "A bell timer for the Ardis G. Egan Junior High School schedule",
  icons: {
    icon: '/favicon.svg',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={firaCode.variable}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script async src="https://cdn.lordicon.com/lordicon.js"></script>
        {/* Add meta tags for better mobile experience */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#151718" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#151718" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script dangerouslySetInnerHTML={{__html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/service-worker.js');
            });
          }
        `}} />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        {/* PWA fallback message for offline mode */}
        <noscript>
          <div style={{background:'#151718',color:'#fff',padding:'1em',textAlign:'center'}}>Enable JavaScript for full offline support.</div>
        </noscript>
        <ThemeProvider>
          <div className="fixed top-4 right-4 z-50">
            <ThemeSwitcher />
          </div>
          <ClientBody>{children}</ClientBody>
        </ThemeProvider>
      </body>
    </html>
  );
}
