import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import ClientInit from "../components/ClientInit";
import SplashWrapper from "@/components/SplashWrapper";
import Footer from "../components/Footer";
import { SearchProvider } from "@/contexts/SearchContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KāSi",
  description: "Discover the best products at KāSi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <SearchProvider>
            <SplashWrapper>
              <ClientInit />
              {children}
              <Footer />
            </SplashWrapper>
          </SearchProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
