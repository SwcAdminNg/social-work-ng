import QuizzesContainer from "@/components/dashboard/quiz-attempts/QuizzesContainer";

export default function QuizAttemptsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return <QuizzesContainer searchParams={searchParams} />;
}
