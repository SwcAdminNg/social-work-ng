import Navbar from "@/components/generic/essentials/Navbar";
import Footer from "@/components/generic/essentials/Footer";
import { auth } from "@/auth";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <>
      <Navbar isLoggedIn={!!session} />
      {children}
      <Footer />
    </>
  );
}
