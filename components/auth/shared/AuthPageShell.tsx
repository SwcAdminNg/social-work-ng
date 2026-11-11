import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import HydrationGate from "@/components/site/HydrationGate";
import type { HomeStats } from "./types";
import "./auth.css";

type AuthVariant = "login" | "register" | "forgot-password" | "reset-password";

/**
 * The frame of every sign-in screen, after Apple's account sign-in: the
 * wordmark and a way back at the top, one glass sheet in the middle over a
 * slowly drifting brand glow, and the legal line at the foot.
 *
 * `stage` names the current step; changing it replays the entry motion, so
 * moving from password to code feels like a new sheet sliding in.
 */
export function AuthPageShell({
  children,
  stage,
  wide,
}: {
  children: React.ReactNode;
  variant?: AuthVariant;
  statsData?: HomeStats;
  stage?: string;
  wide?: boolean;
}) {
  return (
    <HydrationGate className="au au-page">
      <div className="au-aura" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <header className="au-top">
        <Link href="/" className="au-brand" aria-label="Social Work Consultancy Ltd home">
          <Image src="/images/logo/swc-logo-on-light.webp" alt="" width={480} height={133} className="dark:hidden" priority />
          <Image src="/images/logo/swc-logo-on-dark.webp" alt="" width={480} height={133} className="hidden dark:block" priority />
        </Link>
        <Link href="/" className="au-pill">
          <ChevronLeft size={16} strokeWidth={2.4} aria-hidden="true" />
          Website
        </Link>
      </header>

      <main className="au-main">
        <div className="au-sheet" data-wide={wide || undefined}>
          <div key={stage ?? "main"} className="au-stage">
            {children}
          </div>
        </div>
      </main>

      <footer className="au-foot">
        <span>Copyright © {new Date().getFullYear()} Social Work Consultancy Ltd. All rights reserved.</span>
        <nav aria-label="Legal">
          <Link href="/privacy-policy">Privacy Policy</Link>
          <span aria-hidden="true">|</span>
          <Link href="/terms-of-service">Terms of Service</Link>
        </nav>
      </footer>
    </HydrationGate>
  );
}
