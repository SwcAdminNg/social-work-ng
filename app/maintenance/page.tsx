import type { Metadata } from "next";
import { Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Under Maintenance | Social Work Nigeria",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <main className="min-h-[100dvh] w-full flex items-center justify-center bg-white dark:bg-[#0a0a0a] px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#2D6A4F]/10 dark:bg-[#2D6A4F]/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#F4A261]/10 dark:bg-[#F4A261]/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-lg text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F]">
          <Wrench className="h-9 w-9" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          We&apos;ll be back soon
        </h1>
        <p className="mt-4 text-base leading-relaxed text-gray-600 dark:text-gray-400">
          Social Work Nigeria is currently undergoing scheduled maintenance.
          We&apos;re working to get everything back up as quickly as possible.
          Thank you for your patience.
        </p>
      </div>
    </main>
  );
}
