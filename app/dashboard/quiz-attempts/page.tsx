import { redirect } from "next/navigation";

export default function QuizAttemptsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return redirectToAssessments(searchParams);
}

async function redirectToAssessments(
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>,
) {
  const params = await searchParams;
  const nextParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => nextParams.append(key, item));
      return;
    }

    if (typeof value === "string") {
      nextParams.set(key, value);
    }
  });

  const query = nextParams.toString();
  redirect(`/dashboard/assessments${query ? `?${query}` : ""}`);
}
