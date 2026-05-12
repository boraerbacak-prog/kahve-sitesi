import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import CartPanel from "@/components/CartPanel";
import Providers from "@/components/Providers";
import FloatingBarista from "@/components/FloatingBarista";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rostello - Özel Kahve",
  description: "En taze özel kahve çekirdekleri, özenle kavrulur.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#f8f6f3] text-[#1a1a1a]">
        <Providers>
          <Header />
          <CartPanel />
          <main className="flex-1">{children}</main>
          <FloatingBarista />
        </Providers>
      </body>
    </html>
  );
}
