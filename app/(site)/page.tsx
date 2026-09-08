import Home from "@/components/home/Home";
import { LiveSessionReturnHandler } from "@/components/learning/LiveSessionReturnHandler";

export default function HomePage() {
  return (
    <>
      <LiveSessionReturnHandler />
      <Home />
    </>
  );
}
