import ElearningOpening from "./ElearningOpening";
import Offer from "./Offer";
import Audiences from "./Audiences";
import Expect from "./Expect";

// The handover's sequence: title and photograph, the learning offer
// with its audiences and approach, the five features, and the course
// button with the qualification clarification beside it.
export default function Elearning() {
  return (
    <>
      <ElearningOpening />
      <Offer />
      <Audiences />
      <Expect />
    </>
  );
}
