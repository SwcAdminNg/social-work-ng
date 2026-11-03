import CertificatesContainer from "@/components/dashboard/certificates/CertificatesContainer";

export const metadata = {
  title: "Certificates | Social Work Nigeria",
};

export default function CertificatesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return <CertificatesContainer searchParams={searchParams} />;
}
