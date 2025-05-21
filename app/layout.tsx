import type { Metadata } from "next";
import localFont from "next/font/local";
import { Montserrat } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { SupabaseProvider } from "@/components/SupabaseProvider";
import { ToastProvider } from "@/components/ToastProvider";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Define Montserrat font
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
});

// Since Proxima Nova is a commercial font, we'll use a fallback system font
const proximaNova = localFont({
  src: './fonts/GeistVF.woff', // Using Geist as a fallback
  variable: '--font-proxima-nova',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: "Supply Stack Construction",
  description: "Find construction materials with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} ${proximaNova.variable} antialiased font-montserrat bg-background text-dark-gray`}
        >
          <SupabaseProvider>
            <main className="min-h-screen">
              {children}
            </main>
            <ToastProvider />
          </SupabaseProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
