import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandPanel, MobileBrandLogo } from "./BrandPanel";

type AuthVariant = "login" | "register" | "forgot-password" | "reset-password";
type HomeStats = { total_number_of_students?: number; number_of_published_courses?: number } | null;

export function AuthPageShell({
  children,
  variant = "login",
  statsData,
}: {
  children: React.ReactNode;
  variant?: AuthVariant;
  statsData?: HomeStats;
}) {
  return (
    <div className="flex min-h-[100dvh] bg-[#fbf8f0] dark:bg-[#0b1410]">
      <BrandPanel variant={variant} statsData={statsData} />

      <main className="relative flex flex-1 flex-col">
        <div className="flex justify-end px-5 pt-5 sm:px-8">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[#14402F] hover:bg-black/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9a6500] dark:text-[#95d5b2] dark:hover:bg-white/5 dark:focus-visible:outline-[#F3C56B]"
          >
            <ArrowLeft size={16} aria-hidden="true" /> Back to website
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-12 pt-4 sm:px-10 lg:px-14 xl:px-20">
          <div className="w-full max-w-[440px]">
            <MobileBrandLogo />
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
