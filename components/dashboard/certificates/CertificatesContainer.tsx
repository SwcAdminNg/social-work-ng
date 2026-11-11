import { fetchApi } from "@/lib/fetchApi";
import CertificatesList, { type Certificate } from "./CertificatesList";

export default async function CertificatesContainer({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const page =
    typeof resolvedParams.page === "string"
      ? parseInt(resolvedParams.page, 10)
      : 1;

  const limit = 12;

  let certificates: Certificate[] = [];
  let totalItems = 0;
  let error: string | null = null;

  try {
    const res = await fetchApi(
      `/certificates/mine?page=${page}&page_size=${limit}`,
      { next: { revalidate: 0 } },
    );

    if (!res.ok) {
      throw new Error("Failed to fetch certificates");
    }

    const json = await res.json().catch(() => ({}));
    if (json && json.data) {
      certificates = json.data;
      totalItems = json.meta?.total_items || 0;
    }
  } catch (err) {
    error =
      err instanceof Error
        ? err.message
        : "An error occurred while fetching your certificates.";
  }

  return (
    <CertificatesList
      initialData={certificates}
      totalItems={totalItems}
      currentPage={page}
      limit={limit}
      error={error}
    />
  );
}
