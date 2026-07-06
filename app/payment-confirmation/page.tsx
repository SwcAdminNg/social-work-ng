import { Suspense } from "react";
import PaymentVerifier from "@/components/payments/PaymentVerifier";
import Navbar from "@/components/generic/essentials/Navbar";
import Footer from "@/components/generic/essentials/Footer";
import { auth } from "@/auth";

export const metadata = {
  title: "Payment Confirmation | Social Work Consultancy",
};

export default async function PaymentConfirmationPage() {
  const session = await auth();
  
  return (
    <>
      <Navbar isLoggedIn={!!session} />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center py-12">
        <Suspense fallback={
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#2D6A4F] border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <PaymentVerifier />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
