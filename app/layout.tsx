import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/generic/ThemeProvider";
import ThemeToggle from "@/components/generic/ThemeToggle";
import { auth, signOut } from "@/auth";

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Social Work Consultancy",
  description:
    "Professional Training & CPD for Social Work Practice in Nigeria",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (session && (session as any).error === "RefreshAccessTokenError") {
    await signOut({ redirectTo: "/login" });
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.className} antialiased`}>
        <ThemeProvider>
          {children}
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
