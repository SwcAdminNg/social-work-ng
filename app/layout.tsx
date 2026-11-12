import type { Metadata, Viewport } from "next";
import { shareImages, site } from "@/lib/site";
import "./fonts.css";
import "./globals.css";
import { bodyFont, preloadBodyFont } from "@/lib/fonts";
import ThemeProvider from "@/components/generic/ThemeProvider";
import ThemeToggle from "@/components/generic/ThemeToggle";
import { auth } from "@/auth";
import SessionMonitor from "@/components/auth/SessionMonitor";
import QueryProvider from "@/components/generic/QueryProvider";
import { Toaster } from "sonner";

// Defaults for every page. Public pages add their own with pageMetadata().
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.name,
  description: site.description,
  applicationName: site.name,
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    title: site.name,
    description: site.description,
    images: [{ url: shareImages.home, width: 1200, height: 630, alt: site.name }],
  },
  twitter: { card: "summary_large_image", title: site.name, description: site.description, images: [shareImages.home] },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0c2a1e" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1410" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  preloadBodyFont();

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${bodyFont} antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            <SessionMonitor session={session}>
              {children}
              <ThemeToggle />
              <Toaster richColors position="top-right" />
            </SessionMonitor>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
