import type { LucideIcon } from "lucide-react";
import {
  Award,
  Bell,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  CircleHelp,
  ClipboardCheck,
  CreditCard,
  FileClock,
  FileText,
  LayoutDashboard,
  LibraryBig,
  LockKeyhole,
  MessagesSquare,
  NotebookPen,
  Radio,
  Route,
  Settings,
  ShoppingCart,
  TicketCheck,
  UsersRound,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
};

export type NavGroup = {
  label?: string;
  items: NavItem[];
};

export const dashboardNavGroups: NavGroup[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "My Learning",
    items: [
      { label: "My Courses", href: "/dashboard/courses", icon: BookOpen },
      {
        label: "Learning Progress",
        href: "/dashboard/learning-progress",
        icon: ChartNoAxesColumnIncreasing,
        disabled: true,
      },
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
      {
        label: "CPD Record",
        href: "/dashboard/cpd-record",
        icon: FileClock,
        disabled: true,
      },
      {
        label: "Reflective Journal",
        href: "/dashboard/reflective-journal",
        icon: NotebookPen,
        disabled: true,
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
      { label: "Cart", href: "/dashboard/cart", icon: ShoppingCart },
      {
        label: "Learning Pathways",
        href: "/dashboard/learning-pathways",
        icon: Route,
        disabled: true,
      },
      {
        label: "Live Sessions",
        href: "/dashboard/live-sessions",
        icon: Radio,
        disabled: true,
      },
      { label: "Resources", href: "/dashboard/resources", icon: FileText },
      {
        label: "Community",
        href: "/dashboard/community",
        icon: UsersRound,
      },
    ],
  },
  {
    label: "Support",
    items: [
      { label: "Help Centre", href: "/contact", icon: CircleHelp },
      {
        label: "My Support Tickets",
        href: "/dashboard/support-tickets",
        icon: TicketCheck,
      },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Profile Settings", href: "/dashboard/settings", icon: Settings },
      {
        label: "Payment & Billing",
        href: "/dashboard/orders",
        icon: CreditCard,
      },
      {
        label: "Notifications",
        href: "/dashboard/notifications",
        icon: Bell,
        disabled: true,
      },
      {
        label: "Privacy Settings",
        href: "/dashboard/privacy",
        icon: LockKeyhole,
        disabled: true,
      },
      {
        label: "Plans & Pricing",
        href: "/dashboard/pricing",
        icon: MessagesSquare,
      },
    ],
  },
];

export const dashboardNavItems = dashboardNavGroups.flatMap(
  (group) => group.items,
);

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
