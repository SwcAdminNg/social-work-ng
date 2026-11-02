import CertificatesContainer from "@/components/dashboard/certificates/CertificatesContainer";

export const metadata = {
  title: "Certificates",
};

export default function CertificatesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return <CertificatesContainer searchParams={searchParams} />;
}
