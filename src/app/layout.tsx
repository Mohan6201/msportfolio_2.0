import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import ChatWidget from "@/components/chat/ChatWidget";
import ScrollProgress from "@/components/ui/ScrollProgress";
import BackToTop from "@/components/ui/BackToTop";
import CursorGlow from "@/components/ui/CursorGlow";
import CommandPalette from "@/components/ui/CommandPalette";
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
  metadataBase: new URL("https://mohan6201.vercel.app"),
  title: "MS Portfolio | Mohana Srinivasan",
  description:
    "AWS DevOps Engineer with 4+ years building production-grade cloud infrastructure, CI/CD pipelines, and Kubernetes deployments on AWS — currently at Swirepay.",
  keywords: [
    "DevOps Engineer", "AWS Engineer", "Cloud Engineer", "CI/CD",
    "Docker", "Kubernetes", "Terraform", "GitHub Actions",
    "Mohana Srinivasan", "Swirepay", "Hyderabad",
  ],
  authors: [{ name: "Mohana Srinivasan", url: "https://mohan6201.vercel.app" }],
  creator: "Mohana Srinivasan",
  icons: {
    icon: [
      { url: "/icons/ms-icon.svg", type: "image/svg+xml" },
      { url: "/icons/ms-icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/ms-icon-16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/icons/ms-icon-32.png",
    apple: "/icons/ms-icon-180.png",
  },
  openGraph: {
    title: "MS Portfolio | Mohana Srinivasan",
    description:
      "Portfolio of Mohana Srinivasan — AWS DevOps Engineer specialising in cloud infrastructure, CI/CD automation, and Kubernetes deployments.",
    type: "website",
    url: "https://mohan6201.vercel.app",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Mohana Srinivasan",
    jobTitle: "AWS DevOps Engineer",
    url: "https://mohan6201.vercel.app",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body text-white relative overflow-x-hidden bg-darkBrown">
        <CursorGlow />
        <ScrollProgress />
        {children}
        <BackToTop />
        <ChatWidget />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
