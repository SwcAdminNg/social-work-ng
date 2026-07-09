"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown, CheckCircle2 } from "lucide-react";

// The FAQ Data Structure
type FAQCategory =
  | "General"
  | "Courses"
  | "Mentorship"
  | "Certification"
  | "Pricing";

interface FAQItem {
  id: string;
  category: FAQCategory;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: "g1",
    category: "General",
    question: "Who is Social Work Nigeria for?",
    answer:
      "Our platform is designed for aspiring social workers, current practitioners, healthcare professionals, and anyone interested in building an ethical, evidence-based career in social work within Nigeria.",
  },
  {
    id: "g2",
    category: "General",
    question: "Are your programs recognized internationally?",
    answer:
      "Yes. While our content is heavily contextualised for the Nigerian landscape, our training programs align with global social work standards and best practices.",
  },
  {
    id: "c1",
    category: "Courses",
    question: "How do I enroll in a course?",
    answer:
      "Simply create an account on our platform, browse the 'Courses' section, and click on 'Enroll'. You can start learning immediately after successful registration.",
  },
  {
    id: "c2",
    category: "Courses",
    question: "Are the courses self-paced?",
    answer:
      "Absolutely. All our online courses are self-paced, allowing you to learn at your convenience and balance your studies with your professional commitments.",
  },
  {
    id: "m1",
    category: "Mentorship",
    question: "How does the mentorship program work?",
    answer:
      "Our mentorship program pairs you with experienced social work professionals. You will have access to one-on-one sessions, career guidance, and practical insights to navigate the social work landscape in Nigeria.",
  },
  {
    id: "m2",
    category: "Mentorship",
    question: "Is there a fee for the mentorship program?",
    answer:
      "We offer both free community mentorship tiers and premium one-on-one dedicated mentorship packages. Please visit the Pricing page for detailed information.",
  },
  {
    id: "cert1",
    category: "Certification",
    question: "Will I receive a certificate upon completion?",
    answer:
      "Yes, upon successfully completing all modules and assessments in a course, you will receive a verifiable, CPD-accredited certificate of completion.",
  },
  {
    id: "cert2",
    category: "Certification",
    question: "Do these courses count toward my CPD hours?",
    answer:
      "Yes, our certified courses count toward your Continuing Professional Development (CPD) hours, helping you maintain your professional licenses and credentials.",
  },
  {
    id: "p1",
    category: "Pricing",
    question: "Can I cancel my subscription?",
    answer:
      "Yes, you can cancel your subscription at any time from your dashboard settings. You will continue to have access to your plan's benefits until the end of your current billing period.",
  },
  {
    id: "p2",
    category: "Pricing",
    question: "What happens to my certificates if I cancel?",
    answer:
      "You keep all the certificates you earned while your subscription was active forever. They remain completely verifiable through our platform indefinitely.",
  },
  {
    id: "p3",
    category: "Pricing",
    question:
      "Are exclusive premium courses included in the standard subscription?",
    answer:
      "No, exclusive premium courses are not included in the standard subscription plans and must be purchased separately. However, active subscribers often receive special discounts on exclusive content.",
  },
];

const categories: ("All" | FAQCategory)[] = [
  "All",
  "General",
  "Courses",
  "Mentorship",
  "Certification",
  "Pricing",
];

export function FAQContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | FAQCategory>(
    "All",
  );
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const filteredFAQs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        selectedCategory === "All" || faq.category === selectedCategory;
      const matchesSearch =
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <section className="py-20 px-6 bg-gray-50 dark:bg-[#0a0a0a] flex-1">
      <div className="max-w-4xl mx-auto">
        {/* Search Bar */}
        <div className="relative mb-2 transform -translate-y-28 z-30">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <div className="w-[3.25rem] h-[3.25rem] bg-gray-50 dark:bg-gray-800/80 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-500">
              <Search className="h-6 w-6" />
            </div>
          </div>
          <input
            type="text"
            className="block w-full pl-20 pr-6 py-5 border-0 rounded-2xl text-lg text-gray-900 dark:text-white bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/50 dark:shadow-none ring-1 ring-gray-100 dark:ring-gray-800 focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 transition-all placeholder:text-gray-400"
            placeholder="Search for answers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto items-center md:flex-wrap md:justify-center gap-3 mb-7 mt-1 pb-4 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setOpenId(null);
              }}
              className={`flex-shrink-0 whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm ${
                selectedCategory === cat
                  ? "bg-[#2D6A4F] text-white shadow-md shadow-[#2D6A4F]/20"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-[#2D6A4F] dark:hover:border-[#52b788] hover:text-[#2D6A4F] dark:hover:text-[#52b788]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQs List */}
        <div className="space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`bg-white dark:bg-gray-900 rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? "border-[#2D6A4F]/50 dark:border-[#52b788]/50 shadow-md"
                      : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                  }`}
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none focus-visible:bg-gray-50 dark:focus-visible:bg-gray-800/50"
                  >
                    <span
                      className={`text-[1.05rem] md:text-lg font-bold pr-4 transition-colors ${isOpen ? "text-[#2D6A4F] dark:text-[#52b788]" : "text-gray-900 dark:text-gray-100"}`}
                    >
                      {faq.question}
                    </span>
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${isOpen ? "bg-[#2D6A4F]/10 dark:bg-[#52b788]/10 rotate-180" : "bg-gray-100 dark:bg-gray-800"}`}
                    >
                      <ChevronDown
                        className={`w-5 h-5 ${isOpen ? "text-[#2D6A4F] dark:text-[#52b788]" : "text-gray-500"}`}
                      />
                    </span>
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden min-h-0">
                      <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed pt-2 border-t border-gray-100 dark:border-gray-800/50 flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]/60 dark:text-[#52b788]/60" />
                        </div>
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No answers found
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                We couldn't find any FAQs matching "{searchTerm}". Try another
                search term.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
