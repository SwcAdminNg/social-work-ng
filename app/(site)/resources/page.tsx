import { ResourcesHero } from "@/components/resources/ResourcesHero";
import { ResourcesList } from "@/components/resources/ResourcesList";

export const metadata = {
  title: "Resources | Social Work Nigeria",
  description: "Access essential toolkits, guidelines, and practice materials designed to support social workers.",
};

export default function ResourcesPage() {
  return (
    <div className="w-full bg-white dark:bg-gray-950 flex flex-col">
      <ResourcesHero />
      <ResourcesList />
    </div>
  );
}
