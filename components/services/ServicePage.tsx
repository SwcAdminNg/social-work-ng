import type { LucideIcon } from "lucide-react";
import ServiceOpening from "./ServiceOpening";
import ServiceApproach from "./ServiceApproach";
import ServiceCommission from "./ServiceCommission";
import ServiceEnquiry from "./ServiceEnquiry";
import type { ServicePageContent } from "./types";

// A service page in the handovers' sequence: title and photograph, the
// service described, the support you can commission with its enquiry
// button, then the enquiry form.
export default function ServicePage({
  content,
  icons,
}: {
  content: ServicePageContent;
  icons: LucideIcon[];
}) {
  return (
    <>
      <ServiceOpening opening={content.opening} />
      <ServiceApproach approach={content.approach} />
      <ServiceCommission services={content.services} icons={icons} />
      <ServiceEnquiry enquiry={content.enquiry} />
    </>
  );
}
