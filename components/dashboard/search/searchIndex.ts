import type { LucideIcon } from "lucide-react";
import {
  Award,
  Bell,
  BookOpen,
  CircleHelp,
  ClipboardCheck,
  CreditCard,
  FileText,
  Fingerprint,
  KeyRound,
  LayoutDashboard,
  LibraryBig,
  ListChecks,
  LogOut,
  Mail,
  Moon,
  Radio,
  Receipt,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  TicketCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

/** A page or action the palette knows about without asking the server. */
export type StaticEntry = {
  id: string;
  title: string;
  /** Where it lives, shown as a breadcrumb under the title. */
  section: string;
  icon: LucideIcon;
  /** Other words people use for the same place. */
  keywords?: string[];
  href?: string;
  action?: "toggle-theme" | "sign-out";
};

export const STATIC_ENTRIES: StaticEntry[] = [
  { id: "p-home", title: "Dashboard", section: "Home", icon: LayoutDashboard, href: "/dashboard", keywords: ["home", "overview", "start", "activity"] },
  { id: "p-notifications", title: "Notifications", section: "Home", icon: Bell, href: "/dashboard/notifications", keywords: ["alerts", "inbox", "updates", "messages"] },
  { id: "p-courses", title: "My Courses", section: "My Learning", icon: BookOpen, href: "/dashboard/courses", keywords: ["enrolled", "learning", "progress", "continue", "classes"] },
  { id: "p-assessments", title: "Assessments", section: "My Learning", icon: ClipboardCheck, href: "/dashboard/assessments", keywords: ["essays", "assignments", "grades", "submissions", "exams"] },
  { id: "p-quiz-attempts", title: "Quiz Attempts", section: "My Learning", icon: ListChecks, href: "/dashboard/quiz-attempts", keywords: ["quizzes", "scores", "results", "tests"] },
  { id: "p-certificates", title: "Certificates", section: "My Learning", icon: Award, href: "/dashboard/certificates", keywords: ["certification", "awards", "cpd", "completion", "diploma"] },
  { id: "p-catalogue", title: "Course Catalogue", section: "Explore", icon: LibraryBig, href: "/dashboard/course-catalogue", keywords: ["browse", "courses", "explore", "find", "enrol", "shop"] },
  { id: "p-live", title: "Live Sessions", section: "Explore", icon: Radio, href: "/dashboard/live-sessions", keywords: ["webinar", "class", "zoom", "meeting", "schedule", "calendar", "events"] },
  { id: "p-resources", title: "Resources", section: "Explore", icon: FileText, href: "/dashboard/resources", keywords: ["library", "documents", "templates", "downloads", "policies", "files"] },
  { id: "p-community", title: "Community", section: "Explore", icon: UsersRound, href: "/dashboard/community", keywords: ["chat", "forum", "discussion", "groups", "rooms", "peers"] },
  { id: "p-cart", title: "Cart", section: "Explore", icon: ShoppingCart, href: "/dashboard/cart", keywords: ["basket", "checkout", "buy"] },
  { id: "p-pricing", title: "Plans & Pricing", section: "Explore", icon: Sparkles, href: "/dashboard/pricing", keywords: ["subscription", "upgrade", "membership", "premium", "plan"] },
  { id: "p-help", title: "Help Centre", section: "Support", icon: CircleHelp, href: "/faq", keywords: ["faq", "questions", "how to", "help"] },
  { id: "p-tickets", title: "My Support Tickets", section: "Support", icon: TicketCheck, href: "/dashboard/support-tickets", keywords: ["support", "help", "issue", "problem", "complaint", "ticket"] },
  { id: "p-contact", title: "Contact Us", section: "Support", icon: Mail, href: "/contact", keywords: ["email", "phone", "reach", "contact"] },
  { id: "p-settings", title: "Settings", section: "Account", icon: Settings, href: "/dashboard/settings", keywords: ["account", "preferences", "profile"] },
  { id: "p-profile", title: "Profile & photo", section: "Account › Settings", icon: UserRound, href: "/dashboard/settings", keywords: ["name", "avatar", "picture", "gender", "edit profile"] },
  { id: "p-username", title: "Username", section: "Account › Settings", icon: UserRound, href: "/dashboard/settings#username-head", keywords: ["handle", "change username"] },
  { id: "p-passkeys", title: "Passkeys", section: "Account › Sign-In & Security", icon: Fingerprint, href: "/dashboard/settings#passkeys-head", keywords: ["face id", "touch id", "fingerprint", "biometric", "webauthn"] },
  { id: "p-2fa", title: "Two-Factor Authentication", section: "Account › Sign-In & Security", icon: ShieldCheck, href: "/dashboard/settings#twofactor-head", keywords: ["2fa", "mfa", "authenticator", "otp", "security", "verification"] },
  { id: "p-password", title: "Change password", section: "Account › Sign-In & Security", icon: KeyRound, href: "/forgot-password", keywords: ["reset password", "forgot", "password"] },
  { id: "p-orders", title: "Payment & Billing", section: "Account", icon: CreditCard, href: "/dashboard/orders", keywords: ["orders", "payments", "invoices", "cards", "transactions", "billing"] },
  { id: "p-receipts", title: "Receipts & orders", section: "Account › Payment & Billing", icon: Receipt, href: "/dashboard/orders", keywords: ["receipt", "invoice", "history", "purchase"] },
  { id: "a-theme", title: "Switch light / dark mode", section: "Action", icon: Moon, action: "toggle-theme", keywords: ["theme", "appearance", "dark", "light", "night mode"] },
  { id: "a-signout", title: "Sign out", section: "Action", icon: LogOut, action: "sign-out", keywords: ["log out", "logout", "exit", "sign off"] },
];

/** Shown before anything is typed. */
export const SUGGESTED_IDS = ["p-courses", "p-catalogue", "p-live", "p-resources", "p-community", "p-certificates"];

const normalise = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");

/** Letters of `needle` appear in order in `hay` (a loose, typo-friendly match). */
function subsequence(needle: string, hay: string) {
  let i = 0;
  for (let j = 0; j < hay.length && i < needle.length; j++) if (hay[j] === needle[i]) i++;
  return i === needle.length;
}

/**
 * Scores how well one text answers the query. Every word of the query has to
 * land somewhere; a title that starts with it beats a word inside it, which
 * beats a loose in-order match. Zero means "no match".
 */
export function scoreText(query: string, title: string, extra: string[] = []): number {
  const words = normalise(query).split(/\s+/).filter(Boolean);
  if (!words.length) return 0;
  const t = normalise(title).trim();
  const titleWords = t.split(/\s+/);
  const others = extra.map(normalise);
  const whole = normalise(query).trim();

  let total = 0;
  if (t === whole) total += 120;
  else if (t.startsWith(whole)) total += 70;
  else if (others.some((k) => k.trim() === whole || k.startsWith(whole))) total += 45;

  for (const word of words) {
    let best = 0;
    if (titleWords.some((w) => w === word)) best = 40;
    else if (titleWords.some((w) => w.startsWith(word))) best = 32;
    else if (t.includes(word)) best = 22;
    else if (others.some((k) => k.split(/\s+/).some((w) => w.startsWith(word)))) best = 18;
    else if (others.some((k) => k.includes(word))) best = 12;
    else if (word.length >= 3 && subsequence(word, t.replace(/\s/g, ""))) best = 6;
    if (!best) return 0;
    total += best;
  }
  // Shorter titles are more likely to be exactly what was meant.
  return total - Math.min(t.length, 60) * 0.1;
}

export function searchStatic(query: string, limit = 6) {
  return STATIC_ENTRIES.map((entry) => ({
    entry,
    score: scoreText(query, entry.title, [...(entry.keywords ?? []), entry.section]),
  }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((hit) => hit.entry);
}
