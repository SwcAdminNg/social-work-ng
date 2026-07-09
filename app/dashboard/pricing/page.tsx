import { fetchApi } from "@/lib/fetchApi";
import { PricingPlanGrid } from "@/components/payments/PricingPlanGrid";
import { ActiveSubscriptionBanner } from "@/components/payments/ActiveSubscriptionBanner";
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

  // Fetch current subscription
  const subRes = await fetchApi(`/payments/subscriptions/current`, {
    next: { revalidate: 0 },
  });
  const subData = await subRes.json().catch(() => ({}));
  const currentSubscription = subData?.data;

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-0 py-8 lg:py-0">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Subscription Plans
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Upgrade your account to get unlimited access to all standard courses.
        </p>
      </div>

      {currentSubscription && (
        <ActiveSubscriptionBanner
          subscription={currentSubscription}
          allPlans={plans}
        />
      )}

      <PricingPlanGrid
        plans={plans}
        isLoggedIn={!!session}
        currentSubscription={currentSubscription}
      />
    </div>
  );
}
