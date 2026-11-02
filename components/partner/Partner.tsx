import PartnerBanner from "./PartnerBanner";
import Ways from "./Ways";
import Reasons from "./Reasons";
import Process from "./Process";

// The handover's sequence: the two-column banner, the four ways to
// partner, the reasons to partner, how a partnership is built (in the
// old past-partnerships area) and the closing email invitation.
export default function Partner() {
  return (
    <>
      <PartnerBanner />
      <Ways />
      <Reasons />
      <Process />
    </>
  );
}
