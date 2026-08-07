import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Fraunces, Bodoni_Moda } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import BackgroundLayer from "@/components/three/BackgroundLayer";
import ScrollProgress from "@/components/layout/ScrollProgress";
import CustomCursor from "@/components/layout/CustomCursor";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { profile } from "@/data/profile";

const inter = localFont({
  src: "./fonts/Inter-Variable.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  style: ["normal", "italic"],
  display: "swap",
});

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  style: ["normal", "italic"],
  display: "swap",
});

const siteUrl = "https://vishwadayarathne.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${profile.name} — Software Engineer`,
  description: profile.tagline,
  keywords: [
    "Vishwa Dayarathne",
    "Software Engineer",
    "Backend Developer",
    "Spring Boot",
    "Portfolio",
    "Sri Lanka",
  ],
  authors: [{ name: profile.name }],
  openGraph: {
    title: `${profile.name} — Software Engineer`,
    description: profile.tagline,
    url: siteUrl,
    siteName: profile.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — Software Engineer`,
    description: profile.tagline,
  },
};

export const viewport: Viewport = {
  themeColor: "#05050a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${bodoniModa.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SmoothScroll>
          <BackgroundLayer />
          <div className="grain" aria-hidden="true" />
          <CustomCursor />
          <ScrollProgress />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
