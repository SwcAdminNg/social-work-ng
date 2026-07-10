import { ProfileSettings } from "@/components/dashboard/ProfileSettings";

export const metadata = {
  title: "Settings | Social Work Nigeria",
  description: "Manage your profile and account settings.",
};

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-0">
      <ProfileSettings />
    </div>
  );
}
