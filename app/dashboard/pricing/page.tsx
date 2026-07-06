import { fetchApi } from "@/lib/fetchApi";
import { PricingPlanGrid } from "@/components/payments/PricingPlanGrid";
import { auth } from "@/auth";

export const metadata = {
  title: "Subscription Plans | Dashboard",
};

export default async function DashboardPricingPage() {
  const session = await auth();
  
  // Fetch plans from the backend
  const res = await fetchApi(`/payments/plans`, { next: { revalidate: 60 } });
  const data = await res.json().catch(() => ({}));
  const plans = data?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription Plans</h1>
        <p className="text-sm text-gray-500 mt-1">Upgrade your account to get unlimited access to all standard courses.</p>
      </div>

      <PricingPlanGrid plans={plans} isLoggedIn={!!session} />
    </div>
  );
}
