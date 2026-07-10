import {
  IconBookOpen,
  IconClipboardCheck,
  IconGrid,
  IconReceipt,
  IconSettings,
  IconCreditCard,
} from "./icons";

export type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType;
};

export const dashboardNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: IconGrid },
  { label: "Enrolled Courses", href: "/dashboard/courses", icon: IconBookOpen },
  {
    label: "My Quiz Attempts",
    href: "/dashboard/quiz-attempts",
    icon: IconClipboardCheck,
  },
  { label: "Order History", href: "/dashboard/orders", icon: IconReceipt },
  {
    label: "Plans & Pricing",
    href: "/dashboard/pricing",
    icon: IconCreditCard,
  },
  { label: "Settings", href: "/dashboard/settings", icon: IconSettings },
];

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
