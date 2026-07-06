import { SubscriptionButton } from "./SubscriptionButton";

interface Plan {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  price: number;
  is_free_trial: boolean;
  is_active: boolean;
}

interface PricingPlanGridProps {
  plans: Plan[];
  isLoggedIn: boolean;
}

export function PricingPlanGrid({ plans, isLoggedIn }: PricingPlanGridProps) {
  if (!plans || plans.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
        <p className="text-gray-500 dark:text-gray-400">No subscription plans available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {plans.filter(p => p.is_active).map((plan, idx) => {
        // Highlight the middle plan or the one with "Pro" in the name
        const isHighlighted = plan.name.toLowerCase().includes("pro") || idx === 1;

        return (
          <div 
            key={plan.id}
            className={`relative flex flex-col p-8 rounded-3xl transition-transform hover:-translate-y-2 ${
              isHighlighted 
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-2xl shadow-gray-900/20 dark:shadow-white/10 border-2 border-gray-900 dark:border-white scale-105 z-10" 
                : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg"
            }`}
          >
            {isHighlighted && (
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <span className="px-4 py-1 text-xs font-bold uppercase tracking-wider bg-[#2D6A4F] text-white rounded-full shadow-md">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="mb-8">
              <h3 className={`text-2xl font-bold mb-2 ${isHighlighted ? "text-white dark:text-gray-900" : "text-gray-900 dark:text-white"}`}>
                {plan.name}
              </h3>
              <p className={`text-sm ${isHighlighted ? "text-gray-300 dark:text-gray-600" : "text-gray-500 dark:text-gray-400"}`}>
                {plan.description || "Get unlimited access to all standard courses."}
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className={`text-4xl font-extrabold tracking-tight ${isHighlighted ? "text-white dark:text-gray-900" : "text-gray-900 dark:text-white"}`}>
                  ₦{plan.price.toLocaleString()}
                </span>
                <span className={`text-sm font-medium ${isHighlighted ? "text-gray-300 dark:text-gray-600" : "text-gray-500 dark:text-gray-400"}`}>
                  /{plan.duration_days} days
                </span>
              </div>
              {plan.is_free_trial && (
                <p className="mt-2 text-sm font-semibold text-[#2D6A4F] dark:text-[#52b788]">Includes free trial</p>
              )}
            </div>

            <div className="flex-1">
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <span className={`w-1.5 h-1.5 rounded-full ${isHighlighted ? "bg-[#2D6A4F]" : "bg-[#2D6A4F]"}`} />
                  <span className={`text-sm ${isHighlighted ? "text-gray-200 dark:text-gray-700" : "text-gray-600 dark:text-gray-400"}`}>
                    Access to all standard courses
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <span className={`w-1.5 h-1.5 rounded-full ${isHighlighted ? "bg-[#2D6A4F]" : "bg-[#2D6A4F]"}`} />
                  <span className={`text-sm ${isHighlighted ? "text-gray-200 dark:text-gray-700" : "text-gray-600 dark:text-gray-400"}`}>
                    Cancel anytime
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <span className={`w-1.5 h-1.5 rounded-full ${isHighlighted ? "bg-[#2D6A4F]" : "bg-[#2D6A4F]"}`} />
                  <span className={`text-sm ${isHighlighted ? "text-gray-200 dark:text-gray-700" : "text-gray-600 dark:text-gray-400"}`}>
                    Certificate of completion
                  </span>
                </li>
              </ul>
            </div>

            <div className={isHighlighted ? "filter invert" : ""}>
               {/* We can invert the button colors inside the highlighted card if needed, or SubscriptionButton can handle it.
                   Actually, SubscriptionButton uses #2D6A4F which looks good on both dark and light modes. */}
              <SubscriptionButton 
                planId={plan.id}
                price={plan.price}
                isLoggedIn={isLoggedIn}
                planName={plan.name}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
