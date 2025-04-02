import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";

const inter = Inter({ subsets: ["latin"] });
const firaCode = Fira_Code({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-fira-code'
});

export const metadata: Metadata = {
  title: "b3ll",
  description: "A bell timer for school schedules",
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
        <script src="https://cdn.lordicon.com/lordicon.js"></script>
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <ClientBody>{children}</ClientBody>
      </body>
    </html>
  );
}
