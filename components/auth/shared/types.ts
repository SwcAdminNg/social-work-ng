/** Figures shown on the sign-in panel; only real numbers from the API. */
export type HomeStats = { total_number_of_students?: number; number_of_published_courses?: number } | null;

/** The signed-in session the API hands back once two-factor is complete. */
export type SessionData = Record<string, unknown>;

/** The message of a thrown value, or a fallback when it has none. */
export function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}
