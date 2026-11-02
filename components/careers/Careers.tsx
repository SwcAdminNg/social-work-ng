import CareersOpening from "./CareersOpening";
import Benefits from "./Benefits";
import Areas from "./Areas";
import Opportunities from "./Opportunities";
import InterestForm from "./InterestForm";

// The handover's sequence: the two-column introduction and the
// photograph, the three benefit columns, the areas of contribution, the
// three opportunity cards, then the expression-of-interest form.
export default function Careers() {
  return (
    <>
      <CareersOpening />
      <Benefits />
      <Areas />
      <Opportunities />
      <InterestForm />
    </>
  );
}
