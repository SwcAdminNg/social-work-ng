import type { LucideIcon } from "lucide-react";
import {
  Award,
  Bell,
  BookOpen,
  CircleHelp,
  ClipboardCheck,
  CreditCard,
  FileText,
  LayoutDashboard,
  LibraryBig,
  Radio,
  Settings,
  ShoppingCart,
  TicketCheck,
  UsersRound,
} from "lucide-react";
import type { BadgeCounts } from "./BadgeCounts";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Which live count, if any, sits beside the label. */
  badge?: keyof BadgeCounts;
};

export type NavGroup = {
  label?: string;
  items: NavItem[];
};

export const dashboardNavGroups: NavGroup[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
    ],
  },
  {
    label: "My Learning",
    items: [
      { label: "My Courses", href: "/dashboard/courses", icon: BookOpen },
      {
        label: "Assessments",
        href: "/dashboard/assessments",
        icon: ClipboardCheck,
      },
      {
        label: "Certificates",
        href: "/dashboard/certificates",
        icon: Award,
      },
    ],
  },
  {
    label: "Explore",
    items: [
      {
        label: "Course Catalogue",
        href: "/dashboard/course-catalogue",
        icon: LibraryBig,
      },
      {
        label: "Live Sessions",
        href: "/dashboard/live-sessions",
        icon: Radio,
      },
      { label: "Resources", href: "/dashboard/resources", icon: FileText },
      {
        label: "Community",
        href: "/dashboard/community",
        icon: UsersRound,
        badge: "community",
      },
      { label: "Cart", href: "/dashboard/cart", icon: ShoppingCart, badge: "cart" },
    ],
  },
  {
    label: "Support",
    items: [
      { label: "Help Centre", href: "/faq", icon: CircleHelp },
      {
        label: "My Support Tickets",
        href: "/dashboard/support-tickets",
        icon: TicketCheck,
        badge: "support",
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        label: "Profile Settings",
        href: "/dashboard/settings",
        icon: Settings,
      },
      {
        label: "Payment & Billing",
        href: "/dashboard/orders",
        icon: CreditCard,
      },
    ],
  },
];

export const dashboardNavItems = dashboardNavGroups.flatMap(
  (group) => group.items,
);

/** The four destinations kept one tap away on small screens. */
export const dashboardTabs: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Courses", href: "/dashboard/courses", icon: BookOpen },
  { label: "Explore", href: "/dashboard/course-catalogue", icon: LibraryBig },
  {
    label: "Community",
    href: "/dashboard/community",
    icon: UsersRound,
    badge: "community",
  },
];

export function isNavItemActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getPageTitle(pathname: string): string {
  const exact = dashboardNavItems.find((item) => item.href === pathname);
  if (exact) return exact.label;

  const nested = dashboardNavItems
    .filter(
      (item) => item.href !== "/dashboard" && pathname.startsWith(item.href),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];

  return nested?.label ?? "Dashboard";
}
