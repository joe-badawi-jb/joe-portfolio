import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "./providers";
import Header from "./components/header/Header";
import Footer from "./components/sections/Footer";
import RouteLoader from "./components/loader/RouteLoader";
import ScrollToTop from "./components/ui/ScrollToTop";
import ScrollTopOnNavigate from "./components/ui/ScrollTopOnNavigate";
import MobileNotice from "./components/ui/MobileNotice";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

// Absolute base for OG/Twitter image URLs. Set NEXT_PUBLIC_SITE_URL to your
// real domain in production so social previews resolve correctly.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://joebadawi.com";

const description =
  "Joe El Badawi is a software engineer crafting fast, accessible, and polished web experiences with Next.js, React, and TypeScript. Explore his projects, skills, and work.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Joe El Badawi — Software Engineer",
    template: "%s — Joe El Badawi",
  },
  description,
  keywords: [
    "Joe El Badawi",
    "Joe Badawi",
    "Software Engineer",
    "Web Developer",
    "Frontend Developer",
    "Full-Stack Developer",
    "Next.js",
    "React",
    "TypeScript",
    "Portfolio",
  ],
  authors: [{ name: "Joe El Badawi" }],
  creator: "Joe El Badawi",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Joe El Badawi",
    title: "Joe El Badawi — Software Engineer",
    description,
    images: [
      {
        url: "/assets/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Joe El Badawi — Software Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Joe El Badawi — Software Engineer",
    description,
    images: ["/assets/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <ScrollTopOnNavigate />
          <RouteLoader />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <ScrollToTop />
          <MobileNotice />
        </Providers>

        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-PKQZDWCNMM"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PKQZDWCNMM');
          `}
        </Script>
      </body>
    </html>
  );
}
