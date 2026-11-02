import AssessmentsContainer from "@/components/dashboard/assessments/AssessmentsContainer";

export const metadata = {
  title: "Assessments",
};

export default function AssessmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return <AssessmentsContainer searchParams={searchParams} />;
}
