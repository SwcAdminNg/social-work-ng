import PolicyOpening from "./PolicyOpening";
import Approach from "./Approach";
import Commission from "./Commission";
import Enquiry from "./Enquiry";

// The handover's sequence: title and photograph, the service described,
// the support you can commission with its enquiry button, then the form.
export default function PolicyAdvocacy() {
  return (
    <>
      <PolicyOpening />
      <Approach />
      <Commission />
      <Enquiry />
    </>
  );
}
