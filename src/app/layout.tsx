import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import AppBanner from "@/components/AppBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Annonsen - Hitta det du söker, exakt",
  description: "En modern och premium marknadsplats för radannonser i Sverige.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Session hanteras nu i Navbar (Client Component)
  return (
    <html lang="sv">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <AppBanner />
          <main className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '2rem', paddingBottom: '2rem' }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
