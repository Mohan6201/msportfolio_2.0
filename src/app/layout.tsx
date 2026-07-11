import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import ChatWidget from "@/domains/profile/components/chat/ChatWidget";
import ScrollProgress from "@/components/ui/ScrollProgress";
import BackToTop from "@/components/ui/BackToTop";
import CursorGlow from "@/components/ui/CursorGlow";
import CommandPalette from "@/components/ui/CommandPalette";
import { PDFViewerProvider } from "@/components/ui/PDFViewer";
import PageTracker from "@/components/ui/PageTracker";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space", display: "swap" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://m-s-r-portfolio.vercel.app"),
  title: "MS Portfolio | Mohana Srinivasan",
  description:
    "AWS DevOps Engineer with 4+ years building production-grade cloud infrastructure, CI/CD pipelines, and Kubernetes deployments on AWS — currently at Swirepay.",
  keywords: [
    "DevOps Engineer", "AWS Engineer", "Cloud Engineer", "CI/CD",
    "Docker", "Kubernetes", "Terraform", "GitHub Actions",
    "Mohana Srinivasan", "Swirepay", "Hyderabad",
  ],
  authors: [{ name: "Mohana Srinivasan", url: "https://m-s-r-portfolio.vercel.app" }],
  creator: "Mohana Srinivasan",
  icons: {
    icon: [
      { url: "/icons/Actual_Logo.ico",    type: "image/x-icon", sizes: "any" },
    ],
    shortcut: "/icons/Actual_Logo.ico",
    apple: [{ url: "/icons/apple-touch.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "MS Portfolio | Mohana Srinivasan",
    description:
      "Portfolio of Mohana Srinivasan — AWS DevOps Engineer specialising in cloud infrastructure, CI/CD automation, and Kubernetes deployments.",
    type: "website",
    url: "https://m-s-r-portfolio.vercel.app",
    siteName: "Mohana Srinivasan",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "MS Portfolio | Mohana Srinivasan",
    description: "AWS DevOps Engineer — cloud infra, CI/CD, Docker, Kubernetes, Terraform.",
    creator: "@Mohan6201",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#05080f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Mohana Srinivasan",
    jobTitle: "AWS DevOps Engineer",
    url: "https://m-s-r-portfolio.vercel.app",
    email: "mohandevopssme@gmail.com",
    worksFor: { "@type": "Organization", name: "Swirepay" },
    sameAs: [
      "https://www.linkedin.com/in/mohan6201",
      "https://github.com/Mohan6201",
    ],
    knowsAbout: ["AWS", "DevOps", "Docker", "Kubernetes", "CI/CD", "Terraform", "Helm", "Vault"],
  };

  return (
    <html
      lang="en"
      className={cn(inter.variable, spaceGrotesk.variable, jetbrainsMono.variable)}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body text-white relative overflow-x-hidden bg-darkBrown">
        <PDFViewerProvider>
          <CursorGlow />
          <ScrollProgress />
          <PageTracker />
          {children}
          <BackToTop />
          <ChatWidget />
          <Analytics />
          <SpeedInsights />
        </PDFViewerProvider>
      </body>
    </html>
  );
}
