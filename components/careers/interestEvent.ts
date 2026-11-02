import type { OpportunityType } from "./content";

// The opportunity buttons tell the form which kind of opportunity the
// visitor is interested in before scrolling to it. The visitor can still
// change the selection.
export const INTEREST_EVENT = "swcl:interest";

export function announceInterest(type: OpportunityType) {
  window.dispatchEvent(
    new CustomEvent<OpportunityType>(INTEREST_EVENT, { detail: type }),
  );
}
