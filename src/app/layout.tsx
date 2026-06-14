import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartPanel from "@/components/CartPanel";
import FloatingBarista from "@/components/FloatingBarista";
import Providers from "@/components/Providers";
import ThemeProvider from "@/components/ThemeProvider";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Rostello - Özel Kahve",
  description: "En taze özel kahve çekirdekleri, özenle kavrulur.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${montserrat.variable}`}>
      <body className="min-h-screen flex flex-col bg-[var(--color-page)] text-[var(--color-heading)]">
        <Providers>
          <ThemeProvider>
          <Header />
          <CartPanel />
          <FloatingBarista />
          <main className="flex-1">{children}</main>
          <Footer />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
