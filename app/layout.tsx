import type { Metadata, Viewport } from "next";
import { shareImage, site } from "@/lib/site";
import { Roboto } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/generic/ThemeProvider";
import { auth } from "@/auth";
import SessionMonitor from "@/components/auth/SessionMonitor";
import QueryProvider from "@/components/generic/QueryProvider";
import { Toaster } from "sonner";

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["300", "400", "500", "700", "900"],
  subsets: ["latin"],
});


// Site-wide defaults. Pages set their own title (completed by the template
// below) and description; Open Graph and Twitter fields are inherited unless
// a page defines its own. The sharing image comes from app/opengraph-image.jpg.
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.organisation, url: site.url }],
  creator: site.organisation,
  publisher: site.organisation,
  category: "education",
  keywords: [
    "social work Nigeria",
    "social work training",
    "CPD for social workers",
    "social work e-learning",
    "research and evaluation",
    "policy and advocacy",
    "safeguarding training Nigeria",
    "Social Work Consultancy Ltd",
  ],
  formatDetection: { email: false, address: false, telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    url: "/",
    title: site.name,
    description: site.description,
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    images: [shareImage],
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1410" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" className={`${roboto.variable} scroll-smooth`} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${roboto.className} antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            <SessionMonitor session={session}>
              {children}
              <Toaster richColors position="top-right" />
            </SessionMonitor>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
