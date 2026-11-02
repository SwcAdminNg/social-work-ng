import MentorshipOpening from "./MentorshipOpening";
import MentorshipIntro from "./MentorshipIntro";
import MentorshipJoin from "./MentorshipJoin";
import { MentorshipForm } from "./MentorshipForm";

// The programme named over its photograph, why it matters and what we
// offer, who can join and how it works, then the enquiry form.
export default function Mentorship() {
  return (
    <>
      <MentorshipOpening />
      <MentorshipIntro />
      <MentorshipJoin />
      <MentorshipForm />
    </>
  );
}
