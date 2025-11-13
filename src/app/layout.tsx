import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DomesticWorker - Connecting Domestic Workers with Trusted Households",
  description: "A comprehensive platform for domestic workers, employers, and placement agencies. Find the perfect match, manage contracts, and ensure secure payments.",
  keywords: ["domestic worker", "household help", "placement agency", "maid service", "caregiver", "nanny", "cleaning services"],
  authors: [{ name: "DomesticWorker Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "DomesticWorker - Connecting Domestic Workers with Trusted Households",
    description: "Find trusted domestic helpers, manage contracts, and ensure secure payments through our comprehensive platform.",
    url: "https://domesticworker.com",
    siteName: "DomesticWorker",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DomesticWorker - Connecting Domestic Workers with Trusted Households",
    description: "Find trusted domestic helpers, manage contracts, and ensure secure payments through our comprehensive platform.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
