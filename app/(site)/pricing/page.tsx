import { fetchApi } from "@/lib/fetchApi";
import { PricingPlanGrid } from "@/components/payments/PricingPlanGrid";
import { auth } from "@/auth";

export const metadata = {
  title: "Pricing & Plans | Social Work Consultancy",
  description: "Unlock unlimited access to all standard courses.",
};

export default async function PricingPage() {
  const session = await auth();

  // Fetch plans from the backend
  const res = await fetchApi(`/payments/plans`, { next: { revalidate: 60 } });
  const data = await res.json().catch(() => ({}));
  const plans = data?.data || [];

  // Fetch current subscription if logged in
  let currentSubscription = null;
  if (session) {
    const subRes = await fetchApi(`/payments/subscriptions/current`, {
      next: { revalidate: 0 },
    });
    const subData = await subRes.json().catch(() => ({}));
    currentSubscription = subData?.data;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 lg:py-20">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
          Invest in your{" "}
          <span className="text-[#2D6A4F] dark:text-[#52b788]">
            career growth
          </span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Subscribe to get unlimited access to our entire library of standard
          social work courses, verified certificates, and more.
        </p>
      </div>

      <PricingPlanGrid
        plans={plans}
        isLoggedIn={!!session}
        currentSubscription={currentSubscription}
      />

      <div className="mt-24 text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Frequently Asked Questions
        </h2>
        <div className="space-y-8 text-left mt-10">
          <div>
            <h4 className="font-bold text-lg text-gray-900 dark:text-white">
              Can I cancel my subscription?
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Yes, you can cancel your subscription at any time from your
              dashboard settings. You will continue to have access until the end
              of your billing period.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-lg text-gray-900 dark:text-white">
              What happens to my certificates if I cancel?
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              You keep all the certificates you earned while your subscription
              was active forever. They remain verifiable through our platform.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-lg text-gray-900 dark:text-white">
              Are exclusive courses included?
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Exclusive premium courses are not included in standard
              subscription plans and must be purchased separately. However,
              subscribers often get discounts on exclusive content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
