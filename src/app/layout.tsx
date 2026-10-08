import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import ScrollSequenceBackground from "@/components/backgrounds/ScrollSequenceBackground";
import { getBackgroundFrames } from "@/lib/background-sequence";
import ScrollProgress from "@/components/layout/ScrollProgress";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { profile } from "@/data/profile";
import MotionProvider from "@/components/providers/MotionProvider";
import CustomCursor from "@/components/layout/CustomCursor";

const inter = localFont({
  src: "./fonts/Inter-Variable.woff2",
  variable: "--font-inter",
  weight: "100 900",
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
  themeColor: "#f6f7f5",
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const backgroundFrames = await getBackgroundFrames();
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(()=>{try{if(matchMedia("(prefers-reduced-motion: no-preference)").matches){document.documentElement.classList.add("motion-capable");window.__portfolioMotion=true;const s=document.createElement("style");s.id="intro-guard";s.textContent=".motion-capable:not(.motion-started) [data-intro],.motion-capable:not(.motion-started) [data-intro-stagger]>.stagger-item{opacity:0}";document.head.appendChild(s);setTimeout(()=>{if(!document.documentElement.classList.contains("motion-started"))document.documentElement.classList.remove("motion-capable")},2500)}}catch{}})()`,
          }}
        />
        {backgroundFrames[0] && (
          <link rel="preload" as="image" href={backgroundFrames[0]} fetchPriority="high" />
        )}
        {backgroundFrames[1] && (
          <link rel="prefetch" as="image" href={backgroundFrames[1]} />
        )}
      </head>
      <body className="isolate min-h-full flex flex-col bg-background text-foreground">
        <a className="skip-link" href="#main-content">Skip to content</a>
        <MotionProvider>
          <SmoothScroll>
            <ScrollSequenceBackground frames={backgroundFrames} />
            <div className="background-veil" aria-hidden="true" />
            <ScrollProgress />
            <CustomCursor />
            <Navbar />
            <main id="main-content" tabIndex={-1} className="relative z-10 flex-1">{children}</main>
            <div className="relative z-10"><Footer /></div>
          </SmoothScroll>
        </MotionProvider>
      </body>
    </html>
  );
}
